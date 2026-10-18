// "What we offer" video: one continuous camera flight across a board of six service artboards.
import React from 'react';
import { AbsoluteFill, Easing, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { AR, MONO, ensureFonts } from './fonts';
import { OffsetProvider, SpeedProvider, ThemeProvider, hexA, type Idea } from './ui';
import { CANVASES, Cta, isLight } from './Reel';
import SERVICES from '../shared/services.json';

export type ServicesProps = { ideas: Idea[]; handle: string; cta: string };
const SVC = SERVICES as Record<string, { name: { ar: string; en: string }; offers: string[][] }>;

export const SERVICES_TIMELINE = { total: 438, drop: 56, enter: [56, 98], cellFrames: 42, outro: [350, 372], cta: 378 };
const T = SERVICES_TIMELINE;
const CELL_W = 1700;
const CELL_H = 2500;
const COLS = 2;
const clamp = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const;
const smooth = Easing.bezier(0.65, 0, 0.35, 1);
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

// Brand-neutral studio palette for the frame around the artboards
const STUDIO = { bg: '#0E0F12', ink: '#F4F5F7', accent: '#FF5A36', accentInk: '#FFFFFF', accent2: '#FFC93C', surface: '#1A1C21', line: '#2A2D34', muted: '#9CA0A8', surface2: '#22252B', mode: 'dark', name: 'Studio', key: 'studio' };

function cellCenter(i: number) {
  return { x: (i % COLS) * CELL_W + CELL_W / 2, y: Math.floor(i / COLS) * CELL_H + CELL_H / 2 };
}

export const ServicesReel: React.FC<ServicesProps> = ({ ideas, handle, cta }) => {
  ensureFonts();
  const frame = useCurrentFrame();
  const { width: VW, height: VH } = useVideoConfig();
  const rows = Math.ceil(ideas.length / COLS);
  const W = COLS * CELL_W;
  const H = rows * CELL_H;
  const world = { x: W / 2, y: H / 2, s: Math.min(VW / W, (VH - 200) / H) * 0.98 };
  const cells = ideas.map((_, i) => ({ ...cellCenter(i), s: 0.62 }));

  // Camera path: far → whole board → each artboard (with a gentle pull-back between) → whole board
  const keys: { f: number; x: number; y: number; s: number; dip?: number }[] = [
    { f: T.enter[0], ...world, s: world.s * 0.45 },
    { f: T.enter[1], ...world },
  ];
  cells.forEach((c, i) => {
    const arrive = T.enter[1] + i * T.cellFrames + 18;
    keys.push({ f: arrive, ...c, dip: i === 0 ? 0.05 : 0.35 });
    keys.push({ f: T.enter[1] + (i + 1) * T.cellFrames, x: c.x + 20, y: c.y + 14, s: c.s * 1.05 });
  });
  keys.push({ f: T.outro[1], ...world, dip: 0.05 });
  let k = 0;
  while (k < keys.length - 2 && frame > keys[k + 1].f) k++;
  const a = keys[k];
  const b = keys[k + 1];
  const holding = b.dip === undefined && k > 1;
  const t = interpolate(frame, [a.f, b.f], [0, 1], { ...clamp, easing: holding ? Easing.linear : k === 0 ? Easing.bezier(0.16, 1, 0.3, 1) : smooth });
  const cam = {
    x: lerp(a.x, b.x, t),
    y: lerp(a.y, b.y, t),
    s: Math.exp(lerp(Math.log(a.s), Math.log(b.s), t)) * (1 - (b.dip ?? 0) * Math.sin(Math.PI * t)),
  };
  const activeCell = Math.floor((frame - T.enter[1]) / T.cellFrames);
  const dive = interpolate(frame, [T.outro[1] - 4, T.cta + 4], [0, 1], { ...clamp, easing: Easing.in(Easing.cubic) });

  return (
    <ThemeProvider value={{ p: STUDIO as any, s: ideas[0].style, idea: ideas[0] }}>
      <AbsoluteFill style={{ background: STUDIO.bg, overflow: 'hidden', fontFamily: 'Inter, sans-serif' }}>
        {frame >= 40 && frame < T.cta + 8 && (
          <AbsoluteFill style={{ transform: `scale(${1 + dive * 10})` }}>
            <AbsoluteFill style={{ background: `radial-gradient(1100px 1100px at 15% 10%, ${hexA(STUDIO.accent, 0.25)}, transparent 60%), radial-gradient(1000px 1000px at 90% 90%, ${hexA(STUDIO.accent2, 0.18)}, transparent 60%)` }} />
            <div style={{ position: 'absolute', left: 0, top: 0, width: W, height: H, transformOrigin: '0 0', transform: `translate(${VW / 2 - cam.x * cam.s}px, ${VH / 2 + 40 - cam.y * cam.s}px) scale(${cam.s})` }}>
              {ideas.map((idea, i) => <Artboard key={i} idea={idea} index={i} arrive={T.enter[1] + i * T.cellFrames} />)}
            </div>
            {ideas.map((idea, i) => <CellLabel key={i} idea={idea} index={i} total={ideas.length} active={activeCell === i} from={T.enter[1] + i * T.cellFrames + 10} to={T.enter[1] + (i + 1) * T.cellFrames + 4} />)}
          </AbsoluteFill>
        )}
        {frame < 62 && <Hook count={ideas.length} />}
        {frame >= T.cta - 8 && (
          <ThemeProvider value={{ p: STUDIO as any, s: ideas[0].style, idea: { ...ideas[0], palette: STUDIO as any } }}>
            <Cta handle={handle} cta={cta} from={T.cta} />
          </ThemeProvider>
        )}
      </AbsoluteFill>
    </ThemeProvider>
  );
};

const Hook: React.FC<{ count: number }> = ({ count }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const in1 = spring({ frame, fps, config: { damping: 200 } });
  const past1 = interpolate(frame, [20, 30], [0, 1], { ...clamp, easing: Easing.in(Easing.cubic) });
  const in2 = spring({ frame: frame - 24, fps, config: { damping: 200, mass: 0.9 } });
  const dive = interpolate(frame, [42, 60], [0, 1], { ...clamp, easing: Easing.in(Easing.cubic) });
  return (
    <AbsoluteFill style={{ background: `radial-gradient(900px 900px at 50% 45%, ${hexA(STUDIO.accent, 0.35 * (1 - dive))}, transparent 70%), ${hexA('#23262D', 1 - dive)}`, transform: `scale(${1 + dive * 9})`, opacity: 1 - interpolate(dive, [0.55, 1], [0, 1], clamp), justifyContent: 'center', alignItems: 'center' }}>
      <div dir="rtl" style={{ position: 'absolute', fontFamily: AR, fontWeight: 700, fontSize: 170, color: STUDIO.ink, transform: `scale(${(0.7 + in1 * 0.3) * (1 + past1 * 3)})`, opacity: in1 * (1 - past1), filter: past1 > 0 ? `blur(${past1 * 14}px)` : undefined }}>وش نقدم؟</div>
      <div dir="rtl" style={{ position: 'absolute', fontFamily: AR, fontWeight: 700, fontSize: 140, lineHeight: 1.2, textAlign: 'center', color: STUDIO.accent, transform: `scale(${0.35 + in2 * 0.65})`, opacity: in2, filter: in2 < 0.9 ? `blur(${(1 - in2) * 16}px)` : undefined }}>
        {count} خدمات<br />تصميم
      </div>
    </AbsoluteFill>
  );
};

const Artboard: React.FC<{ idea: Idea; index: number; arrive: number }> = ({ idea, index, arrive }) => {
  const entry = CANVASES[idea.category];
  const L = entry.layout(idea);
  const c = cellCenter(index);
  const inner = Math.min((CELL_W - 140) / L.width, (CELL_H - 300) / L.height);
  const p = idea.palette;
  return (
    <ThemeProvider value={{ p, s: idea.style, idea }}>
      <div style={{ position: 'absolute', left: c.x - CELL_W / 2 + 40, top: c.y - CELL_H / 2 + 40, width: CELL_W - 80, height: CELL_H - 80, borderRadius: 80, background: p.bg, overflow: 'hidden', boxShadow: `0 60px 120px -40px ${hexA('#000000', 0.7)}` }}>
        <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(900px 900px at 20% 15%, ${hexA(p.accent, 0.25)}, transparent 60%)` }} />
        <div style={{ position: 'absolute', left: (CELL_W - 80 - L.width * inner) / 2, top: 200, width: L.width, height: L.height, transformOrigin: '0 0', transform: `scale(${inner})` }}>
          <OffsetProvider value={T.enter[0] - 6}>
            <SpeedProvider value={2.4}>
              <entry.C />
            </SpeedProvider>
          </OffsetProvider>
        </div>
        <div dir="rtl" style={{ position: 'absolute', top: 60, right: 70, fontFamily: AR, fontWeight: 700, fontSize: 92, color: p.ink }}>{SVC[idea.category].name.ar}</div>
        <div style={{ position: 'absolute', top: 80, left: 70, fontFamily: MONO, fontSize: 44, color: p.muted }}>0{index + 1}</div>
      </div>
    </ThemeProvider>
  );
};

const CellLabel: React.FC<{ idea: Idea; index: number; total: number; active: boolean; from: number; to: number }> = ({ idea, index, total, from, to }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  if (frame < from - 2 || frame > to + 2) return null;
  const sv = SVC[idea.category];
  const p = idea.palette;
  const a = spring({ frame: frame - from, fps, config: { damping: 200, mass: 0.8 } });
  const out = interpolate(frame, [to - 8, to], [0, 1], { ...clamp, easing: Easing.in(Easing.quad) });
  return (
    <div style={{ position: 'absolute', left: 54, right: 54, bottom: 150, opacity: a * (1 - out), transform: `translateY(${(1 - a) * 50 - out * 30}px)`, filter: out > 0 ? `blur(${out * 10}px)` : undefined }}>
      <div dir="rtl" style={{ padding: '28px 36px', borderRadius: 36, background: hexA('#111114', 0.94), color: '#fff', boxShadow: `0 30px 60px -30px ${hexA('#000000', 0.6)}` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <div style={{ fontFamily: MONO, fontSize: 30, color: p.accent === '#14213D' ? p.accent2 : (isLight(p.accent) ? p.accent : p.accent2) }} dir="ltr">0{index + 1}/0{total}</div>
          <div style={{ fontFamily: AR, fontWeight: 700, fontSize: 60, lineHeight: 1.3 }}>{sv.name.ar}</div>
        </div>
        <div style={{ fontFamily: AR, fontSize: 32, opacity: 0.75, marginTop: 8 }}>{sv.offers.map((o) => o[0]).join(' · ')}</div>
      </div>
    </div>
  );
};
