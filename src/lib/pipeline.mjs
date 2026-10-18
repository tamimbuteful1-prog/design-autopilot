import fs from 'node:fs';
import path from 'node:path';
import { config } from './config.mjs';
import { chooseIdea } from './ideas.mjs';
import { writeCopy } from './copy.mjs';
import { renderVideo, renderFrame, prepareBrowser } from './render.mjs';
import { synthesize, writeWav, muxAudio } from './audio.mjs';
import { checkVideo, checkCopy, checkUniqueness, fileHash } from './qa.mjs';
import { uploadVideo } from './storage.mjs';
import * as buffer from './buffer.mjs';
import { STATUS, loadLedger, loadControl, saveControl, updateEntry, findEntry, approvedPublishedCount } from './ledger.mjs';
import { reportFailure, requestApproval, closeIssue } from './notify.mjs';
import { localDate, zonedToUtc } from './time.mjs';
import { runUrl } from './github.mjs';
import fsTL from 'node:fs';
const TL = JSON.parse(fsTL.readFileSync(new URL('../shared/timeline.json', import.meta.url)));

const log = (...a) => console.log(new Date().toISOString(), ...a);

export function needsApproval(ledger, control = loadControl()) {
  return approvedPublishedCount(ledger) < config.approvalRequiredCount || !control.autoMode;
}

function plannedSlot(date) {
  return zonedToUtc(date, config.postTimeLocal, config.timezone).toISOString();
}

