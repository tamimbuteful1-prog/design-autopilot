// Central configuration. Every secret is read from environment variables only —
// never hard-code or commit keys. In GitHub Actions they come from repository Secrets.
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');

const env = (k, d = undefined) => {
  const v = process.env[k];
  return v === undefined || v === '' ? d : v;
};
const bool = (k, d) => {
  const v = env(k);
  if (v === undefined) return d;
  return ['1', 'true', 'yes', 'on'].includes(String(v).toLowerCase());
};

export const config = {
  root: ROOT,
  stateDir: env('STATE_DIR', path.join(ROOT, 'state')),
  outDir: env('OUT_DIR', path.join(ROOT, 'out')),
  docsDir: env('DOCS_DIR', path.join(ROOT, 'docs')),

  // Brand shown on the call-to-action card and caption
  brandHandle: env('BRAND_HANDLE', '@your.design.studio'),
  brandName: env('BRAND_NAME', 'Freelance Design Studio'),
  ctaText: env('CTA_TEXT', 'تحتاج تصميمًا مثل هذا؟ راسلني'),
  captionLanguage: env('CAPTION_LANGUAGE', 'ar'), // 'ar' | 'en'
  discloseAI: bool('DISCLOSE_AI', true),

  // Scheduling
  timezone: env('POST_TIMEZONE', 'Asia/Riyadh'),
  postTimeLocal: env('POST_TIME_LOCAL', '19:00'),
  approvalRequiredCount: Number(env('APPROVAL_REQUIRED_COUNT', '7')),

  // Video
  fps: 30,
  width: 1080,
  height: 1920,
  durationSec: Number(env('VIDEO_SECONDS', '24')),
  browserExecutable: env('BROWSER_EXECUTABLE'),

  // Buffer (GraphQL API) — https://developers.buffer.com
  buffer: {
    endpoint: env('BUFFER_API_URL', 'https://api.buffer.com'),
    apiKey: env('BUFFER_API_KEY'),
    channelId: env('BUFFER_TIKTOK_CHANNEL_ID'),
    organizationId: env('BUFFER_ORGANIZATION_ID'),
    schedulingType: env('BUFFER_SCHEDULING_TYPE', 'automatic'), // automatic | notification
  },

  // Storage: 's3' (Cloudflare R2 / AWS S3 / any S3-compatible) or 'github-release'
  storage: {
    driver: env('STORAGE_DRIVER', 's3'),
    s3: {
      endpoint: env('S3_ENDPOINT'), // e.g. https://<accountid>.r2.cloudflarestorage.com
      region: env('S3_REGION', 'auto'),
      bucket: env('S3_BUCKET'),
      accessKeyId: env('S3_ACCESS_KEY_ID'),
      secretAccessKey: env('S3_SECRET_ACCESS_KEY'),
      publicBaseUrl: env('S3_PUBLIC_BASE_URL'), // e.g. https://media.example.com or https://pub-xxx.r2.dev
      prefix: env('S3_PREFIX', 'tiktok'),
    },
  },

  // GitHub (issues for approvals + failure reports). Provided automatically in Actions.
  github: {
    token: env('GITHUB_TOKEN'),
    repo: env('GITHUB_REPOSITORY'), // owner/name
    api: env('GITHUB_API_URL', 'https://api.github.com'),
    serverUrl: env('GITHUB_SERVER_URL', 'https://github.com'),
    runId: env('GITHUB_RUN_ID'),
  },

  // Optional extra failure channel (Slack/Discord-compatible webhook or ntfy topic URL)
  notifyWebhookUrl: env('NOTIFY_WEBHOOK_URL'),

  dryRun: bool('DRY_RUN', false),
};

export function requireKeys(obj, keys, label) {
  const missing = keys.filter((k) => !obj[k]);
  if (missing.length) {
    throw Object.assign(new Error(`${label}: missing configuration ${missing.join(', ')} (set them as secret environment variables)`), { fatal: true });
  }
}
