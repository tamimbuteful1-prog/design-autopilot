import React from 'react';
import { Button, Card, Heading, Icon, Pill, Reveal, hexA, useProgress, useTheme } from '../ui';
import { Phone } from './Mobile';
import type { Layout } from './types';

const W = 1600;
const H = 2200;

const FlowScreen: React.FC<{ step: any; index: number }> = ({ step, index }) => {
  const { p, idea } = useTheme();
  return (
    <div style={{ padding: '30px 30px', height: 870, display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', gap: 8 }}>
        {[0, 1, 2].map((k) => <div key={k} style={{ flex: 1, height: 6, borderRadius: 6, background: k <= index ? p.accent : p.line }} />)}
      </div>
      <Reveal delay={20 + index * 8} style={{ marginTop: 50, height: 300, borderRadius: 36, background: hexA(p.accent, 0.12), display: 'grid', placeItems: 'center' }}>
        <div style={{ width: 170, height: 170, borderRadius: 85, background: p.accent, display: 'grid', placeItems: 'center', boxShadow: `0 0 0 24px ${hexA(p.accent, 0.15)}` }}>
          <Icon name={index === 2 ? 'check' : index === 1 ? 'grid' : idea.icon} size={80} color={p.accentInk} />
        </div>
      </Reveal>
      <Heading size={40} style={{ marginTop: 40 }}>{step.title}</Heading>
      <div style={{ fontSize: 19, color: p.muted, marginTop: 12, lineHeight: 1.45 }}>{step.body}</div>
      {step.options && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 22 }}>
          {step.options.map((o: string, i: number) => <Pill key={o} active={i === 0 || i === 2}>{o}</Pill>)}
        </div>
      )}
      <div style={{ flex: 1 }} />
      <Button style={{ width: '100%' }}>{step.cta}</Button>
      <div style={{ textAlign: 'center', color: p.muted, fontSize: 17, marginTop: 18 }}>{index === 0 ? 'I already have an account' : 'Back'}</div>
    </div>
  );
};

const Arrow: React.FC<{ x: number; y: number; delay: number }> = ({ x, y, delay }) => {
  const { p } = useTheme();
  const t = useProgress(delay, 30);
  return (
    <svg style={{ position: 'absolute', left: x, top: y, overflow: 'visible' }} width={140} height={60}>
      <path d="M0 30 C 50 0, 90 0, 130 30" stroke={p.accent} strokeWidth={5} fill="none" strokeDasharray="200" strokeDashoffset={200 * (1 - t)} strokeLinecap="round" />
      <path d="M118 18 L132 31 L116 40" stroke={p.accent} strokeWidth={5} fill="none" opacity={t} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
};

const Note: React.FC<{ x: number; y: number; delay: number; title: string; body: string; rot?: number }> = ({ x, y, delay, title, body, rot = 0 }) => {
  const { p } = useTheme();
  return (
    <Reveal delay={delay} style={{ position: 'absolute', left: x, top: y, transform: `rotate(${rot}deg)` }}>
      <div style={{ width: 460, padding: 32, borderRadius: 18, background: p.accent2, color: '#111', boxShadow: `0 20px 40px -20px ${hexA('#000', 0.5)}` }}>
        <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 16, opacity: 0.7 }}>UX NOTE</div>
        <div style={{ fontSize: 34, fontWeight: 750, marginTop: 8 }}>{title}</div>
        <div style={{ fontSize: 25, marginTop: 10, lineHeight: 1.4, opacity: 0.85 }}>{body}</div>
      </div>
    </Reveal>
  );
};

export const UxCanvas: React.FC = () => {
  const { p, idea } = useTheme();
  const c = idea.content;
  return (
    <>
      <Reveal delay={0} style={{ position: 'absolute', left: 60, top: 60 }}>
        <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 22, color: p.muted }}>USER FLOW · {idea.brand.toUpperCase()}</div>
        <Heading size={64} style={{ marginTop: 10 }}>{idea.subject.en}</Heading>
      </Reveal>
      {c.flow.map((st: any, i: number) => (
        <Phone key={i} x={40 + i * 520} y={250 + (i % 2) * 120} delay={6 + i * 8}><FlowScreen step={st} index={i} /></Phone>
      ))}
      <Arrow x={470} y={700} delay={50} />
      <Arrow x={990} y={760} delay={58} />
      <Note x={70} y={1340} delay={64} rot={-2} title={c.principle[0]} body="Each step asks for one thing, keeping cognitive load low." />
      <Note x={590} y={1460} delay={70} rot={1.5} title={c.principle[1]} body="Pre-selected options speed up the most common path." />
      <Note x={1110} y={1380} delay={76} rot={-1} title={c.principle[2]} body="The primary action stays in the thumb zone on every screen." />
      <Reveal delay={82} style={{ position: 'absolute', left: 60, right: 60, top: 1830 }}>
        <Card style={{ padding: 34, display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: W - 120 }}>
          {[['Tap target', '≥ 48px'], ['Steps', '3'], ['Contrast', 'WCAG AA'], ['Grid', '8pt']].map(([k, v]) => (
            <div key={k}><div style={{ fontSize: 26, color: p.muted }}>{k}</div><div style={{ fontSize: 52, fontWeight: 750, marginTop: 6 }}>{v}</div></div>
          ))}
        </Card>
      </Reveal>
    </>
  );
};

export const uxLayout = (): Layout => ({
  width: W,
  height: H,
  overview: { x: W / 2, y: 1080, scale: 0.66 },
  focus: [
    { x: 520, y: 780, scale: 1.0, ar: 'خطوات قليلة وقرار واحد في كل شاشة', en: 'Few steps · one decision per screen' },
    { x: 800, y: 1520, scale: 0.7, ar: 'كل قرار تصميمي مبني على سبب واضح', en: 'Every design decision has a reason' },
    { x: 800, y: 1900, scale: 0.68, ar: 'معايير وصول وقابلية استخدام مدروسة', en: 'Accessibility & usability specs' },
  ],
});
