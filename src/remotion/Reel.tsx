// Fast, beat-synced 14-second ad cut (detail shots and CTA hold 3+ beats) (128 BPM: one beat = 14 frames at 30 fps).
// Hook (kinetic type) → drop: design builds in → three snap-zoom detail shots → colour flash → hero reveal → CTA.
import React from 'react';
import { AbsoluteFill, Easing, Sequence, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { AR, MONO, ensureFonts } from './fonts';
import { OffsetProvider, SpeedProvider, ThemeProvider, hexA, useTheme, type Idea } from './ui';
import { MobileCanvas, mobileLayout } from './canvases/Mobile';
import { DashboardCanvas, dashboardLayout } from './canvases/Dashboard';
import { WebsiteCanvas, websiteLayout } from './canvases/Website';
import { UxCanvas, uxLayout } from './canvases/Ux';
import { ProductCanvas, productLayout } from './canvases/Product';
import { PackagingCanvas, packagingLayout } from './canvases/Packaging';
import type { Layout } from './canvases/types';
import TL from '../shared/timeline.json';

export type ReelProps = { idea: Idea; handle: string; cta: string };

const CANVASES: Record<string, { C: React.FC; layout: (idea: Idea) => Layout }> = {
  mobile: { C: MobileCanvas, layout: mobileLayout },
  dashboard: { C: DashboardCanvas, layout: dashboardLayout },
  website: { C: WebsiteCanvas, layout: websiteLayout },
  uiux: { C: UxCanvas, layout: uxLayout },
  product: { C: ProductCanvas, layout: productLayout },
  packaging: { C: PackagingCanvas, layout: packagingLayout },
};

// One punchy word per detail shot.
const TAGS: Record<string, [string, string][]> = {
  mobile: [['سهل', 'Effortless'], ['ذكي', 'Smart'], ['أنيق', 'Beautiful']],
  dashboard: [['واضح', 'Clear'], ['دقيق', 'Precise'], ['قوي', 'Powerful']],
  website: [['جذّاب', 'Bold'], ['مقنع', 'Convincing'], ['يبيع', 'Converts']],
  uiux: [['سلس', 'Seamless'], ['مدروس', 'Intentional'], ['للجميع', 'Accessible']],
  product: [['أنيق', 'Sleek'], ['عملي', 'Functional'], ['فريد', 'Iconic']],
  packaging: [['لافت', 'Eye-catching'], ['فاخر', 'Premium'], ['مميز', 'Distinct']],
};

const B = TL.beatFrames;
const S = TL.shots as Record<string, [number, number]>;
const seq = (k: string) => ({ from: S[k][0], durationInFrames: S[k][1] - S[k][0] });
const clamp = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const;
const snap = Easing.bezier(0.16, 1, 0.3, 1);
const isLight = (hex: string) => parseInt(hex.slice(1, 3), 16) * 0.299 + parseInt(hex.slice(3, 5), 16) * 0.587 + parseInt(hex.slice(5, 7), 16) * 0.114 > 150;

export const Reel: React.FC<ReelProps> = ({ idea, handle, cta }) => {
  ensureFonts();
  const p = idea.palette;
  return (
    <ThemeProvider value={{ p, s: idea.style, idea }}>
      <AbsoluteFill style={{ background: p.bg, fontFamily: 'Inter, sans-serif', color: p.ink, overflow: 'hidden' }}>
        <Sequence {...seq('hook')}><Hook /></Sequence>
        <Sequence {...seq('build')}><Shot kind="build" /></Sequence>
        <Sequence {...seq('focus1')}><Shot kind="focus" index={0} /></Sequence>
        <Sequence {...seq('focus2')}><Shot kind="focus" index={1} /></Sequence>
        <Sequence {...seq('focus3')}><Shot kind="focus" index={2} /></Sequence>
        <Sequence {...seq('palette')}><PaletteShot /></Sequence>
        <Sequence {...seq('hero')}><Shot kind="hero" /></Sequence>
        <Sequence {...seq('cta')}><Cta handle={handle} cta={cta} /></Sequence>
        <Flash at={TL.dropFrame} />
        <Flash at={S.cta[0]} />
        <Chrome />
      </AbsoluteFill>
    </ThemeProvider>
  );
};

/** Short white flash on the big hits. */
const Flash: React.FC<{ at: number }> = ({ at }) => {
  const f = useCurrentFrame() - at;
  if (f < 0 || f > 6) return null;
  return <AbsoluteFill style={{ background: '#FFFFFF', opacity: interpolate(f, [0, 1, 6], [0.8, 0.55, 0], clamp) }} />;
};

/** Whip-in used at the start of every shot: fast slide + blur + scale overshoot. */
function useWhip(dir = 1) {
  const f = useCurrentFrame();
  const t = interpolate(f, [0, 7], [0, 1], { ...clamp, easing: snap });
  return { transform: `translateX(${(1 - t) * 70 * dir}%) scale(${1.25 - 0.25 * t})`, filter: t < 0.98 ? `blur(${(1 - t) * 28}px)` : undefined } as React.CSSProperties;
}

const Rings: React.FC<{ color: string; t: number }> = ({ color, t }) => (
  <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center' }}>
    {[0, 1, 2].map((i) => {
      const s = (t * 0.04 + i / 3) % 1;
      return <div key={i} style={{ position: 'absolute', width: 2400 * s, height: 2400 * s, borderRadius: '50%', border: `6px solid ${color}`, opacity: 1 - s }} />;
    })}
  </AbsoluteFill>
);

const Hook: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { idea } = useTheme();
  const p = idea.palette;
  const beat = Math.min(2, Math.floor(frame / B));
  const local = frame - beat * B;
  const pop = spring({ frame: local, fps, config: { damping: 11, stiffness: 220, mass: 0.6 } });
  const bgs = [p.ink, p.accent, p.accent2];
  const fgs = bgs.map((c) => (isLight(c) ? '#111111' : '#FFFFFF'));
  const words: React.ReactNode[] = [
    <span key="a">فكرة<br />اليوم</span>,
    <span key="b" style={{ fontSize: idea.subject.ar.length > 22 ? 112 : 136, display: 'block', lineHeight: 1.25 }}>{idea.subject.ar}</span>,
    <span key="c" dir="ltr" style={{ fontFamily: `"${idea.style.heading}", Inter, sans-serif`, letterSpacing: -6 }}>{idea.brand}</span>,
  ];
  return (
    <AbsoluteFill style={{ background: bgs[beat], color: fgs[beat], justifyContent: 'center', alignItems: 'center', padding: 70 }}>
      <Rings color={hexA(fgs[beat], 0.12)} t={frame} />
      <div dir="rtl" style={{ fontFamily: AR, fontWeight: 700, fontSize: 210, lineHeight: 1.05, textAlign: 'center', transform: `scale(${0.6 + pop * 0.4}) rotate(${(1 - pop) * (beat % 2 ? 6 : -6)}deg)`, opacity: Math.min(1, pop * 1.4) }}>
        {words[beat]}
      </div>
      <div style={{ position: 'absolute', bottom: 260, fontFamily: MONO, fontSize: 30, letterSpacing: 6, opacity: 0.7 }} dir="ltr">{idea.categoryMeta.en.toUpperCase()}</div>
    </AbsoluteFill>
  );
};