/** Daily entry point: generate → QA → upload → (approval | publish). Idempotent per calendar day. */
export async function daily({ date = localDate(config.timezone), force = false } = {}) {
  const control = loadControl();
  if (control.paused && !force) {
    log(`Autopilot is paused (${control.reason ?? 'no reason given'}). Nothing generated.`);
    return { skipped: 'paused' };
  }
  const ledger = loadLedger();
  const existing = ledger.entries.find((e) => e.date === date && ![STATUS.FAILED, STATUS.QA_FAILED, STATUS.REJECTED].includes(e.status) && (config.dryRun || e.status !== STATUS.TEST));
  if (existing) {
    log(`A video for ${date} already exists (${existing.idea.code}, ${existing.status}) — skipping to avoid duplicates.`);
    if (existing.status === STATUS.APPROVED) return publish(existing.id);
    return { skipped: 'exists', entry: existing };
  }
  let entry = await generate({ date, ledger });
  if (entry.status === STATUS.QA_FAILED) {
    log('QA failed — trying once more with a different idea.');
    entry = await generate({ date, ledger });
    if (entry.status !== STATUS.QA_FAILED) process.exitCode = 0;
  }
  if (entry.status === STATUS.TEST) {
    log(`🧪 ${entry.idea.code} rendered in TEST mode — not uploaded, not posted. Download it from the workflow run artifacts.`);
    return { entry };
  }
  if (entry.status !== STATUS.AWAITING_APPROVAL && entry.status !== STATUS.APPROVED) return { entry };

  if (needsApproval(ledger, control)) {
    const remaining = Math.max(0, config.approvalRequiredCount - approvedPublishedCount(ledger));
    try {
      const issue = await requestApproval(entry, { remaining });
      updateEntry(ledger, entry, { approval: { required: true, issue } }, `approval requested${issue ? ` (issue #${issue})` : ''}`);
    } catch (e) {
      await reportFailure({ stage: 'approval request', error: e, entry });
    }
    log(`✋ ${entry.idea.code} is waiting for approval.`);
    return { entry };
  }
  updateEntry(ledger, entry, { status: STATUS.APPROVED, approval: { required: false, by: 'auto', at: new Date().toISOString() } }, 'auto-approved (automatic mode)');
  return publish(entry.id);
}

export async function generate({ date, ledger = loadLedger() }) {
  const idea = chooseIdea({ entries: ledger.entries, date, seed: `${date}:${ledger.entries.length}` });
  const id = `${date}-${idea.code}`;
  const entry = { id, date, status: STATUS.GENERATING, idea, createdAt: new Date().toISOString(), log: [] };
  ledger.entries.push(entry);
  updateEntry(ledger, entry, {}, `idea chosen: ${idea.category} / ${idea.subjectKey} / ${idea.styleKey} / ${idea.paletteKey}`);
  const dir = path.join(config.outDir, id);
  fs.mkdirSync(dir, { recursive: true });
  try {
    await prepareBrowser();
    const props = { idea, handle: config.brandHandle, cta: config.ctaText, seconds: config.durationSec };
    const silent = path.join(dir, 'silent.mp4');
    log(`🎬 rendering ${id}`);
    let last = 0;
    await renderVideo(props, silent, (p) => { if (p - last >= 0.25) { last = p; log(`   ${Math.round(p * 100)}%`); } });
    const wav = path.join(dir, 'music.wav');
    writeWav(wav, synthesize({ seconds: config.durationSec, seed: idea.fingerprint }));
    const final = path.join(dir, `${id}.mp4`);
    muxAudio({ video: silent, wav, out: final });
    fs.rmSync(silent);
    fs.rmSync(wav);
    const thumb = await renderFrame(props, TL.thumbnailFrame, path.join(dir, 'thumb.jpg'));
    const copy = writeCopy(idea);
    updateEntry(ledger, entry, { copy, video: { file: path.relative(config.root, final), sha256: fileHash(final), bytes: fs.statSync(final).size, thumb: path.relative(config.root, thumb) } }, 'rendered');

    const qa = [...checkVideo(final, { minSec: 10, maxSec: 15 }), ...checkCopy(copy), ...checkUniqueness({ entry, entries: ledger.entries })];
    const failed = qa.filter((c) => !c.ok);
    updateEntry(ledger, entry, { qa }, `QA ${qa.length - failed.length}/${qa.length} passed`);
    if (failed.length) {
      updateEntry(ledger, entry, { status: STATUS.QA_FAILED }, `QA failed: ${failed.map((f) => f.name).join(', ')}`);
      await reportFailure({ stage: 'quality check', error: new Error(failed.map((f) => `${f.name}: ${f.detail}`).join('\n')), entry });
      process.exitCode = 1;
      return entry;
    }

    if (config.dryRun) {
      updateEntry(ledger, entry, { status: STATUS.TEST, plannedAt: plannedSlot(date), runUrl: runUrl() }, 'TEST mode: QA passed; upload and publishing skipped');
      return entry;
    }
    const up = await uploadVideo(final, `${id}.mp4`);
    updateEntry(ledger, entry, { video: { ...entry.video, url: up.url, storage: up.driver, key: up.key }, plannedAt: plannedSlot(date), status: STATUS.AWAITING_APPROVAL }, `uploaded (${up.driver})`);
    return entry;
  } catch (e) {
    updateEntry(ledger, entry, { status: STATUS.FAILED, error: String(e.message || e) }, `generation failed: ${e.message}`);
    await reportFailure({ stage: 'generation', error: e, entry });
    process.exitCode = 1;
    return entry;
  }
}

/** Send one approved entry to Buffer exactly once. */
export async function publish(id) {
  const ledger = loadLedger();
  const control = loadControl();
  const entry = findEntry(ledger, id);
  if (!entry) throw new Error(`No entry ${id}`);
  if (entry.buffer?.postId) {
    log(`${entry.idea.code} already has Buffer post ${entry.buffer.postId} — not posting again.`);
    return { entry, skipped: 'already-posted' };
  }
  if (control.paused) {
    log(`Paused — ${entry.idea.code} stays "${entry.status}" and will publish after resume.`);
    return { entry, skipped: 'paused' };
  }
  if (entry.status === STATUS.PUBLISHING || entry.status === STATUS.NEEDS_REVIEW) {
    const found = await buffer.findPostByMarker(`Concept ${entry.idea.code}`).catch(() => null);
    if (found) {
      updateEntry(ledger, entry, { status: found.status === 'sent' ? STATUS.PUBLISHED : STATUS.SCHEDULED, buffer: { postId: found.id, dueAt: found.dueAt } }, 'reconciled with existing Buffer post');
      return { entry };
    }
    updateEntry(ledger, entry, { status: STATUS.NEEDS_REVIEW }, 'previous publish attempt was interrupted; not retrying automatically');
    await reportFailure({ stage: 'publish (interrupted earlier)', error: new Error('A previous publish attempt ended without confirmation. Check Buffer; if no post exists, run the control workflow with action "retry".'), entry });
    return { entry };
  }
  if (entry.status !== STATUS.APPROVED) throw new Error(`${entry.idea.code} is "${entry.status}", expected "approved"`);

  const now = Date.now();
  const planned = entry.plannedAt ? Date.parse(entry.plannedAt) : 0;
  const dueAt = planned > now + 10 * 60 * 1000 ? new Date(planned).toISOString() : null;
  updateEntry(ledger, entry, { status: STATUS.PUBLISHING }, `publishing (${dueAt ? `scheduled for ${dueAt}` : 'now'})`);
  if (config.dryRun) {
    updateEntry(ledger, entry, { status: dueAt ? STATUS.SCHEDULED : STATUS.PUBLISHED, buffer: { postId: `dry-run-${entry.id}`, dueAt, dryRun: true } }, 'DRY RUN — Buffer not called');
    return { entry };
  }
  try {
    const post = await buffer.createVideoPost({ text: entry.copy.caption, videoUrl: entry.video.url, dueAt });
    updateEntry(ledger, entry, { status: dueAt ? STATUS.SCHEDULED : STATUS.PUBLISHED, buffer: { postId: post.id, dueAt: post.dueAt ?? dueAt, createdAt: new Date().toISOString() } }, `sent to Buffer (post ${post.id})`);
    if (entry.approval?.issue) await closeIssue(entry.approval.issue, `✅ Sent to Buffer as post \`${post.id}\`${dueAt ? `, scheduled for ${dueAt}` : ' (posting now)'}.`).catch(() => {});
    log(`✅ ${entry.idea.code} → Buffer ${post.id}`);
  } catch (e) {
    const status = e.rejected || e.fatal ? STATUS.FAILED : STATUS.NEEDS_REVIEW;
    updateEntry(ledger, entry, { status, error: e.message }, `publish failed: ${e.message}`);
    await reportFailure({ stage: 'publish to Buffer', error: e, entry });
    process.exitCode = 1;
  }
  return { entry };
}

export async function approve(id, by = 'owner') {
  const ledger = loadLedger();
  const entry = findEntry(ledger, id);
  if (!entry) throw new Error(`No entry ${id}`);
  if (entry.status !== STATUS.AWAITING_APPROVAL) {
    log(`${entry.idea.code} is "${entry.status}" — nothing to approve.`);
    return { entry, skipped: entry.status };
  }
  updateEntry(ledger, entry, { status: STATUS.APPROVED, approval: { ...entry.approval, by, at: new Date().toISOString() } }, `approved by ${by}`);
  return publish(entry.id);
}

export async function reject(id, by = 'owner', reason = '') {
  const ledger = loadLedger();
  const entry = findEntry(ledger, id);
  if (!entry) throw new Error(`No entry ${id}`);
  if (![STATUS.AWAITING_APPROVAL, STATUS.APPROVED, STATUS.NEEDS_REVIEW].includes(entry.status)) return { entry, skipped: entry.status };
  updateEntry(ledger, entry, { status: STATUS.REJECTED, approval: { ...entry.approval, by, at: new Date().toISOString(), reason } }, `rejected by ${by}${reason ? `: ${reason}` : ''}`);
  if (entry.approval?.issue) await closeIssue(entry.approval.issue, `🚫 Rejected${reason ? `: ${reason}` : ''}. The idea is retired and won't be reused.`).catch(() => {});
  return { entry };
}

/** Manual retry after a needs_review/failed publish, once the owner has confirmed nothing went out. */
export async function retry(id) {
  const ledger = loadLedger();
  const entry = findEntry(ledger, id);
  if (!entry) throw new Error(`No entry ${id}`);
  if (entry.buffer?.postId) return { entry, skipped: 'already-posted' };
  if (![STATUS.NEEDS_REVIEW, STATUS.FAILED].includes(entry.status) || !entry.video?.url) throw new Error(`${entry.idea.code} cannot be retried from "${entry.status}"`);
  updateEntry(ledger, entry, { status: STATUS.APPROVED }, 'manual retry requested');
  return publish(entry.id);
}

export async function sync() {
  const ledger = loadLedger();
  for (const e of ledger.entries.filter((x) => x.status === STATUS.SCHEDULED && x.buffer?.postId && !x.buffer.dryRun)) {
    const p = await buffer.getPost(e.buffer.postId);
    if (p?.status && /sent|published/i.test(p.status)) updateEntry(ledger, e, { status: STATUS.PUBLISHED, buffer: { ...e.buffer, status: p.status, sentAt: p.sentAt } }, 'Buffer reports the post as sent');
    else if (p?.status && /error|fail/i.test(p.status)) {
      updateEntry(ledger, e, { status: STATUS.FAILED, buffer: { ...e.buffer, status: p.status } }, 'Buffer reports a posting error');
      await reportFailure({ stage: 'TikTok posting (reported by Buffer)', error: new Error(`Buffer post ${e.buffer.postId} status: ${p.status}`), entry: e });
    } else if (!p?.error && e.buffer.dueAt && Date.parse(e.buffer.dueAt) < Date.now() - 3 * 3600e3 && p?.status) {
      updateEntry(ledger, e, { buffer: { ...e.buffer, status: p.status } });
    }
  }
}

export function setPaused(paused, by = 'owner', reason = null) {
  const c = loadControl();
  saveControl({ ...c, paused, reason: paused ? reason : null, changedAt: new Date().toISOString(), changedBy: by });
  log(paused ? '⏸️  autopilot paused' : '▶️  autopilot resumed');
}

export function setAutoMode(on, by = 'owner') {
  const ledger = loadLedger();
  if (on && approvedPublishedCount(ledger) < config.approvalRequiredCount) {
    throw new Error(`Automatic mode needs ${config.approvalRequiredCount} approved, successfully posted videos first (have ${approvedPublishedCount(ledger)}).`);
  }
  const c = loadControl();
  saveControl({ ...c, autoMode: on, autoModeChangedAt: new Date().toISOString(), autoModeChangedBy: by });
  log(on ? '🤖 automatic mode ON' : '✋ approval mode ON');
}

/** One-off "what we offer" video covering every service (not part of the daily rotation). */
export async function servicesVideo() {
  const { CATEGORIES } = await import('./catalog.mjs');
  const ideas = [];
  CATEGORIES.forEach((category, i) => {
    const entries = ideas.map((idea) => ({ idea, status: 'test' }));
    let idea;
    for (let a = 0; a < 40 && (!idea || idea.category !== category); a++) {
      // walk the rotation until we land on the wanted category
      idea = chooseIdea({ entries: entries.length ? entries : [], date: `services-${i}-${a}`, seed: `services-${i}-${a}` });
      if (idea.category !== category) entries.push({ idea, status: 'test' });
    }
    ideas.push(idea);
  });
  ideas.forEach((idea, i) => { idea.code = `S0${i + 1}`; });
  const dir = path.join(config.outDir, 'services');
  fs.mkdirSync(dir, { recursive: true });
  await prepareBrowser();
  const props = { ideas, handle: config.brandHandle, cta: config.ctaText };
  const silent = path.join(dir, 'silent.mp4');
  log('🎬 rendering services video');
  await renderVideo(props, silent, undefined, 'ServicesReel');
  const SERVICES_TIMELINE_NODE = { total: 438, drop: 56, cta: 378 }; // mirrors SERVICES_TIMELINE in src/remotion/ServicesReel.tsx
  const wav = path.join(dir, 'music.wav');
  writeWav(wav, synthesize({ seconds: SERVICES_TIMELINE_NODE.total / config.fps, seed: 'services', dropFrame: SERVICES_TIMELINE_NODE.drop, ctaFrame: SERVICES_TIMELINE_NODE.cta }));
  const final = path.join(dir, 'services.mp4');
  muxAudio({ video: silent, wav, out: final });
  fs.rmSync(silent);
  fs.rmSync(wav);
  const qa = checkVideo(final, { minSec: 10, maxSec: 15 });
  qa.forEach((c) => log(`${c.ok ? '✅' : '❌'} ${c.name} — ${c.detail}`));
  if (qa.some((c) => !c.ok)) process.exitCode = 1;
  return final;
}
