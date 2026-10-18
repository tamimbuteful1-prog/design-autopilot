// 14-second service ad shot as ONE continuous camera move (128 BPM, beat = 14 frames).
// Problem hook → camera zooms THROUGH the text into the design → glides (zoom out → zoom in) between
// three details while "what you get" appears → pulls back to the hero → dives THROUGH the brand chip
// into the call to action. No hard cuts anywhere.
import React from 'react';
import { AbsoluteFill, Easing, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
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
import SERVICES from '../shared/services.json';

export type ReelProps = { idea: Idea; handle: string; cta: string };

export const CANVASES: Record<string, { C: React.FC; layout: (idea: Idea) => Layout }> = {
  mobile: { C: MobileCanvas, layout: mobileLayout },
  dashboard: { C: DashboardCanvas, layout: dashboardLayout },
  website: { C: WebsiteCanvas, layout: websiteLayout },
  uiux: { C: UxCanvas, layout: uxLayout },
  product: { C: ProductCanvas, layout: productLayout },
  packaging: { C: PackagingCanvas, layout: packagingLayout },
};
type Service = { name: { ar: string; en: string }; hook: string[]; offers: string[][] };
const SVC = SERVICES as Record<string, Service>;

const CAM = TL.camera as { enter: number[]; focus: number[][]; hero: number[]; zoomThrough: number[] };
const clamp = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const;
const smooth = Easing.bezier(0.65, 0, 0.35, 1); // in-out for travelling
const glide = Easing.bezier(0.16, 1, 0.3, 1); // soft landing
export const isLight = (hex: string) => parseInt(hex.slice(1, 3), 16) * 0.299 + parseInt(hex.slice(3, 5), 16) * 0.587 + parseInt(hex.slice(5, 7), 16) * 0.114 > 150;
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

export const Reel: React.FC<ReelProps> = ({ idea, handle, cta }) => {
  ensureFonts();
  const frame = useCurrentFrame();
  const p = idea.palette;
  return (
    <ThemeProvider value={{ p, s: idea.style, idea }}>
      <AbsoluteFill style={{ background: p.bg, fontFamily: 'Inter, sans-serif', color: p.ink, overflow: 'hidden' }}>
        {frame >= 40 && frame < TL.shots.cta[0] + 6 && <OneTake />}
        {frame < 62 && <Hook />}
        {frame >= TL.shots.cta[0] - 8 && <Cta handle={handle} cta={cta} from={TL.shots.cta[0]} />}
        <Chrome />
      </AbsoluteFill>
    </ThemeProvider>
  );
};

/* ---------------- Hook: two lines that fly past the camera, then the camera dives through ---------------- */
const Hook: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { idea } = useTheme();
  const p = idea.palette;
  const svc = SVC[idea.category];
  const fg = isLight(p.ink) ? '#111111' : '#FFFFFF';
  // line 1: arrives softly, then zooms past the camera
  const in1 = spring({ frame, fps, config: { damping: 200 } });
  const past1 = interpolate(frame, [20, 30], [0, 1], { ...clamp, easing: Easing.in(Easing.cubic) });
  // line 2: emerges from depth
  const in2 = spring({ frame: frame - 24, fps, config: { damping: 200, mass: 0.9 } });
  // whole hook: camera dives through it into the design
  const dive = interpolate(frame, [42, 60], [0, 1], { ...clamp, easing: Easing.in(Easing.cubic) });
  return (
    <AbsoluteFill style={{ background: hexA(p.ink, 1 - dive), transform: `scale(${1 + dive * 9})`, opacity: 1 - interpolate(dive, [0.55, 1], [0, 1], clamp), justifyContent: 'center', alignItems: 'center' }}>
      <Rings color={hexA(fg, 0.1)} t={frame} />
      <div dir="rtl" style={{ position: 'absolute', fontFamily: AR, fontWeight: 700, fontSize: 132, lineHeight: 1.25, color: fg, textAlign: 'center', padding: '0 70px', transform: `scale(${(0.7 + in1 * 0.3) * (1 + past1 * 3)})`, opacity: in1 * (1 - past1), filter: past1 > 0 ? `blur(${past1 * 14}px)` : undefined }}>
        {svc.hook[0]}
      </div>
      <div dir="rtl" style={{ position: 'absolute', fontFamily: AR, fontWeight: 700, fontSize: 150, lineHeight: 1.2, color: p.accent === p.ink ? p.accent2 : p.accent, textAlign: 'center', padding: '0 60px', transform: `scale(${0.35 + in2 * 0.65})`, opacity: in2, filter: in2 < 0.9 ? `blur(${(1 - in2) * 16}px)` : undefined }}>
        {svc.hook[1]}
      </div>
    </AbsoluteFill>
  );
};

