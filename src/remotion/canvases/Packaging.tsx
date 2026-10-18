import React from 'react';
import { Card, Heading, Reveal, hexA, mix, useProgress, useTheme } from '../ui';
import type { Layout } from './types';

const W = 1400;
const H = 2150;

type PackColors = { base: string; ink: string; accent: string };

const Label: React.FC<{ c: any; brand: string; col: PackColors; scale?: number; compact?: boolean }> = ({ c, brand, col, scale = 1, compact }) => {
  const { s } = useTheme();
  return (
    <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: col.ink, textAlign: 'center', padding: 34 * scale }}>
      <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 16 * scale, letterSpacing: 3 * scale, opacity: 0.75 }}>EST. 2026</div>
      <div style={{ fontFamily: `"${s.heading}", Inter, sans-serif`, fontWeight: 700, fontSize: 64 * scale, letterSpacing: -1 * scale, lineHeight: 1, marginTop: 10 * scale }}>{brand}</div>
      <div style={{ width: 140 * scale, height: 140 * scale, borderRadius: 999, margin: `${26 * scale}px 0`, background: `repeating-radial-gradient(circle, ${col.accent} 0 ${6 * scale}px, transparent ${6 * scale}px ${14 * scale}px)`, opacity: 0.9 }} />
      <div style={{ fontSize: 30 * scale, fontWeight: 700, lineHeight: 1.15 }}>{c.productName}</div>
      {!compact && <div style={{ fontSize: 17 * scale, opacity: 0.8, marginTop: 8 * scale }}>{c.descriptor}</div>}
      {!compact && (
        <div style={{ display: 'flex', gap: 8 * scale, marginTop: 18 * scale, flexWrap: 'wrap', justifyContent: 'center' }}>
          {c.notes.map((n: string) => <span key={n} style={{ fontSize: 14 * scale, fontWeight: 650, padding: `${5 * scale}px ${10 * scale}px`, borderRadius: 999, border: `1.5px solid ${hexA(col.ink, 0.5)}` }}>{n}</span>)}
        </div>
      )}
      <div style={{ position: 'absolute', bottom: 26 * scale, fontFamily: '"JetBrains Mono", monospace', fontSize: 16 * scale, opacity: 0.8 }}>{c.weight}</div>
    </div>
  );
};

