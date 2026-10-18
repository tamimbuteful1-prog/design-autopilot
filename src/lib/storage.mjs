// Upload the finished MP4 somewhere Buffer (and TikTok) can fetch it from a public HTTPS URL.
import fs from 'node:fs';
import path from 'node:path';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { config, requireKeys } from './config.mjs';
import { gh } from './github.mjs';

export async function uploadVideo(file, key) {
  const driver = config.storage.driver;
  if (config.dryRun) return { driver: 'dry-run', url: `https://example.invalid/${key}`, key };
  if (driver === 's3') return uploadS3(file, key);
  if (driver === 'github-release') return uploadGithubRelease(file, key);
  throw new Error(`Unknown STORAGE_DRIVER "${driver}" (use s3 or github-release)`);
}

async function uploadS3(file, key) {
  const s = config.storage.s3;
  requireKeys(s, ['endpoint', 'bucket', 'accessKeyId', 'secretAccessKey', 'publicBaseUrl'], 'S3 storage');
  const client = new S3Client({ region: s.region, endpoint: s.endpoint, credentials: { accessKeyId: s.accessKeyId, secretAccessKey: s.secretAccessKey }, forcePathStyle: true });
  const Key = `${s.prefix ? s.prefix.replace(/\/$/, '') + '/' : ''}${key}`;
  await client.send(new PutObjectCommand({ Bucket: s.bucket, Key, Body: fs.readFileSync(file), ContentType: 'video/mp4', CacheControl: 'public, max-age=31536000, immutable' }));
  const url = `${s.publicBaseUrl.replace(/\/$/, '')}/${Key}`;
  await verifyPublic(url, fs.statSync(file).size);
  return { driver: 's3', url, key: Key };
}

async function uploadGithubRelease(file, key) {
  const tag = 'media';
  let release = await gh(`/releases/tags/${tag}`, { allow404: true });
  if (!release) release = await gh('/releases', { method: 'POST', body: { tag_name: tag, name: 'Video media (auto)', body: 'MP4 files used by the TikTok autopilot. Do not delete while posts are scheduled.', prerelease: true } });
  const name = path.basename(key);
  const existing = (release.assets || []).find((a) => a.name === name);
  if (existing) return { driver: 'github-release', url: existing.browser_download_url, key: name };
  const uploadUrl = release.upload_url.replace(/\{.*\}$/, '') + `?name=${encodeURIComponent(name)}`;
  const res = await fetch(uploadUrl, { method: 'POST', headers: { Authorization: `Bearer ${config.github.token}`, 'Content-Type': 'video/mp4', Accept: 'application/vnd.github+json' }, body: fs.readFileSync(file) });
  if (!res.ok) throw new Error(`GitHub asset upload failed: ${res.status} ${await res.text()}`);
  const asset = await res.json();
  await verifyPublic(asset.browser_download_url, fs.statSync(file).size);
  return { driver: 'github-release', url: asset.browser_download_url, key: name };
}

/** Confirm the file is publicly downloadable before we hand the URL to Buffer. */
export async function verifyPublic(url, bytes) {
  let lastErr;
  for (let i = 0; i < 5; i++) {
    try {
      const res = await fetch(url, { method: 'GET', headers: { Range: 'bytes=0-1023' }, redirect: 'follow' });
      const len = Number(res.headers.get('content-range')?.split('/')[1] || res.headers.get('content-length'));
      const type = res.headers.get('content-type') || '';
      if ((res.status === 206 || res.status === 200) && (!bytes || len === bytes) && /video\/mp4|application\/octet-stream/.test(type)) return true;
      lastErr = new Error(`public URL check failed: HTTP ${res.status}, type ${type}, length ${len}`);
    } catch (e) {
      lastErr = e;
    }
    await new Promise((r) => setTimeout(r, 2000 * (i + 1)));
  }
  throw lastErr;
}
