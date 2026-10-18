# Design Autopilot — فيديو تصميم يومي لـ TikTok

نظام ينتج كل يوم إعلانًا عموديًا سريعًا (1080×1920، 12 ثانية، قطعات على إيقاع 128 BPM وموسيقى صيفية أصلية) لتصميم أصلي، يفحصه آليًا، ثم يرسله إلى حساب TikTok عبر Buffer.

> 🔒 **وضع الاختبار مفعّل افتراضيًا.** لا يُرفع ولا يُنشر أي فيديو حتى تضيف متغيّر المستودع `PUBLISH_ENABLED = true`. قبل ذلك يُنشأ فيديو تجريبي يوميًا ويُفحص، وتجده في صفحة تشغيل الـ workflow تحت **Artifacts**.

```
GitHub Actions (يوميًا 15:47 الرياض)
  │
  ├─ اختيار فكرة ─────── تناوب: تطبيق جوال → لوحة تحكم → موقع → UI/UX → منتج → تغليف
  │                       منع التكرار: بصمة (الفئة+الموضوع+الأسلوب+الألوان) لا تتكرر أبدًا
  ├─ Remotion ─────────── إعلان 12 ث: نص حركي → تصميم يُبنى → 3 لقطات زوم سريعة → الألوان → البطل → «تواصل معانا على الخاص»
  ├─ موسيقى أصلية ──────── صيفية حماسية مولّدة برمجيًا ومتزامنة مع القطعات (لا حقوق طرف ثالث)، −12 LUFS
  ├─ فحص الجودة (24) ───── المقاس، المدة، fps، الترميز، الصوت، إطارات سوداء/متجمدة، النصوص، التكرار
  ├─ رفع MP4 ──────────── Cloudflare R2 / S3 (أو GitHub Releases) + التحقق من أن الرابط عام
  ├─ موافقة؟ ──────────── أول 7 فيديوهات: Issue في GitHub → تعليق /approve أو /reject
  └─ Buffer API ───────── createPost (مجدول على 19:00) → TikTok
```

كل حالة تُسجَّل في `state/ledger.json` (سجل كامل في تاريخ git)، واللوحة في `docs/` تُعرض عبر GitHub Pages.

## الشفافية والسياسات

- كل فيديو يحمل وسم **CONCEPT** ورقمًا، وبطاقته الأخيرة تقول إنه تصميم مفاهيمي لعلامة خيالية وليس مشروعًا لعميل؛ والوصف يقول ذلك أيضًا. الفحص الآلي يرفض أي نص يدّعي عملًا لعميل.
- الوصف يتضمن إفصاحًا عن استخدام الذكاء الاصطناعي (`DISCLOSE_AI=true` افتراضيًا).
- الموسيقى أصلية مولّدة، والخطوط مرخّصة SIL OFL ومضمّنة في المشروع.

## الإعداد (مرة واحدة)

### 1) Buffer
1. اربط حساب TikTok بـ Buffer (يجب أن يكون حساب Business/Creator حسب متطلبات TikTok).
2. أنشئ مفتاح API من `publish.buffer.com/settings/api`.

### 2) التخزين — Cloudflare R2 (موصى به)
1. أنشئ Bucket وفعّل **Public access** (نطاق `r2.dev` أو نطاقك الخاص).
2. أنشئ API Token بصلاحية *Object Read & Write* على هذا الـ Bucket فقط.

> بديل بلا إعداد: `STORAGE_DRIVER=github-release` يرفع الفيديو إلى Releases في المستودع العام. يعمل، لكن رابطه يمر بإعادة توجيه، لذلك R2 أكثر موثوقية مع Buffer/TikTok.

### 3) أسرار GitHub
في المستودع: **Settings → Secrets and variables → Actions**

| Secret | المصدر |
|---|---|
| `BUFFER_API_KEY` | Buffer |
| `BUFFER_TIKTOK_CHANNEL_ID`, `BUFFER_ORGANIZATION_ID` | شغّل workflow **Discover Buffer channel** (أدناه) |
| `S3_ENDPOINT`, `S3_BUCKET`, `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY`, `S3_PUBLIC_BASE_URL` | Cloudflare R2 |
| `NOTIFY_WEBHOOK_URL` (اختياري) | Slack/Discord/ntfy |

