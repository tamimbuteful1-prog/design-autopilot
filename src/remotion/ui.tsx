import React, { createContext, useContext } from 'react';
import { Easing, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';

export type Palette = { key: string; name: string; mode: 'light' | 'dark'; bg: string; surface: string; surface2: string; ink: string; muted: string; line: string; accent: string; accent2: string; accentInk: string };
export type Style = { key: string; name: string; radius: number; border: number; shadow: string; heading: string; weight: number; tracking: number; glass?: boolean };
export type Idea = {
  category: string; subjectKey: string; styleKey: string; paletteKey: string; fingerprint: string; code: string; conceptNo: number; date: string;
  brand: string; subject: { ar: string; en: string }; categoryMeta: { ar: string; en: string }; icon: string; shape: string | null;
  palette: Palette; style: Style; content: any;
};

export type Theme = { p: Palette; s: Style; idea: Idea };
const ThemeCtx = createContext<Theme>(null as any);
export const ThemeProvider = ThemeCtx.Provider;
export const useTheme = () => useContext(ThemeCtx);

// Frame offset so canvas elements can animate relative to when the showcase starts.
const OffsetCtx = createContext(0);
export const OffsetProvider = OffsetCtx.Provider;

/** Staggered entrance: returns style for opacity + rise, `delay` in frames after section start. */
export function useReveal(delay = 0, distance = 40) {
  const frame = useCurrentFrame();
  const offset = useContext(OffsetCtx);
  const { fps } = useVideoConfig();
  const p = spring({ frame: frame - offset - delay, fps, config: { damping: 200, mass: 0.8 } });
  return { opacity: p, transform: `translateY(${(1 - p) * distance}px)` } as React.CSSProperties;
}
export function useProgress(delay: number, duration: number) {
  const frame = useCurrentFrame();
  const offset = useContext(OffsetCtx);
  return interpolate(frame - offset - delay, [0, duration], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.bezier(0.22, 1, 0.36, 1) });
}

export const Reveal: React.FC<{ delay?: number; distance?: number; style?: React.CSSProperties; children: React.ReactNode }> = ({ delay = 0, distance = 40, style, children }) => {
  const r = useReveal(delay, distance);
  return <div style={{ ...style, ...r, transform: `${style?.transform ?? ''} ${r.transform}` }}>{children}</div>;
};

/** A card that follows the active visual style (soft / glass / brutal / editorial / minimal). */
export const Card: React.FC<{ style?: React.CSSProperties; children?: React.ReactNode; tone?: 'surface' | 'surface2' | 'accent' }> = ({ style, children, tone = 'surface' }) => {
  const { p, s } = useTheme();
  const bg = tone === 'accent' ? p.accent : tone === 'surface2' ? p.surface2 : p.surface;
  return (
    <div
      style={{
        background: s.glass && tone !== 'accent' ? hexA(bg, p.mode === 'dark' ? 0.55 : 0.7) : bg,
        backdropFilter: s.glass ? 'blur(24px)' : undefined,
        borderRadius: s.radius,
        border: s.border ? `${s.border}px solid ${s.key === 'brutal' ? p.ink : s.glass ? hexA('#FFFFFF', p.mode === 'dark' ? 0.12 : 0.6) : p.line}` : undefined,
        boxShadow: s.key === 'brutal' ? `8px 8px 0 0 ${p.ink}` : s.shadow,
        color: tone === 'accent' ? p.accentInk : p.ink,
        ...style,
      }}
    >
      {children}
    </div>
  );
};

export const Heading: React.FC<{ size: number; style?: React.CSSProperties; children: React.ReactNode }> = ({ size, style, children }) => {
  const { s } = useTheme();
  return <div style={{ fontFamily: `"${s.heading}", Inter, sans-serif`, fontWeight: s.weight, fontSize: size, letterSpacing: (s.tracking * size) / 48, lineHeight: 1.08, ...style }}>{children}</div>;
};

export const Pill: React.FC<{ active?: boolean; children: React.ReactNode; style?: React.CSSProperties }> = ({ active, children, style }) => {
  const { p, s } = useTheme();
  return (
    <div style={{ padding: '10px 20px', borderRadius: s.key === 'brutal' ? 4 : 999, fontSize: 18, fontWeight: 600, whiteSpace: 'nowrap', background: active ? p.accent : p.surface2, color: active ? p.accentInk : p.muted, border: s.key === 'brutal' ? `2px solid ${p.ink}` : undefined, ...style }}>
      {children}
    </div>
  );
};

