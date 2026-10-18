// Scene-change times (seconds) shared with the Remotion cut, so the music hits land on the cuts.
import fs from 'node:fs';
export const TL = JSON.parse(fs.readFileSync(new URL('../shared/timeline.json', import.meta.url)));
export function timelineCues() {
  return Object.values(TL.shots).map(([from]) => from / TL.fps).filter((t) => t > 0);
}