ومتغير التحكم بالنشر: `PUBLISH_ENABLED` (اتركه غير موجود أثناء الاختبار).

ومتغيرات عادية (Variables): `BRAND_HANDLE`، `CTA_TEXT`، `POST_TIME_LOCAL`، `POST_TIMEZONE`، `STORAGE_DRIVER`.

### 4) اللوحة
**Settings → Pages → Deploy from a branch → `main` / `/docs`**. ستظهر على `https://<user>.github.io/design-autopilot/`.

### 5) تجربة (وضع الاختبار)
1. **Actions → Daily video → Run workflow** — يرسم الفيديو ويفحصه فقط. حمّله من **Artifacts** أسفل صفحة التشغيل.
2. **Actions → Discover Buffer channel → Run** — يطبع معرّف قناة TikTok.

### 6) تفعيل النشر الحقيقي (بعد رضاك عن الجودة)
**Settings → Secrets and variables → Actions → Variables → New variable**: `PUBLISH_ENABLED` = `true`.
بعدها كل فيديو جديد يُرفع ويفتح Issue «🟡 Approve video …» → علّق `/approve` لينشر. لإيقاف النشر الحقيقي فورًا احذف المتغير أو غيّره إلى `false`.

## التحكم اليومي

| أريد أن… | الطريقة |
|---|---|
| أوافق على فيديو | تعليق `/approve` على الـ Issue الخاص به |
| أرفض فيديو | تعليق `/reject السبب` |
| أوقف النشر مؤقتًا | زر «إيقاف النشر مؤقتًا» في اللوحة (يفتح Issue بعنوان `/pause`) |
| أستأنف | Issue بعنوان `/resume` (الزر نفسه يتحول) |
| أفعّل الوضع التلقائي | Issue بعنوان `/auto-on` — يُرفض تلقائيًا قبل نشر 7 فيديوهات موافَق عليها |
| أعيد محاولة نشر متعثر | Issue بعنوان `/retry C012` بعد التأكد من عدم وجوده في Buffer |

الأوامر تُقبل من **مالك المستودع فقط**.

## منع التكرار والنشر المزدوج

- فيديو واحد لكل يوم؛ تشغيل ثانٍ لليوم نفسه يتخطى.
- لا يُستدعى `createPost` إذا كان للفيديو `postId` مسجل.
- عند خطأ غامض (انقطاع/5xx) **لا يعيد المحاولة تلقائيًا**؛ يبحث في Buffer عن منشور يحمل رمز الفيديو (`Concept C012`)، وإن لم يجده يضع الحالة `needs_review` وينبّهك.
- جميع سير العمل تتشارك قفل `concurrency` واحدًا، فلا يعمل اثنان معًا.

## التقارير عند الفشل

أي فشل (فحص الجودة، الرسم، الرفع، Buffer، أو خطأ يبلغ عنه Buffer لاحقًا) يفتح Issue بوسم `autopilot-failure` مع السجل ونتائج الفحص، ويرسل إلى `NOTIFY_WEBHOOK_URL` إن وُجد، كما يرسل GitHub بريدًا عند فشل الـ workflow.

## تشغيل محلي

```bash
npm ci
npm test                         # اختبارات وحدات + سيناريوهات نشر مع خادم Buffer وهمي
DRY_RUN=true npm run daily       # يرسم فيديو اليوم ويفحصه دون نشر
npm run studio                   # معاينة القوالب في Remotion Studio
npm run status
```

## التوسعة

أضف مواضيع في `src/lib/catalog.mjs`، ولوحات ألوان في `src/lib/palettes.mjs` (يختبرها `npm test` لتباين النص)، وقوالب في `src/remotion/canvases/`.

## حدود معروفة

- Buffer لا يعرض حاليًا عبر الـ API إعدادات إفصاح TikTok (محتوى ترويجي/مولّد بالذكاء الاصطناعي)؛ الإفصاح موجود في نص الوصف. إن احتجت مفتاح الإفصاح الرسمي فعّله يدويًا من تطبيق TikTok.
- حقول حالة المنشور (`status`، `sentAt`) في استعلام `post` تُقرأ بأفضل جهد؛ إن تغيّر مخطط Buffer تبقى الحالة «مجدول» دون أن يتأثر النشر.
