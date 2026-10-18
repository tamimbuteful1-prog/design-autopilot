import React from 'react';
import { AbsoluteFill, Easing, Sequence, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { AR, MONO, ensureFonts } from './fonts';
import { Heading, Icon, OffsetProvider, ThemeProvider, hexA, mix, useTheme, type Idea } from './ui';
import { MobileCanvas, mobileLayout } from './canvases/Mobile';
import { DashboardCanvas, dashboardLayout } from './canvases/Dashboard';
import { WebsiteCanvas, websiteLayout } from './canvases/Website';
import { UxCanvas, uxLayout } from './canvases/Ux';
import { ProductCanvas, productLayout } from './canvases/Product';
import { PackagingCanvas, packagingLayout } from './canvases/Packaging';
import type { Layout } from './canvases/types';

export type ReelProps = { idea: Idea; handle: string; cta: string };

const CANVASES: Record<string, { C: React.FC; layout: (idea: Idea) => Layout }> = {
  mobile: { C: MobileCanvas, layout: mobileLayout },
  dashboard: { C: DashboardCanvas, layout: dashboardLayout },
  website: { C: WebsiteCanvas, layout: websiteLayout },
  uiux: { C: UxCanvas, layout: uxLayout },
  product: { C: ProductCanvas, layout: productLayout },
  packaging: { C: PackagingCanvas, layout: packagingLayout },
};

export const timeline = (total: number) => {
  const hook = { from: 0, dur: 78 };
  const cta = { from: total - 96, dur: 96 };
  const system = { from: cta.from - 120, dur: 132 };
  const show = { from: hook.dur - 18, dur: system.from - (hook.dur - 18) + 12 };
  return { hook, show, system, cta };
};

const ease = Easing.bezier(0.65, 0, 0.35, 1);

export const Reel: React.FC<ReelProps> = ({ idea, handle, cta }) => {
  ensureFonts();
  const { durationInFrames } = useVideoConfig();
  const t = timeline(durationInFrames);
  const p = idea.palette;
  return (
    <ThemeProvider value={{ p, s: idea.style, idea }}>
      <AbsoluteFill style={{ background: p.bg, fontFamily: 'Inter, sans-serif', color: p.ink }}>
        <Backdrop />
        <Sequence from={t.show.from} durationInFrames={t.show.dur}><Showcase /></Sequence>
        <Sequence from={t.hook.from} durationInFrames={t.hook.dur}><Hook /></Sequence>
        <Sequence from={t.system.from} durationInFrames={t.system.dur}><SystemCard /></Sequence>
        <Sequence from={t.cta.from} durationInFrames={t.cta.dur}><CtaCard handle={handle} cta={cta} /></Sequence>
        <Chrome />
      </AbsoluteFill>
    </ThemeProvider>
  );
};

const Backdrop: React.FC = () => {
  const frame = useCurrentFrame();
  const { idea } = useTheme();
  const p = idea.palette;
  const a = frame / 300;
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ background: `radial-gradient(1200px 900px at ${30 + Math.sin(a) * 10}% ${20 + Math.cos(a) * 6}%, ${hexA(p.accent, p.mode === 'dark' ? 0.28 : 0.18)}, transparent 60%), radial-gradient(900px 900px at ${80 - Math.sin(a) * 8}% 85%, ${hexA(p.accent2, p.mode === 'dark' ? 0.2 : 0.16)}, transparent 60%)` }} />
      <AbsoluteFill style={{ backgroundImage: `radial-gradient(${hexA(p.ink, 0.08)} 1.4px, transparent 1.4px)`, backgroundSize: '36px 36px', opacity: 0.6 }} />
    </AbsoluteFill>
  );
};

