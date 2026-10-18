import fs from 'node:fs';
import { CATEGORY_META } from './catalog.mjs';
import { makeRng } from './rng.mjs';
import { config } from './config.mjs';

const BASE_TAGS = ['#تصميم', '#مصمم_مستقل', '#freelancedesigner', '#designinspiration'];
const STYLE_TAGS = { soft: '#softui', glass: '#glassmorphism', brutal: '#neobrutalism', editorial: '#editorialdesign', minimal: '#minimaldesign' };

const SERVICES = JSON.parse(fs.readFileSync(new URL('../shared/services.json', import.meta.url)));

const TITLES_AR = [
  (i, sv) => `${sv.hook[0]} ${sv.hook[1]} ✨`,
  (i, sv) => `خدمة ${sv.name.ar} — وش نقدم لك؟`,
  (i, sv) => `${sv.name.ar} باحترافية 🔥`,
];
const CTA_AR = [
  'تبي تصميم زي كذا لمشروعك؟ تواصل معانا على الخاص 📩',
  'جاهزين نبدأ مشروعك — تواصل معانا على الخاص 📩',
  'احفظ الفيديو، وتواصل معانا على الخاص لمشروعك 📩',
];

export function writeCopy(idea) {
  const r = makeRng(`copy:${idea.fingerprint}`);
  const sv = SERVICES[idea.category];
  const title = r.pick(TITLES_AR)(idea, sv).slice(0, 80);
  const tags = [...new Set([...CATEGORY_META[idea.category].tags, STYLE_TAGS[idea.style.key], ...BASE_TAGS])].slice(0, 8);
  const lines = [
    title,
    '',
    'وش تحصل معنا:',
    ...sv.offers.map(([ar]) => `✅ ${ar}`),
    '',
    r.pick(CTA_AR),
    '',
    `ℹ️ التصميم المعروض مفاهيمي (Concept ${idea.code}) لعلامة خيالية، وليس مشروعًا منفذًا لعميل.`,
  ];
  if (config.discloseAI) lines.push('🤖 أُنتج هذا المحتوى بمساعدة أدوات الذكاء الاصطناعي.');
  lines.push('', tags.join(' '));
  const caption = lines.join('\n');
  return { title, caption, hashtags: tags };
}
