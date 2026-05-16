// app/methodology/page.tsx  (Next.js App Router)
// VeriJournals Methodology — bilingual AR/EN
// Legal purpose: primary defense against
//   - Saudi Anti-Cyber Crime Law Art. 3 (defamation)
//   - UK Defamation Act 2013 s.3 (Honest Opinion)
//   - SDAIA AI Ethics: Transparency + Accountability
//   - PDPL Art. 22 (Automated Decisions): right to explanation

'use client';

import { useState } from 'react';

const CONTACT_EMAIL = 'abrar.aseeri@gmail.com';
const VERSION = '1.0';
const LAST_UPDATED_AR = '١٥ مايو ٢٠٢٦';
const LAST_UPDATED_EN = 'May 15, 2026';

type Lang = 'ar' | 'en';

export default function MethodologyPage() {
  const [lang, setLang] = useState<Lang>('ar');
  const isAr = lang === 'ar';

  return (
    <main
      dir={isAr ? 'rtl' : 'ltr'}
      lang={isAr ? 'ar' : 'en'}
      className="mx-auto max-w-3xl px-5 py-10 leading-relaxed text-slate-800"
      style={{ fontFamily: isAr ? "'Cairo','Noto Sans Arabic','Segoe UI',sans-serif" : "'DM Sans','Segoe UI',sans-serif" }}
    >
      <div className="mb-6 rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900">
        {isAr
          ? '⚠️ مشروع شخصي مستقل، غير مرتبط بأي جهة حكومية أو مؤسسية. المالكة: أبرار العسيري.'
          : '⚠️ Independent personal project, not affiliated with any government or institutional entity. Owner: Abrar Aseeri.'}
      </div>

      <header className="mb-8 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            {isAr ? 'المنهجية' : 'Methodology'}
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            {isAr ? `الإصدار ${VERSION} · آخر تحديث: ${LAST_UPDATED_AR}` : `Version ${VERSION} · Last updated: ${LAST_UPDATED_EN}`}
          </p>
        </div>
        <button
          onClick={() => setLang(isAr ? 'en' : 'ar')}
          className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium hover:bg-slate-50"
        >
          {isAr ? 'English' : 'العربية'}
        </button>
      </header>

      {isAr ? <ArabicContent /> : <EnglishContent />}

      <footer className="mt-12 border-t border-slate-200 pt-6 text-xs text-slate-500">
        {isAr
          ? '© VeriJournals — جميع الحقوق محفوظة. تُحدَّث المنهجية بعد مراجعة دورية أو تغيير جوهري في مصادر البيانات.'
          : '© VeriJournals — All rights reserved. Methodology is updated after periodic review or material change in upstream data sources.'}
      </footer>
    </main>
  );
}