const Chrome: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const { idea } = useTheme();
  const p = idea.palette;
  const t = timeline(durationInFrames);
  const inP = interpolate(frame, [6, 24, t.cta.from, t.cta.from + 10], [0, 1, 1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  return (
    <AbsoluteFill style={{ pointerEvents: 'none' }}>
      <div style={{ position: 'absolute', top: 110, left: 64, right: 64, display: 'flex', justifyContent: 'space-between', alignItems: 'center', opacity: inP }}>
        <div style={{ fontFamily: MONO, fontSize: 24, letterSpacing: 2, padding: '10px 18px', borderRadius: 999, background: hexA(p.surface, 0.85), border: `1px solid ${p.line}`, color: p.ink }}>
          CONCEPT · {idea.code}
        </div>
        <div dir="rtl" style={{ fontFamily: AR, fontWeight: 600, fontSize: 26, padding: '10px 22px', borderRadius: 999, background: p.accent, color: p.accentInk }}>
          {idea.categoryMeta.ar}
        </div>
      </div>
      <div style={{ position: 'absolute', left: 64, right: 64, bottom: 70, height: 6, borderRadius: 6, background: hexA(p.ink, 0.12), overflow: 'hidden' }}>
        <div style={{ width: `${(frame / (durationInFrames - 1)) * 100}%`, height: '100%', background: p.accent }} />
      </div>
    </AbsoluteFill>
  );
};

const Hook: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const { idea } = useTheme();
  const p = idea.palette;
  const sp = (d: number) => spring({ frame: frame - d, fps, config: { damping: 200 } });
  const out = interpolate(frame, [durationInFrames - 18, durationInFrames], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const scaleOut = interpolate(frame, [durationInFrames - 18, durationInFrames], [1, 1.08], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  return (
    <AbsoluteFill style={{ background: p.bg, opacity: out, transform: `scale(${scaleOut})`, justifyContent: 'center', padding: '0 80px' }}>
      <Backdrop />
      <div dir="rtl" style={{ fontFamily: AR, textAlign: 'right' }}>
        <div style={{ opacity: sp(4), transform: `translateY(${(1 - sp(4)) * 30}px)`, fontSize: 40, fontWeight: 600, color: p.accent }}>فكرة تصميم اليوم</div>
        <div style={{ marginTop: 26, fontSize: 92, lineHeight: 1.25, fontWeight: 700, color: p.ink, opacity: sp(10), transform: `translateY(${(1 - sp(10)) * 50}px)` }}>{idea.subject.ar}</div>
        <div style={{ marginTop: 40, display: 'flex', gap: 16, flexDirection: 'row', opacity: sp(20) }}>
          <span style={{ fontFamily: 'Inter', fontSize: 30, fontWeight: 600, padding: '12px 24px', borderRadius: 999, background: p.surface, border: `1px solid ${p.line}` }} dir="ltr">{idea.brand}</span>
          <span style={{ fontFamily: 'Inter', fontSize: 30, fontWeight: 500, padding: '12px 24px', borderRadius: 999, color: p.muted, border: `1px solid ${p.line}` }} dir="ltr">{idea.style.name}</span>
        </div>
      </div>
      <div style={{ position: 'absolute', bottom: 230, left: 80, width: interpolate(sp(16), [0, 1], [0, 920]), height: 10, borderRadius: 10, background: `linear-gradient(90deg, ${p.accent2}, ${p.accent})` }} />
    </AbsoluteFill>
  );
};

const Showcase: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames: S, width: VW, height: VH } = useVideoConfig();
  const { idea } = useTheme();
  const entry = CANVASES[idea.category];
  const L = entry.layout(idea);
  const intro = 84;
  const trans = 28;
  const outro = 40;
  const hold = Math.floor((S - intro - outro - L.focus.length * trans) / L.focus.length);

  // Camera keyframes: [frame, state]
  const ov = L.overview;
  const FOY = -130; // focus shots sit higher so the caption card never hides the detail
  const keys: { f: number; x: number; y: number; s: number; oy: number }[] = [{ f: 0, x: ov.x, y: ov.y + 60, s: ov.scale * 0.9, oy: 0 }, { f: intro, x: ov.x, y: ov.y, s: ov.scale, oy: 0 }];
  let f = intro;
  L.focus.forEach((fc) => {
    keys.push({ f: f + trans, x: fc.x, y: fc.y, s: fc.scale, oy: FOY });
    keys.push({ f: f + trans + hold, x: fc.x + 10, y: fc.y + 14, s: fc.scale * 1.035, oy: FOY });
    f += trans + hold;
  });
  keys.push({ f: S - 4, x: ov.x, y: ov.y, s: ov.scale * 0.97, oy: 0 });

  let i = 0;
  while (i < keys.length - 2 && frame > keys[i + 1].f) i++;
  const a = keys[i];
  const b = keys[i + 1];
  const isHold = i >= 2 && (i - 2) % 2 === 0 && i < keys.length - 2; // hold segments drift linearly
  const tt = interpolate(frame, [a.f, b.f], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: isHold ? Easing.linear : ease });
  const cx = a.x + (b.x - a.x) * tt;
  const cy = a.y + (b.y - a.y) * tt;
  const sc = a.s + (b.s - a.s) * tt;
  const oy = a.oy + (b.oy - a.oy) * tt;
  const fadeIn = interpolate(frame, [0, 16], [0, 1], { extrapolateRight: 'clamp' });
  const fadeOut = interpolate(frame, [S - 14, S], [1, 0], { extrapolateLeft: 'clamp' });

  // Which focus callout is active
  const activeIdx = L.focus.findIndex((_, k) => {
    const start = intro + k * (trans + hold) + trans - 6;
    return frame >= start && frame < start + hold + 4;
  });

  return (
    <AbsoluteFill style={{ opacity: fadeIn * fadeOut }}>
      <OffsetProvider value={0}>
        <div style={{ position: 'absolute', left: 0, top: 0, width: L.width, height: L.height, transformOrigin: '0 0', transform: `translate(${VW / 2 - cx * sc}px, ${VH / 2 + oy - cy * sc}px) scale(${sc})` }}>
          <entry.C />
        </div>
      </OffsetProvider>
      {L.focus.map((fc, k) => (
        <Callout key={k} index={k} total={L.focus.length} ar={fc.ar} en={fc.en} active={activeIdx === k} start={intro + k * (trans + hold) + trans - 6} len={hold + 4} />
      ))}
    </AbsoluteFill>
  );
};

