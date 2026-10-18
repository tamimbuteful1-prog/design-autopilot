import { CATEGORY_META } from './catalog.mjs';
import { makeRng } from './rng.mjs';
import { config } from './config.mjs';

const BASE_TAGS = ['#تصميم', '#مصمم_مستقل', '#freelancedesigner', '#designinspiration'];
const STYLE_TAGS = { soft: '#softui', glass: '#glassmorphism', brutal: '#neobrutalism', editorial: '#editorialdesign', minimal: '#minimaldesign' };

const TITLES_AR = [
  (i) => `فكرة اليوم: ${i.subject.ar}`,
  (i) => `${i.categoryMeta.ar} بأسلوب ${i.style.name}`,
  (i) => `كيف أصمم ${i.subject.ar}؟`,
  (i) => `تصميم ${i.code}: ${i.subject.ar}`,
];
const HOOKS_AR = [
  'صممت هذا المفهوم من الصفر — شاهد التفاصيل حتى النهاية 👀',
  'تفاصيل صغيرة تصنع فرقًا كبيرًا في تجربة المستخدم ✨',
  'من الفكرة إلى الواجهة في ثوانٍ — أي جزء أعجبك أكثر؟',
  'هذا الأسلوب مناسب جدًا للمشاريع الناشئة 🚀',
];
const CTA_AR = [
  'تحتاج تصميمًا لمشروعك؟ تواصل معي عبر الرسائل.',
  'متاح لمشاريع التصميم المستقلة — راسلني للتفاصيل.',
  'احفظ الفيديو للإلهام، وراسلني إذا أردت تصميمًا مشابهًا.',
];

export function writeCopy(idea) {
  const r = makeRng(`copy:${idea.fingerprint}`);
  const title = r.pick(TITLES_AR)(idea).slice(0, 80);
  const tags = [...new Set([...CATEGORY_META[idea.category].tags, STYLE_TAGS[idea.style.key], ...BASE_TAGS])].slice(0, 8);
  const lines = [
    title,
    '',
    `${r.pick(HOOKS_AR)}`,
    `العلامة: ${idea.brand} · الألوان: ${idea.palette.name} · الأسلوب: ${idea.style.name}`,
    '',
    r.pick(CTA_AR),
    '',
    `ℹ️ تصميم مفاهيمي (Concept ${idea.code}) لعلامة خيالية، وليس مشروعًا منفذًا لعميل.`,
  ];
  if (config.discloseAI) lines.push('🤖 أُنتج هذا المحتوى بمساعدة أدوات الذكاء الاصطناعي.');
  lines.push('', tags.join(' '));
  const caption = lines.join('\n');
  return { title, caption, hashtags: tags };
}
