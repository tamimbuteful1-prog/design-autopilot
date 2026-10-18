#!/usr/bin/env node
// Handles owner commands written as GitHub issues/comments (used by .github/workflows/commands.yml):
//   comment on an approval issue:  /approve      /reject [reason]
//   open an issue titled:          /pause [reason]   /resume   /auto-on   /auto-off   /retry C012
import fs from 'node:fs';
import * as P from '../src/lib/pipeline.mjs';
import { loadLedger } from '../src/lib/ledger.mjs';
import { gh } from '../src/lib/github.mjs';
import { buildDashboardData } from '../src/lib/dashboard.mjs';

const event = JSON.parse(fs.readFileSync(process.env.GITHUB_EVENT_PATH, 'utf8'));
const issue = event.issue;
const isComment = Boolean(event.comment);
const author = (isComment ? event.comment.user : issue.user).login;
const association = isComment ? event.comment.author_association : issue.author_association;
const text = (isComment ? event.comment.body : `${issue.title}\n${issue.body ?? ''}`).trim();
const [cmdRaw, ...rest] = text.split(/\s+/);
const cmd = cmdRaw?.toLowerCase();
const arg = rest.join(' ').trim();

const reply = (body) => gh(`/issues/${issue.number}/comments`, { method: 'POST', body: { body } });
const close = () => gh(`/issues/${issue.number}`, { method: 'PATCH', body: { state: 'closed' } });

if (!cmd?.startsWith('/')) process.exit(0);
if (association !== 'OWNER') {
  await reply(`⛔ @${author} — only the repository owner can run autopilot commands.`);
  process.exit(0);
}

try {
  const entryForIssue = () => loadLedger().entries.find((e) => e.approval?.issue === issue.number);
  switch (cmd) {
    case '/approve': {
      const e = entryForIssue();
      if (!e) { await reply('No video is linked to this issue.'); break; }
      const r = await P.approve(e.id, author);
      const after = loadLedger().entries.find((x) => x.id === e.id);
      await reply(r.skipped ? `ℹ️ Nothing to do — ${e.idea.code} is \`${r.skipped}\`.` : `✅ Approved by @${author}. Status: \`${after.status}\`${after.buffer?.dueAt ? ` · scheduled for ${after.buffer.dueAt}` : ''}.`);
      break;
    }
    case '/reject': {
      const e = entryForIssue();
      if (!e) { await reply('No video is linked to this issue.'); break; }
      await P.reject(e.id, author, arg);
      break;
    }
    case '/pause':
      P.setPaused(true, author, arg || null);
      await reply('⏸️ Autopilot paused. Nothing will be generated or published until you open an issue titled `/resume`.');
      await close();
      break;
    case '/resume': {
      P.setPaused(false, author);
      for (const e of loadLedger().entries.filter((x) => x.status === 'approved')) await P.publish(e.id);
      await reply('▶️ Autopilot resumed. Any approved videos waiting during the pause were sent to Buffer.');
      await close();
      break;
    }
    case '/auto-on':
      P.setAutoMode(true, author);
      await reply('🤖 Automatic mode is on: videos that pass every QA check are published without waiting for approval. Open `/auto-off` to go back.');
      await close();
      break;
    case '/auto-off':
      P.setAutoMode(false, author);
      await reply('✋ Approval mode is on: every new video waits for `/approve`.');
      await close();
      break;
    case '/retry': {
      const r = await P.retry(arg);
      await reply(`🔁 Retry for ${arg}: ${r.skipped ? r.skipped : loadLedger().entries.find((x) => x.idea?.code === arg)?.status}`);
      await close();
      break;
    }
    default:
      process.exit(0);
  }
} catch (e) {
  await reply(`❌ Command failed: ${e.message}`);
  process.exitCode = 1;
} finally {
  buildDashboardData();
}
