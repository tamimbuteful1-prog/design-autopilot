import React from 'react';
import { Button, Card, Heading, Icon, Pill, Reveal, hexA, mix, useProgress, useTheme } from '../ui';
import type { Layout } from './types';

const PW = 430;
const PH = 932;

export const Phone: React.FC<{ x: number; y: number; delay: number; children: React.ReactNode; tilt?: number }> = ({ x, y, delay, children, tilt = 0 }) => {
  const { p } = useTheme();
  return (
    <Reveal delay={delay} distance={120} style={{ position: 'absolute', left: x, top: y, transform: `rotate(${tilt}deg)` }}>
      <div style={{ width: PW + 28, height: PH + 28, borderRadius: 74, background: '#0B0B0D', padding: 14, boxShadow: `0 60px 120px -40px ${hexA('#000000', 0.55)}, 0 0 0 2px ${hexA('#FFFFFF', 0.08)} inset` }}>
        <div style={{ width: PW, height: PH, borderRadius: 60, overflow: 'hidden', background: p.bg, color: p.ink, position: 'relative', fontFamily: 'Inter, sans-serif' }}>
          <div style={{ height: 54, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 34px', fontSize: 17, fontWeight: 600 }}>
            <span>9:41</span>
            <div style={{ width: 120, height: 34, borderRadius: 20, background: '#0B0B0D', position: 'absolute', left: PW / 2 - 60, top: 10 }} />
            <span style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
              <span style={{ width: 18, height: 11, borderRadius: 3, border: `2px solid ${p.ink}` }} />
            </span>
          </div>
          {children}
        </div>
      </div>
    </Reveal>
  );
};

const TabBar: React.FC<{ active: number; icons: string[] }> = ({ active, icons }) => {
  const { p } = useTheme();
  return (
    <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 96, background: p.surface, borderTop: `1px solid ${p.line}`, display: 'flex', justifyContent: 'space-around', alignItems: 'center', paddingBottom: 18 }}>
      {icons.map((ic, i) => (
        <div key={ic + i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
          <Icon name={ic} size={26} color={i === active ? p.accent : p.muted} />
          <div style={{ width: 5, height: 5, borderRadius: 5, background: i === active ? p.accent : 'transparent' }} />
        </div>
      ))}
    </div>
  );
};

const HomeScreen: React.FC = () => {
  const { p, idea } = useTheme();
  const c = idea.content;
  return (
    <div style={{ padding: '10px 26px' }}>
      <Reveal delay={18} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ fontSize: 16, color: p.muted, fontWeight: 500 }}>{idea.brand}</div>
          <Heading size={30}>{c.greeting}</Heading>
        </div>
        <div style={{ width: 52, height: 52, borderRadius: 26, background: `linear-gradient(135deg, ${p.accent}, ${p.accent2})`, display: 'grid', placeItems: 'center' }}>
          <Icon name="user" size={24} color={p.accentInk} />
        </div>
      </Reveal>
      <Reveal delay={26} style={{ marginTop: 26 }}>
        <Card tone="accent" style={{ padding: 26, position: 'relative', overflow: 'hidden', height: 210 }}>
          <div style={{ position: 'absolute', right: -40, top: -40, width: 200, height: 200, borderRadius: 200, background: hexA(p.accentInk, 0.1) }} />
          <div style={{ position: 'absolute', right: 30, bottom: 30, width: 70, height: 70, borderRadius: 22, background: hexA(p.accentInk, 0.16), display: 'grid', placeItems: 'center' }}>
            <Icon name={idea.icon} size={36} color={p.accentInk} />
          </div>
          <div style={{ fontSize: 17, opacity: 0.8, fontWeight: 500 }}>{c.heroTitle}</div>
          <Heading size={44} style={{ marginTop: 10 }}>{c.heroValue}</Heading>
          <div style={{ fontSize: 16, opacity: 0.8, marginTop: 14 }}>{c.heroSub}</div>
        </Card>
      </Reveal>
      <Reveal delay={34} style={{ display: 'flex', gap: 10, marginTop: 24 }}>
        {c.chips.slice(0, 3).map((t: string, i: number) => <Pill key={t} active={i === 0}>{t}</Pill>)}
      </Reveal>
      <div style={{ marginTop: 26, fontSize: 20, fontWeight: 700 }}>Today</div>
      {c.list.map((it: any, i: number) => (
        <Reveal key={it.title} delay={40 + i * 6} style={{ marginTop: 14 }}>
          <Card style={{ padding: 18, display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ width: 54, height: 54, borderRadius: 16, background: hexA(p.accent, 0.14), display: 'grid', placeItems: 'center' }}>
              <Icon name={it.icon} size={26} color={p.accent} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 19, fontWeight: 650 }}>{it.title}</div>
              <div style={{ fontSize: 15, color: p.muted, marginTop: 4 }}>{it.sub}</div>
            </div>
            <div style={{ fontSize: 16, fontWeight: 700, color: p.accent }}>{it.meta}</div>
          </Card>
        </Reveal>
      ))}
      <TabBar active={0} icons={['home', 'search', idea.icon, 'user']} />
    </div>
  );
};

