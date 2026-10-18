// Original procedurally-generated soundtrack (no third-party music => no copyright claims).
// A soft lo-fi/ambient bed: chord pad, sub bass, kick + hats, and whooshes on scene changes.
import fs from 'node:fs';
import { execFileSync } from 'node:child_process';
import { makeRng } from './rng.mjs';

const SR = 44100;
const PROGRESSIONS = [
  [[57, 60, 64, 67], [53, 57, 60, 64], [48, 52, 55, 59], [55, 59, 62, 65]], // Am7 Fmaj7 Cmaj7 G7
  [[50, 53, 57, 60], [55, 59, 62, 65], [48, 52, 55, 59], [45, 48, 52, 55]], // Dm7 G7 Cmaj7 Am7
  [[52, 55, 59, 62], [48, 52, 55, 59], [55, 59, 62, 66], [50, 54, 57, 60]], // Em7 Cmaj7 Gmaj7 D7
  [[53, 57, 60, 64], [52, 55, 59, 62], [50, 53, 57, 60], [48, 52, 55, 58]], // Fmaj7 Em7 Dm7 C7
];
const mtof = (m) => 440 * 2 ** ((m - 69) / 12);

export function synthesize({ seconds, seed, cues = [] }) {
  const rng = makeRng(`audio:${seed}`);
  const n = Math.round(seconds * SR);
  const L = new Float32Array(n);
  const R = new Float32Array(n);
  const prog = rng.pick(PROGRESSIONS);
  const transpose = rng.int(-2, 2);
  const bpm = rng.int(92, 108);
  const beat = 60 / bpm;
  const bar = beat * 4;

  // Pad: detuned saws through a one-pole low-pass, chord per bar
  const lp = [0, 0];
  const phases = new Float64Array(16);
  for (let i = 0; i < n; i++) {
    const t = i / SR;
    const chord = prog[Math.floor(t / bar) % prog.length];
    const barPos = (t % bar) / bar;
    const env = Math.min(1, barPos * 6) * (0.75 + 0.25 * Math.cos(barPos * Math.PI * 2));
    let sL = 0;
    let sR = 0;
    chord.forEach((note, k) => {
      const f = mtof(note + transpose);
      for (let d = 0; d < 2; d++) {
        const idx = k * 2 + d;
        phases[idx] += (f * (d ? 1.004 : 0.996)) / SR;
        const saw = 2 * (phases[idx] % 1) - 1;
        if (d) sR += saw; else sL += saw;
      }
    });
    const cutoff = 0.035 + 0.02 * Math.sin(t * 0.35);
    lp[0] += cutoff * (sL - lp[0]);
    lp[1] += cutoff * (sR - lp[1]);
    L[i] += lp[0] * 0.055 * env;
    R[i] += lp[1] * 0.055 * env;

    // Sub bass on chord root
    const root = mtof(chord[0] + transpose - 24);
    const b = Math.sin(2 * Math.PI * root * t) * 0.12 * Math.min(1, ((t % beat) / beat) * 8) * (1 - 0.5 * ((t % beat) / beat));
    L[i] += b;
    R[i] += b;
  }

  // Drums (start after the hook so the opening breathes)
  const drumStart = beat * 4;
  for (let tb = drumStart; tb < seconds - beat; tb += beat) {
    const s0 = Math.round(tb * SR);
    for (let j = 0; j < SR * 0.35 && s0 + j < n; j++) {
      const t = j / SR;
      const f = 50 + 90 * Math.exp(-t * 30);
      const v = Math.sin(2 * Math.PI * f * t) * Math.exp(-t * 9) * 0.38;
      L[s0 + j] += v;
      R[s0 + j] += v;
    }
    for (const off of [beat / 2]) {
      const h0 = Math.round((tb + off) * SR);
      let prev = 0;
      for (let j = 0; j < SR * 0.05 && h0 + j < n; j++) {
        const w = rng.next() * 2 - 1;
        const hp = w - prev;
        prev = w;
        const v = hp * Math.exp(-(j / SR) * 70) * 0.05;
        L[h0 + j] += v * 0.8;
        R[h0 + j] += v;
      }
    }
  }

  // Whooshes at scene cues (filtered noise swell)
  for (const c of cues) {
    const len = 0.7;
    const s0 = Math.round(Math.max(0, c - len * 0.7) * SR);
    let lpw = 0;
    for (let j = 0; j < len * SR && s0 + j < n; j++) {
      const x = j / (len * SR);
      const env = Math.sin(Math.PI * x) ** 2;
      lpw += (0.02 + 0.25 * x) * (rng.next() * 2 - 1 - lpw);
      const pan = x;
      L[s0 + j] += lpw * env * 0.5 * (1 - pan * 0.6);
      R[s0 + j] += lpw * env * 0.5 * (0.4 + pan * 0.6);
    }
  }

  // Global fade in/out
  const fi = SR * 0.4;
  const fo = SR * 1.2;
  for (let i = 0; i < n; i++) {
    const g = Math.min(1, i / fi, (n - i) / fo);
    L[i] = Math.tanh(L[i] * g * 1.2);
    R[i] = Math.tanh(R[i] * g * 1.2);
  }
  return { L, R, bpm };
}

export function writeWav(file, { L, R }) {
  const n = L.length;
  const buf = Buffer.alloc(44 + n * 4);
  buf.write('RIFF', 0);
  buf.writeUInt32LE(36 + n * 4, 4);
  buf.write('WAVEfmt ', 8);
  buf.writeUInt32LE(16, 16);
  buf.writeUInt16LE(1, 20);
  buf.writeUInt16LE(2, 22);
  buf.writeUInt32LE(SR, 24);
  buf.writeUInt32LE(SR * 4, 28);
  buf.writeUInt16LE(4, 32);
  buf.writeUInt16LE(16, 34);
  buf.write('data', 36);
  buf.writeUInt32LE(n * 4, 40);
  for (let i = 0; i < n; i++) {
    buf.writeInt16LE(Math.max(-32767, Math.min(32767, Math.round(L[i] * 32767))), 44 + i * 4);
    buf.writeInt16LE(Math.max(-32767, Math.min(32767, Math.round(R[i] * 32767))), 46 + i * 4);
  }
  fs.writeFileSync(file, buf);
}

/** Mux the soundtrack into the silent render, normalised to about -14 LUFS (typical for short-form platforms). */
export function muxAudio({ video, wav, out }) {
  execFileSync('ffmpeg', [
    '-y', '-loglevel', 'error',
    '-i', video, '-i', wav,
    '-filter:a', 'loudnorm=I=-14:TP=-1.5:LRA=11',
    '-map', '0:v:0', '-map', '1:a:0',
    // Final encode: broadcast-range yuv420p H.264 High@4.2 with BT.709 tags — the safest profile for TikTok ingest.
    '-c:v', 'libx264', '-preset', 'slow', '-crf', '19', '-maxrate', '12M', '-bufsize', '24M',
    '-pix_fmt', 'yuv420p', '-profile:v', 'high', '-level', '4.2', '-r', '30',
    '-vf', 'scale=in_range=full:out_range=tv,format=yuv420p',
    '-colorspace', 'bt709', '-color_primaries', 'bt709', '-color_trc', 'bt709', '-color_range', 'tv',
    '-c:a', 'aac', '-b:a', '192k', '-ar', '44100',
    '-shortest', '-movflags', '+faststart',
    out,
  ]);
}