const Glow: React.FC = () => {
  const { idea } = useTheme();
  const p = idea.palette;
  return <AbsoluteFill style={{ background: `radial-gradient(900px 900px at 20% 15%, ${hexA(p.accent, 0.3)}, transparent 60%), radial-gradient(900px 900px at 85% 90%, ${hexA(p.accent2, 0.25)}, transparent 60%)` }} />;
};

const Shot: React.FC<{ kind: 'build' | 'focus' | 'hero'; index?: number }> = ({ kind, index = 0 }) => {
  const frame = useCurrentFrame();
  const { fps, width: VW, height: VH, durationInFrames: D } = useVideoConfig();
  const { idea } = useTheme();
  const p = idea.palette;
  const entry = CANVASES[idea.category];
  const L = entry.layout(idea);
  const whip = useWhip(kind === 'focus' ? (index % 2 ? -1 : 1) : 1);
  const settle = spring({ frame, fps, config: { damping: 14, stiffness: 120 } });
  const drift = interpolate(frame, [0, D], [0, 1], clamp);

  let cx = L.overview.x;
  let cy = L.overview.y;
  let sc = L.overview.scale;
  let rx = 0;
  let rz = 0;
  let offset = -400; // canvases already fully built
  let speed = 1;
  if (kind === 'build') {
    sc = L.overview.scale * (0.78 + 0.22 * settle + 0.05 * drift);
    rx = (1 - settle) * 28;
    rz = (1 - settle) * -6;
    offset = 0;
    speed = 3.2;
  } else if (kind === 'focus') {
    const fc = L.focus[index];
    cx = fc.x + drift * 30 * (index % 2 ? -1 : 1);
    cy = fc.y + drift * 20;
    sc = fc.scale * (1.08 + 0.06 * drift) * (0.85 + 0.15 * settle);
  } else {
    sc = L.overview.scale * (0.8 + 0.2 * settle + 0.07 * drift);
    rx = (1 - settle) * -24;
    rz = (1 - settle) * 5;
  }
  const oy = kind === 'focus' ? -150 : kind === 'hero' ? -120 : 0;
  const bg = kind === 'focus' ? [p.surface2, p.bg, p.surface2][index] : p.bg;

  return (
    <AbsoluteFill style={{ background: bg, ...whip }}>
      <Glow />
      <AbsoluteFill style={{ perspective: 2200 }}>
        <div style={{ position: 'absolute', inset: 0, transform: `rotateX(${rx}deg) rotateZ(${rz}deg)`, transformOrigin: '50% 50%' }}>
          <OffsetProvider value={offset}>
            <SpeedProvider value={speed}>
              <div style={{ position: 'absolute', left: 0, top: 0, width: L.width, height: L.height, transformOrigin: '0 0', transform: `translate(${VW / 2 - cx * sc}px, ${VH / 2 + oy - cy * sc}px) scale(${sc})` }}>
                <entry.C />
              </div>
            </SpeedProvider>
          </OffsetProvider>
        </div>
      </AbsoluteFill>
      {kind === 'focus' && <Tag word={TAGS[idea.category][index]} index={index} />}
      {kind === 'hero' && <HeroTitle />}
    </AbsoluteFill>
  );
};