const DetailScreen: React.FC = () => {
  const { p, idea } = useTheme();
  const d = idea.content.detail;
  const prog = useProgress(60, 50) * d.progress;
  const R = 70;
  const C = 2 * Math.PI * R;
  return (
    <div style={{ position: 'relative', height: PH - 54 }}>
      <div style={{ height: 380, margin: '0 18px', borderRadius: 40, background: `radial-gradient(circle at 30% 20%, ${mix(p.accent, '#FFFFFF', 0.35)}, ${p.accent} 70%)`, position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: 22, left: 22, right: 22, display: 'flex', justifyContent: 'space-between' }}>
          {['back', 'heart'].map((ic) => (
            <div key={ic} style={{ width: 52, height: 52, borderRadius: 26, background: hexA('#FFFFFF', 0.25), display: 'grid', placeItems: 'center' }}><Icon name={ic} size={24} color="#fff" /></div>
          ))}
        </div>
        <Reveal delay={30} distance={60} style={{ position: 'absolute', left: '50%', top: '55%', transform: 'translate(-50%,-50%)' }}>
          <div style={{ width: 190, height: 190, borderRadius: 95, background: hexA('#FFFFFF', 0.18), display: 'grid', placeItems: 'center', boxShadow: `0 0 0 26px ${hexA('#FFFFFF', 0.08)}` }}>
            <Icon name={idea.icon} size={96} color="#fff" stroke={1.6} />
          </div>
        </Reveal>
      </div>
      <div style={{ padding: '24px 30px' }}>
        <Reveal delay={36}><Heading size={34}>{d.title}</Heading></Reveal>
        <Reveal delay={40}><div style={{ color: p.muted, fontSize: 17, marginTop: 6 }}>{d.subtitle}</div></Reveal>
        <Reveal delay={46} style={{ display: 'flex', gap: 12, marginTop: 22 }}>
          {d.stats.map(([k, v]: [string, string]) => (
            <Card key={k} tone="surface" style={{ flex: 1, padding: '14px 12px', textAlign: 'center' }}>
              <div style={{ fontSize: 14, color: p.muted }}>{k}</div>
              <div style={{ fontSize: 19, fontWeight: 700, marginTop: 4 }}>{v}</div>
            </Card>
          ))}
        </Reveal>
        <Reveal delay={52} style={{ display: 'flex', alignItems: 'center', gap: 22, marginTop: 22 }}>
          <svg width={160} height={160} viewBox="0 0 160 160">
            <circle cx={80} cy={80} r={R} stroke={p.line} strokeWidth={14} fill="none" />
            <circle cx={80} cy={80} r={R} stroke={p.accent} strokeWidth={14} fill="none" strokeLinecap="round" strokeDasharray={C} strokeDashoffset={C * (1 - prog / 100)} transform="rotate(-90 80 80)" />
            <text x={80} y={90} textAnchor="middle" fontSize={32} fontWeight={700} fill={p.ink} fontFamily="Inter">{Math.round(prog)}%</text>
          </svg>
          <div style={{ fontSize: 17, color: p.muted, lineHeight: 1.4 }}>Progress tracked automatically with gentle reminders.</div>
        </Reveal>
      </div>
      <Reveal delay={60} style={{ position: 'absolute', left: 30, right: 30, bottom: 34 }}>
        <Button style={{ width: '100%' }}>{d.cta}</Button>
      </Reveal>
    </div>
  );
};

