// Original, procedurally-generated summer house track (no third-party music => no copyright claims).
// 128.6 BPM, locked to the video cut: 3-beat build → drop on the first design shot → groove → hit on the CTA.
import fs from 'node:fs';
import { execFileSync } from 'node:child_process';
import { makeRng } from './rng.mjs';
import { TL } from './timeline.mjs';

const SR = 44100;
const mtof = (m) => 440 * 2 ** ((m - 69) / 12);

// Bright major progressions (I–V–vi–IV family), as semitone offsets from the key root.
const PROGRESSIONS = [
  [[0, 4, 7], [7, 11, 14], [9, 12, 16], [5, 9, 12]],
  [[9, 12, 16], [5, 9, 12], [0, 4, 7], [7, 11, 14]],
  [[5, 9, 12], [7, 11, 14], [4, 7, 11], [9, 12, 16]],
  [[0, 4, 7], [9, 12, 16], [5, 9, 12], [7, 11, 14]],
];
const PENTA = [0, 2, 4, 7, 9];
// 16-step rhythms (1 = hit) for chord stabs and lead plucks
const STAB_PATTERNS = ['0010001000100010', '1001001000100100', '0010010010010010'];
const LEAD_PATTERNS = ['1011010110110101', '1010110110101101', '1101101011011010'];