const Tag: React.FC<{ word: [string, string]; index: number }> = ({ word, index }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { idea } = useTheme();
  const p = idea.palette;
  const pop = spring({ frame: frame - 3, fps, config: { damping: 10, stiffness: 240, mass: 0.6 } });
  const bar = interpolate(frame, [2, 9], [0, 1], { ...clamp, easing: snap });
  return (
    <div style={{ position: 'absolute', left: 0, right: 0, bottom: 150, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <div style={{ position: 'relative', padding: '6px 54px' }}>
        <div style={{ position: 'absolute', inset: 0, background: p.accent, transform: `scaleX(${bar}) skewX(-8deg)`, transformOrigin: index % 2 ? 'left' : 'right', borderRadius: 18 }} />
        <div dir="rtl" style={{ position: 'relative', fontFamily: AR, fontWeight: 700, fontSize: 190, lineHeight: 1.15, color: p.accentInk, transform: `scale(${0.5 + pop * 0.5})`, opacity: Math.min(1, pop * 1.5) }}>{word[0]}</div>
      </div>
      <div style={{ marginTop: 18, fontFamily: MONO, fontSize: 30, letterSpacing: 8, color: p.ink, opacity: bar, background: hexA(p.surface, 0.9), padding: '6px 18px', borderRadius: 999 }}>{word[1].toUpperCase()}</div>
    </div>
  );
};

const PaletteShot: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { idea } = useTheme();
  const p = idea.palette;
  const cols = [p.accent, p.accent2, p.ink, p.surface, p.bg, p.muted];
  const title = spring({ frame: frame - 8, fps, config: { damping: 12, stiffness: 200 } });
  return (
    <AbsoluteFill style={{ background: p.ink, flexDirection: 'row' }}>
      {cols.map((c, i) => {
        const d = spring({ frame: frame - i * 2, fps, config: { damping: 15, stiffness: 260 } });
        return (
          <div key={i} style={{ flex: 1, background: c, transform: `translateY(${(1 - d) * (i % 2 ? 100 : -100)}%)`, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', paddingBottom: 120 }}>
            <div style={{ fontFamily: MONO, fontSize: 24, color: isLight(c) ? '#111' : '#fff', writingMode: 'vertical-rl', transform: 'rotate(180deg)', letterSpacing: 3 }}>{c.toUpperCase()}</div>
          </div>
        );
      })}
      <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center' }}>
        <div style={{ fontFamily: `"${idea.style.heading}", Inter, sans-serif`, fontWeight: 700, fontSize: 140, letterSpacing: -4, color: '#fff', background: hexA('#000000', 0.55), padding: '0 40px 14px', borderRadius: 24, transform: `scale(${0.6 + title * 0.4})`, opacity: Math.min(1, title * 1.5), textAlign: 'center', lineHeight: 1.1 }}>{p.name}</div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

const HeroTitle: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { idea } = useTheme();
  const p = idea.palette;
  const a = spring({ frame: frame - B, fps, config: { damping: 12, stiffness: 180 } });
  const b = spring({ frame: frame - B * 2, fps, config: { damping: 14 } });
  return (
    <div style={{ position: 'absolute', left: 60, right: 60, bottom: 130, textAlign: 'center' }}>
      <div style={{ display: 'inline-block', fontFamily: `"${idea.style.heading}", Inter, sans-serif`, fontWeight: 700, fontSize: 120, letterSpacing: -4, color: p.accentInk, background: p.accent, padding: '4px 40px 14px', borderRadius: 26, transform: `scale(${a}) rotate(${(1 - a) * -8}deg)` }}>{idea.brand}</div>
      <div><div dir="rtl" style={{ marginTop: 22, fontFamily: AR, fontWeight: 600, fontSize: 40, color: p.ink, opacity: b, background: hexA(p.surface, 0.92), display: 'inline-block', padding: '8px 26px', borderRadius: 999 }}>{idea.subject.ar}</div></div>
    </div>
  );
};

const Cta: React.FC<{ handle: string; cta: string }> = ({ handle, cta }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { idea } = useTheme();
  const p = idea.palette;
  const words = cta.split(/\s+/);
  const cut = cta.includes(' على ') ? cta.indexOf(' على ') : Math.ceil(cta.length / 2);
  const line1 = cta.includes(' على ') ? cta.slice(0, cut) : words.slice(0, Math.ceil(words.length / 2)).join(' ');
  const line2 = cta.includes(' على ') ? cta.slice(cut + 1) : words.slice(Math.ceil(words.length / 2)).join(' ');
  const a = spring({ frame, fps, config: { damping: 9, stiffness: 230, mass: 0.6 } });
  const b = spring({ frame: frame - B, fps, config: { damping: 9, stiffness: 230, mass: 0.6 } });
  const c = spring({ frame: frame - B * 2, fps, config: { damping: 12 } });
  const bounce = Math.abs(Math.sin((frame / B) * Math.PI)) * 18;
  return (
    <AbsoluteFill style={{ background: p.accent, color: p.accentInk, justifyContent: 'center', alignItems: 'center' }}>
      <Rings color={hexA(p.accentInk, 0.14)} t={frame + 20} />
      <div style={{ width: 190, height: 190, borderRadius: 60, background: p.accentInk, display: 'grid', placeItems: 'center', transform: `translateY(${-bounce}px) scale(${a})`, boxShadow: `0 30px 60px -20px ${hexA('#000000', 0.4)}` }}>
        <svg width={100} height={100} viewBox="0 0 24 24" fill="none" stroke={p.accent} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M4 5h16v11H9l-5 4V5z" /><path d="M8 10.5h.01M12 10.5h.01M16 10.5h.01" strokeWidth={3} /></svg>
      </div>
      <div dir="rtl" style={{ fontFamily: AR, fontWeight: 700, fontSize: 150, lineHeight: 1.2, marginTop: 50, textAlign: 'center' }}>
        <div style={{ transform: `scale(${0.4 + a * 0.6})`, opacity: Math.min(1, a * 1.5) }}>{line1}</div>
        <div style={{ transform: `scale(${0.4 + b * 0.6})`, opacity: Math.min(1, b * 1.5) }}>{line2}</div>
      </div>
      <div style={{ marginTop: 44, fontFamily: 'Inter', fontWeight: 800, fontSize: 52, background: p.accentInk, color: p.accent, padding: '16px 44px', borderRadius: 999, transform: `scale(${c})` }}>{handle}</div>
      <div dir="rtl" style={{ position: 'absolute', bottom: 120, fontFamily: AR, fontSize: 28, opacity: 0.8 * c, textAlign: 'center' }}>تصميم مفاهيمي (Concept) لعلامة خيالية — ليس مشروعًا لعميل</div>
    </AbsoluteFill>
  );
};

const Chrome: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const { idea } = useTheme();
  const p = idea.palette;
  const vis = frame >= TL.dropFrame && frame < S.cta[0] && !(frame >= S.palette[0] && frame < S.palette[1]) ? 1 : 0;
  return (
    <AbsoluteFill style={{ pointerEvents: 'none' }}>
      <div style={{ position: 'absolute', top: 110, left: 60, opacity: vis, fontFamily: MONO, fontSize: 24, letterSpacing: 2, padding: '10px 18px', borderRadius: 999, background: hexA(p.surface, 0.9), border: `1px solid ${p.line}`, color: p.ink }}>
        CONCEPT · {idea.code}
      </div>
      <div style={{ position: 'absolute', left: 0, bottom: 0, height: 8, width: `${(frame / (durationInFrames - 1)) * 100}%`, background: p.accent2 }} />
    </AbsoluteFill>
  );
};