function ArabicContent() {
  return (
    <article className="prose prose-slate max-w-none rtl text-right">

      <h2>١. الغرض من هذه الوثيقة</h2>
      <p>
        تشرح هذه الوثيقة كيف تحسب منصة <strong>VeriJournals</strong> مؤشري <strong>Trust Score</strong>
        و<strong>Risk Score</strong> لأي مجلة علمية. الهدف هو الشفافية الكاملة: أي باحث، ناشر، أو
        محكِّم بإمكانه فهم كل عنصر يدخل في الحساب، ومن أين أتت البيانات، ومتى آخر تحديث لها.
      </p>
      <p>
        هذه المنهجية <strong>منشورة بحسن نية</strong>، تستند إلى مصادر علمية معترف بها، وقابلة للاعتراض
        عبر صفحة <a href="/appeal"><code>/appeal</code></a> أو بمراسلة <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.
      </p>

      <h2>٢. ما تفعله VeriJournals وما لا تفعله</h2>
      <p><strong>ما تفعله:</strong></p>
      <ul>
        <li>تجمع مؤشرات معلنة من 11 مصدراً علمياً موثوقاً (انظر القسم 3).</li>
        <li>تعرض هذه المؤشرات كما هي (Pass-through) مع ذكر المصدر وتاريخه.</li>
        <li>تحسب درجتين مركّبتين (Trust / Risk) بصيغة شفافة (انظر القسمين 5 و6).</li>
        <li>تصنّف المجلة في إحدى الخانات الموضحة في القسم 7.</li>
        <li>تقترح بدائل مفهرسة في نفس النطاق عند الطلب.</li>
      </ul>
      <p><strong>ما لا تفعله:</strong></p>
      <ul>
        <li>❌ لا تقرر بشكل قاطع أن مجلة "مفترسة" — هذا حكم قيمي خارج نطاقها.</li>
        <li>❌ لا تستبدل قرار اللجنة العلمية أو هيئة التحرير في الجامعة/المستشفى.</li>
        <li>❌ لا تضمن أن نشر بحث في مجلة "بدرجة ثقة مرتفعة" سيقبل/يُستشهد به.</li>
        <li>❌ لا تجمع بيانات شخصية للمؤلفين أو تقيّم أفراداً.</li>
        <li>❌ لا تتعامل مع تحقيقات سرقة علمية أو تدقيق أوراق منفردة.</li>
      </ul>
      <p>
        النتائج <strong>استرشادية</strong>. القرار النهائي بالنشر في مجلة معيّنة يعود للباحث ومؤسسته.
      </p>

      <h2>٣. مصادر البيانات الأحد عشر</h2>
      <p>كل مؤشر يأتي من مصدر معلن، مع رابط للمصدر الأصلي وتاريخ Snapshot في صفحة كل مجلة.</p>

      <div className="not-prose my-6 rounded-lg border border-blue-300 bg-blue-50 p-4">
        <p className="font-semibold text-blue-900 mb-2">ℹ️ حالة المصادر في الإصدار الحالي</p>
        <p className="text-sm text-blue-900 mb-2">
          المنصة في مرحلة Closed Beta. من بين الـ 11 مصدراً الموثَّقة أدناه:
        </p>
        <ul className="text-sm text-blue-900 mb-2 list-none pr-0 space-y-1">
          <li>✅ <strong>مفعَّلة آلياً (4):</strong> PubMed, DOAJ, Scimago, Retraction Watch.</li>
          <li>⏳ <strong>قيد التطوير (7):</strong> Web of Science, Scopus, Crossref, Editorial Board, Hijacked Journal Checker, DOAJ Removed, Arab Impact Factor.</li>
        </ul>
        <p className="text-sm text-blue-900">
          سيتم تفعيل المصادر تباعاً مع إعلان كل تفعيل في سجل الإصدارات (القسم ١٤).
        </p>
      </div>

      <h3>مصادر تعزز الثقة (Trust-positive)</h3>
      <ol>
        <li><strong>NLM / PubMed</strong> — قاعدة المكتبة الوطنية الأمريكية للطب. الفهرسة تعني اجتياز معايير NLM.</li>
        <li><strong>DOAJ</strong> — دليل المجلات مفتوحة الوصول. إدراج فعّال يعني التزام بمعايير شفافية ومراجعة أقران.</li>
        <li><strong>Scimago Journal Rank (SJR)</strong> — قيمة عددية + ربع (Q1-Q4) من Scimago Lab.</li>
        <li><strong>Web of Science</strong> — Clarivate. تُسجَّل المجلة في أحد الفهارس (SCI-E, SSCI, AHCI, ESCI).</li>
        <li><strong>Crossref</strong> — تسجيل DOI صالح + اتساق ISSN.</li>
        <li><strong>Scopus</strong> — Elsevier. الإدراج + CiteScore.</li>
        <li><strong>Arab Impact Factor</strong> — مرجع للمجلات الإقليمية العربية/الخليجية (لا يُضاف للدرجة الإجمالية في الإصدار الحالي).</li>
        <li><strong>وجود صفحة محررين علنية</strong> — التحقق من وجود صفحة "Editorial Board" في موقع المجلة تعرض أسماء وانتماءات المحررين علناً. <em>تحذير:</em> هذا مؤشر سطحي على وجود الصفحة فقط، لا على صحة الأسماء أو الانتماءات. التحقق العميق يبقى مسؤولية الباحث.</li>
      </ol>

      <h3>مصادر ترصد المخاطر (Risk-positive)</h3>
      <ol start={9}>
        <li><strong>DOAJ Removed List</strong> — قائمة المجلات التي أزالتها Directory of Open Access Journals من فهرسها بسبب عدم استيفاء معايير الشفافية أو مراجعة الأقران. مصدر دقيق (ISSN + سبب الإزالة + تاريخ).</li>
        <li><strong>Hijacked Journal Checker</strong> — قاعدة بيانات Anna Abalkina وآخرون لرصد المجلات المُختطَفة (Cabells/Retraction Watch).</li>
        <li><strong>Retraction Watch Database</strong> — قاعدة بيانات حالات السحب الموثَّقة (عبر Crossref API منذ 2023).</li>
      </ol>

      <h2>٤. مبدأ "الناقل التقني" (Technical Conduit)</h2>
      <p>
        المؤشرات الأولية (الفهرسة، الـ Quartile، Impact Factor، CiteScore، حالات السحب) <strong>تُعرَض كما تردنا من
        المصدر</strong> بدون تعديل، بدون تقريب صامت، بدون استنتاج. لكل قيمة:
      </p>
      <ul>
        <li>اسم المصدر.</li>
        <li>تاريخ ووقت آخر تحديث (Snapshot timestamp).</li>
        <li>رابط قابل للنقر للمصدر الأصلي.</li>
      </ul>
      <p>
        لو كان المصدر غير متاح أو أعطى بيانات غير قابلة للتأكد، نعرض "البيانات غير متاحة" بدلاً من تخمين قيمة.
      </p>
      <p>
        <strong>إذا ثبت أن المصدر الأصلي خاطئ</strong>، يجب على الناشر أو الباحث التواصل أولاً مع المصدر الأصلي
        لتصحيحه. عند تحديث المصدر، يُحدَّث VeriJournals تلقائياً في الدورة التالية.
      </p>

      <h2>٥. حساب Trust Score (من 0 إلى 100)</h2>
      <p>درجة الثقة هي مجموع نقاط من أوزان معلنة. الأوزان الحالية:</p>

      <table>
        <thead>
          <tr>
            <th>المؤشر</th>
            <th>الوزن</th>
            <th>شرط التفعيل</th>
          </tr>
        </thead>
        <tbody>
          <tr><td>NLM / PubMed</td><td>+20</td><td>مفهرسة في NLM Catalog</td></tr>
          <tr><td>DOAJ</td><td>+15</td><td>إدراج فعّال (ليس Removed)</td></tr>
          <tr><td>Web of Science</td><td>+15</td><td>مدرجة في أحد فهارس WoS</td></tr>
          <tr><td>Scopus</td><td>+15</td><td>مدرجة فعلياً (ليست Discontinued)</td></tr>
          <tr><td>Scimago Q1 أو Q2</td><td>+15</td><td>أعلى ربع أو الثاني</td></tr>
          <tr><td>Scimago Q3 أو Q4</td><td>+5</td><td>الربع الثالث أو الرابع (لا تُضاف مع Q1/Q2)</td></tr>
          <tr><td>Crossref + ISSN متسق</td><td>+10</td><td>DOI صالح + ISSN يطابق</td></tr>
          <tr><td>صفحة محررين علنية</td><td>+10</td><td>وجود صفحة Editorial Board في موقع المجلة (مؤشر سطحي)</td></tr>
        </tbody>
      </table>
      <p>
        <strong>الحد الأقصى = 100.</strong> لا يُضاف Q3/Q4 مع Q1/Q2 (يُختار الأعلى فقط).
        Arab Impact Factor مذكور كمرجع للمجلات الإقليمية لكنه لا يُضاف للدرجة الإجمالية في الإصدار الحالي.
      </p>

      <h2>٦. حساب Risk Score (من 0 إلى 100)</h2>
      <p>درجة الخطر هي مجموع نقاط من إشارات خطر معلنة:</p>

      <table>
        <thead>
          <tr>
            <th>المؤشر</th>
            <th>الوزن</th>
            <th>شرط التفعيل</th>
          </tr>
        </thead>
        <tbody>
          <tr><td>Hijacked Journal Checker</td><td>+30</td><td>هوية مُختطَفة موثَّقة</td></tr>
          <tr><td>DOAJ Removed</td><td>+25</td><td>أُزيلت من DOAJ مع سبب موثّق</td></tr>
          <tr><td>عدم تطابق نطاق ISSN/الموقع</td><td>+15</td><td>الـ Domain لا يتطابق مع ISSN registry</td></tr>
          <tr><td>غياب صفحة محررين علنية</td><td>+10</td><td>لا توجد صفحة Editorial Board علنية في موقع المجلة</td></tr>
          <tr><td>Retraction Watch (rate-based)</td><td>+10</td><td>نسبة سحب أكبر من 0.5% من إجمالي المنشورات</td></tr>
          <tr><td>عدم اتساق ISSN بين المصادر</td><td>+5</td><td>اختلاف ISSN بين registry والمواقع</td></tr>
          <tr><td>لا يوجد Crossref DOI</td><td>+5</td><td>المجلة لا تسجّل DOIs</td></tr>
        </tbody>
      </table>
      <p>
        <strong>الحد الأقصى = 100.</strong> "سرعة نشر مشبوهة" مذكورة كإشارة قيد التطوير،
        لم تُفعَّل بعد في الحساب الآلي.
      </p>

      <h2>٧. خانات التصنيف</h2>
      <p>تنتج خمس خانات ممكنة، تحدّدها قواعد مكتوبة <strong>بترتيب الأولوية</strong>:</p>
      <ol>
        <li><strong>Has Retracted Content (تتضمن أوراقاً مسحوبة) ↩</strong> — Retraction Watch موثَّقة و Risk ≥ 25.</li>
        <li><strong>Elevated Risk (مؤشر مخاطر مرتفع) ✗</strong> — Risk ≥ 40 (وإذا لم تتحقق الأولوية أعلاه).</li>
        <li><strong>Legitimate (موثوقة) ✓</strong> — Trust ≥ 60 و Risk أقل من 30.</li>
        <li><strong>Mixed Signals (إشارات متباينة) ⚠</strong> — Trust ≥ 40 و Risk أقل من 40 (لكن لا تستوفي الموثوقية).</li>
        <li><strong>Under Evaluation (تحت التقييم) ~</strong> — لم تتحقق أي خانة من السابق.</li>
      </ol>
      <p>
        <strong>منطق التقييم:</strong> يُقيَّم كل تقرير حسب الأولوية أعلاه. أول خانة تتحقق شروطها
        هي التصنيف النهائي. هذا يضمن أن المجلات ذات Trust العالي وRisk المرتفع تُصنَّف بحسب
        الخطر، لا بحسب الثقة.
      </p>
      <p>
        <strong>ملاحظة مهمة:</strong> VeriJournals لا تستخدم مصطلح <em>"predatory"</em> أو <em>"مفترسة"</em> كحكم
        مباشر على مجلة. أعلى مستوى خطر يُسمَّى "Elevated Risk Indicator". الحكم القاطع متروك للباحث ومؤسسته
        بعد مراجعة المصادر الأصلية.
      </p>

      <h2>٨. مستويات الثقة في التقرير</h2>
      <p>كل تقرير له مستوى ثقة في حد ذاته، بناءً على عدد المؤشرات المتوفرة بصراحة:</p>
      <ul>
        <li><strong>High:</strong> أكثر من 70% من المؤشرات المفعّلة لها بيانات صريحة.</li>
        <li><strong>Medium:</strong> 40-70% من المؤشرات المفعّلة لها بيانات صريحة.</li>
        <li><strong>Low:</strong> أقل من 40% (نوصي بمراجعة المصادر مباشرة قبل أي قرار).</li>
      </ul>

      <h2>٩. تحديث البيانات (Snapshot Policy)</h2>
      <ul>
        <li><strong>المصادر النشطة (PubMed, DOAJ, Crossref, Retraction Watch):</strong> تُحدَّث شهرياً عبر GitHub Actions cron.</li>
        <li><strong>المصادر السنوية (Scimago, JCR/WoS, Scopus CiteScore):</strong> تُحدَّث عند إصدار النسخة السنوية الجديدة من المصدر.</li>
      </ul>
      <p>
        تاريخ Snapshot يظهر بجانب كل قيمة في تقرير المجلة. إذا تغيّر مصدر بعد تاريخ Snapshot،
        لا تتحمل VeriJournals مسؤولية بأثر رجعي.
      </p>

      <h2>١٠. حدود المنهجية (Limitations)</h2>
      <p>للشفافية، نعترف بالحدود التالية:</p>
      <ul>
        <li><strong>الأوزان اجتهادية:</strong> الأوزان المذكورة قائمة على ممارسات COPE وICMJE وأدبيات سلامة النشر، لكنها <strong>ليست قياسية عالمياً</strong>. مراجعتها تتم سنوياً.</li>
        <li><strong>المجلات الحديثة:</strong> المجلات الجديدة (أقل من عامين) قد تُصنَّف تلقائياً "Under Evaluation" لقلة البيانات، حتى لو كانت ممتازة.</li>
        <li><strong>المجلات الإقليمية:</strong> المجلات العربية أو الجنوبية قد تكون مفهرسة محلياً فقط، فيظهر Trust أقل من الواقع المهني. نعمل على توسيع Arab Impact Factor وإضافة قواعد البيانات الإقليمية الأخرى.</li>
        <li><strong>التحيّز اللغوي:</strong> المصادر الإنجليزية مهيمنة، مما يخلق تحيزاً ضد المجلات بلغات أخرى.</li>
        <li><strong>التأخر في تحديث المصدر:</strong> لو سحب مصدر مجلةً من قائمة سوداء، قد يتأخر تحديثنا حسب دورة التحديث.</li>
        <li><strong>القرارات الآلية:</strong> Trust/Risk قراران حسابيان، لا يحلان محل التقييم البشري الخبير.</li>
      </ul>

      <h2>١١. حق المراجعة البشرية</h2>
      <p>
        وفقاً لنظام حماية البيانات الشخصية السعودي (المواد 4، 7) ومبادئ سدايا لأخلاقيات الذكاء الاصطناعي
        (مبدأ المساءلة)، لكل ناشر أو باحث الحق في طلب مراجعة بشرية لأي درجة. التقدم:
      </p>
      <ul>
        <li>عبر صفحة <a href="/appeal"><code>/appeal</code></a> (قيد الإكمال).</li>
        <li>أو مباشرة عبر <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.</li>
      </ul>
      <p>الردّ خلال 30 يوماً، مع توثيق المراجعة في سجل المنصة.</p>

      <h2>١٢. الإبلاغ عن خطأ في البيانات</h2>
      <p>
        إذا اكتشفت قيمة خاطئة في تقرير مجلة، استخدمي صفحة{' '}
        <a href="/report-discrepancy"><code>/report-discrepancy</code></a>. سيتم:
      </p>
      <ol>
        <li>تسجيل البلاغ.</li>
        <li>إعادة الاستعلام من المصدر الأصلي.</li>
        <li>إذا كان المصدر صحَّح، نُحدِّث نحن.</li>
        <li>إذا كان المصدر لم يتغير، نحيلك إليه لتصحيحه عنده.</li>
      </ol>

      <h2>١٣. المعايير الدولية المُلهَمة</h2>
      <p>المنهجية مُلهَمة من ممارسات:</p>
      <ul>
        <li><strong>COPE Core Practices</strong> — Committee on Publication Ethics.</li>
        <li><strong>ICMJE Recommendations</strong> — International Committee of Medical Journal Editors.</li>
        <li><strong>WAME Policy Statements</strong> — World Association of Medical Editors.</li>
        <li><strong>DOAJ Best Practice Criteria</strong>.</li>
        <li><strong>Saudi SDAIA AI Ethics Principles</strong> — Transparency, Fairness, Accountability.</li>
      </ul>
      <p>
        <em>تنبيه:</em> هذه المعايير غير ملزمة قانونياً، لكنها مرجع مهني معتمد. لا تدّعي VeriJournals
        التوافق الكامل مع جميع متطلباتها.
      </p>

      <h2>١٤. سجل الإصدارات</h2>
      <ul>
        <li><strong>الإصدار 1.0</strong> (مايو 2026) — الإصدار الأولي.</li>
      </ul>
      <p>عند أي تغيير جوهري في الأوزان أو العتبات، يُرفع رقم الإصدار، ويُحفظ الإصدار السابق في أرشيف عام.</p>

      <h2>١٥. سياسة تغيير الخوارزمية</h2>
      <p>
        أي تعديل جوهري على الأوزان أو العتبات (مثال: تغيير وزن مصدر، إضافة/حذف مصدر، تعديل عتبات التصنيف)
        يُعلَن في هذه الصفحة <strong>قبل تطبيقه بـ 30 يوماً</strong>. يُحفظ الإصدار السابق في
        أرشيف عام، ويتم إخطار المستخدمين المسجلين عبر البريد الإلكتروني.
      </p>
      <p>
        التعديلات التشغيلية الصغيرة (إصلاح أخطاء، تحسينات أداء، تحديثات أمنية) لا تتطلب إعلاناً مسبقاً.
      </p>

      <h2>١٦. إفصاح عن تضارب المصالح</h2>
      <p>
        أبرار العسيري، مالكة المنصة، باحثة طبية تستخدم المنصة شخصياً لأبحاثها الخاصة. لا يوجد
        تمويل تجاري من أي ناشر، ولا أي اتفاقية تعاقدية مع المجلات أو الناشرين المعروضين في المنصة.
      </p>
      <p>
        لو نشأت أي علاقة تعاقدية مستقبلية مع أي ناشر، ستُعلَن في هذه الصفحة قبل بدئها بـ 30 يوماً.
      </p>

      <h2>١٧. التواصل</h2>
      <p>
        لأي استفسار أو طلب توضيح حول المنهجية:{' '}
        <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
      </p>
    </article>
  );
}

