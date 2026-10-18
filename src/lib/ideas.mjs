import { CATEGORIES, CATEGORY_META, SUBJECTS } from './catalog.mjs';
import { PALETTES, STYLES } from './palettes.mjs';
import { makeRng, sha } from './rng.mjs';

// Fingerprint = the "idea" identity. Same subject+style+palette in the same category is a duplicate.
export const fingerprintOf = (i) => sha(`${i.category}|${i.subjectKey}|${i.styleKey}|${i.paletteKey}`).slice(0, 16);

/**
 * Choose the next idea.
 * - Categories rotate in a fixed order, continuing from the last entry in the ledger.
 * - A subject is not reused in its category until every other subject has been used (rolling window).
 * - The exact fingerprint (category+subject+style+palette) is never reused.
 * - Palette and style also avoid the previous 3 videos so consecutive posts look different.
 */
export function chooseIdea({ entries, date, seed = date }) {
  const valid = entries.filter((e) => e.idea && !['rejected', 'failed'].includes(e.status));
  const last = valid[valid.length - 1];
  const nextCatIndex = last ? (CATEGORIES.indexOf(last.idea.category) + 1) % CATEGORIES.length : 0;
  const usedFingerprints = new Set(entries.filter((e) => e.idea).map((e) => e.idea.fingerprint));
  const recent = valid.slice(-3).map((e) => e.idea);

  for (let attempt = 0; attempt < 200; attempt++) {
    const rng = makeRng(`${seed}#${attempt}`);
    const category = CATEGORIES[(nextCatIndex + Math.floor(attempt / 50)) % CATEGORIES.length];
    const subjects = SUBJECTS[category];
    const window = Math.max(0, subjects.length - 1);
    const recentSubjects = new Set(valid.filter((e) => e.idea.category === category).slice(-window).map((e) => e.idea.subjectKey));
    const fresh = subjects.filter((s) => !recentSubjects.has(s.key));
    const subject = rng.pick(fresh.length ? fresh : subjects);
    const palette = rng.pick(PALETTES.filter((p) => !recent.some((r) => r.paletteKey === p.key)));
    const style = rng.pick(STYLES.filter((s) => !recent.slice(-2).some((r) => r.styleKey === s.key)));
    const candidate = { category, subjectKey: subject.key, styleKey: style.key, paletteKey: palette.key };
    const fp = fingerprintOf(candidate);
    if (usedFingerprints.has(fp)) continue;

    const brand = rng.pick(subject.brands);
    const conceptNo = entries.filter((e) => e.idea).length + 1;
    return {
      ...candidate,
      fingerprint: fp,
      conceptNo,
      code: `C${String(conceptNo).padStart(3, '0')}`,
      date,
      brand,
      subject: { ar: subject.ar, en: subject.en },
      categoryMeta: { ar: CATEGORY_META[category].ar, en: CATEGORY_META[category].en },
      icon: subject.icon,
      shape: subject.shape ?? null,
      palette,
      style,
      content: subject.content(rng),
      seed: `${seed}#${attempt}`,
    };
  }
  throw new Error('Idea space exhausted: extend src/lib/catalog.mjs with new subjects');
}
