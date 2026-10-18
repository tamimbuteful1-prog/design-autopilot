import crypto from 'node:crypto';

// Deterministic PRNG (mulberry32) seeded from any string.
export function makeRng(seedStr) {
  let a = crypto.createHash('sha256').update(String(seedStr)).digest().readUInt32LE(0);
  const next = () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  return {
    next,
    int: (min, max) => Math.floor(next() * (max - min + 1)) + min,
    pick: (arr) => arr[Math.floor(next() * arr.length)],
    shuffle: (arr) => {
      const a2 = [...arr];
      for (let i = a2.length - 1; i > 0; i--) {
        const j = Math.floor(next() * (i + 1));
        [a2[i], a2[j]] = [a2[j], a2[i]];
      }
      return a2;
    },
    float: (min, max) => min + next() * (max - min),
  };
}

export const sha = (s) => crypto.createHash('sha256').update(String(s)).digest('hex');