const Callout: React.FC<{ index: number; total: number; ar: string; en: string; active: boolean; start: number; len: number }> = ({ index, total, ar, en, start, len }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { idea } = useTheme();
  const p = idea.palette;
  const local = frame - start;
  if (local < 0 || local > len) return null;
  const inS = spring({ frame: local, fps, config: { damping: 200 } });
  const outS = interpolate(local, [len - 10, len], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const panel = p.mode === 'dark' ? p.surface : '#111114';
  const ink = '#FFFFFF';
  return (
    <div style={{ position: 'absolute', left: 56, right: 56, bottom: 140, opacity: inS * outS, transform: `translateY(${(1 - inS) * 60}px)` }}>
      <div dir="rtl" style={{ background: hexA(panel, 0.92), backdropFilter: 'blur(20px)', borderRadius: 34, padding: '30px 38px', border: `1px solid ${hexA('#FFFFFF', 0.1)}`, color: ink, display: 'flex', alignItems: 'center', gap: 26 }}>
        <div style={{ fontFamily: MONO, fontSize: 30, color: mix(p.accent2, '#FFFFFF', 0.45), minWidth: 70 }} dir="ltr">0{index + 1}<span style={{ opacity: 0.4 }}>/{String(total).padStart(2, '0')}</span></div>
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: AR, fontSize: 44, fontWeight: 700, lineHeight: 1.35 }}>{ar}</div>
          <div style={{ fontFamily: 'Inter', fontSize: 26, opacity: 0.65, marginTop: 6 }} dir="ltr">{en}</div>
        </div>
      </div>
    </div>
  );
};

