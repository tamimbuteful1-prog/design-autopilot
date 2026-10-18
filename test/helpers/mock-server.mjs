// Local stand-in for the Buffer GraphQL API, the GitHub REST API and a public media host.
import http from 'node:http';

export async function startMock() {
  const state = { buffer: [], github: [], posts: [], issues: 0, failNextCreate: null };
  const server = http.createServer(async (req, res) => {
    let body = '';
    for await (const c of req) body += c;
    const send = (code, obj, headers = {}) => { res.writeHead(code, { 'Content-Type': 'application/json', ...headers }); res.end(obj === undefined ? '' : JSON.stringify(obj)); };

    if (req.url.startsWith('/buffer')) {
      if (req.headers.authorization !== 'Bearer test-key') return send(401, { errors: [{ message: 'unauthorized' }] });
      const { query } = JSON.parse(body);
      state.buffer.push(query);
      if (query.includes('createPost')) {
        if (state.failNextCreate === 'reject') { state.failNextCreate = null; return send(200, { data: { createPost: { message: 'Video could not be processed' } } }); }
        if (state.failNextCreate === '502') { state.failNextCreate = null; return send(502, { error: 'bad gateway' }); }
        const text = JSON.parse(query.match(/text: ("(?:[^"\\]|\\.)*")/)[1]);
        const due = query.match(/dueAt: "([^"]+)"/)?.[1] ?? null;
        const post = { id: `post_${state.posts.length + 1}`, text, dueAt: due, status: due ? 'scheduled' : 'sent' };
        state.posts.push(post);
        return send(200, { data: { createPost: { post: { id: post.id, text, dueAt: due } } } });
      }
      if (query.includes('posts(')) {
        const status = query.match(/status: \[(\w+)\]/)[1];
        return send(200, { data: { posts: { edges: state.posts.filter((p) => p.status === status).map((node) => ({ node })) } } });
      }
      if (query.includes('post(')) {
        const id = query.match(/id: "([^"]+)"/)[1];
        const p = state.posts.find((x) => x.id === id);
        return send(200, { data: { post: p ? { id: p.id, status: p.status, dueAt: p.dueAt, sentAt: null } : null } });
      }
      if (query.includes('account')) return send(200, { data: { account: { organizations: [{ id: 'org_1', name: 'Test org' }] } } });
      if (query.includes('channels(')) return send(200, { data: { channels: [{ id: 'chan_tiktok', name: 'design.account', displayName: 'Design', service: 'tiktok', isQueuePaused: false }] } });
      return send(400, { errors: [{ message: 'unknown query' }] });
    }

    if (req.url.startsWith('/github')) {
      state.github.push({ method: req.method, url: req.url, body: body ? JSON.parse(body) : null });
      if (req.url.includes('/labels/')) return send(200, { name: 'x' });
      if (req.method === 'POST' && req.url.endsWith('/issues')) return send(201, { number: ++state.issues });
      return send(200, {});
    }

    if (req.url.startsWith('/media/')) {
      return send(206, undefined, { 'Content-Type': 'video/mp4', 'Content-Range': 'bytes 0-1023/1000000' });
    }
    send(404, { error: 'not found' });
  });
  await new Promise((r) => server.listen(0, '127.0.0.1', r));
  const base = `http://127.0.0.1:${server.address().port}`;
  return { state, base, close: () => new Promise((r) => server.close(r)) };
}
