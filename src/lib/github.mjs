// Minimal GitHub REST helper (issues for approvals and failure reports, releases for optional storage).
import { config } from './config.mjs';

export const githubEnabled = () => Boolean(config.github.token && config.github.repo);

export async function gh(pathname, { method = 'GET', body, allow404 = false } = {}) {
  if (!githubEnabled()) throw new Error('GitHub API not configured (GITHUB_TOKEN / GITHUB_REPOSITORY)');
  const res = await fetch(`${config.github.api}/repos/${config.github.repo}${pathname}`, {
    method,
    headers: { Authorization: `Bearer ${config.github.token}`, Accept: 'application/vnd.github+json', 'X-GitHub-Api-Version': '2022-11-28', ...(body ? { 'Content-Type': 'application/json' } : {}) },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (allow404 && res.status === 404) return null;
  if (!res.ok) throw new Error(`GitHub ${method} ${pathname}: ${res.status} ${await res.text()}`);
  return res.status === 204 ? null : res.json();
}

export async function ensureLabels() {
  const labels = [
    ['approval-needed', 'D4A015', 'Video waiting for your approval'],
    ['autopilot-failure', 'E5484D', 'Generation or publishing failed'],
    ['approved', '22A06B', 'Approved for publishing'],
  ];
  for (const [name, color, description] of labels) {
    const exists = await gh(`/labels/${encodeURIComponent(name)}`, { allow404: true });
    if (!exists) await gh('/labels', { method: 'POST', body: { name, color, description } });
  }
}

export const runUrl = () => (config.github.runId ? `${config.github.serverUrl}/${config.github.repo}/actions/runs/${config.github.runId}` : null);