export const Button: React.FC<{ children: React.ReactNode; variant?: 'primary' | 'secondary'; style?: React.CSSProperties }> = ({ children, variant = 'primary', style }) => {
  const { p, s } = useTheme();
  const primary = variant === 'primary';
  return (
    <div style={{ height: 64, padding: '0 28px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: s.key === 'brutal' ? 4 : s.key === 'editorial' ? 2 : Math.min(s.radius, 20), background: primary ? p.accent : 'transparent', color: primary ? p.accentInk : p.ink, border: primary ? (s.key === 'brutal' ? `3px solid ${p.ink}` : undefined) : `2px solid ${p.line}`, boxShadow: s.key === 'brutal' && primary ? `5px 5px 0 0 ${p.ink}` : undefined, fontWeight: 700, fontSize: 22, ...style }}>
      {children}
    </div>
  );
};

export function hexA(hex: string, a: number) {
  const n = hex.replace('#', '');
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(n.slice(i, i + 2), 16));
  return `rgba(${r},${g},${b},${a})`;
}
export function mix(a: string, b: string, t: number) {
  const pa = [0, 2, 4].map((i) => parseInt(a.replace('#', '').slice(i, i + 2), 16));
  const pb = [0, 2, 4].map((i) => parseInt(b.replace('#', '').slice(i, i + 2), 16));
  return '#' + pa.map((v, i) => Math.round(v + (pb[i] - v) * t).toString(16).padStart(2, '0')).join('');
}

const PATHS: Record<string, string> = {
  leaf: 'M5 21c0-9 6-15 16-16-1 10-7 16-16 16zm0 0c3-5 6-8 10-10',
  sun: 'M12 7a5 5 0 100 10 5 5 0 000-10zm0-5v2m0 16v2M2 12h2m16 0h2M4.9 4.9l1.4 1.4m11.4 11.4l1.4 1.4M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4',
  drop: 'M12 3s7 7.5 7 12a7 7 0 01-14 0c0-4.5 7-12 7-12z',
  moon: 'M20 14.5A8.5 8.5 0 019.5 4 8.5 8.5 0 1020 14.5z',
  bolt: 'M13 2L4 14h7l-1 8 9-12h-7l1-8z',
  heart: 'M12 20s-8-4.6-8-10.2A4.8 4.8 0 0112 7a4.8 4.8 0 018 2.8C20 15.4 12 20 12 20z',
  star: 'M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9L12 3z',
  cup: 'M4 8h13v5a6 6 0 01-6 6h-1a6 6 0 01-6-6V8zm13 2h1.5a2.5 2.5 0 010 5H17M7 3v2m4-2v2',
  map: 'M9 4L3 6v14l6-2 6 2 6-2V4l-6 2-6-2zm0 0v14m6-12v14',
  wallet: 'M3 7a2 2 0 012-2h13v4M3 7v11a2 2 0 002 2h15V9H5a2 2 0 01-2-2zm14 7h.01',
  cart: 'M3 4h2l2.4 11h10.2L20 8H6.2M9 20a1 1 0 100-2 1 1 0 000 2zm8 0a1 1 0 100-2 1 1 0 000 2z',
  chart: 'M4 20V10m6 10V4m6 16v-7m4 7H2',
  home: 'M3 11l9-7 9 7v9a1 1 0 01-1 1h-5v-6h-6v6H4a1 1 0 01-1-1v-9z',
  bell: 'M6 16V11a6 6 0 1112 0v5l2 2H4l2-2zm4 4h4',
  search: 'M11 4a7 7 0 100 14 7 7 0 000-14zm9 16l-4-4',
  play: 'M7 4l13 8-13 8V4z',
  grid: 'M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z',
  check: 'M4 12l5 5L20 6',
  calendar: 'M4 6h16v14H4zM4 10h16M8 3v4m8-4v4',
  user: 'M12 12a4 4 0 100-8 4 4 0 000 8zm-7 9a7 7 0 0114 0',
  plus: 'M12 5v14M5 12h14',
  arrow: 'M5 12h14m-6-6l6 6-6 6',
  back: 'M19 12H5m6-6l-6 6 6 6',
  dots: 'M5 12h.01M12 12h.01M19 12h.01',
};
export const Icon: React.FC<{ name: string; size?: number; color?: string; stroke?: number }> = ({ name, size = 24, color = 'currentColor', stroke = 2 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
    <path d={PATHS[name] ?? PATHS.star} />
  </svg>
);
