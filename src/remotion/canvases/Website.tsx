import React from 'react';
import { Button, Card, Heading, Icon, Reveal, hexA, mix, useProgress, useTheme } from '../ui';
import type { Layout } from './types';

const W = 1440;
const H = 3200;

const HeroArt: React.FC = () => {
  const { p, s, idea } = useTheme();
  const t = useProgress(20, 80);
  return (
    <div style={{ position: 'relative', width: 560, height: 620 }}>
      <div style={{ position: 'absolute', inset: 0, borderRadius: s.key === 'editorial' ? 0 : 48, background: `linear-gradient(160deg, ${p.accent}, ${mix(p.accent, p.accent2, 0.6)})`, overflow: 'hidden', border: s.key === 'brutal' ? `3px solid ${p.ink}` : undefined, boxShadow: s.key === 'brutal' ? `12px 12px 0 ${p.ink}` : undefined }}>
        <div style={{ position: 'absolute', width: 520, height: 520, borderRadius: 520, border: `2px solid ${hexA('#FFFFFF', 0.25)}`, left: 20 + t * 40, top: 60 - t * 20 }} />
        <div style={{ position: 'absolute', width: 300, height: 300, borderRadius: 300, background: hexA('#FFFFFF', 0.16), right: -60, bottom: -40 + t * 30 }} />
        <div style={{ position: 'absolute', left: '50%', top: '46%', transform: `translate(-50%,-50%) rotate(${(1 - t) * -12}deg)` }}>
          <Icon name={idea.icon} size={220} color="#FFFFFF" stroke={1.2} />
        </div>
      </div>
      <Card style={{ position: 'absolute', left: -70, bottom: 60, padding: '18px 24px', display: 'flex', alignItems: 'center', gap: 14, transform: `translateY(${(1 - t) * 40}px)`, opacity: t }}>
        <div style={{ width: 46, height: 46, borderRadius: 23, background: hexA(p.accent, 0.15), display: 'grid', placeItems: 'center' }}><Icon name="check" size={24} color={p.accent} /></div>
        <div><div style={{ fontWeight: 700, fontSize: 18 }}>{idea.content.stats[0][0]} {idea.content.stats[0][1]}</div><div style={{ color: p.muted, fontSize: 14 }}>{idea.brand}</div></div>
      </Card>
    </div>
  );
};

