// Dev helper: render a contact sheet of key frames for one idea per category.
import fs from 'node:fs';
import { execFileSync } from 'node:child_process';
import { chooseIdea } from '../src/lib/ideas.mjs';
import { renderFrame } from '../src/lib/render.mjs';
const out = process.argv[2] || 'out/preview';
const cats = (process.argv[3] || 'mobile,dashboard,website,uiux,product,packaging').split(',');
const frames = (process.argv[4] || '30,150,206,316,426,560').split(',').map(Number);
fs.mkdirSync(out, { recursive: true });
let entries = [];
for (let day = 0; day < 12 && cats.length; day++) {
  const idea = chooseIdea({ entries, date: `2026-10-${String(19 + day).padStart(2, '0')}`, seed: process.env.SEED ? process.env.SEED + day : undefined });
  entries.push({ idea, status: 'published' });
  if (!cats.includes(idea.category)) continue;
  cats.splice(cats.indexOf(idea.category), 1);
  const props = { idea, handle: '@your.design.studio', cta: 'تحتاج تصميمًا مثل هذا؟ راسلني', seconds: 24 };
  const files = [];
  for (const f of frames) files.push(await renderFrame(props, f, `${out}/${idea.category}-${f}.jpg`));
  execFileSync('ffmpeg', ['-y', '-loglevel', 'error', ...files.flatMap((x) => ['-i', x]), '-filter_complex', `${files.map((_, i) => `[${i}]`).join('')}hstack=${files.length},scale=2400:-1`, `${out}/sheet-${idea.category}.jpg`]);
  console.log('sheet', idea.category, idea.subjectKey, idea.styleKey, idea.paletteKey);
}
