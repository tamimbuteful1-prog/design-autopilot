// Persistent state: state/ledger.json (every video and its lifecycle) and state/control.json (pause switch).
// Both are committed back to the repository by the workflows, giving a full audit trail in git history.
import fs from 'node:fs';
import path from 'node:path';
import { config } from './config.mjs';

const LEDGER = () => path.join(config.stateDir, 'ledger.json');
const CONTROL = () => path.join(config.stateDir, 'control.json');

const readJson = (f, d) => (fs.existsSync(f) ? JSON.parse(fs.readFileSync(f, 'utf8')) : d);
function writeJson(f, data) {
  fs.mkdirSync(path.dirname(f), { recursive: true });
  const tmp = `${f}.tmp`;
  fs.writeFileSync(tmp, JSON.stringify(data, null, 2) + '\n');
  fs.renameSync(tmp, f);
}

export const STATUS = {
  GENERATING: 'generating',
  QA_FAILED: 'qa_failed',
  AWAITING_APPROVAL: 'awaiting_approval',
  APPROVED: 'approved',
  PUBLISHING: 'publishing',
  SCHEDULED: 'scheduled',
  PUBLISHED: 'published',
  REJECTED: 'rejected',
  FAILED: 'failed',
  NEEDS_REVIEW: 'needs_review',
};

export function loadLedger() {
  return readJson(LEDGER(), { version: 1, entries: [] });
}
export function saveLedger(ledger) {
  writeJson(LEDGER(), ledger);
}
export function loadControl() {
  return readJson(CONTROL(), { paused: false, reason: null, changedAt: null, changedBy: null });
}
export function saveControl(control) {
  writeJson(CONTROL(), control);
}

export function findEntry(ledger, idOrCode) {
  return ledger.entries.find((e) => e.id === idOrCode || e.idea?.code === idOrCode || e.date === idOrCode);
}

export function updateEntry(ledger, entry, patch, logMsg) {
  Object.assign(entry, patch, { updatedAt: new Date().toISOString() });
  if (logMsg) (entry.log ||= []).push({ at: new Date().toISOString(), msg: logMsg });
  saveLedger(ledger);
  return entry;
}

/** Count of videos that went live (or are queued in Buffer) after manual approval. */
export const approvedPublishedCount = (ledger) =>
  ledger.entries.filter((e) => [STATUS.SCHEDULED, STATUS.PUBLISHED].includes(e.status)).length;

export const approvalRequired = (ledger) => approvedPublishedCount(ledger) < config.approvalRequiredCount;