export function synthesize({ seconds, seed }) {
  const rng = makeRng(`audio:${seed}`);
  const n = Math.round(seconds * SR);
  const drums = [new Float32Array(n), new Float32Array(n)];
  const music = [new Float32Array(n), new Float32Array(n)];
  const send = [new Float32Array(n), new Float32Array(n)];
  const beat = TL.beatFrames / TL.fps; // 0.4667 s
  const step = beat / 4;
  const drop = TL.dropFrame / TL.fps;
  const ctaAt = TL.shots.cta[0] / TL.fps;
  const end = seconds - 0.35;
  const key = 48 + rng.pick([0, 2, 5, 7, -3]); // C, D, F, G or A as tonic (bass octave)
  const prog = rng.pick(PROGRESSIONS);
  const stab = rng.pick(STAB_PATTERNS);
  const lead = rng.pick(LEAD_PATTERNS);
  const melody = Array.from({ length: 16 }, () => rng.pick(PENTA) + 12 * rng.int(0, 1));

  const put = (bus, i, l, r) => { if (i >= 0 && i < n) { bus[0][i] += l; bus[1][i] += r; } };

  const kick = (t, g = 1) => {
    const s0 = Math.round(t * SR);
    let ph = 0;
    for (let j = 0; j < SR * 0.32; j++) {
      const x = j / SR;
      ph += (45 + 120 * Math.exp(-x * 38)) / SR;
      const v = (Math.sin(2 * Math.PI * ph) * Math.exp(-x * 7) + (j < 60 ? (rng.next() - 0.5) * 0.4 : 0)) * 0.9 * g;
      put(drums, s0 + j, v, v);
    }
  };
  const clap = (t, g = 1) => {
    const s0 = Math.round(t * SR);
    let bp1 = 0, bp2 = 0;
    for (let j = 0; j < SR * 0.22; j++) {
      const x = j / SR;
      const env = (x < 0.03 ? [0, 0.01, 0.02].reduce((a, o) => a + (x >= o ? Math.exp(-(x - o) * 180) : 0), 0) : 0) + Math.exp(-x * 22) * 0.6;
      const w = rng.next() * 2 - 1;
      bp1 += 0.35 * (w - bp1); bp2 += 0.35 * (bp1 - bp2);
      const v = (bp1 - bp2) * env * 0.9 * g;
      put(drums, s0 + j, v * 0.9, v);
      if (j % 2 === 0) put(send, s0 + j, v * 0.25, v * 0.25);
    }
  };
  const hat = (t, open, g = 1) => {
    const s0 = Math.round(t * SR);
    let prev = 0;
    const len = open ? 0.16 : 0.035;
    for (let j = 0; j < SR * len; j++) {
      const w = rng.next() * 2 - 1;
      const hp = w - prev; prev = w;
      const v = hp * Math.exp(-(j / SR) * (open ? 18 : 90)) * (open ? 0.15 : 0.1) * g;
      put(drums, s0 + j, v * 0.8, v);
    }
  };
  const shaker = (t, g = 1) => {
    const s0 = Math.round(t * SR);
    let prev = 0;
    for (let j = 0; j < SR * 0.05; j++) {
      const w = rng.next() * 2 - 1; const hp = w - prev; prev = w;
      const x = j / SR;
      const v = hp * Math.sin(Math.PI * Math.min(1, x / 0.05)) * 0.05 * g;
      put(drums, s0 + j, v, v * 0.7);
    }
  };
  // Plucked synth: decaying harmonic series (bright attack, mellow tail)
  const pluck = (t, midi, dur, amp, pan = 0, bright = 1, bus = music, sendAmt = 0.3) => {
    const s0 = Math.round(t * SR);
    const f = mtof(midi);
    const H = Math.min(12, Math.floor(9000 / f));
    for (let j = 0; j < SR * dur; j++) {
      const x = j / SR;
      let v = 0;
      for (let k = 1; k <= H; k++) v += (Math.sin(2 * Math.PI * f * k * x + k) / k) * Math.exp(-x * (4 + k * 3.2 / bright));
      v *= amp * Math.min(1, x * 400) * (j > SR * dur - 400 ? (SR * dur - j) / 400 : 1);
      put(bus, s0 + j, v * (1 - pan) , v * (1 + pan));
      put(send, s0 + j, v * sendAmt, v * sendAmt);
    }
  };
  const bass = (t, midi, dur, amp) => {
    const s0 = Math.round(t * SR);
    const f = mtof(midi);
    for (let j = 0; j < SR * dur; j++) {
      const x = j / SR;
      const v = (Math.sin(2 * Math.PI * f * x) + 0.35 * Math.sin(4 * Math.PI * f * x) + 0.12 * Math.sin(6 * Math.PI * f * x)) * Math.exp(-x * 5) * Math.min(1, x * 300) * amp;
      put(music, s0 + j, v, v);
    }
  };
  const noiseSweep = (t0, t1, amp, up = true) => {
    let lp = 0;
    for (let i = Math.round(t0 * SR); i < Math.min(n, Math.round(t1 * SR)); i++) {
      const x = (i / SR - t0) / (t1 - t0);
      const c = up ? 0.02 + 0.5 * x * x : 0.5 - 0.48 * x;
      lp += c * (rng.next() * 2 - 1 - lp);
      const v = lp * amp * (up ? x * x : (1 - x) ** 2);
      put(drums, i, v * (1 - x * 0.5), v * (0.5 + x * 0.5));
    }
  };
  const impact = (t) => {
    const s0 = Math.round(t * SR);
    let ph = 0;
    for (let j = 0; j < SR * 0.9; j++) {
      const x = j / SR;
      ph += (32 + 70 * Math.exp(-x * 12)) / SR;
      const v = Math.sin(2 * Math.PI * ph) * Math.exp(-x * 3.5) * 0.7;
      put(drums, s0 + j, v, v);
    }
    noiseSweep(t, t + 0.8, 0.35, false);
  };

  // ---- Arrangement ----
  const chordAt = (t) => prog[Math.floor(Math.max(0, t - drop) / (beat * 4)) % prog.length];

  // Build (0 → drop): rising filtered chords, accelerating snare roll, riser
  for (let t = 0; t < drop - 0.01; t += beat / 2) pluck(t, key + 24 + prog[0][0], 0.3, 0.07 + 0.08 * (t / drop), 0, 0.6 + t / drop);
  let rollStep = beat / 2;
  for (let t = 0; t < drop - 0.05; t += rollStep) { clap(t, 0.25 + 0.6 * (t / drop)); if (t > drop * 0.5) rollStep = beat / 4; if (t > drop * 0.8) rollStep = beat / 8; }
  noiseSweep(0, drop - 0.02, 0.5, true);
  impact(drop);

  // Groove (drop → end)
  for (let b = 0; drop + b * beat < end; b++) {
    const t = drop + b * beat;
    const atCta = Math.abs(t - ctaAt) < 0.01;
    kick(t, b === 0 || atCta ? 1.15 : 1);
    if (b % 2 === 1) clap(t, 0.75);
    hat(t + beat / 2, true);
    for (let s = 0; s < 4; s++) shaker(t + s * step, s % 2 ? 1 : 0.6);
    const ch = chordAt(t);
    bass(t + beat / 2, key - 12 + ch[0] + 12, beat / 2 - 0.02, 0.32);
    bass(t + beat * 0.75, key - 12 + ch[0] + 12, beat / 4 - 0.02, 0.18);
  }
  for (let i = 0; drop + i * step < end; i++) {
    const t = drop + i * step;
    const s16 = i % 16;
    const ch = chordAt(t);
    if (stab[s16] === '1') ch.forEach((iv, k) => pluck(t, key + 24 + iv, 0.22, 0.05, (k - 1) * 0.35, 1.1));
    if (lead[s16] === '1') {
      const m = key + 36 + (melody[s16] + (ch[0] > 6 ? 0 : 0));
      pluck(t, m, 0.18, 0.06, s16 % 2 ? 0.3 : -0.3, 1.6, music, 0.45);
    }
  }
  impact(ctaAt);
  noiseSweep(ctaAt - beat * 2, ctaAt - 0.02, 0.3, true);
  // Final hit
  kick(end - 0.05, 1.2);
  prog[0].forEach((iv, k) => pluck(end - 0.05, key + 24 + iv, 0.6, 0.08, (k - 1) * 0.4, 1));

  // ---- Mix ----
  // Sidechain ducking of the music bus on every kick after the drop
  for (let i = 0; i < n; i++) {
    const t = i / SR;
    if (t >= drop) {
      const since = (t - drop) % beat;
      const duck = 1 - 0.55 * Math.exp(-since * 14);
      music[0][i] *= duck; music[1][i] *= duck;
    }
  }
  // Small room reverb (parallel combs) on the send bus
  const rev = [new Float32Array(n), new Float32Array(n)];
  [[1557, 1617, 1491, 1422], [1277, 1356, 1188, 1116]].forEach((delays, ch) => {
    delays.forEach((d) => {
      const buf = new Float32Array(d); let idx = 0;
      for (let i = 0; i < n; i++) {
        const y = buf[idx];
        buf[idx] = send[ch][i] + y * 0.78;
        idx = (idx + 1) % d;
        rev[ch][i] += y * 0.12;
      }
    });
  });
  const L = new Float32Array(n);
  const R = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const g = Math.min(1, (n - i) / (SR * 0.12));
    L[i] = Math.tanh((drums[0][i] + music[0][i] + rev[0][i]) * 1.1) * g;
    R[i] = Math.tanh((drums[1][i] + music[1][i] + rev[1][i]) * 1.1) * g;
  }
  return { L, R, bpm: 60 / beat };
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

/** Mux the soundtrack into the silent render; loud and punchy (~-12 LUFS) like short-form ads. */
export function muxAudio({ video, wav, out }) {
  execFileSync('ffmpeg', [
    '-y', '-loglevel', 'error',
    '-i', video, '-i', wav,
    '-filter:a', 'acompressor=threshold=-14dB:ratio=3:attack=5:release=80,loudnorm=I=-12:TP=-2:LRA=9,alimiter=limit=0.75:level=false',
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
