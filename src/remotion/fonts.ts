// Fonts are bundled from npm (@fontsource, all SIL Open Font License) so renders are
// identical on any machine and need no network access to Google Fonts.
import '@fontsource/inter/400.css';
import '@fontsource/inter/500.css';
import '@fontsource/inter/600.css';
import '@fontsource/inter/700.css';
import '@fontsource/inter/800.css';
import '@fontsource/space-grotesk/500.css';
import '@fontsource/space-grotesk/600.css';
import '@fontsource/space-grotesk/700.css';
import '@fontsource/playfair-display/500.css';
import '@fontsource/playfair-display/600.css';
import '@fontsource/playfair-display/700.css';
import '@fontsource/ibm-plex-sans-arabic/400.css';
import '@fontsource/ibm-plex-sans-arabic/500.css';
import '@fontsource/ibm-plex-sans-arabic/600.css';
import '@fontsource/ibm-plex-sans-arabic/700.css';
import '@fontsource/jetbrains-mono/500.css';

import { continueRender, delayRender } from 'remotion';

const FACES = [
  '400 20px Inter', '500 20px Inter', '600 20px Inter', '700 20px Inter', '800 20px Inter',
  '500 20px "Space Grotesk"', '600 20px "Space Grotesk"', '700 20px "Space Grotesk"',
  '500 20px "Playfair Display"', '600 20px "Playfair Display"', '700 20px "Playfair Display"',
  '400 20px "IBM Plex Sans Arabic"', '500 20px "IBM Plex Sans Arabic"', '600 20px "IBM Plex Sans Arabic"', '700 20px "IBM Plex Sans Arabic"',
  '500 20px "JetBrains Mono"',
];

let started = false;
export function ensureFonts() {
  if (started || typeof document === 'undefined') return;
  started = true;
  const handle = delayRender('Loading fonts');
  Promise.all(FACES.map((f) => document.fonts.load(f, 'Aa مرحبا 0123')))
    .then(() => document.fonts.ready)
    .then(() => continueRender(handle))
    .catch((e) => {
      console.error('Font loading failed', e);
      continueRender(handle);
    });
}

export const AR = '"IBM Plex Sans Arabic", Inter, sans-serif';
export const MONO = '"JetBrains Mono", monospace';