const Rings: React.FC<{ color: string; t: number }> = ({ color, t }) => (
  <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center' }}>
    {[0, 1, 2].map((i) => {
      const s = (t * 0.025 + i / 3) % 1;
      return <div key={i} style={{ position: 'absolute', width: 2400 * s, height: 2400 * s, borderRadius: '50%', border: `5px solid ${color}`, opacity: 1 - s }} />;
    })}
  </AbsoluteFill>
);

/* ---------------- One continuous camera over the design ---------------- */
type Cam = { x: number; y: number; s: number; rx: number; oy: number };

export function cameraAt(frame: number, L: Layout): Cam {
  const ov: Cam = { x: L.overview.x, y: L.overview.y, s: L.overview.scale, rx: 0, oy: 0 };
  const far: Cam = { ...ov, s: ov.s * 0.42, rx: 32 };
  const foc = L.focus.map((f): Cam => ({ x: f.x, y: f.y, s: f.scale, rx: 0, oy: -170 }));
  const drift = (c: Cam, k: number): Cam => ({ ...c, x: c.x + 14 * k, y: c.y + 10 * k, s: c.s * (1 + 0.045 * k) });
  const mix = (a: Cam, b: Cam, t: number, dip = 0): Cam => ({
    x: lerp(a.x, b.x, t), y: lerp(a.y, b.y, t), rx: lerp(a.rx, b.rx, t), oy: lerp(a.oy, b.oy, t),
    // geometric interpolation of scale feels like a real dolly; `dip` pulls back mid-move (zoom out → zoom in)
    s: Math.exp(lerp(Math.log(a.s), Math.log(b.s), t)) * (1 - dip * Math.sin(Math.PI * t)),
  });
  const seg = (f0: number, f1: number, e = smooth) => interpolate(frame, [f0, f1], [0, 1], { ...clamp, easing: e });

  const [e0, e1] = CAM.enter;
  if (frame <= e1) return mix(far, ov, seg(e0, e1, glide));
  const [f1a] = CAM.focus[0];
  if (frame <= f1a) return mix(ov, foc[0], seg(e1, f1a), 0.05);
  for (let i = 0; i < CAM.focus.length; i++) {
    const [a, b] = CAM.focus[i];
    const held = drift(foc[i], 1);
    if (frame <= b) return mix(foc[i], held, interpolate(frame, [a, b], [0, 1], clamp));
    const next = i + 1 < CAM.focus.length ? CAM.focus[i + 1][0] : CAM.hero[0];
    const target = i + 1 < CAM.focus.length ? foc[i + 1] : ov;
    if (frame <= next) return mix(held, target, seg(b, next), i + 1 < CAM.focus.length ? 0.38 : 0.08);
  }
  const [h0, h1] = CAM.hero;
  return mix(ov, drift(ov, 1), interpolate(frame, [h0, h1 + 30], [0, 1], clamp));
}

const OneTake: React.FC = () => {
  const frame = useCurrentFrame();
  const { width: VW, height: VH } = useVideoConfig();
  const { idea } = useTheme();
  const p = idea.palette;
  const entry = CANVASES[idea.category];
  const L = entry.layout(idea);
  const c = cameraAt(frame, L);
  const [z0, z1] = CAM.zoomThrough;
  const dive = interpolate(frame, [z0, z1], [0, 1], { ...clamp, easing: Easing.in(Easing.cubic) });
  const chipY = VH - 220 - 56; // centre of the «نصممه لك» chip — the camera dives through it
  return (
    <AbsoluteFill style={{ transformOrigin: `${VW / 2}px ${chipY}px`, transform: `scale(${1 + dive * 16})` }}>
      <AbsoluteFill style={{ background: `radial-gradient(1000px 1000px at 20% 15%, ${hexA(p.accent, 0.28)}, transparent 60%), radial-gradient(1000px 1000px at 85% 90%, ${hexA(p.accent2, 0.22)}, transparent 60%), ${p.bg}` }} />
      <AbsoluteFill style={{ perspective: 2400 }}>
        <div style={{ position: 'absolute', inset: 0, transform: `rotateX(${c.rx}deg)`, transformOrigin: '50% 60%' }}>
          <OffsetProvider value={CAM.enter[0] - 4}>
            <SpeedProvider value={2.2}>
              <div style={{ position: 'absolute', left: 0, top: 0, width: L.width, height: L.height, transformOrigin: '0 0', transform: `translate(${VW / 2 - c.x * c.s}px, ${VH / 2 + c.oy - c.y * c.s}px) scale(${c.s})` }}>
                <entry.C />
              </div>
            </SpeedProvider>
          </OffsetProvider>
        </div>
      </AbsoluteFill>
      <OfferHeader />
      {CAM.focus.map(([a, b], i) => <Offer key={i} index={i} from={a - 10} to={b + 6} />)}
      <HeroTitle />
    </AbsoluteFill>
  );
};