export const Pack: React.FC<{ shape: string; col: PackColors; c: any; brand: string; scale?: number; sweep?: number; compact?: boolean }> = ({ shape, col, c, brand, scale = 1, sweep = 0.5, compact }) => {
  const sheen = `linear-gradient(90deg, ${hexA('#000', 0.25)}, transparent ${(sweep - 0.25) * 100}%, ${hexA('#FFFFFF', 0.28)} ${sweep * 100}%, transparent ${(sweep + 0.25) * 100}%, ${hexA('#000', 0.25)})`;
  const S = (n: number) => n * scale;
  const shadow = `0 ${S(50)}px ${S(90)}px -${S(30)}px ${hexA('#000', 0.55)}`;
  if (shape === 'can') {
    return (
      <div style={{ width: S(380), height: S(700), position: 'relative', borderRadius: S(40), background: col.base, boxShadow: shadow, overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: S(46), background: 'linear-gradient(90deg,#9a9a9a,#efefef 45%,#8a8a8a)' }} />
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: S(36), background: 'linear-gradient(90deg,#8a8a8a,#e6e6e6 45%,#7a7a7a)' }} />
        <div style={{ position: 'absolute', inset: `${S(46)}px 0 ${S(36)}px` }}><Label c={c} brand={brand} col={col} scale={scale * 0.88} compact={compact} /></div>
        <div style={{ position: 'absolute', inset: 0, background: sheen, mixBlendMode: 'overlay' }} />
      </div>
    );
  }
  if (shape === 'box') {
    return (
      <div style={{ position: 'relative', width: S(560), height: S(660) }}>
        <div style={{ position: 'absolute', left: S(460), top: S(30), width: S(100), height: S(630), background: mix(col.base, '#000000', 0.3), transform: 'skewY(-30deg)', transformOrigin: 'left top' }} />
        <div style={{ position: 'absolute', left: S(30), top: 0, width: S(530), height: S(60), background: mix(col.base, '#FFFFFF', 0.15), transform: 'skewX(-60deg)', transformOrigin: 'left bottom', marginTop: -S(30) }} />
        <div style={{ position: 'absolute', left: 0, top: S(30), width: S(460), height: S(630), background: col.base, boxShadow: shadow, overflow: 'hidden' }}>
          <Label c={c} brand={brand} col={col} scale={scale} compact={compact} />
          <div style={{ position: 'absolute', inset: 0, background: sheen, mixBlendMode: 'overlay', opacity: 0.6 }} />
        </div>
      </div>
    );
  }
  if (shape === 'tube') {
    return (
      <div style={{ width: S(330), height: S(780), position: 'relative', filter: `drop-shadow(0 ${S(40)}px ${S(40)}px ${hexA('#000', 0.35)})` }}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: S(660), background: col.base, clipPath: 'polygon(0 0, 100% 0, 100% 3%, 92% 100%, 8% 100%, 0 3%)', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: S(8), left: 0, right: 0, height: S(14), background: `repeating-linear-gradient(90deg, ${hexA('#000', 0.15)} 0 ${S(4)}px, transparent ${S(4)}px ${S(8)}px)` }} />
          <Label c={c} brand={brand} col={col} scale={scale * 0.78} compact={compact} />
          <div style={{ position: 'absolute', inset: 0, background: sheen, mixBlendMode: 'overlay' }} />
        </div>
        <div style={{ position: 'absolute', bottom: 0, left: S(70), right: S(70), height: S(130), borderRadius: S(18), background: col.accent }} />
      </div>
    );
  }
  if (shape === 'bar') {
    return (
      <div style={{ width: S(820), height: S(400), position: 'relative', borderRadius: S(14), background: col.base, boxShadow: shadow, overflow: 'hidden' }}>
        <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: S(260), background: `repeating-linear-gradient(135deg, ${col.accent} 0 ${S(16)}px, transparent ${S(16)}px ${S(34)}px)`, opacity: 0.85 }} />
        <div style={{ position: 'absolute', left: S(260), right: 0, top: 0, bottom: 0 }}><Label c={c} brand={brand} col={col} scale={scale * 0.82} compact={compact} /></div>
        <div style={{ position: 'absolute', inset: 0, background: sheen, mixBlendMode: 'overlay', opacity: 0.6 }} />
      </div>
    );
  }
  // pouch
  return (
    <div style={{ width: S(480), height: S(720), position: 'relative', filter: `drop-shadow(0 ${S(40)}px ${S(40)}px ${hexA('#000', 0.35)})` }}>
      <div style={{ position: 'absolute', inset: 0, background: col.base, borderRadius: `${S(10)}px ${S(10)}px ${S(60)}px ${S(60)}px`, overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: S(70), background: mix(col.base, '#000000', 0.15), borderBottom: `${S(3)}px dashed ${hexA(col.ink, 0.3)}` }} />
        <div style={{ position: 'absolute', top: S(70), left: 0, right: 0, bottom: 0 }}><Label c={c} brand={brand} col={col} scale={scale} compact={compact} /></div>
        <div style={{ position: 'absolute', inset: 0, background: sheen, mixBlendMode: 'overlay' }} />
      </div>
    </div>
  );
};

const packSize = (shape: string) => ({ can: [380, 700], box: [560, 660], tube: [330, 780], bar: [820, 400], pouch: [480, 720] } as Record<string, number[]>)[shape] ?? [480, 720];

