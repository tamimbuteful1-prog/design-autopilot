// Buffer GraphQL API client — https://developers.buffer.com
// Auth: Authorization: Bearer <API key from publish.buffer.com/settings/api>, stored only as a secret.
import { config, requireKeys } from './config.mjs';

export class Enum {
  constructor(v) { this.v = v; }
}
const E = (v) => new Enum(v);

/** Serialise a JS value into a GraphQL input literal (enums unquoted). Avoids guessing input type names. */
export function gqlLiteral(v) {
  if (v instanceof Enum) return v.v;
  if (Array.isArray(v)) return `[${v.map(gqlLiteral).join(', ')}]`;
  if (v && typeof v === 'object') return `{ ${Object.entries(v).filter(([, x]) => x !== undefined).map(([k, x]) => `${k}: ${gqlLiteral(x)}`).join(', ')} }`;
  return JSON.stringify(v);
}

async function gql(query, { retries = 2 } = {}) {
  requireKeys(config.buffer, ['apiKey'], 'Buffer');
  let lastErr;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const res = await fetch(config.buffer.endpoint, {
        method: 'POST',
        headers: { Authorization: `Bearer ${config.buffer.apiKey}`, 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ query }),
      });
      const text = await res.text();
      let json;
      try { json = JSON.parse(text); } catch { throw Object.assign(new Error(`Buffer HTTP ${res.status}: ${text.slice(0, 300)}`), { status: res.status }); }
      if (res.status === 401 || res.status === 403) throw Object.assign(new Error(`Buffer auth failed (${res.status}) — check BUFFER_API_KEY`), { fatal: true });
      if (res.status === 429 || res.status >= 500) throw Object.assign(new Error(`Buffer HTTP ${res.status}`), { status: res.status });
      if (json.errors?.length) throw Object.assign(new Error(`Buffer GraphQL: ${json.errors.map((e) => e.message).join('; ')}`), { fatal: true });
      return json.data;
    } catch (e) {
      lastErr = e;
      if (e.fatal || retries === 0) break;
      await new Promise((r) => setTimeout(r, 1500 * 2 ** attempt));
    }
  }
  throw lastErr;
}

export async function discover() {
  const data = await gql('query { account { organizations { id name } } }');
  const orgs = data.account?.organizations ?? [];
  const out = [];
  for (const o of orgs) {
    const ch = await gql(`query { channels(input: ${gqlLiteral({ organizationId: o.id })}) { id name displayName service isQueuePaused } }`);
    out.push({ organization: o, channels: ch.channels });
  }
  return out;
}

export async function getChannel(id) {
  const d = await gql(`query { channel(input: ${gqlLiteral({ id })}) { id name displayName service isQueuePaused } }`);
  return d.channel;
}

/**
 * Create the TikTok post. NOT retried automatically: an ambiguous failure could already have created a post,
 * so the caller marks the entry "needs_review" and reconciles instead of risking a duplicate.
 */
export async function createVideoPost({ text, videoUrl, dueAt, thumbnailOffsetMs = 1500 }) {
  requireKeys(config.buffer, ['channelId'], 'Buffer');
  const input = {
    text,
    channelId: config.buffer.channelId,
    schedulingType: E(config.buffer.schedulingType),
    mode: dueAt ? E('customScheduled') : E('shareNow'),
    dueAt: dueAt || undefined,
    assets: [{ video: { url: videoUrl, metadata: { thumbnailOffset: thumbnailOffsetMs } } }],
  };
  const q = `mutation { createPost(input: ${gqlLiteral(input)}) { ... on PostActionSuccess { post { id text dueAt } } ... on MutationError { message } } }`;
  const d = await gql(q, { retries: 0 });
  const r = d.createPost;
  if (!r?.post) throw Object.assign(new Error(`Buffer rejected the post: ${r?.message ?? 'unknown error'}`), { rejected: true });
  return r.post;
}

/** Best-effort status lookup. Field availability can vary, so failures here never block the pipeline. */
export async function getPost(id) {
  try {
    const d = await gql(`query { post(input: ${gqlLiteral({ id })}) { id status dueAt sentAt } }`, { retries: 1 });
    return d.post;
  } catch (e) {
    return { error: e.message };
  }
}

/** Find a post we may have created during an interrupted run (matched by our concept code in the text). */
export async function findPostByMarker(marker) {
  if (!config.buffer.organizationId) return null;
  for (const status of ['scheduled', 'sent']) {
    try {
      const d = await gql(`query { posts(input: ${gqlLiteral({ organizationId: config.buffer.organizationId, filter: { status: [E(status)], channelIds: [config.buffer.channelId] } })}) { edges { node { id text dueAt } } } }`, { retries: 1 });
      const hit = d.posts?.edges?.map((e) => e.node).find((n) => n.text?.includes(marker));
      if (hit) return { ...hit, status };
    } catch {
      /* ignore — reconciliation is advisory */
    }
  }
  return null;
}