function EnglishContent() {
  return (
    <article className="prose prose-slate max-w-none">

      <h2>1. Purpose of This Document</h2>
      <p>
        This document explains how <strong>VeriJournals</strong> computes the <strong>Trust Score</strong>
        and <strong>Risk Score</strong> for any scientific journal. The goal is full transparency: any
        researcher, publisher, or reviewer should be able to understand every input, its source, and the
        most recent snapshot date.
      </p>
      <p>
        This methodology is <strong>published in good faith</strong>, grounded in recognized scientific
        sources, and open to challenge via <a href="/appeal"><code>/appeal</code></a> or by emailing{' '}
        <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.
      </p>

      <h2>2. What VeriJournals Does and Does Not Do</h2>
      <p><strong>Does:</strong></p>
      <ul>
        <li>Aggregates declared indicators from 11 trusted scientific sources (see §3).</li>
        <li>Displays indicators pass-through, with source attribution and timestamp.</li>
        <li>Computes two composite scores (Trust / Risk) via a transparent formula (§§5–6).</li>
        <li>Classifies a journal into one of the categories in §7.</li>
        <li>Suggests indexed alternatives within the same scope on request.</li>
      </ul>
      <p><strong>Does not:</strong></p>
      <ul>
        <li>❌ Declare conclusively that a journal is "predatory" — that is a value judgment outside our scope.</li>
        <li>❌ Replace the decision of an institutional ethics or editorial committee.</li>
        <li>❌ Guarantee that publishing in a high-Trust journal will result in acceptance or citation.</li>
        <li>❌ Collect personal data about authors or rate individuals.</li>
        <li>❌ Handle plagiarism investigations or individual-paper audits.</li>
      </ul>
      <p>Results are <strong>advisory</strong>. The final decision rests with the researcher and their institution.</p>

      <h2>3. The Eleven Data Sources</h2>
      <p>Each indicator comes from a declared source, with a link to the original and a snapshot date on each journal page.</p>

      <div className="not-prose my-6 rounded-lg border border-blue-300 bg-blue-50 p-4">
        <p className="font-semibold text-blue-900 mb-2">ℹ️ Source Activation Status</p>
        <p className="text-sm text-blue-900 mb-2">
          The platform is in Closed Beta. Of the 11 documented sources below:
        </p>
        <ul className="text-sm text-blue-900 mb-2 list-none pl-0 space-y-1">
          <li>✅ <strong>Actively computed (4):</strong> PubMed, DOAJ, Scimago, Retraction Watch.</li>
          <li>⏳ <strong>Under development (7):</strong> Web of Science, Scopus, Crossref, Editorial Board, Hijacked Journal Checker, DOAJ Removed, Arab Impact Factor.</li>
        </ul>
        <p className="text-sm text-blue-900">
          Sources will be progressively activated, with each activation announced in the Version Log (Section 14).
        </p>
      </div>

      <h3>Trust-positive sources</h3>
      <ol>
        <li><strong>NLM / PubMed</strong> — US National Library of Medicine. Indexing means NLM editorial criteria were met.</li>
        <li><strong>DOAJ</strong> — Directory of Open Access Journals. Active listing implies transparency and peer-review compliance.</li>
        <li><strong>Scimago Journal Rank (SJR)</strong> — numerical score + quartile (Q1–Q4) from Scimago Lab.</li>
        <li><strong>Web of Science</strong> — Clarivate. Journal is listed in one of WoS indexes (SCI-E, SSCI, AHCI, ESCI).</li>
        <li><strong>Crossref</strong> — valid DOI registration + consistent ISSN.</li>
        <li><strong>Scopus</strong> — Elsevier. Listing + CiteScore.</li>
        <li><strong>Arab Impact Factor</strong> — reference for regional Arabic/Gulf journals (not added to composite score in current version).</li>
        <li><strong>Editorial board page presence</strong> — Verifies that the journal has a public "Editorial Board" page listing names and affiliations. <em>Caveat:</em> This is a surface-level indicator of page existence only, not validation of name authenticity or affiliations. Deep verification remains the researcher's responsibility.</li>
      </ol>

      <h3>Risk-positive sources</h3>
      <ol start={9}>
        <li><strong>DOAJ Removed List</strong> — Journals removed by the Directory of Open Access Journals from its index for failing transparency or peer-review standards. Accurate source (ISSN + removal reason + date).</li>
        <li><strong>Hijacked Journal Checker</strong> — database by Anna Abalkina et al. tracking hijacked journals (Cabells/Retraction Watch).</li>
        <li><strong>Retraction Watch Database</strong> — documented retraction records (via Crossref API since 2023).</li>
      </ol>

      <h2>4. Technical Conduit Principle</h2>
      <p>
        Primary indicators (indexing status, quartile, Impact Factor, CiteScore, retraction counts) are
        displayed <strong>exactly as received</strong> — no modification, no silent rounding, no inference.
        Every value carries:
      </p>
      <ul>
        <li>Source name.</li>
        <li>Snapshot timestamp.</li>
        <li>Clickable link to the original source.</li>
      </ul>
      <p>If a source is unavailable or returns unverifiable data, we show "Data unavailable" instead of guessing.</p>
      <p>
        <strong>If the upstream source is wrong</strong>, the publisher or researcher should contact the
        original source first. When the source updates, VeriJournals updates automatically in the next cycle.
      </p>

      <h2>5. Trust Score Calculation (0–100)</h2>
      <p>Trust Score is a sum of points from declared weights:</p>

      <table>
        <thead>
          <tr><th>Indicator</th><th>Weight</th><th>Trigger</th></tr>
        </thead>
        <tbody>
          <tr><td>NLM / PubMed</td><td>+20</td><td>Indexed in NLM Catalog</td></tr>
          <tr><td>DOAJ</td><td>+15</td><td>Actively listed (not Removed)</td></tr>
          <tr><td>Web of Science</td><td>+15</td><td>Listed in any WoS index</td></tr>
          <tr><td>Scopus</td><td>+15</td><td>Actively listed (not Discontinued)</td></tr>
          <tr><td>Scimago Q1 or Q2</td><td>+15</td><td>Top or second quartile</td></tr>
          <tr><td>Scimago Q3 or Q4</td><td>+5</td><td>Third or fourth quartile (does not stack with Q1/Q2)</td></tr>
          <tr><td>Crossref + ISSN consistent</td><td>+10</td><td>Valid DOI + matching ISSN</td></tr>
          <tr><td>Public editorial board page</td><td>+10</td><td>Editorial Board page exists on journal's website (surface indicator)</td></tr>
        </tbody>
      </table>
      <p>
        <strong>Maximum = 100.</strong> Q3/Q4 does not stack with Q1/Q2 (highest applicable only).
        Arab Impact Factor is noted as a reference for regional journals but is not added to the
        composite score in the current version.
      </p>

      <h2>6. Risk Score Calculation (0–100)</h2>
      <p>Risk Score is a sum of declared risk signals:</p>

      <table>
        <thead>
          <tr><th>Indicator</th><th>Weight</th><th>Trigger</th></tr>
        </thead>
        <tbody>
          <tr><td>Hijacked Journal Checker</td><td>+30</td><td>Documented hijacked identity</td></tr>
          <tr><td>DOAJ Removed</td><td>+25</td><td>Removed from DOAJ with documented reason</td></tr>
          <tr><td>ISSN/domain mismatch</td><td>+15</td><td>Domain does not match ISSN registry</td></tr>
          <tr><td>No public editorial board page</td><td>+10</td><td>No public Editorial Board page on journal's website</td></tr>
          <tr><td>Retraction Watch (rate-based)</td><td>+10</td><td>Retraction rate above 0.5% of total publications</td></tr>
          <tr><td>ISSN inconsistency across sources</td><td>+5</td><td>Different ISSNs in registry vs. sites</td></tr>
          <tr><td>No Crossref DOI</td><td>+5</td><td>Journal does not register DOIs</td></tr>
        </tbody>
      </table>
      <p>
        <strong>Maximum = 100.</strong> "Suspicious publication speed" is listed as an indicator
        under development, not yet active in automated scoring.
      </p>

      <h2>7. Classification Categories</h2>
      <p>Five possible classifications, evaluated <strong>by priority order</strong>:</p>
      <ol>
        <li><strong>Has Retracted Content ↩</strong> — Retraction Watch documented and Risk ≥ 25.</li>
        <li><strong>Elevated Risk ✗</strong> — Risk ≥ 40 (if priority above is not met).</li>
        <li><strong>Legitimate ✓</strong> — Trust ≥ 60 and Risk below 30.</li>
        <li><strong>Mixed Signals ⚠</strong> — Trust ≥ 40 and Risk below 40 (but does not meet Legitimate).</li>
        <li><strong>Under Evaluation ~</strong> — none of the above are met.</li>
      </ol>
      <p>
        <strong>Evaluation logic:</strong> Each report is evaluated by the priority order above.
        The first matching category becomes the final classification. This ensures journals with
        high Trust but elevated Risk are classified by Risk, not by Trust.
      </p>
      <p>
        <strong>Important:</strong> VeriJournals does <em>not</em> apply the term <em>"predatory"</em>
        as a direct judgment. The highest risk category is called "Elevated Risk Indicator". Conclusive
        judgment is left to the researcher and their institution after consulting primary sources.
      </p>

      <h2>8. Report Confidence Levels</h2>
      <p>Each report has its own confidence level based on indicator availability:</p>
      <ul>
        <li><strong>High:</strong> More than 70% of active indicators have explicit data.</li>
        <li><strong>Medium:</strong> 40–70% of active indicators have explicit data.</li>
        <li><strong>Low:</strong> Less than 40% (we recommend consulting primary sources directly before any decision).</li>
      </ul>

      <h2>9. Snapshot Policy</h2>
      <ul>
        <li><strong>Active sources (PubMed, DOAJ, Crossref, Retraction Watch):</strong> updated monthly via GitHub Actions cron.</li>
        <li><strong>Annual sources (Scimago, JCR/WoS, Scopus CiteScore):</strong> updated with each new annual release.</li>
      </ul>
      <p>
        Snapshot date appears next to every value. If a source changes after our snapshot, VeriJournals
        is not retroactively liable.
      </p>

      <h2>10. Limitations</h2>
      <ul>
        <li><strong>Weights are judgment-based:</strong> the weights draw on COPE, ICMJE, and publication-ethics literature but are <strong>not a global standard</strong>. Reviewed annually.</li>
        <li><strong>New journals:</strong> journals under two years old may be auto-classified "Under Evaluation" due to scarce data, even if excellent.</li>
        <li><strong>Regional journals:</strong> Arabic or Global-South journals may be locally indexed only, making Trust appear lower than professional reality. We're working on expanding Arab Impact Factor and adding other regional databases.</li>
        <li><strong>Language bias:</strong> English-language sources dominate, creating bias against non-English journals.</li>
        <li><strong>Source update lag:</strong> if a source removes a journal from a blacklist, our update may lag depending on refresh cycle.</li>
        <li><strong>Automated decisions:</strong> Trust/Risk are computational, not a substitute for expert human review.</li>
      </ul>

      <h2>11. Right to Human Review</h2>
      <p>
        Under Saudi PDPL (Articles 4, 7) and SDAIA AI Ethics Principles (Accountability principle),
        every publisher or researcher has the right to request human review of any score:
      </p>
      <ul>
        <li>Via <a href="/appeal"><code>/appeal</code></a> (under construction).</li>
        <li>Or directly via <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.</li>
      </ul>
      <p>Response within 30 days, with the review documented in our platform log.</p>

      <h2>12. Reporting Data Errors</h2>
      <p>If you find an incorrect value in a journal report, use <a href="/report-discrepancy"><code>/report-discrepancy</code></a>. We will:</p>
      <ol>
        <li>Log the report.</li>
        <li>Re-query the original source.</li>
        <li>If the source has corrected, we update.</li>
        <li>If the source has not changed, we refer you to it for primary correction.</li>
      </ol>

      <h2>13. International Standards (Inspirational)</h2>
      <p>The methodology is inspired by practices from:</p>
      <ul>
        <li><strong>COPE Core Practices</strong> — Committee on Publication Ethics.</li>
        <li><strong>ICMJE Recommendations</strong> — International Committee of Medical Journal Editors.</li>
        <li><strong>WAME Policy Statements</strong> — World Association of Medical Editors.</li>
        <li><strong>DOAJ Best Practice Criteria</strong>.</li>
        <li><strong>Saudi SDAIA AI Ethics Principles</strong> — Transparency, Fairness, Accountability.</li>
      </ul>
      <p>
        <em>Note:</em> these standards are not legally binding but are recognized professional references.
        VeriJournals does not claim full compliance with all their requirements.
      </p>

      <h2>14. Version Log</h2>
      <ul>
        <li><strong>Version 1.0</strong> (May 2026) — initial release.</li>
      </ul>
      <p>Material changes to weights or thresholds increment the version, with prior versions archived publicly.</p>

      <h2>15. Algorithm Change Policy</h2>
      <p>
        Any material change to weights or thresholds (e.g., changing a source's weight, adding/removing
        a source, adjusting classification thresholds) is announced on this page <strong>30 days before
        taking effect</strong>. Prior versions are archived publicly, and registered users are notified
        by email.
      </p>
      <p>
        Minor operational changes (bug fixes, performance improvements, security updates) do not
        require prior announcement.
      </p>

      <h2>16. Conflict of Interest Disclosure</h2>
      <p>
        Abrar Aseeri, owner of the platform, is a medical researcher who uses the platform personally
        for her own research. There is no commercial funding from any publisher, nor any contractual
        agreement with the journals or publishers displayed on the platform.
      </p>
      <p>
        Should any future contractual relationship with a publisher arise, it will be disclosed on
        this page 30 days before commencement.
      </p>

      <h2>17. Contact</h2>
      <p>For inquiries or clarifications about methodology: <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a></p>
    </article>
  );
}
