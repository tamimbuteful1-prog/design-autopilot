import React from 'react';
import { Card, Heading, Icon, Reveal, hexA, useProgress, useTheme } from '../ui';
import type { Layout } from './types';

const W = 1920;
const H = 1240;

const LineChart: React.FC<{ a: number[]; b: number[]; w: number; h: number }> = ({ a, b, w, h }) => {
  const { p } = useTheme();
  const prog = useProgress(40, 70);
  const max = Math.max(...a, ...b) * 1.15;
  const pt = (arr: number[]) => arr.map((v, i) => [(i / (arr.length - 1)) * w, h - (v / max) * h] as const);
  const smooth = (pts: readonly (readonly [number, number])[]) =>
    pts.reduce((acc, [x, y], i, arr) => {
      if (i === 0) return `M${x},${y}`;
      const [px, py] = arr[i - 1];
      const cx = (px + x) / 2;
      return `${acc} C${cx},${py} ${cx},${y} ${x},${y}`;
    }, '');
  const pa = smooth(pt(a));
  const pb = smooth(pt(b));
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const last = pt(a)[a.length - 1];
  return (
    <svg width={w} height={h + 40} style={{ overflow: 'visible' }}>
      <defs>
        <linearGradient id="ga" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor={p.accent} stopOpacity={0.35} />
          <stop offset="1" stopColor={p.accent} stopOpacity={0} />
        </linearGradient>
        <clipPath id="reveal"><rect x={0} y={-20} width={w * prog} height={h + 40} /></clipPath>
      </defs>
      {[0, 0.25, 0.5, 0.75, 1].map((g) => <line key={g} x1={0} x2={w} y1={h * g} y2={h * g} stroke={p.line} strokeDasharray="4 8" />)}
      <g clipPath="url(#reveal)">
        <path d={`${pa} L${w},${h} L0,${h} Z`} fill="url(#ga)" />
        <path d={pb} fill="none" stroke={p.accent2} strokeWidth={4} strokeDasharray="10 10" />
        <path d={pa} fill="none" stroke={p.accent} strokeWidth={6} strokeLinecap="round" />
      </g>
      <circle cx={last[0]} cy={last[1]} r={12 * prog} fill={p.surface} stroke={p.accent} strokeWidth={5} />
      {months.map((m, i) => <text key={m} x={(i / 11) * w} y={h + 34} fontSize={18} fill={p.muted} textAnchor="middle" fontFamily="Inter">{m}</text>)}
    </svg>
  );
};

