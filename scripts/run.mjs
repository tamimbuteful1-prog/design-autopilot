#!/usr/bin/env node
// CLI: node scripts/run.mjs <command> [args]
import * as P from '../src/lib/pipeline.mjs';
import { discover } from '../src/lib/buffer.mjs';
import { buildDashboardData } from '../src/lib/dashboard.mjs';
import { loadLedger, loadControl } from '../src/lib/ledger.mjs';
import { reportFailure } from '../src/lib/notify.mjs';
import { config } from '../src/lib/config.mjs';

const [cmd, ...args] = process.argv.slice(2);
const by = process.env.ACTOR || 'owner';

const commands = {
  daily: async () => { await P.sync().catch((e) => console.warn('sync skipped:', e.message)); return P.daily({ date: args[0] || undefined, force: args.includes('--force') }); },
  generate: () => P.generate({ date: args[0] }),
  'publish-approved': async () => { for (const e of loadLedger().entries.filter((x) => x.status === 'approved')) await P.publish(e.id); },
  approve: () => P.approve(args[0], by),
  reject: () => P.reject(args[0], by, args.slice(1).join(' ')),
  retry: () => P.retry(args[0]),
  pause: () => P.setPaused(true, by, args.join(' ') || null),
  resume: async () => { P.setPaused(false, by); for (const e of loadLedger().entries.filter((x) => x.status === 'approved')) await P.publish(e.id); },
  'auto-on': () => P.setAutoMode(true, by),
  'auto-off': () => P.setAutoMode(false, by),
  sync: () => P.sync(),
  services: () => P.servicesVideo(),
  discover: async () => console.log(JSON.stringify(await discover(), null, 2)),
  dashboard: () => buildDashboardData(),
  status: () => {
    const c = loadControl();
    console.log(`paused=${c.paused} autoMode=${Boolean(c.autoMode)} dryRun=${config.dryRun}`);
    for (const e of loadLedger().entries) console.log(`${e.id.padEnd(18)} ${String(e.status).padEnd(18)} ${e.idea?.category}/${e.idea?.subjectKey} ${e.buffer?.postId ?? ''}`);
  },
};

if (!commands[cmd]) {
  console.log(`Usage: node scripts/run.mjs <${Object.keys(commands).join('|')}> [args]`);
  process.exit(2);
}
try {
  await commands[cmd]();
} catch (e) {
  process.exitCode = 1;
  if (['daily', 'approve', 'resume', 'publish-approved', 'retry'].includes(cmd)) await reportFailure({ stage: cmd, error: e });
  else console.error(e.message);
} finally {
  try { buildDashboardData(); } catch (e) { console.warn('dashboard data not updated:', e.message); }
}