export const PackagingCanvas: React.FC = () => {
  const { p, idea } = useTheme();
  const c = idea.content;
  const shape = idea.shape ?? 'pouch';
  const sweep = 0.15 + useProgress(10, 220) * 0.7;
  const main: PackColors = { base: p.accent, ink: p.accentInk, accent: p.accent2 };
  const v1: PackColors = { base: p.accent2, ink: '#111111', accent: p.accent };
  const v2: PackColors = { base: p.mode === 'dark' ? p.surface2 : p.ink, ink: p.mode === 'dark' ? p.ink : p.bg, accent: p.accent2 };
  const [mw, mh] = packSize(shape);
  const isBar = shape === 'bar';
  const vScale = isBar ? 0.5 : 0.62;
  return (
    <>
      <Reveal delay={0} style={{ position: 'absolute', left: 90, top: 110 }}>
        <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 24, color: p.muted }}>PACKAGING CONCEPT</div>
        <Heading size={88} style={{ marginTop: 10 }}>{idea.brand}</Heading>
        <div style={{ fontSize: 30, color: p.muted, marginTop: 6 }}>{idea.subject.en}</div>
      </Reveal>
      <Reveal delay={14} distance={60} style={{ position: 'absolute', left: isBar ? 90 : 120, top: isBar ? 1260 : 560 }}>
        <Pack shape={shape} col={v1} c={c} brand={idea.brand} scale={vScale} sweep={0.5} compact />
      </Reveal>
      <Reveal delay={20} distance={60} style={{ position: 'absolute', right: isBar ? 90 : 120, top: isBar ? 1260 : 560 }}>
        <Pack shape={shape} col={v2} c={c} brand={idea.brand} scale={vScale} sweep={0.5} compact />
      </Reveal>
      <div style={{ position: 'absolute', left: W / 2 - 420, top: 420, width: 840, height: 840, borderRadius: 840, background: `radial-gradient(circle, ${hexA(p.accent2, 0.3)}, transparent 68%)` }} />
      <Reveal delay={4} distance={100} style={{ position: 'absolute', left: W / 2 - mw / 2, top: (isBar ? 840 : 840) - mh / 2 }}>
        <Pack shape={shape} col={main} c={c} brand={idea.brand} sweep={sweep} />
      </Reveal>
      <Reveal delay={60} style={{ position: 'absolute', left: 90, top: 1620, width: W - 180 }}>
        <Card style={{ padding: 40, display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 40 }}>
          <div>
            <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 18, color: p.muted }}>LABEL HIERARCHY</div>
            {[['1', 'Brand mark', idea.brand], ['2', 'Product', c.productName], ['3', 'Descriptor', c.descriptor]].map(([n, k, v]) => (
              <div key={n} style={{ display: 'flex', gap: 18, alignItems: 'baseline', marginTop: 20 }}>
                <span style={{ fontFamily: '"JetBrains Mono", monospace', color: p.accent, fontSize: 22 }}>0{n}</span>
                <span style={{ fontSize: 20, color: p.muted, width: 150 }}>{k}</span>
                <span style={{ fontSize: 24, fontWeight: 700 }}>{v}</span>
              </div>
            ))}
          </div>
          <div>
            <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 18, color: p.muted }}>RANGE</div>
            <div style={{ display: 'flex', gap: 16, marginTop: 20 }}>
              {[main, v1, v2].map((cw, i) => (
                <div key={i} style={{ flex: 1 }}>
                  <div style={{ height: 120, borderRadius: 16, background: cw.base, border: `2px solid ${p.line}` }} />
                  <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 16, color: p.muted, marginTop: 8 }}>{cw.base.toUpperCase()}</div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </Reveal>
    </>
  );
};

export const packagingLayout = (): Layout => ({
  width: W,
  height: H,
  overview: { x: W / 2, y: 1060, scale: 0.77 },
  focus: [
    { x: 700, y: 760, scale: 1.3, ar: 'ملصق بتسلسل بصري يلفت النظر على الرف', en: 'Shelf-ready label hierarchy' },
    { x: 700, y: 900, scale: 0.85, ar: 'تشكيلة ألوان لنكهات وإصدارات مختلفة', en: 'A colour system for the whole range' },
    { x: 700, y: 1780, scale: 0.8, ar: 'تفاصيل الهوية والطباعة', en: 'Identity & print details' },
  ],
});