export const DashboardCanvas: React.FC = () => {
  const { p, s, idea } = useTheme();
  const c = idea.content;
  const barP = useProgress(60, 50);
  const maxBar = Math.max(...c.bars.map((b: any) => b.value));
  const statusColor = (st: string) => (/(paid|delivered|normal|checked|in house|in session|shipped)/i.test(st) ? '#22A06B' : /(pending|waiting|packing|booked|arriving|on route|cleaning)/i.test(st) ? '#D4A015' : '#E5484D');
  return (
    <Reveal delay={0} distance={80} style={{ position: 'absolute', left: 0, top: 0 }}>
      <div style={{ width: W, height: H, borderRadius: 30, overflow: 'hidden', background: p.bg, boxShadow: `0 80px 160px -60px ${hexA('#000', 0.6)}`, border: `1px solid ${p.line}`, display: 'flex', flexDirection: 'column' }}>
        <div style={{ height: 52, background: p.surface2, display: 'flex', alignItems: 'center', gap: 10, padding: '0 22px', borderBottom: `1px solid ${p.line}` }}>
          {['#FF5F57', '#FEBC2E', '#28C840'].map((col) => <div key={col} style={{ width: 14, height: 14, borderRadius: 7, background: col }} />)}
          <div style={{ marginLeft: 30, height: 32, flex: 0.4, borderRadius: 10, background: p.bg, fontSize: 15, color: p.muted, display: 'flex', alignItems: 'center', padding: '0 16px' }}>app.{idea.brand.toLowerCase().replace(/[^a-z]/g, '')}.io/{c.nav[0].toLowerCase().replace(/\s/g, '-')}</div>
        </div>
        <div style={{ flex: 1, display: 'flex' }}>
          <div style={{ width: 270, background: p.surface, borderRight: `1px solid ${p.line}`, padding: '34px 24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: p.accent, display: 'grid', placeItems: 'center' }}><Icon name={idea.icon} size={24} color={p.accentInk} /></div>
              <Heading size={26}>{idea.brand}</Heading>
            </div>
            <div style={{ marginTop: 44, display: 'flex', flexDirection: 'column', gap: 8 }}>
              {c.nav.map((n: string, i: number) => (
                <div key={n} style={{ height: 52, borderRadius: 14, display: 'flex', alignItems: 'center', gap: 14, padding: '0 16px', fontSize: 19, fontWeight: i === 0 ? 650 : 500, background: i === 0 ? hexA(p.accent, 0.14) : 'transparent', color: i === 0 ? p.accent : p.muted }}>
                  <Icon name={['grid', 'user', 'wallet', 'chart', 'dots'][i] ?? 'dots'} size={22} />
                  {n}
                </div>
              ))}
            </div>
            <Card tone="surface2" style={{ marginTop: 300, padding: 20 }}>
              <div style={{ fontSize: 16, fontWeight: 650 }}>Weekly report</div>
              <div style={{ fontSize: 14, color: p.muted, marginTop: 6 }}>Auto-sent every Sunday</div>
            </Card>
          </div>
          <div style={{ flex: 1, padding: 36, display: 'flex', flexDirection: 'column', gap: 26 }}>
            <Reveal delay={10} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: 17, color: p.muted }}>Last 12 months</div>
                <Heading size={46}>{c.title}</Heading>
              </div>
              <div style={{ display: 'flex', gap: 14 }}>
                <div style={{ height: 52, width: 300, borderRadius: 14, background: p.surface, border: `1px solid ${p.line}`, display: 'flex', alignItems: 'center', gap: 10, padding: '0 16px', color: p.muted, fontSize: 17 }}><Icon name="search" size={20} />Search…</div>
                <div style={{ height: 52, padding: '0 22px', borderRadius: 14, background: p.accent, color: p.accentInk, display: 'flex', alignItems: 'center', gap: 8, fontWeight: 650, fontSize: 17 }}><Icon name="plus" size={20} />Export</div>
              </div>
            </Reveal>
            <div style={{ display: 'flex', gap: 22 }}>
              {c.kpis.map((k: any, i: number) => (
                <Reveal key={k.label} delay={16 + i * 5} style={{ flex: 1 }}>
                  <Card style={{ padding: 26 }} tone={i === 0 ? 'accent' : 'surface'}>
                    <div style={{ fontSize: 17, opacity: 0.75 }}>{k.label}</div>
                    <div style={{ fontSize: 40, fontWeight: 750, marginTop: 10, letterSpacing: -1 }}>{k.value}</div>
                    <div style={{ marginTop: 12, display: 'inline-block', fontSize: 15, fontWeight: 650, padding: '4px 10px', borderRadius: 8, background: i === 0 ? hexA(p.accentInk, 0.18) : hexA(k.delta.startsWith('-') && !/churn|wait|eta|returns|no-show|peak|usage/i.test(k.label) ? '#E5484D' : '#22A06B', 0.15), color: i === 0 ? p.accentInk : k.delta.startsWith('-') && !/churn|wait|eta|returns|no-show|peak|usage/i.test(k.label) ? '#E5484D' : '#22A06B' }}>{k.delta}</div>
                  </Card>
                </Reveal>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 22 }}>
              <Reveal delay={30} style={{ flex: 2 }}>
                <Card style={{ padding: 28, height: 400 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <div style={{ fontSize: 21, fontWeight: 650 }}>Trend</div>
                    <div style={{ display: 'flex', gap: 18, fontSize: 15, color: p.muted }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><span style={{ width: 12, height: 12, borderRadius: 3, background: p.accent }} />This year</span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><span style={{ width: 12, height: 12, borderRadius: 3, background: p.accent2 }} />Last year</span>
                    </div>
                  </div>
                  <div style={{ marginTop: 30 }}><LineChart a={c.series} b={c.series2} w={1000} h={260} /></div>
                </Card>
              </Reveal>
              <Reveal delay={36} style={{ flex: 1 }}>
                <Card style={{ padding: 28, height: 400 }}>
                  <div style={{ fontSize: 21, fontWeight: 650 }}>Breakdown</div>
                  <div style={{ marginTop: 26, display: 'flex', flexDirection: 'column', gap: 22 }}>
                    {c.bars.map((b: any, i: number) => (
                      <div key={b.label}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 16, marginBottom: 8 }}><span style={{ color: p.muted }}>{b.label}</span><span style={{ fontWeight: 650 }}>{Math.round(b.value * barP)}%</span></div>
                        <div style={{ height: 14, borderRadius: 8, background: p.surface2 }}>
                          <div style={{ height: '100%', width: `${(b.value / maxBar) * 100 * barP}%`, borderRadius: 8, background: i === 0 ? p.accent : hexA(p.accent, 0.45 - i * 0.07) }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              </Reveal>
            </div>
            <Reveal delay={44}>
              <Card style={{ padding: '22px 28px' }}>
                <div style={{ fontSize: 21, fontWeight: 650, marginBottom: 10 }}>Recent activity</div>
                {c.table.map((row: string[], i: number) => (
                  <div key={i} style={{ display: 'grid', gridTemplateColumns: '1.3fr 1fr 1fr 0.9fr', alignItems: 'center', height: 50, borderTop: i ? `1px solid ${p.line}` : undefined, fontSize: 17 }}>
                    <span style={{ fontWeight: 600 }}>{row[0]}</span>
                    <span style={{ color: p.muted }}>{row[1]}</span>
                    <span style={{ color: p.muted }}>{row[2]}</span>
                    <span style={{ justifySelf: 'start', fontSize: 14, fontWeight: 650, padding: '5px 12px', borderRadius: s.key === 'brutal' ? 4 : 999, background: hexA(statusColor(row[3]), 0.14), color: statusColor(row[3]) }}>{row[3]}</span>
                  </div>
                ))}
              </Card>
            </Reveal>
          </div>
        </div>
      </div>
    </Reveal>
  );
};

export const dashboardLayout = (): Layout => ({
  width: W,
  height: H,
  overview: { x: W / 2, y: H / 2, scale: 0.55 },
  focus: [
    { x: 790, y: 300, scale: 1.0, ar: 'مؤشرات أداء واضحة من النظرة الأولى', en: 'KPIs readable at a glance' },
    { x: 830, y: 640, scale: 0.98, ar: 'رسم بياني يروي قصة الأرقام', en: 'A chart that tells the story' },
    { x: 830, y: 1040, scale: 0.98, ar: 'جدول بحالات ملونة لسرعة المتابعة', en: 'Colour-coded status for fast scanning' },
  ],
});
