// Builds docs/data.json (+ thumbnails) for the static dashboard in docs/index.html (served by GitHub Pages).
import fs from 'node:fs';
import path from 'node:path';
import { config } from './config.mjs';
import { loadLedger, loadControl, approvedPublishedCount } from './ledger.mjs';

export function buildDashboardData() {
  const ledger = loadLedger();
  const control = loadControl();
  const thumbs = path.join(config.docsDir, 'thumbs');
  fs.mkdirSync(thumbs, { recursive: true });
  const entries = ledger.entries.map((e) => {
    let thumb = null;
    const src = e.video?.thumb && path.join(config.root, e.video.thumb);
    const abs = e.video?.thumb?.startsWith('/') ? e.video.thumb : src;
    if (abs && fs.existsSync(abs)) {
      fs.copyFileSync(abs, path.join(thumbs, `${e.id}.jpg`));
    }
    if (fs.existsSync(path.join(thumbs, `${e.id}.jpg`))) thumb = `thumbs/${e.id}.jpg`;
    return {
      id: e.id,
      date: e.date,
      code: e.idea?.code,
      category: e.idea?.categoryMeta,
      subject: e.idea?.subject,
      brand: e.idea?.brand,
      style: e.idea?.style?.name,
      palette: e.idea?.palette ? { name: e.idea.palette.name, colors: [e.idea.palette.bg, e.idea.palette.accent, e.idea.palette.accent2, e.idea.palette.ink] } : null,
      status: e.status,
      title: e.copy?.title,
      videoUrl: e.video?.url ?? null,
      plannedAt: e.plannedAt ?? null,
      buffer: e.buffer ? { postId: e.buffer.postId, dueAt: e.buffer.dueAt, dryRun: Boolean(e.buffer.dryRun) } : null,
      issue: e.approval?.issue ?? null,
      qa: e.qa ? { passed: e.qa.filter((c) => c.ok).length, total: e.qa.length, failed: e.qa.filter((c) => !c.ok).map((c) => c.name) } : null,
      error: e.error ?? null,
      updatedAt: e.updatedAt,
      thumb,
    };
  }).reverse();
  const data = {
    generatedAt: new Date().toISOString(),
    repo: config.github.repo ?? null,
    control: { paused: Boolean(control.paused), reason: control.reason, autoMode: Boolean(control.autoMode), changedAt: control.changedAt },
    approvals: { required: config.approvalRequiredCount, done: approvedPublishedCount(ledger) },
    schedule: { time: config.postTimeLocal, timezone: config.timezone },
    entries,
  };
  fs.writeFileSync(path.join(config.docsDir, 'data.json'), JSON.stringify(data, null, 2));
  return data;
}