export const WebsiteCanvas: React.FC = () => {
  const { p, s, idea } = useTheme();
  const c = idea.content;
  const section = (children: React.ReactNode, extra: React.CSSProperties = {}) => <div style={{ padding: '110px 110px', ...extra }}>{children}</div>;
  return (
    <Reveal delay={0} distance={100} style={{ position: 'absolute', left: 0, top: 0 }}>
      <div style={{ width: W, height: H, background: p.bg, borderRadius: 36, overflow: 'hidden', boxShadow: `0 80px 160px -60px ${hexA('#000', 0.6)}`, border: `1px solid ${p.line}` }}>
        <div style={{ height: 96, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 110px', borderBottom: `1px solid ${p.line}` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 40, height: 40, borderRadius: s.key === 'brutal' ? 4 : 12, background: p.accent, display: 'grid', placeItems: 'center' }}><Icon name={idea.icon} size={22} color={p.accentInk} /></div>
            <Heading size={28}>{idea.brand}</Heading>
          </div>
          <div style={{ display: 'flex', gap: 44, fontSize: 19, color: p.muted, fontWeight: 500 }}>{c.nav.slice(0, 3).map((n: string) => <span key={n}>{n}</span>)}</div>
          <Button style={{ height: 54, fontSize: 18 }}>{c.nav[3]}</Button>
        </div>
        {section(
          <div style={{ display: 'flex', alignItems: 'center', gap: 70 }}>
            <div style={{ flex: 1 }}>
              <Reveal delay={12}><div style={{ display: 'inline-block', padding: '8px 18px', borderRadius: 999, background: hexA(p.accent, 0.12), color: p.accent, fontWeight: 650, fontSize: 18 }}>{idea.subject.en}</div></Reveal>
              <Reveal delay={18}><Heading size={84} style={{ marginTop: 28 }}>{c.heroTitle}</Heading></Reveal>
              <Reveal delay={26}><div style={{ fontSize: 26, color: p.muted, marginTop: 28, lineHeight: 1.5, maxWidth: 560 }}>{c.heroSub}</div></Reveal>
              <Reveal delay={32} style={{ display: 'flex', gap: 16, marginTop: 44 }}>
                <Button style={{ height: 70, fontSize: 22 }}>{c.cta} →</Button>
                <Button variant="secondary" style={{ height: 70, fontSize: 22 }}>Learn more</Button>
              </Reveal>
            </div>
            <HeroArt />
          </div>,
          { paddingTop: 120 }
        )}
        <div style={{ margin: '0 110px', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', borderTop: `1px solid ${p.line}`, borderBottom: `1px solid ${p.line}` }}>
          {c.stats.map(([v, l]: [string, string], i: number) => (
            <Reveal key={l} delay={40 + i * 5} style={{ padding: '44px 0', textAlign: 'center', borderLeft: i ? `1px solid ${p.line}` : undefined }}>
              <Heading size={64} style={{ color: p.accent }}>{v}</Heading>
              <div style={{ color: p.muted, fontSize: 20, marginTop: 8 }}>{l}</div>
            </Reveal>
          ))}
        </div>
        {section(
          <>
            <Heading size={56} style={{ maxWidth: 800 }}>Designed around what matters</Heading>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 28, marginTop: 56 }}>
              {c.features.map((f: any, i: number) => (
                <Reveal key={f.title} delay={46 + i * 6}>
                  <Card style={{ padding: 40, height: 340 }} tone={i === 1 ? 'accent' : 'surface'}>
                    <div style={{ width: 68, height: 68, borderRadius: s.key === 'brutal' ? 4 : 20, background: i === 1 ? hexA(p.accentInk, 0.16) : hexA(p.accent, 0.12), display: 'grid', placeItems: 'center' }}><Icon name={f.icon} size={34} color={i === 1 ? p.accentInk : p.accent} /></div>
                    <div style={{ fontSize: 30, fontWeight: 700, marginTop: 34 }}>{f.title}</div>
                    <div style={{ fontSize: 21, marginTop: 14, lineHeight: 1.5, opacity: 0.75 }}>{f.body}</div>
                  </Card>
                </Reveal>
              ))}
            </div>
          </>
        )}
        {c.pricing
          ? section(
              <>
                <Heading size={56}>Simple pricing</Heading>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 28, marginTop: 56 }}>
                  {c.pricing.map((pl: any, i: number) => (
                    <Card key={pl.name} style={{ padding: 40, height: 470, position: 'relative' }} tone={i === 1 ? 'accent' : 'surface'}>
                      {i === 1 && <div style={{ position: 'absolute', top: 28, right: 28, fontSize: 15, fontWeight: 700, padding: '6px 14px', borderRadius: 999, background: hexA(p.accentInk, 0.2) }}>Popular</div>}
                      <div style={{ fontSize: 24, fontWeight: 650, opacity: 0.8 }}>{pl.name}</div>
                      <Heading size={64} style={{ marginTop: 20 }}>{pl.price}</Heading>
                      <div style={{ fontSize: 18, opacity: 0.6, marginTop: 4 }}>per month</div>
                      <div style={{ marginTop: 36, display: 'flex', flexDirection: 'column', gap: 16 }}>
                        {pl.items.map((it: string) => <div key={it} style={{ display: 'flex', gap: 12, alignItems: 'center', fontSize: 21 }}><Icon name="check" size={22} color={i === 1 ? p.accentInk : p.accent} />{it}</div>)}
                      </div>
                      <div style={{ position: 'absolute', left: 40, right: 40, bottom: 40, height: 62, borderRadius: Math.min(s.radius, 16), display: 'grid', placeItems: 'center', fontWeight: 700, fontSize: 20, background: i === 1 ? p.accentInk : p.surface2, color: i === 1 ? p.accent : p.ink }}>Choose {pl.name}</div>
                    </Card>
                  ))}
                </div>
              </>,
              { background: p.surface2 }
            )
          : section(
              <>
                <Heading size={56}>How it works</Heading>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 22, marginTop: 56 }}>
                  {c.steps.map((st: string, i: number) => (
                    <Card key={st} style={{ padding: 34, height: 300 }} tone={i === 0 ? 'accent' : 'surface'}>
                      <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 22, opacity: 0.6 }}>0{i + 1}</div>
                      <Heading size={40} style={{ marginTop: 110 }}>{st}</Heading>
                    </Card>
                  ))}
                </div>
              </>,
              { background: p.surface2 }
            )}
        {section(
          <Card tone="accent" style={{ padding: '80px 90px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Heading size={60} style={{ maxWidth: 700 }}>Ready when you are.</Heading>
            <div style={{ height: 76, padding: '0 40px', borderRadius: Math.min(s.radius, 18), background: p.accentInk, color: p.accent, display: 'grid', placeItems: 'center', fontSize: 24, fontWeight: 700 }}>{c.cta}</div>
          </Card>
        )}
        <div style={{ padding: '0 110px', display: 'flex', justifyContent: 'space-between', color: p.muted, fontSize: 18 }}>
          <span>© {idea.brand} — concept</span>
          <span>Privacy · Terms · Contact</span>
        </div>
      </div>
    </Reveal>
  );
};

export const websiteLayout = (): Layout => ({
  width: W,
  height: H,
  overview: { x: W / 2, y: 1500, scale: 0.6 },
  focus: [
    { x: 470, y: 470, scale: 1.2, ar: 'عنوان رئيسي قوي ودعوة واضحة لاتخاذ إجراء', en: 'Strong headline · clear call to action' },
    { x: 720, y: 1340, scale: 0.95, ar: 'شبكة مزايا مرتبة تشرح القيمة بسرعة', en: 'Feature grid that sells the value' },
    { x: 720, y: 2170, scale: 0.95, ar: 'قسم تحويل مصمم لرفع المبيعات', en: 'Conversion section built to convert' },
  ],
});
