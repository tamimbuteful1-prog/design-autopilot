// Failure reports and approval requests.
// Channels: GitHub issues (you get GitHub's email/mobile notifications), plus an optional webhook.
import { config } from './config.mjs';
import { gh, githubEnabled, ensureLabels, runUrl } from './github.mjs';

async function webhook(text) {
  if (!config.notifyWebhookUrl) return;
  const url = config.notifyWebhookUrl;
  const isNtfy = /ntfy\./.test(url);
  await fetch(url, isNtfy ? { method: 'POST', body: text } : { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text, content: text }) }).catch((e) => console.error('webhook failed', e.message));
}

export async function reportFailure({ stage, error, entry }) {
  const title = `❌ Autopilot failed at "${stage}"${entry ? ` — ${entry.idea?.code ?? entry.id}` : ''} (${new Date().toISOString().slice(0, 10)})`;
  const body = [
    `**Stage:** ${stage}`,
    entry ? `**Video:** ${entry.idea?.code} · ${entry.idea?.subject?.en} · status \`${entry.status}\`` : '',
    runUrl() ? `**Run log:** ${runUrl()}` : '',
    '',
    '```',
    String(error?.stack || error).slice(0, 3000),
    '```',
    '',
    entry?.qa ? `**QA results**\n${entry.qa.map((c) => `- ${c.ok ? '✅' : '❌'} ${c.name} — ${c.detail}`).join('\n')}` : '',
    '',
    'Nothing was posted for this run. Fix the cause and re-run the **Daily video** workflow, or wait for tomorrow’s run.',
  ].filter(Boolean).join('\n');
  console.error(title, '\n', error);
  await webhook(`${title}\n${String(error?.message || error)}${runUrl() ? `\n${runUrl()}` : ''}`);
  if (githubEnabled()) {
    try {
      await ensureLabels();
      await gh('/issues', { method: 'POST', body: { title, body, labels: ['autopilot-failure'] } });
    } catch (e) {
      console.error('could not open failure issue', e.message);
    }
  }
}

export async function requestApproval(entry, { remaining }) {
  const body = [
    `### ${entry.idea.code} — ${entry.idea.subject.ar} (${entry.idea.subject.en})`,
    '',
    `▶️ **Preview video:** ${entry.video.url}`,
    '',
    `**Category:** ${entry.idea.categoryMeta.en} · **Style:** ${entry.idea.style.name} · **Palette:** ${entry.idea.palette.name}`,
    `**Planned post time:** ${entry.plannedAt ?? 'next slot'}`,
    '',
    '**Caption**',
    '```',
    entry.copy.caption,
    '```',
    '',
    `**QA:** ${entry.qa.filter((c) => c.ok).length}/${entry.qa.length} checks passed`,
    '',
    '---',
    '**To approve:** comment `/approve` · **To reject:** comment `/reject` (optionally with a reason).',
    `Approval is required for the first ${config.approvalRequiredCount} videos (${remaining} left).`,
  ].join('\n');
  await webhook(`🟡 New video waiting for approval: ${entry.idea.code} — ${entry.video.url}`);
  if (!githubEnabled()) return null;
  await ensureLabels();
  const issue = await gh('/issues', { method: 'POST', body: { title: `🟡 Approve video ${entry.idea.code}: ${entry.idea.subject.en}`, body, labels: ['approval-needed'] } });
  return issue.number;
}

export async function closeIssue(number, comment, labels) {
  if (!githubEnabled() || !number) return;
  await gh(`/issues/${number}/comments`, { method: 'POST', body: { body: comment } });
  await gh(`/issues/${number}`, { method: 'PATCH', body: { state: 'closed', ...(labels ? { labels } : {}) } });
}
