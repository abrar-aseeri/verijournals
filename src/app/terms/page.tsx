export const dynamic = 'force-dynamic'

const SECTIONS: { n: number; ar: { title: string; body: React.ReactNode }; en: { title: string; body: React.ReactNode } }[] = [
  {
    n: 1,
    ar: {
      title: 'تعريف المنصة وملكيتها',
      body: (
        <>
          <p>
            VeriJournals (المُشار إليها بـ &quot;المنصة&quot;) مشروع رقمي مستقل يديره باحث فرد بصفته الشخصية، لأغراض دعم البحث العلمي والتحقق من المجلات العلمية.{' '}
            <strong>المنصة ليست تابعة لأي جهة حكومية أو مؤسسية، ولا تمثل وزارة الصحة، وزارة الدفاع، الإدارة العامة للخدمات الصحية، أو أي مستشفى أو مرفق حكومي.</strong>{' '}
            أي ربط بهذه الجهات على أساس الموقع الجغرافي للمالك أو خبرته السابقة هو افتراض غير صحيح.
          </p>
        </>
      ),
    },
    en: {
      title: 'Definition and Ownership',
      body: (
        <>
          <p>
            VeriJournals (the &quot;Platform&quot;) is an independent digital project operated by an individual researcher in personal capacity, for the purpose of supporting scientific research and the verification of academic journals.{' '}
            <strong>The Platform is not affiliated with any governmental or institutional entity, and does not represent the Ministry of Health, Ministry of Defense, the General Directorate of Medical Services, or any hospital or public facility.</strong>{' '}
            Any inference of such affiliation based on the owner&apos;s geographic location or prior experience is incorrect.
          </p>
        </>
      ),
    },
  },
  {
    n: 2,
    ar: {
      title: 'طبيعة المخرجات',
      body: (
        <>
          <p>تعرض المنصة نوعين مختلفين من المعلومات:</p>
          <p>
            أ. <strong>مؤشرات منقولة (Pass-through)</strong> من المصادر المُعلَنة (Scopus, DOAJ, Crossref, Retraction Watch، إلخ). هذه المؤشرات تُعرض &quot;كما هي&quot; من المصدر، مع تاريخ ورابط، ولا تتحمل المنصة المسؤولية عن دقتها — هي مسؤولية المصدر الأصلي. أي اعتراض يُحال أولاً للمصدر.
          </p>
          <p>
            ب. <strong>مؤشرات مركَّبة</strong> (Trust Score, Risk Score) من إنتاج المنصة وفق منهجية موثقة ومُعلَنة في صفحة <a href="/methodology" className="underline">/methodology</a>. هذه المؤشرات آراء استرشادية مستندة إلى وقائع مُعلَنة، لا أحكاماً قطعية، وتخضع لإجراء الاعتراض في البند 5.
          </p>
        </>
      ),
    },
    en: {
      title: 'Nature of Outputs',
      body: (
        <>
          <p>The Platform displays two distinct categories of information:</p>
          <p>
            (a) <strong>Pass-through indicators</strong> sourced from declared third parties (Scopus, DOAJ, Crossref, Retraction Watch, and others). These are presented &quot;as-is&quot; from the source, with timestamp and link. The Platform does not bear responsibility for the accuracy of pass-through indicators — that responsibility lies with the original source. Disputes must be addressed to the source first.
          </p>
          <p>
            (b) <strong>Composite indicators</strong> (Trust Score, Risk Score) produced by the Platform according to a documented methodology published at <a href="/methodology" className="underline">/methodology</a>. These are advisory opinions grounded in declared facts, not definitive judgments, and are subject to the dispute procedure in Section 5.
          </p>
        </>
      ),
    },
  },
  {
    n: 3,
    ar: {
      title: 'الاستخدام المسموح والممنوع',
      body: (
        <>
          <p><strong>مسموح:</strong> البحث الشخصي، الاستشهاد الأكاديمي مع ذكر المصدر، المراجعة قبل النشر كأداة استرشادية.</p>
          <p><strong>ممنوع:</strong> الـ scraping المُنظَّم، إعادة النشر دون نسبة، استخدام المنصة لأغراض إساءة لأي مجلة أو ناشر أو فرد، انتحال صفة المنصة في تقارير رسمية.</p>
        </>
      ),
    },
    en: {
      title: 'Permitted and Prohibited Use',
      body: (
        <>
          <p><strong>Permitted:</strong> Personal research, academic citation with source attribution, pre-submission review as an advisory tool.</p>
          <p><strong>Prohibited:</strong> Automated scraping, republication without attribution, use of the Platform for the abuse of any journal, publisher, or individual, misrepresentation of Platform output in official reports.</p>
        </>
      ),
    },
  },
  {
    n: 4,
    ar: {
      title: 'حدود المسؤولية',
      body: (
        <>
          <p>
            تُقدَّم الخدمة &quot;كما هي&quot; (as-is) و&quot;بحسب توافرها&quot; (as-available) دون أي ضمانات صريحة أو ضمنية بشأن: الدقة، الكمال، الحداثة، الملاءمة لغرض محدد، الخلو من الانقطاع، أو الخلو من الأخطاء. <strong>لا يتحمل مالك المنصة أي مسؤولية عن:</strong>
          </p>
          <ul className="list-disc pe-5 space-y-1">
            <li>قرارات النشر التي يتخذها المستخدم بناءً على المخرجات.</li>
            <li>الأضرار غير المباشرة، التبعية، الخاصة، العقابية، أو فوات الكسب.</li>
            <li>تغييرات تطرأ على المصادر بعد تاريخ اللقطة المعروض.</li>
            <li>توقف الخدمة أو فقدان البيانات.</li>
          </ul>
        </>
      ),
    },
    en: {
      title: 'Limitation of Liability',
      body: (
        <>
          <p>
            The Service is provided &quot;as-is&quot; and &quot;as-available&quot; without any express or implied warranties regarding: accuracy, completeness, timeliness, fitness for a particular purpose, uninterrupted availability, or error-free operation. <strong>The Platform owner bears no liability for:</strong>
          </p>
          <ul className="list-disc ps-5 space-y-1">
            <li>Publication decisions made by users based on Platform outputs.</li>
            <li>Indirect, consequential, special, punitive, or lost-profit damages.</li>
            <li>Changes to source data occurring after the displayed snapshot date.</li>
            <li>Service interruption or data loss.</li>
          </ul>
        </>
      ),
    },
  },
  {
    n: 5,
    ar: {
      title: 'الاعتراض على التصنيف',
      body: (
        <p>
          لأي مجلة، ناشر، مؤلف، أو طرف معني الحق في تقديم اعتراض موثَّق بدليل من المصدر الأولي عبر صفحة <a href="/report-discrepancy" className="underline">/report-discrepancy</a>. تُدرَس الاعتراضات خلال 30 يوم عمل. لا تُعدَّل التصنيفات بناءً على الادعاء وحده — يُشترط دليل وثائقي من المصدر الأصلي.
        </p>
      ),
    },
    en: {
      title: 'Dispute Procedure',
      body: (
        <p>
          Any journal, publisher, author, or affected party has the right to submit a documented dispute, supported by primary-source evidence, via <a href="/report-discrepancy" className="underline">/report-discrepancy</a>. Disputes are reviewed within 30 business days. Classifications are not modified based on assertion alone — documentary evidence from the original source is required.
        </p>
      ),
    },
  },
  {
    n: 6,
    ar: {
      title: 'الخصوصية وحماية البيانات',
      body: (
        <>
          <p>
            تخضع معالجة البيانات الشخصية لإشعار الخصوصية المُعلَن. الأساس النظامي: الموافقة الصريحة عبر هذا النموذج. النظام المرجعي: نظام حماية البيانات الشخصية السعودي م/19 لعام 1443هـ وتعديلاته.
          </p>
          <p>
            البنية التحتية (Vercel، Supabase) خارج المملكة العربية السعودية. <strong>لا تُخزَّن بيانات صحية، أو بيانات حساسة، أو بيانات مهنية مرتبطة بأي صاحب عمل.</strong> البيانات المُخزَّنة محدودة بـ: بريد إلكتروني، تفضيلات استخدام، سجل بحث مجهول الهوية. باستخدامك للمنصة وموافقتك على إشعار الخصوصية، توافق على هذه المعالجة وفق المادة 6 من النظام (الموافقة الصريحة).
          </p>
        </>
      ),
    },
    en: {
      title: 'Privacy and Data Protection',
      body: (
        <>
          <p>
            Processing of personal data is governed by the published Privacy Notice. Legal basis: express consent collected via the consent interstitial. Governing regime: the Saudi Personal Data Protection Law (Royal Decree M/19 of 1443H) and its amendments.
          </p>
          <p>
            Infrastructure (Vercel, Supabase) is located outside the Kingdom of Saudi Arabia. <strong>No health data, no sensitive data, and no employment-linked professional data are stored.</strong> Data stored is limited to: email address, usage preferences, anonymized search activity. By using the Platform and accepting the Privacy Notice, you consent to this processing under Article 6 (express consent) of the law.
          </p>
        </>
      ),
    },
  },
  {
    n: 7,
    ar: {
      title: 'الملكية الفكرية',
      body: (
        <p>
          البيانات الوقائعية (أسماء، ISSN، حالة الفهرسة) معلومات وقائعية غير مشمولة بحماية حق المؤلف. منهجية المنصة وتصاميمها وكودها ملك لمالك المنصة، مرخَّص للاستخدام الشخصي غير التجاري.
        </p>
      ),
    },
    en: {
      title: 'Intellectual Property',
      body: (
        <p>
          Factual data (names, ISSNs, indexing status) are factual information not subject to copyright protection. The Platform&apos;s methodology, design, and code are owned by the Platform owner, licensed for personal non-commercial use.
        </p>
      ),
    },
  },
  {
    n: 8,
    ar: {
      title: 'القانون المختص واللغة المرجعية',
      body: (
        <p>
          تخضع هذه الشروط لأنظمة المملكة العربية السعودية، ويختص بأي نزاع ينشأ بشأنها المحاكم السعودية المختصة دون سواها. <strong>النص العربي هو المرجع القانوني الأصلي</strong>؛ النسخة الإنجليزية للتيسير فقط، وفي حال التعارض يُعمَل بالعربي.
        </p>
      ),
    },
    en: {
      title: 'Governing Law and Reference Language',
      body: (
        <p>
          These terms are governed by the laws of the Kingdom of Saudi Arabia, with exclusive jurisdiction vested in the competent Saudi courts. <strong>The Arabic text is the authoritative legal reference;</strong> the English version is provided for accessibility only, and in case of conflict the Arabic version prevails.
        </p>
      ),
    },
  },
  {
    n: 9,
    ar: {
      title: 'التعديل والإنهاء',
      body: (
        <p>
          يحق للمالك تعديل هذه الشروط أو إيقاف المنصة في أي وقت دون إشعار مسبق. النسخة المحدَّثة تُنشَر على <a href="/terms" className="underline">/terms</a> بتاريخ نفاذ جديد.
        </p>
      ),
    },
    en: {
      title: 'Modification and Termination',
      body: (
        <p>
          The owner reserves the right to modify these terms or discontinue the Platform at any time without prior notice. Updated versions are published at <a href="/terms" className="underline">/terms</a> with a new effective date.
        </p>
      ),
    },
  },
  {
    n: 10,
    ar: {
      title: 'التواصل',
      body: (
        <>
          <p>للاستفسارات العامة: privacy@verijournals.app</p>
          <p>للاعتراضات على التصنيف: <a href="/report-discrepancy" className="underline">/report-discrepancy</a></p>
        </>
      ),
    },
    en: {
      title: 'Contact',
      body: (
        <>
          <p>General inquiries: privacy@verijournals.app</p>
          <p>Classification disputes: <a href="/report-discrepancy" className="underline">/report-discrepancy</a></p>
        </>
      ),
    },
  },
]