/** "What you get" label that stays up during the detail section. */
const OfferHeader: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { idea } = useTheme();
  const p = idea.palette;
  const a = spring({ frame: frame - (CAM.focus[0][0] - 14), fps, config: { damping: 200 } });
  const out = interpolate(frame, [CAM.focus[2][1], CAM.focus[2][1] + 14], [1, 0], clamp);
  return (
    <div style={{ position: 'absolute', top: 190, left: 0, right: 0, display: 'flex', justifyContent: 'center', opacity: a * out, transform: `translateY(${(1 - a) * -30}px)` }}>
      <div dir="rtl" style={{ fontFamily: AR, fontWeight: 700, fontSize: 46, padding: '12px 34px', borderRadius: 999, background: p.ink, color: isLight(p.ink) ? '#111' : '#fff' }}>
        وش نقدم لك؟
      </div>
    </div>
  );
};

const Offer: React.FC<{ index: number; from: number; to: number }> = ({ index, from, to }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { idea } = useTheme();
  const p = idea.palette;
  if (frame < from - 2 || frame > to + 2) return null;
  const [ar, en] = SVC[idea.category].offers[index];
  const a = spring({ frame: frame - from, fps, config: { damping: 200, mass: 0.8 } });
  const out = interpolate(frame, [to - 10, to], [0, 1], { ...clamp, easing: Easing.in(Easing.quad) });
  return (
    <div style={{ position: 'absolute', left: 54, right: 54, bottom: 150, opacity: a * (1 - out), transform: `translateY(${(1 - a) * 50 - out * 30}px) scale(${0.96 + 0.04 * a})`, filter: out > 0 ? `blur(${out * 10}px)` : undefined }}>
      <div dir="rtl" style={{ display: 'flex', alignItems: 'center', gap: 26, padding: '28px 36px', borderRadius: 36, background: hexA(isLight(p.bg) ? '#111114' : p.surface, 0.94), color: '#fff', boxShadow: `0 30px 60px -30px ${hexA('#000000', 0.6)}` }}>
        <div style={{ width: 84, height: 84, flexShrink: 0, borderRadius: 26, background: p.accent, display: 'grid', placeItems: 'center' }}>
          <svg width={46} height={46} viewBox="0 0 24 24" fill="none" stroke={p.accentInk} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round"><path d="M4 12l5 5L20 6" /></svg>
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: AR, fontWeight: 700, fontSize: 54, lineHeight: 1.3 }}>{ar}</div>
          <div dir="ltr" style={{ fontFamily: 'Inter', fontSize: 26, opacity: 0.6, textAlign: 'right' }}>{en}</div>
        </div>
        <div dir="ltr" style={{ fontFamily: MONO, fontSize: 28, opacity: 0.5 }}>{index + 1}/3</div>
      </div>
    </div>
  );
};

const HeroTitle: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { idea } = useTheme();
  const p = idea.palette;
  const start = CAM.hero[0] - 16;
  const a = spring({ frame: frame - start, fps, config: { damping: 200 } });
  const b = spring({ frame: frame - start - 8, fps, config: { damping: 200 } }) * interpolate(frame, [CAM.zoomThrough[0], CAM.zoomThrough[0] + 6], [1, 0], clamp);
  if (frame < start) return null;
  return (
    <div style={{ position: 'absolute', left: 60, right: 60, bottom: 220, textAlign: 'center' }}>
      <div dir="rtl" style={{ fontFamily: AR, fontWeight: 600, fontSize: 40, color: p.ink, opacity: b, background: hexA(p.surface, 0.94), display: 'inline-block', padding: '8px 28px', borderRadius: 999, marginBottom: 18 }}>
        {SVC[idea.category].name.ar}
      </div>
      <div>
        <div style={{ display: 'inline-block', fontFamily: AR, fontWeight: 700, fontSize: 64, color: p.accentInk, background: p.accent, padding: '10px 48px 18px', borderRadius: 30, transform: `scale(${0.85 + 0.15 * a})`, opacity: a }} dir="rtl">
          نصممه لك
        </div>
      </div>
    </div>
  );
};

