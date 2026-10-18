import React from 'react';
import { Card, Heading, Reveal, hexA, mix, useProgress, useTheme } from '../ui';
import type { Layout } from './types';

const W = 1400;
const H = 2150;

/** Original, parametric product drawings (no real-world product is reproduced). */
export const ProductArt: React.FC<{ shape: string; color: string; size?: number; sweep?: number; id?: string }> = ({ shape, color, size = 760, sweep = 0.5, id = 'p' }) => {
  const { p } = useTheme();
  const dark = mix(color, '#000000', 0.45);
  const light = mix(color, '#FFFFFF', 0.35);
  const gx = `${id}-gx`;
  const fabric = `${id}-fab`;
  const defs = (
    <defs>
      <linearGradient id={gx} x1="0" x2="1" y1="0" y2="0">
        <stop offset="0" stopColor={dark} />
        <stop offset={Math.max(0.05, sweep - 0.18)} stopColor={color} />
        <stop offset={sweep} stopColor={light} />
        <stop offset={Math.min(0.95, sweep + 0.2)} stopColor={color} />
        <stop offset="1" stopColor={dark} />
      </linearGradient>
      <pattern id={fabric} width="10" height="10" patternUnits="userSpaceOnUse">
        <circle cx="5" cy="5" r="1.7" fill={hexA('#000000', 0.18)} />
      </pattern>
      <radialGradient id={`${id}-shadow`}>
        <stop offset="0" stopColor="#000" stopOpacity={0.35} />
        <stop offset="1" stopColor="#000" stopOpacity={0} />
      </radialGradient>
    </defs>
  );
  const shadow = <ellipse cx={200} cy={388} rx={150} ry={14} fill={`url(#${id}-shadow)`} />;
  let body: React.ReactNode = null;
  if (shape === 'speaker') {
    body = (
      <>
        <rect x={110} y={70} width={180} height={310} rx={60} fill={`url(#${gx})`} />
        <rect x={110} y={110} width={180} height={270} rx={56} fill={`url(#${fabric})`} />
        <ellipse cx={200} cy={78} rx={88} ry={16} fill={light} />
        <ellipse cx={200} cy={78} rx={46} ry={8} fill="none" stroke={p.accent2} strokeWidth={3} />
        <rect x={180} y={350} width={40} height={6} rx={3} fill={hexA('#FFFFFF', 0.5)} />
      </>
    );
  } else if (shape === 'bottle') {
    body = (
      <>
        <rect x={145} y={40} width={110} height={56} rx={14} fill={dark} />
        <circle cx={200} cy={68} r={8} fill={p.accent2} />
        <path d="M160 96 h80 v20 q40 18 40 60 v190 q0 22 -22 22 h-116 q-22 0 -22 -22 v-190 q0 -42 40 -60z" fill={`url(#${gx})`} />
        <rect x={150} y={230} width={100} height={4} rx={2} fill={hexA('#FFFFFF', 0.35)} />
      </>
    );
  } else if (shape === 'lamp') {
    body = (
      <>
        <ellipse cx={200} cy={372} rx={110} ry={18} fill={dark} />
        <rect x={92} y={352} width={216} height={20} rx={10} fill={`url(#${gx})`} />
        <path d="M200 356 L140 210 L260 90" stroke={color} strokeWidth={14} fill="none" strokeLinecap="round" />
        <circle cx={140} cy={210} r={14} fill={light} />
        <path d="M230 60 q60 -10 90 40 l-100 50 q-20 -50 10 -90z" fill={`url(#${gx})`} />
        <ellipse cx={272} cy={124} rx={56} ry={14} transform="rotate(-27 272 124)" fill={p.accent2} opacity={0.9} />
      </>
    );
  } else if (shape === 'headphones') {
    body = (
      <>
        <path d="M95 250 q0 -200 105 -200 q105 0 105 200" stroke={color} strokeWidth={22} fill="none" strokeLinecap="round" />
        <path d="M95 250 q0 -200 105 -200 q105 0 105 200" stroke={hexA('#FFFFFF', 0.25)} strokeWidth={6} fill="none" strokeLinecap="round" />
        <rect x={52} y={210} width={92} height={150} rx={40} fill={`url(#${gx})`} />
        <rect x={256} y={210} width={92} height={150} rx={40} fill={`url(#${gx})`} />
        <rect x={130} y={240} width={20} height={90} rx={10} fill={dark} />
        <rect x={250} y={240} width={20} height={90} rx={10} fill={dark} />
        <circle cx={302} cy={250} r={5} fill={p.accent2} />
      </>
    );
  } else {
    // watch
    body = (
      <>
        <rect x={150} y={20} width={100} height={110} rx={20} fill={dark} />
        <rect x={150} y={270} width={100} height={110} rx={20} fill={dark} />
        <rect x={120} y={100} width={160} height={190} rx={48} fill={`url(#${gx})`} />
        <rect x={134} y={114} width={132} height={162} rx={38} fill="#0A0A0A" />
        <circle cx={200} cy={195} r={48} stroke={hexA('#FFFFFF', 0.15)} strokeWidth={8} fill="none" />
        <circle cx={200} cy={195} r={48} stroke={p.accent2} strokeWidth={8} fill="none" strokeDasharray={302} strokeDashoffset={302 * (1 - sweep)} strokeLinecap="round" transform="rotate(-90 200 195)" />
        <text x={200} y={204} fill="#fff" fontSize={26} fontWeight={700} textAnchor="middle" fontFamily="Inter">09:41</text>
        <rect x={281} y={170} width={10} height={40} rx={5} fill={light} />
      </>
    );
  }
  return (
    <svg width={size} height={size} viewBox="0 0 400 400">
      {defs}
      {shadow}
      {body}
    </svg>
  );
};

