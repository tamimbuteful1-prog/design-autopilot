import { test } from 'node:test';
import assert from 'node:assert/strict';
import { PALETTES, contrast } from '../src/lib/palettes.mjs';
import { chooseIdea } from '../src/lib/ideas.mjs';
import { CATEGORIES } from '../src/lib/catalog.mjs';
import { writeCopy } from '../src/lib/copy.mjs';
import { checkCopy } from '../src/lib/qa.mjs';
import { gqlLiteral, Enum } from '../src/lib/buffer.mjs';
import { zonedToUtc } from '../src/lib/time.mjs';

test('every palette has readable text contrast', () => {
  for (const p of PALETTES) {
    assert.ok(contrast(p.ink, p.bg) >= 7, `${p.key} ink/bg ${contrast(p.ink, p.bg).toFixed(2)}`);
    assert.ok(contrast(p.ink, p.surface) >= 7, `${p.key} ink/surface`);
    assert.ok(contrast(p.muted, p.surface) >= 3.5, `${p.key} muted/surface ${contrast(p.muted, p.surface).toFixed(2)}`);
    assert.ok(contrast(p.accentInk, p.accent) >= 4.5, `${p.key} accentInk/accent ${contrast(p.accentInk, p.accent).toFixed(2)}`);
  }
});

test('120 days of ideas: categories rotate, no duplicate fingerprints, copy always passes QA', () => {
  const entries = [];
  for (let d = 0; d < 120; d++) {
    const date = new Date(Date.UTC(2026, 9, 19 + d)).toISOString().slice(0, 10);
    const idea = chooseIdea({ entries, date, seed: `${date}:${entries.length}` });
    if (d > 0) {
      const prev = entries[entries.length - 1].idea;
      assert.equal(CATEGORIES.indexOf(idea.category), (CATEGORIES.indexOf(prev.category) + 1) % CATEGORIES.length, 'category rotation');
      assert.notEqual(idea.paletteKey, prev.paletteKey, 'palette changes day to day');
    }
    const copy = writeCopy(idea);
    const failed = checkCopy(copy).filter((c) => !c.ok);
    assert.deepEqual(failed, [], `copy QA for ${idea.code}`);
    entries.push({ id: date, date, idea, status: 'published', copy });
  }
  const fps = entries.map((e) => e.idea.fingerprint);
  assert.equal(new Set(fps).size, fps.length);
  // A subject is not repeated in its category until the others have been used
  for (const cat of CATEGORIES) {
    const subs = entries.filter((e) => e.idea.category === cat).map((e) => e.idea.subjectKey);
    for (let i = 1; i < subs.length; i++) assert.notEqual(subs[i], subs[i - 1], `${cat} subject repeated back-to-back`);
  }
});

test('QA blocks copy that claims client work or contains links', () => {
  const base = { title: 'تصميم جديد رائع', hashtags: ['#a', '#b', '#c'] };
  const bad1 = checkCopy({ ...base, caption: 'هذا تصميم لعميلي الجديد — تصميم مفاهيمي '.repeat(2) });
  assert.ok(bad1.some((c) => c.name === 'no client-work claims' && !c.ok));
  const bad2 = checkCopy({ ...base, caption: 'تصميم مفاهيمي رائع، زوروا https://example.com للمزيد من التفاصيل' });
  assert.ok(bad2.some((c) => c.name === 'no links or emails' && !c.ok));
});

test('GraphQL literal serialiser escapes text and leaves enums bare', () => {
  const s = gqlLiteral({ text: 'سطر "مقتبس"\nثانٍ', mode: new Enum('customScheduled'), assets: [{ video: { url: 'https://x/y.mp4' } }] });
  assert.equal(s, '{ text: "سطر \\"مقتبس\\"\\nثانٍ", mode: customScheduled, assets: [{ video: { url: "https://x/y.mp4" } }] }');
});

test('post slot converts Riyadh local time to UTC', () => {
  assert.equal(zonedToUtc('2026-10-19', '19:00', 'Asia/Riyadh').toISOString(), '2026-10-19T16:00:00.000Z');
});