const StatsScreen: React.FC = () => {
  const { p, idea } = useTheme();
  const s = idea.content.stats;
  const grow = useProgress(70, 45);
  const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  const maxI = s.bars.indexOf(Math.max(...s.bars));
  return (
    <div style={{ padding: '10px 26px' }}>
      <Reveal delay={24}><div style={{ fontSize: 17, color: p.muted }}>{s.title}</div></Reveal>
      <Reveal delay={28}><Heading size={48} style={{ marginTop: 6 }}>{s.value}</Heading></Reveal>
      <Reveal delay={34} style={{ marginTop: 24 }}>
        <Card style={{ padding: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 16, color: p.muted }}><span>{s.label}</span><span>This week</span></div>
          <div style={{ height: 250, display: 'flex', alignItems: 'flex-end', gap: 14, marginTop: 20 }}>
            {s.bars.map((v: number, i: number) => (
              <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
                <div style={{ width: '100%', height: (v / 100) * 210 * grow, borderRadius: 12, background: i === maxI ? p.accent : hexA(p.accent, 0.25) }} />
                <div style={{ fontSize: 14, color: p.muted }}>{days[i]}</div>
              </div>
            ))}
          </div>
        </Card>
      </Reveal>
      <div style={{ display: 'flex', gap: 14, marginTop: 18 }}>
        {[['Best day', days[maxI] === 'S' ? 'Sunday' : 'Midweek'], ['Goal', `${Math.round(70 + grow * 22)}%`]].map(([k, v], i) => (
          <Reveal key={k} delay={44 + i * 6} style={{ flex: 1 }}>
            <Card tone="surface2" style={{ padding: 20 }}>
              <div style={{ fontSize: 15, color: p.muted }}>{k}</div>
              <div style={{ fontSize: 24, fontWeight: 700, marginTop: 6 }}>{v}</div>
            </Card>
          </Reveal>
        ))}
      </div>
      <Reveal delay={56} style={{ marginTop: 18 }}>
        <Card style={{ padding: 20, display: 'flex', alignItems: 'center', gap: 14 }}>
          <Icon name="bell" size={26} color={p.accent2} />
          <div style={{ fontSize: 17, flex: 1 }}>Weekly summary ready</div>
          <Icon name="arrow" size={22} color={p.muted} />
        </Card>
      </Reveal>
      <TabBar active={2} icons={['home', 'search', 'chart', 'user']} />
    </div>
  );
};

export const mobileLayout = (): Layout => ({
  width: 1560,
  height: 2240,
  overview: { x: 780, y: 1120, scale: 0.68 },
  focus: [
    { x: 290, y: 560, scale: 1.55, ar: 'بطاقة رئيسية واضحة تبرز أهم معلومة', en: 'Hero card · key info first' },
    { x: 780, y: 1180, scale: 1.4, ar: 'صفحة تفاصيل بتسلسل بصري مريح', en: 'Detail view · visual hierarchy' },
    { x: 1270, y: 1560, scale: 1.55, ar: 'رسوم بيانية بسيطة سهلة القراءة', en: 'Simple, readable data' },
  ],
});

export const MobileCanvas: React.FC = () => (
  <>
    <Phone x={60} y={200} delay={0} tilt={0}><HomeScreen /></Phone>
    <Phone x={551} y={700} delay={8}><DetailScreen /></Phone>
    <Phone x={1042} y={1150} delay={16}><StatsScreen /></Phone>
  </>
);