export const ProductCanvas: React.FC = () => {
  const { p, idea } = useTheme();
  const c = idea.content;
  const sweep = 0.2 + useProgress(10, 200) * 0.6;
  const lines = useProgress(50, 40);
  const colorways = [p.accent, mix(p.ink, p.bg, 0.15), p.accent2];
  const callouts = [
    { side: 'L', x: 90, y: 560, ax: 520, ay: 640 },
    { side: 'R', x: 980, y: 520, ax: 860, ay: 620 },
    { side: 'L', x: 90, y: 1000, ax: 540, ay: 980 },
    { side: 'R', x: 980, y: 960, ax: 860, ay: 1000 },
  ];
  return (
    <>
      <Reveal delay={0} style={{ position: 'absolute', left: 90, top: 120 }}>
        <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 24, color: p.muted }}>INDUSTRIAL DESIGN STUDY</div>
        <Heading size={92} style={{ marginTop: 10 }}>{idea.brand}</Heading>
        <div style={{ fontSize: 30, color: p.muted, marginTop: 8 }}>{idea.subject.en}</div>
      </Reveal>
      <div style={{ position: 'absolute', left: 700 - 330, top: 460, width: 660, height: 660, borderRadius: 660, background: `radial-gradient(circle, ${hexA(p.accent, 0.35)}, transparent 70%)` }} />
      <Reveal delay={6} distance={80} style={{ position: 'absolute', left: 700 - 380, top: 420 }}>
        <ProductArt shape={idea.shape ?? 'speaker'} color={p.accent} sweep={sweep} id="hero" />
      </Reveal>
      <svg style={{ position: 'absolute', left: 0, top: 0, overflow: 'visible' }} width={W} height={H}>
        {callouts.map((cl, i) => {
          const sx = cl.side === 'L' ? cl.x + 300 : cl.x;
          const sy = cl.y + 40;
          return (
            <g key={i} opacity={lines}>
              <path d={`M${sx},${sy} L${sx + (cl.ax - sx) * lines},${sy + (cl.ay - sy) * lines}`} stroke={p.muted} strokeWidth={2} strokeDasharray="6 6" />
              <circle cx={cl.ax} cy={cl.ay} r={9 * lines} fill={p.accent2} stroke={p.bg} strokeWidth={4} />
            </g>
          );
        })}
      </svg>
      {c.specs.map(([k, v]: [string, string], i: number) => (
        <Reveal key={k} delay={56 + i * 6} style={{ position: 'absolute', left: callouts[i].x, top: callouts[i].y, width: 300, textAlign: callouts[i].side === 'L' ? 'left' : 'left' }}>
          <div style={{ fontSize: 22, color: p.muted }}>{k}</div>
          <div style={{ fontSize: 36, fontWeight: 750, marginTop: 4 }}>{v}</div>
        </Reveal>
      ))}
      <Reveal delay={70} style={{ position: 'absolute', left: 90, top: 1300, width: W - 180 }}>
        <div style={{ fontSize: 26, fontWeight: 700, marginBottom: 22 }}>Colourways</div>
        <div style={{ display: 'flex', gap: 24 }}>
          {colorways.map((col, i) => (
            <Card key={i} style={{ flex: 1, padding: 20, display: 'flex', flexDirection: 'column', alignItems: 'center' }} tone="surface">
              <ProductArt shape={idea.shape ?? 'speaker'} color={col} size={300} sweep={0.55} id={`cw${i}`} />
              <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 20, color: p.muted }}>{col.toUpperCase()}</div>
            </Card>
          ))}
        </div>
      </Reveal>
      <Reveal delay={80} style={{ position: 'absolute', left: 90, top: 1800, width: W - 180, display: 'flex', gap: 20 }}>
        {c.materials.map((m: string, i: number) => (
          <Card key={m} tone={i === 0 ? 'accent' : 'surface2'} style={{ flex: 1, padding: '28px 26px' }}>
            <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 18, opacity: 0.6 }}>MATERIAL 0{i + 1}</div>
            <div style={{ fontSize: 28, fontWeight: 700, marginTop: 10 }}>{m}</div>
          </Card>
        ))}
      </Reveal>
    </>
  );
};

export const productLayout = (): Layout => ({
  width: W,
  height: H,
  overview: { x: W / 2, y: 1075, scale: 0.77 },
  focus: [
    { x: 700, y: 800, scale: 1.25, ar: 'شكل بسيط وخامات مدروسة', en: 'Clean form · considered materials' },
    { x: 700, y: 800, scale: 0.8, ar: 'مواصفات واضحة حول المنتج', en: 'Key specs called out' },
    { x: 700, y: 1560, scale: 0.85, ar: 'خيارات ألوان متناسقة مع الهوية', en: 'Colourways that fit the brand' },
  ],
});
