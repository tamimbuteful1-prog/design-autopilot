// End-to-end publishing logic against local mock Buffer/GitHub/media servers (no real network, no real keys).
import { test, after } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { startMock } from './helpers/mock-server.mjs';

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'autopilot-'));
// Configure the environment BEFORE any project module is loaded (config is read once at import time).
const mock = await startMock();
{
  Object.assign(process.env, {
    STATE_DIR: path.join(tmp, 'state'), DOCS_DIR: path.join(tmp, 'docs'), OUT_DIR: path.join(tmp, 'out'),
    BUFFER_API_URL: `${mock.base}/buffer`, BUFFER_API_KEY: 'test-key', BUFFER_TIKTOK_CHANNEL_ID: 'chan_tiktok', BUFFER_ORGANIZATION_ID: 'org_1',
    GITHUB_TOKEN: 'gh-test', GITHUB_REPOSITORY: 'me/autopilot', GITHUB_API_URL: `${mock.base}/github`,
    APPROVAL_REQUIRED_COUNT: '7', DRY_RUN: 'false',
  });
}
const P = await import('../src/lib/pipeline.mjs');
const L = await import('../src/lib/ledger.mjs');
const B = await import('../src/lib/buffer.mjs');
after(() => mock.close());

const { chooseIdea } = await import('../src/lib/ideas.mjs');
const { writeCopy } = await import('../src/lib/copy.mjs');

/** Insert a fully generated, QA-passed entry (rendering is covered by the real render test). */
function seedEntry(dayOffset, status = 'awaiting_approval', plannedInFuture = true) {
  const ledger = L.loadLedger();
  const date = new Date(Date.UTC(2026, 9, 19 + dayOffset)).toISOString().slice(0, 10);
  const idea = chooseIdea({ entries: ledger.entries, date, seed: date });
  const e = {
    id: `${date}-${idea.code}`, date, idea, status, copy: writeCopy(idea),
    video: { url: `${mock.base}/media/${date}.mp4`, sha256: `sha-${date}` },
    plannedAt: new Date(Date.now() + (plannedInFuture ? 3600e3 : -3600e3)).toISOString(),
    approval: { required: true, issue: 100 + dayOffset }, qa: [], log: [],
  };
  ledger.entries.push(e);
  L.saveLedger(ledger);
  return e.id;
}
const createCalls = () => mock.state.buffer.filter((q) => q.includes('createPost')).length;

test('discover lists organisations and the TikTok channel', async () => {
  const out = await B.discover();
  assert.equal(out[0].organization.id, 'org_1');
  assert.equal(out[0].channels[0].service, 'tiktok');
});

test('awaiting video is not posted until approved; approval schedules it exactly once', async () => {
  const id = seedEntry(0);
  assert.equal(createCalls(), 0);
  await P.approve(id, 'tester');
  const e = L.findEntry(L.loadLedger(), id);
  assert.equal(e.status, 'scheduled');
  assert.equal(e.buffer.postId, 'post_1');
  assert.match(mock.state.buffer.at(-1), /mode: customScheduled/);
  assert.match(mock.state.buffer.at(-1), /video: \{ url: "http:\/\/127\.0\.0\.1:\d+\/media\//);
  await P.publish(id); // second attempt must be a no-op
  await P.approve(id, 'tester');
  assert.equal(createCalls(), 1, 'no duplicate post');
  assert.ok(mock.state.github.some((r) => r.url.endsWith('/issues/100') && r.body?.state === 'closed'), 'approval issue closed');
});

test('approval after the planned slot posts immediately', async () => {
  const id = seedEntry(1, 'awaiting_approval', false);
  await P.approve(id);
  const e = L.findEntry(L.loadLedger(), id);
  assert.equal(e.status, 'published');
  assert.match(mock.state.buffer.at(-1), /mode: shareNow/);
});

test('pause blocks publishing; resume releases it', async () => {
  const id = seedEntry(2);
  P.setPaused(true, 'tester', 'holiday');
  const before = createCalls();
  await P.approve(id);
  let e = L.findEntry(L.loadLedger(), id);
  assert.equal(e.status, 'approved');
  assert.equal(createCalls(), before);
  const daily = await P.daily({ date: '2026-12-01' });
  assert.equal(daily.skipped, 'paused', 'daily run generates nothing while paused');
  P.setPaused(false, 'tester');
  await P.publish(id);
  e = L.findEntry(L.loadLedger(), id);
  assert.equal(e.status, 'scheduled');
});

test('Buffer rejection marks failed and opens a failure issue', async () => {
  const id = seedEntry(3);
  mock.state.failNextCreate = 'reject';
  await P.approve(id);
  const e = L.findEntry(L.loadLedger(), id);
  assert.equal(e.status, 'failed');
  assert.ok(mock.state.github.some((r) => r.method === 'POST' && r.url.endsWith('/issues') && r.body.labels?.includes('autopilot-failure')));
  process.exitCode = 0;
});

test('ambiguous 5xx is never retried blindly; reconciliation finds the real post', async () => {
  const id = seedEntry(4);
  mock.state.failNextCreate = '502';
  const before = createCalls();
  await P.approve(id);
  let e = L.findEntry(L.loadLedger(), id);
  assert.equal(e.status, 'needs_review');
  assert.equal(createCalls(), before + 1, 'exactly one attempt');
  // Simulate: Buffer actually created it despite the 502
  mock.state.posts.push({ id: 'post_ghost', text: e.copy.caption, dueAt: e.plannedAt, status: 'scheduled' });
  await P.publish(id);
  e = L.findEntry(L.loadLedger(), id);
  assert.equal(e.status, 'scheduled');
  assert.equal(e.buffer.postId, 'post_ghost');
  assert.equal(createCalls(), before + 1, 'reconciled without re-posting');
  process.exitCode = 0;
});

test('automatic mode stays locked until 7 approved videos have gone out', async () => {
  assert.throws(() => P.setAutoMode(true), /needs 7/);
  for (let d = 5; d < 8; d++) await P.approve(seedEntry(d));
  assert.equal(L.approvedPublishedCount(L.loadLedger()), 7);
  P.setAutoMode(true, 'tester');
  assert.equal(P.needsApproval(L.loadLedger()), false);
  P.setAutoMode(false, 'tester');
  assert.equal(P.needsApproval(L.loadLedger()), true);
});

test('sync marks scheduled posts as published once Buffer reports them sent', async () => {
  mock.state.posts.forEach((p) => (p.status = 'sent'));
  await P.sync();
  const ledger = L.loadLedger();
  assert.ok(ledger.entries.filter((e) => e.buffer?.postId).every((e) => e.status === 'published'));
});

test('dashboard data contains no secrets', async () => {
  const { buildDashboardData } = await import('../src/lib/dashboard.mjs');
  const d = buildDashboardData();
  const raw = JSON.stringify(d);
  assert.ok(!raw.includes('test-key') && !raw.includes('gh-test'));
  assert.ok(d.entries.length >= 8);
});
