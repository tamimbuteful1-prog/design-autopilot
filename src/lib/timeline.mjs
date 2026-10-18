// Mirrors timeline() in src/remotion/Reel.tsx so the soundtrack's whooshes land on scene changes.
export function timelineCues(total, fps) {
  const hookEnd = 78 - 18;
  const ctaFrom = total - 96;
  const systemFrom = ctaFrom - 120;
  return [hookEnd, systemFrom, ctaFrom].map((f) => f / fps);
}