const SystemCard: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const { idea } = useTheme();
  const p = idea.palette;
  const s = idea.style;
  const sp = (d: number) => spring({ frame: frame - d, fps, config: { damping: 200 } });
  const fade = interpolate(frame, [0, 12, durationInFrames - 12, durationInFrames], [0, 1, 1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const swatches = [['Background', p.bg], ['Surface', p.surface], ['Ink', p.ink], ['Muted', p.muted], ['Primary', p.accent], ['Accent', p.accent2]];
  return (
    <AbsoluteFill style={{ background: p.bg, opacity: fade, padding: '260px 72px 0' }}>
      <Backdrop />
      <div dir="rtl" style={{ fontFamily: AR, fontSize: 56, fontWeight: 700, opacity: sp(2), transform: `translateY(${(1 - sp(2)) * 30}px)` }}>نظام الألوان والخطوط</div>
      <div style={{ fontSize: 28, color: p.muted, marginTop: 8, textAlign: 'right', opacity: sp(4) }}>Design tokens · {p.name}</div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 22, marginTop: 56 }}>
        {swatches.map(([name, hex], i) => (
          <div key={name} style={{ opacity: sp(8 + i * 4), transform: `translateY(${(1 - sp(8 + i * 4)) * 40}px)` }}>
            <div style={{ height: 230, borderRadius: Math.min(s.radius, 26), background: hex, border: `2px solid ${p.line}`, boxShadow: s.key === 'brutal' ? `6px 6px 0 ${p.ink}` : undefined }} />
            <div style={{ fontSize: 24, fontWeight: 600, marginTop: 14 }}>{name}</div>
            <div style={{ fontFamily: MONO, fontSize: 22, color: p.muted, marginTop: 4 }}>{hex.toUpperCase()}</div>
          </div>
        ))}
      </div>
      <div style={{ marginTop: 60, display: 'flex', alignItems: 'flex-end', gap: 40, opacity: sp(34), transform: `translateY(${(1 - sp(34)) * 40}px)` }}>
        <Heading size={220} style={{ lineHeight: 0.9, color: p.accent }}>Aa</Heading>
        <div>
          <div style={{ fontSize: 40, fontWeight: 700 }}>{s.heading}</div>
          <div style={{ fontSize: 26, color: p.muted, marginTop: 6 }}>Headings · {s.name}</div>
          <div style={{ fontSize: 26, color: p.muted, marginTop: 4 }}>Body · Inter · Radius {s.radius}px</div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

const CtaCard: React.FC<{ handle: string; cta: string }> = ({ handle, cta }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { idea } = useTheme();
  const p = idea.palette;
  const sp = (d: number) => spring({ frame: frame - d, fps, config: { damping: 200 } });
  const fade = interpolate(frame, [0, 12], [0, 1], { extrapolateRight: 'clamp' });
  return (
    <AbsoluteFill style={{ background: p.accent, opacity: fade, justifyContent: 'center', alignItems: 'center', padding: 80, color: p.accentInk }}>
      <div style={{ position: 'absolute', width: 1400, height: 1400, borderRadius: 1400, border: `2px solid ${hexA(p.accentInk, 0.15)}`, transform: `scale(${0.6 + sp(0) * 0.4})` }} />
      <div style={{ width: 150, height: 150, borderRadius: 44, background: hexA(p.accentInk, 0.14), display: 'grid', placeItems: 'center', transform: `scale(${sp(2)}) rotate(${(1 - sp(2)) * -30}deg)` }}>
        <Icon name="star" size={76} color={p.accentInk} />
      </div>
      <div dir="rtl" style={{ fontFamily: AR, fontSize: 76, fontWeight: 700, textAlign: 'center', lineHeight: 1.35, marginTop: 56, opacity: sp(8), transform: `translateY(${(1 - sp(8)) * 40}px)` }}>{cta}</div>
      <div style={{ fontFamily: 'Inter', fontSize: 46, fontWeight: 700, marginTop: 40, padding: '18px 40px', borderRadius: 999, background: p.accentInk, color: p.accent, opacity: sp(16) }}>{handle}</div>
      <div dir="rtl" style={{ position: 'absolute', bottom: 150, fontFamily: AR, fontSize: 28, opacity: 0.75 * sp(22), textAlign: 'center' }}>
        تصميم مفاهيمي (Concept) لعلامة خيالية — ليس مشروعًا لعميل
      </div>
    </AbsoluteFill>
  );
};
