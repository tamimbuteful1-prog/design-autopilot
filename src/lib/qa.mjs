// Automated quality gate. A video is only eligible for publishing when every check passes.
import fs from 'node:fs';
import crypto from 'node:crypto';
import { execFileSync, spawnSync } from 'node:child_process';

const probe = (file) => JSON.parse(execFileSync('ffprobe', ['-v', 'error', '-print_format', 'json', '-show_streams', '-show_format', file]).toString());

function ffmpegStderr(args) {
  const r = spawnSync('ffmpeg', ['-hide_banner', '-nostats', ...args, '-f', 'null', '-'], { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
  return r.stderr || '';
}

export const fileHash = (file) => crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');

export function checkVideo(file, { minSec = 10, maxSec = 15 } = {}) {
  const checks = [];
  const add = (name, ok, detail) => checks.push({ name, ok: Boolean(ok), detail: String(detail) });
  if (!fs.existsSync(file)) {
    add('file exists', false, file);
    return checks;
  }
  const size = fs.statSync(file).size;
  add('file size 0.3–50 MB', size > 300_000 && size < 50_000_000, `${(size / 1e6).toFixed(2)} MB`);

  const info = probe(file);
  const v = info.streams.find((s) => s.codec_type === 'video');
  const a = info.streams.find((s) => s.codec_type === 'audio');
  const dur = Number(info.format.duration);
  add('video stream H.264', v?.codec_name === 'h264', v?.codec_name);
  add('resolution 1080×1920', v?.width === 1080 && v?.height === 1920, `${v?.width}×${v?.height}`);
  add('pixel format yuv420p', v?.pix_fmt === 'yuv420p', v?.pix_fmt);
  const [fn, fd] = String(v?.r_frame_rate || '0/1').split('/').map(Number);
  add('frame rate 30 fps', Math.abs(fn / fd - 30) < 0.01, `${(fn / fd).toFixed(2)}`);
  add(`duration ${minSec}–${maxSec}s`, dur >= minSec && dur <= maxSec, `${dur.toFixed(2)}s`);
  add('audio stream AAC', a?.codec_name === 'aac', a?.codec_name ?? 'missing');
  add('moov atom at start (faststart)', moovFirst(file), 'web-optimised');

  if (a) {
    const eb = ffmpegStderr(['-i', file, '-map', '0:a:0', '-filter:a', 'ebur128=peak=true']);
    const I = Number((eb.match(/I:\s+(-?[\d.]+) LUFS/g) || []).pop()?.match(/-?[\d.]+/)?.[0]);
    const TP = Number((eb.match(/Peak:\s+(-?[\d.]+) dBFS/g) || []).pop()?.match(/-?[\d.]+/)?.[0]);
    add('loudness −18…−10 LUFS', I >= -18 && I <= -10, `${I} LUFS`);
    add('true peak ≤ −0.5 dBTP', TP <= -0.5, `${TP} dBTP`);
  }

  const bd = ffmpegStderr(['-i', file, '-vf', 'blackdetect=d=0.2:pix_th=0.08', '-an']);
  const black = [...bd.matchAll(/black_duration:([\d.]+)/g)].reduce((s, m) => s + Number(m[1]), 0);
  add('no black frames', black < 0.3, `${black.toFixed(2)}s black`);

  const fz = ffmpegStderr(['-i', file, '-vf', 'freezedetect=n=0.0005:d=1.5', '-an']);
  const freezes = [...fz.matchAll(/freeze_duration: ([\d.]+)/g)].map((m) => Number(m[1]));
  add('no frozen segments > 1.5s', freezes.length === 0, freezes.length ? `${freezes.join(', ')}s` : 'motion throughout');
  return checks;
}

function moovFirst(file) {
  const fd = fs.openSync(file, 'r');
  const buf = Buffer.alloc(64);
  let pos = 0;
  try {
    for (let i = 0; i < 8; i++) {
      fs.readSync(fd, buf, 0, 16, pos);
      const size = buf.readUInt32BE(0);
      const type = buf.toString('ascii', 4, 8);
      if (type === 'moov') return true;
      if (type === 'mdat') return false;
      if (size < 8) return false;
      pos += size;
    }
  } finally {
    fs.closeSync(fd);
  }
  return false;
}

const CLAIM_PATTERNS = [/لعميلي/, /مشروع(?:ي)? (?:الأخير )?لعميل(?! حقيقي| —)/, /client project(?!s? \(| —)/i, /for my client/i];

export function checkCopy({ title, caption, hashtags }) {
  const checks = [];
  const add = (name, ok, detail) => checks.push({ name, ok: Boolean(ok), detail: String(detail) });
  add('title 8–80 chars', title.length >= 8 && title.length <= 80, `${title.length} chars`);
  add('caption ≤ 2200 chars', caption.length <= 2200 && caption.length > 40, `${caption.length} chars`);
  add('3–10 hashtags', hashtags.length >= 3 && hashtags.length <= 10, hashtags.length);
  add('hashtags well-formed', hashtags.every((h) => /^#[\p{L}\p{N}_]+$/u.test(h)), hashtags.join(' '));
  add('no duplicate hashtags', new Set(hashtags.map((h) => h.toLowerCase())).size === hashtags.length, '');
  add('concept disclaimer present', /تصميم مفاهيمي|concept design/i.test(caption), '');
  add('no client-work claims', !CLAIM_PATTERNS.some((re) => re.test(caption.replace(/وليس مشروعًا منفذًا لعميل/g, ''))), '');
  add('no links or emails', !/(https?:\/\/|www\.|@\w+\.\w+)/i.test(caption), '');
  return checks;
}

export function checkUniqueness({ entry, entries }) {
  const others = entries.filter((e) => e.id !== entry.id && !['failed', 'rejected', 'qa_failed', 'test'].includes(e.status));
  return [
    { name: 'idea not used before', ok: !others.some((e) => e.idea?.fingerprint === entry.idea.fingerprint), detail: entry.idea.fingerprint },
    { name: 'video file is unique', ok: !others.some((e) => e.video?.sha256 && e.video.sha256 === entry.video.sha256), detail: entry.video.sha256.slice(0, 12) },
    { name: 'caption not reused', ok: !others.some((e) => e.copy?.caption === entry.copy.caption), detail: '' },
    { name: 'one video per day', ok: !others.some((e) => e.date === entry.date), detail: entry.date },
  ];
}