/* ---------------- CTA: emerges from the brand chip we just flew through ---------------- */
export const Cta: React.FC<{ handle: string; cta: string; from: number }> = ({ handle, cta, from }) => {
  const frame = useCurrentFrame() - from;
  const { fps } = useVideoConfig();
  const { idea } = useTheme();
  const p = idea.palette;
  const words = cta.split(/\s+/);
  const cut = cta.indexOf(' على ');
  const line1 = cut > 0 ? cta.slice(0, cut) : words.slice(0, Math.ceil(words.length / 2)).join(' ');
  const line2 = cut > 0 ? cta.slice(cut + 1) : words.slice(Math.ceil(words.length / 2)).join(' ');
  const bg = interpolate(frame, [-8, 0], [0, 1], clamp);
  const a = spring({ frame: frame - 2, fps, config: { damping: 200 } });
  const b = spring({ frame: frame - 10, fps, config: { damping: 200 } });
  const c = spring({ frame: frame - 20, fps, config: { damping: 200 } });
  const float = Math.sin(frame / 9) * 10;
  return (
    <AbsoluteFill style={{ background: p.accent, opacity: bg, color: p.accentInk, justifyContent: 'center', alignItems: 'center' }}>
      <Rings color={hexA(p.accentInk, 0.14)} t={frame + 20} />
      <div style={{ width: 180, height: 180, borderRadius: 56, background: p.accentInk, display: 'grid', placeItems: 'center', transform: `translateY(${float}px) scale(${0.6 + a * 0.4})`, opacity: a, boxShadow: `0 30px 60px -20px ${hexA('#000000', 0.35)}` }}>
        <svg width={96} height={96} viewBox="0 0 24 24" fill="none" stroke={p.accent} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M4 5h16v11H9l-5 4V5z" /><path d="M8 10.5h.01M12 10.5h.01M16 10.5h.01" strokeWidth={3} /></svg>
      </div>
      <div dir="rtl" style={{ fontFamily: AR, fontWeight: 700, fontSize: 140, lineHeight: 1.2, marginTop: 50, textAlign: 'center' }}>
        <div style={{ transform: `scale(${0.7 + a * 0.3})`, opacity: a, filter: a < 0.9 ? `blur(${(1 - a) * 12}px)` : undefined }}>{line1}</div>
        <div style={{ transform: `scale(${0.7 + b * 0.3})`, opacity: b, filter: b < 0.9 ? `blur(${(1 - b) * 12}px)` : undefined }}>{line2}</div>
      </div>
      <div style={{ marginTop: 44, fontFamily: 'Inter', fontWeight: 800, fontSize: 52, background: p.accentInk, color: p.accent, padding: '16px 44px', borderRadius: 999, transform: `scale(${0.8 + 0.2 * c})`, opacity: c }}>{handle}</div>
      <div dir="rtl" style={{ position: 'absolute', bottom: 120, fontFamily: AR, fontSize: 28, opacity: 0.8 * c, textAlign: 'center', padding: '0 60px' }}>الأعمال المعروضة تصاميم مفاهيمية (Concept) لعلامات خيالية</div>
    </AbsoluteFill>
  );
};

const Chrome: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const { idea } = useTheme();
  const p = idea.palette;
  const vis = interpolate(frame, [64, 76, CAM.zoomThrough[0], CAM.zoomThrough[0] + 8], [0, 1, 1, 0], clamp);
  return (
    <AbsoluteFill style={{ pointerEvents: 'none' }}>
      <div style={{ position: 'absolute', top: 110, left: 60, opacity: vis, fontFamily: MONO, fontSize: 24, letterSpacing: 2, padding: '10px 18px', borderRadius: 999, background: hexA(p.surface, 0.9), border: `1px solid ${p.line}`, color: p.ink }}>
        CONCEPT · {idea.code}
      </div>
      <div style={{ position: 'absolute', left: 0, bottom: 0, height: 8, width: `${(frame / (durationInFrames - 1)) * 100}%`, background: p.accent2 }} />
    </AbsoluteFill>
  );
};