export default function TermsPage() {
  return (
    <main className="min-h-screen px-4 py-12 font-fs" style={{ background: '#F8FAFC' }}>
      <div className="max-w-3xl mx-auto bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
        <header className="mb-8 pb-4 border-b border-gray-100">
          <h1 dir="rtl" className="text-2xl font-bold mb-1" style={{ color: '#0B4644' }}>
            شروط استخدام منصة VeriJournals
          </h1>
          <h2 lang="en" className="text-base font-semibold" style={{ color: '#6B7280' }}>
            VeriJournals — Terms of Use
          </h2>
          <p dir="rtl" className="mt-3 text-sm" style={{ color: '#6B7280' }}>
            <strong>الإصدار: 1.0 | تاريخ النفاذ: 2026-05-15</strong>
          </p>
          <p lang="en" className="text-xs" style={{ color: '#6B7280' }}>
            <strong>Version: 1.0 | Effective Date: 2026-05-15</strong>
          </p>
        </header>

        <div className="space-y-8 text-sm" style={{ color: '#0B4644' }}>
          {SECTIONS.map((s) => (
            <section key={s.n}>
              <h3 dir="rtl" className="text-base font-bold mb-2" style={{ color: '#0B4644' }}>
                {s.n}. {s.ar.title}
              </h3>
              <div dir="rtl" className="space-y-2 leading-relaxed mb-4" style={{ color: '#374151' }}>
                {s.ar.body}
              </div>
              <h4 lang="en" className="text-sm font-semibold mb-1.5" style={{ color: '#6B7280' }}>
                {s.n}. {s.en.title}
              </h4>
              <div lang="en" className="space-y-2 text-xs leading-relaxed" style={{ color: '#374151' }}>
                {s.en.body}
              </div>
            </section>
          ))}
        </div>
      </div>
    </main>
  )
}
