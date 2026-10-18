// Curated colour palettes. Each one is checked for text contrast in test/unit.test.mjs.
export const PALETTES = [
  { key: 'sage-light', name: 'Sage', mode: 'light', bg: '#EEF1EA', surface: '#FFFFFF', surface2: '#F5F7F2', ink: '#18211B', muted: '#5D6B60', line: '#DCE3D8', accent: '#2F6B4F', accent2: '#E8B04B', accentInk: '#FFFFFF' },
  { key: 'midnight-violet', name: 'Midnight Violet', mode: 'dark', bg: '#0D0B1A', surface: '#17142B', surface2: '#211D3A', ink: '#F2F0FF', muted: '#A39FC2', line: '#2E2950', accent: '#8B7CFF', accent2: '#3FE0C5', accentInk: '#0D0B1A' },
  { key: 'terracotta', name: 'Terracotta', mode: 'light', bg: '#F6EEE7', surface: '#FFFAF5', surface2: '#F1E4D8', ink: '#2A1A12', muted: '#7A6253', line: '#E6D5C6', accent: '#B94E28', accent2: '#2E5E6E', accentInk: '#FFFFFF' },
  { key: 'ocean-dark', name: 'Deep Ocean', mode: 'dark', bg: '#071A24', surface: '#0E2733', surface2: '#143443', ink: '#E8F6FA', muted: '#8DB3C1', line: '#1E4253', accent: '#3CC3E8', accent2: '#FFB547', accentInk: '#071A24' },
  { key: 'citrus', name: 'Citrus Pop', mode: 'light', bg: '#FFF8E6', surface: '#FFFFFF', surface2: '#FFF1C9', ink: '#1C1A12', muted: '#6E6A55', line: '#F0E3B8', accent: '#1F3DFF', accent2: '#FF6B3D', accentInk: '#FFFFFF' },
  { key: 'graphite-lime', name: 'Graphite Lime', mode: 'dark', bg: '#111312', surface: '#1A1D1B', surface2: '#232725', ink: '#F1F5EF', muted: '#9AA39C', line: '#2D322F', accent: '#C6F432', accentInk: '#111312', accent2: '#7AA7FF' },
  { key: 'blush', name: 'Blush & Ink', mode: 'light', bg: '#F9ECEC', surface: '#FFFFFF', surface2: '#F6E1E1', ink: '#221417', muted: '#7A5F64', line: '#EDD6D7', accent: '#B3264B', accent2: '#3A3A8C', accentInk: '#FFFFFF' },
  { key: 'sand-navy', name: 'Sand & Navy', mode: 'light', bg: '#EFE9DF', surface: '#FBF8F3', surface2: '#E8E0D2', ink: '#14213D', muted: '#5F6578', line: '#DDD3C3', accent: '#14213D', accent2: '#D98E04', accentInk: '#FBF8F3' },
  { key: 'emerald-night', name: 'Emerald Night', mode: 'dark', bg: '#06140F', surface: '#0D221A', surface2: '#133026', ink: '#E9FBF2', muted: '#86B3A0', line: '#1C3F32', accent: '#2BD98A', accent2: '#F2C14E', accentInk: '#06140F' },
  { key: 'arctic', name: 'Arctic', mode: 'light', bg: '#EAF0F7', surface: '#FFFFFF', surface2: '#F2F6FB', ink: '#0F1B2D', muted: '#56657A', line: '#D8E1EC', accent: '#2563EB', accent2: '#F97362', accentInk: '#FFFFFF' },
];

export const STYLES = [
  { key: 'soft', name: 'Soft UI', radius: 28, border: 0, shadow: '0 30px 60px -20px rgba(0,0,0,.25)', heading: 'Inter', weight: 700, tracking: -1.5 },
  { key: 'glass', name: 'Glassmorphism', radius: 32, border: 1, shadow: '0 40px 80px -30px rgba(0,0,0,.45)', heading: 'Inter', weight: 600, tracking: -1.2, glass: true },
  { key: 'brutal', name: 'Neo-Brutalism', radius: 6, border: 3, shadow: '10px 10px 0 0 var(--ink)', heading: 'Space Grotesk', weight: 700, tracking: -1 },
  { key: 'editorial', name: 'Editorial', radius: 4, border: 1, shadow: 'none', heading: 'Playfair Display', weight: 600, tracking: -0.5 },
  { key: 'minimal', name: 'Swiss Minimal', radius: 14, border: 1, shadow: '0 1px 0 rgba(0,0,0,.04)', heading: 'Space Grotesk', weight: 600, tracking: -1.2 },
];

// WCAG relative luminance contrast
export function contrast(a, b) {
  const lum = (hex) => {
    const n = hex.replace('#', '');
    const [r, g, b2] = [0, 2, 4].map((i) => parseInt(n.slice(i, i + 2), 16) / 255).map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
    return 0.2126 * r + 0.7152 * g + 0.0722 * b2;
  };
  const [l1, l2] = [lum(a), lum(b)].sort((x, y) => y - x);
  return (l1 + 0.05) / (l2 + 0.05);
}
