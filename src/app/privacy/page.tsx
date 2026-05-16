// app/privacy/page.tsx  (Next.js App Router)
// VeriJournals Privacy Notice — bilingual AR/EN
// PDPL-compliant (Royal Decree M/19 of 1443H, amended by M/148 of 1444H)
// Version 1.0 — May 15, 2026

'use client';

import { useState } from 'react';

const CONTACT_EMAIL = 'abrar.aseeri@gmail.com';
const LAST_UPDATED_AR = '١٥ مايو ٢٠٢٦';
const LAST_UPDATED_EN = 'May 15, 2026';
const VERSION = '1.0';

type Lang = 'ar' | 'en';

export default function PrivacyPage() {
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
            {isAr ? 'إخطار الخصوصية' : 'Privacy Notice'}
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
          ? '© VeriJournals — جميع الحقوق محفوظة لـ أبرار العسيري. الاستخدام محكوم بشروط الخدمة.'
          : '© VeriJournals — All rights reserved by Abrar Aseeri. Use governed by Terms of Service.'}
      </footer>
    </main>
  );
}

function ArabicContent() {
  return (
    <article className="prose prose-slate max-w-none rtl text-right">
      <p className="lead">
        تحترم منصة <strong>VeriJournals</strong> خصوصية مستخدميها وتلتزم بحماية بياناتهم الشخصية وفقاً
        لنظام حماية البيانات الشخصية السعودي الصادر بالمرسوم الملكي رقم م/19 بتاريخ 9/2/1443هـ،
        المعدّل بالمرسوم الملكي رقم م/148 بتاريخ 5/9/1444هـ ("PDPL"). هذا الإخطار يبيّن البيانات
        التي نجمعها، وأسباب جمعها، وكيفية استخدامها وحمايتها، وحقوقك المتعلقة بها.
      </p>

      <h2>١. المتحكم في البيانات</h2>
      <p>
        المتحكم في البيانات هو <strong>أبرار العسيري</strong>، بصفتها المالكة المنفردة لمنصة VeriJournals.
        VeriJournals مشروع شخصي مستقل وليس له ارتباط رسمي بأي جهة حكومية أو مؤسسية.
      </p>
      <p>
        للتواصل بشأن خصوصيتك: <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
      </p>

      <h2>٢. البيانات الشخصية التي نجمعها</h2>
      <ul>
        <li><strong>بيانات الحساب:</strong> البريد الإلكتروني، الاسم الكامل، الإدارة/الجهة، التخصص العلمي.</li>
        <li><strong>بيانات طلب الوصول:</strong> الغرض من الاستخدام (نص حر تقدمه عند تقديم الطلب).</li>
        <li><strong>بيانات تقنية:</strong> عنوان IP، نوع المتصفح، نظام التشغيل، توقيت الزيارة، رمز الجلسة.</li>
        <li><strong>بيانات الاستخدام:</strong> عمليات البحث التي تجريها على المنصة (ISSN، DOI، أسماء المجلات، الـ Abstracts المُلصقة).</li>
        <li><strong>سجل الموافقات:</strong> نوع الموافقة، تاريخها، عنوان IP، وعنوان URL وقت الموافقة.</li>
      </ul>
      <p>
        <strong>لا نجمع</strong> بيانات حساسة وفق تصنيف PDPL (المعتقدات الدينية، البيانات الصحية، البيانات الجينية،
        البيانات البيومترية)، ولا نتعامل مع بيانات الأطفال دون 18 عاماً عن قصد.
      </p>

      <h2>٣. الأساس النظامي للمعالجة (PDPL م.5)</h2>
      <ul>
        <li><strong>الموافقة الصريحة (Consent):</strong> هي الأساس الرئيسي للمعالجة. عند التسجيل تُعطي موافقات منفصلة على شروط الاستخدام، إقرار PDPL، ونقل البيانات عبر الحدود (وموافقات اختيارية أخرى).</li>
        <li><strong>المصلحة المشروعة:</strong> لأغراض أمن المنصة، كشف الاحتيال، والحفاظ على سلامة بيانات التدقيق.</li>
      </ul>

      <h2>٤. أغراض المعالجة</h2>
      <ul>
        <li>التحقق من هويتك كباحث معتمد ومنحك صلاحية الدخول للنسخة المغلقة (Closed Beta).</li>
        <li>توفير خدمة التحقق من المجلات العلمية واقتراح بدائل مفهرسة.</li>
        <li>تحسين دقة المنهجية وأداء النظام (Anonymized Analytics — اختياري).</li>
        <li>الامتثال للالتزامات النظامية، بما فيها سجلات التدقيق المنصوص عليها في PDPL م.18.</li>
      </ul>

      <h2>٥. القرارات الآلية (PDPL م.22)</h2>
      <p>
        تنتج المنصة درجتين خوارزميتين: <strong>Trust Score</strong> و<strong>Risk Score</strong>، تستندان
        إلى مؤشرات معلنة من مصادر علمية موثوقة. هاتان الدرجتان <strong>قراران آليان</strong> ولا تشكلان
        رأياً نهائياً ملزماً.
      </p>
      <p>
        <strong>لك الحق في طلب مراجعة بشرية</strong> لأي درجة تخص مجلة تهمك. التقدم بطلب المراجعة متاح
        عبر صفحة <code>/appeal</code> (قيد الإكمال) أو مباشرة عبر البريد الإلكتروني أعلاه.
      </p>

      <h2>٦. مشاركة البيانات والمستلمون</h2>
      <p>لا نبيع بياناتك ولا نشاركها لأغراض تسويقية. نستعين بمزودي خدمة معالجين تالين:</p>
      <ul>
        <li><strong>Supabase</strong> (سنغافورة) — قاعدة بيانات + مصادقة. <em>تتلقى:</em> بياناتك كافة كمعالج بيانات.</li>
        <li><strong>Vercel</strong> (الولايات المتحدة) — استضافة وتشغيل. <em>تتلقى:</em> بيانات تقنية + Logs.</li>
        <li><strong>Resend</strong> (الولايات المتحدة) — إرسال البريد الإلكتروني. <em>تتلقى:</em> بريدك الإلكتروني ومحتوى الرسالة.</li>
        <li><strong>GitHub Inc.</strong> (الولايات المتحدة) — استضافة كود المنصة وسجلات النشر. <em>لا يتلقى:</em> بيانات المستخدمين الشخصية.</li>
        <li><strong>مزودو CDN التابعون لـ Vercel</strong> — يتلقون عابراً عنوان IP و User-Agent لتقديم الموقع.</li>
      </ul>
      <p>جميع المعالجين ملزمون تعاقدياً بمعايير حماية بيانات لا تقل عن PDPL.</p>

      <h2>٧. نقل البيانات عبر الحدود (PDPL م.29)</h2>
      <p>
        نظراً لأن مزودي خدمتنا (Supabase، Vercel، Resend، GitHub) يقعون خارج المملكة العربية السعودية،
        فإن استخدامك للمنصة يستلزم نقل بياناتك الشخصية إلى دول أخرى. لا نقوم بذلك إلا بعد الحصول على
        موافقتك الصريحة المنفصلة (Cross-border Transfer Consent) أثناء التسجيل.
      </p>
      <p>
        <strong>الضمانات المطبّقة لنقل البيانات:</strong> تشفير TLS، تحكم وصول صارم،
        تشفير قاعدة البيانات في حالة الراحة (encryption at rest)، وسجل تدقيق كامل لكل عمليات الوصول.
      </p>
      <p>
        <strong>تقييم الأثر (DPIA):</strong> يجري حالياً إعداد تقييم رسمي لأثر نقل البيانات عبر الحدود،
        وسيُسجَّل لدى الهيئة السعودية للبيانات والذكاء الاصطناعي (SDAIA) قبل أي توسيع للنطاق
        الجغرافي للخدمة خارج المملكة العربية السعودية.
      </p>

      <h2>٨. مدة الاحتفاظ</h2>
      <ul>
        <li><strong>بيانات الحساب:</strong> طوال فترة فعالية حسابك + 12 شهراً بعد آخر تسجيل دخول.</li>
        <li><strong>طلبات الوصول المرفوضة:</strong> 6 أشهر للتمكن من الردّ على الاستئنافات.</li>
        <li><strong>سجل الموافقات (Consent Records):</strong> طوال عمر المنصة كسجل تدقيق غير قابل للتعديل (PDPL م.18).</li>
        <li><strong>سجل البحث:</strong> 90 يوماً ثم يُجهَّل (anonymized) ويُحتفظ بإحصاءات مجمّعة فقط.</li>
        <li><strong>سجلات التدقيق الأمني:</strong> 12 شهراً.</li>
      </ul>
      <p>بعد انقضاء المدة المحددة، تُحذف البيانات أو تُجهَّل بشكل دائم.</p>

      <h2>٩. حقوقك (PDPL م.7)</h2>
      <p>تتمتع بالحقوق التالية، ويمكنك ممارستها بإرسال طلب إلى <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>:</p>
      <ul>
        <li><strong>حق العلم:</strong> الحصول على معلومات عن بياناتك ومعالجتها.</li>
        <li><strong>حق الوصول:</strong> طلب نسخة من بياناتك الشخصية المخزنة لدينا.</li>
        <li><strong>حق التصحيح:</strong> تحديث أو تصحيح أي بيانات غير دقيقة.</li>
        <li><strong>حق الحذف ("الحق في النسيان"):</strong> طلب حذف بياناتك عند انتفاء سبب المعالجة.</li>
        <li><strong>حق سحب الموافقة:</strong> في أي وقت ودون أن يؤثر ذلك على شرعية المعالجة السابقة.</li>
        <li><strong>حق الاعتراض على القرارات الآلية:</strong> طلب مراجعة بشرية لأي درجة Trust/Risk.</li>
        <li><strong>حق تقديم شكوى:</strong> إلى الهيئة السعودية للبيانات والذكاء الاصطناعي (SDAIA).</li>
      </ul>
      <p>سنرد على طلبك خلال 30 يوماً كحد أقصى، أو نُعلمك بأي تمديد ضروري ومبرراته.</p>
      <p>
        <strong>آلية تنفيذ هذه الحقوق:</strong> حالياً، تُعالَج طلبات ممارسة الحقوق يدوياً عبر البريد
        الإلكتروني خلال 30 يوماً. مع نمو المنصة، ستُضاف صفحة مخصصة لإدارة هذه الطلبات (<code>/data-rights</code>).
      </p>

      <h2>١٠. الإشعار بخرق البيانات (PDPL م.19)</h2>
      <p>
        في حال حدوث خرق للبيانات قد يُلحق ضرراً جسيماً بأصحاب البيانات، نلتزم بـ:
      </p>
      <ul>
        <li>إبلاغ الهيئة السعودية للبيانات والذكاء الاصطناعي (SDAIA) خلال 72 ساعة من علمنا بالخرق.</li>
        <li>إبلاغك مباشرة إذا كان الخرق يمسّ بياناتك الشخصية ومن المرجح أن يسبب لك ضرراً.</li>
        <li>توثيق طبيعة الخرق وآثاره والإجراءات المتخذة في سجل داخلي.</li>
      </ul>

      <h2>١١. الأمن</h2>
      <ul>
        <li>تشفير الاتصالات بأحدث إصدارات TLS المدعومة (TLS 1.2 أو أحدث).</li>
        <li>تشفير قاعدة البيانات في حالة الراحة (encryption at rest).</li>
        <li>مصادقة عبر الرابط السحري (Magic Link) — بدون كلمات مرور قابلة للاختراق.</li>
        <li>Row Level Security مفعّل على الجداول التي تخزّن موافقات المستخدمين وطلبات الوصول.</li>
        <li>مراجعات أمنية دورية وسجل عمليات للمدراء.</li>
      </ul>
      <p>
        رغم هذه التدابير، لا توجد منظومة آمنة 100%. ملتزمون بإبلاغك فوراً عند أي حادث يستوجب ذلك.
      </p>

      <h2>١٢. ملفات تعريف الارتباط (Cookies)</h2>
      <ul>
        <li><strong>ضرورية:</strong> رمز الجلسة، تخزين تفضيل اللغة (لا تتطلب موافقة).</li>
        <li><strong>تحليلية مُجهَّلة:</strong> Vercel Analytics — تجمع بيانات إحصائية مُجهَّلة عن أداء الصفحات
          بدون تعريف شخصي. تقدرين الاعتراض على هذه المعالجة عبر إلغاء "Anonymized Analytics consent"
          من إعدادات حسابك.</li>
      </ul>
      <p>لا نستخدم ملفات تعريف ارتباط إعلانية أو تتبع طرف ثالث.</p>

      <h2>١٣. القاصرون</h2>
      <p>
        الخدمة موجَّهة للباحثين البالغين (18 عاماً فأكثر) حصراً. عند تقديم طلب الوصول، يُطلَب من
        المستخدم الإقرار بأنه فوق 18 عاماً. لا نجمع بيانات القاصرين عن قصد. إذا علمنا بجمع أي
        بيانات لقاصر دون موافقة وليّ الأمر، سنحذفها فوراً.
      </p>

      <h2>١٤. التحديثات</h2>
      <p>
        قد نُحدّث هذا الإخطار من وقت لآخر لمواكبة التغييرات النظامية أو التشغيلية. التحديثات الجوهرية
        سنُبلغك بها عبر البريد الإلكتروني قبل سريانها بـ 14 يوماً على الأقل. تاريخ آخر تحديث ورقم الإصدار
        مذكوران أعلى هذه الصفحة.
      </p>

      <h2>١٥. القانون الواجب التطبيق والاختصاص القضائي</h2>
      <p>
        يُحكم هذا الإخطار بأنظمة المملكة العربية السعودية، ولا سيما نظام حماية البيانات الشخصية. أي
        نزاع ينشأ عن تفسيره أو تطبيقه يخضع للاختصاص الحصري للمحاكم السعودية المختصة.
      </p>

      <h2>١٦. التواصل</h2>
      <p>
        لأي استفسار أو طلب يخص خصوصيتك أو ممارسة أي من حقوقك أعلاه، تواصلي معنا عبر:{' '}
        <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
      </p>
      <p>
        المالكة والمسؤولة عن حماية البيانات: <strong>أبرار العسيري</strong>.
      </p>
    </article>
  );
}

function EnglishContent() {
  return (
    <article className="prose prose-slate max-w-none">
      <p className="lead">
        <strong>VeriJournals</strong> respects user privacy and is committed to protecting personal data
        in accordance with the Saudi Personal Data Protection Law issued by Royal Decree M/19 dated 9/2/1443H,
        as amended by Royal Decree M/148 dated 5/9/1444H (the "PDPL"). This Notice explains what data we
        collect, why we collect it, how we use and protect it, and the rights you have over it.
      </p>

      <h2>1. Data Controller</h2>
      <p>
        The data controller is <strong>Abrar Aseeri</strong>, sole owner of the VeriJournals platform.
        VeriJournals is an independent personal project and is not officially affiliated with any
        government or institutional entity.
      </p>
      <p>
        Privacy contact: <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
      </p>

      <h2>2. Personal Data We Collect</h2>
      <ul>
        <li><strong>Account data:</strong> email, full name, department/institution, scientific specialty.</li>
        <li><strong>Access-request data:</strong> the free-text purpose you provide when requesting access.</li>
        <li><strong>Technical data:</strong> IP address, browser type, OS, visit timestamp, session token.</li>
        <li><strong>Usage data:</strong> searches you perform on the platform (ISSNs, DOIs, journal names, pasted abstracts).</li>
        <li><strong>Consent records:</strong> consent type, timestamp, IP, and URL at the time of consent.</li>
      </ul>
      <p>
        We <strong>do not</strong> collect sensitive data as defined by PDPL (religious beliefs, health data,
        genetic data, biometric data), and we do not knowingly process data of minors under 18.
      </p>

      <h2>3. Legal Basis for Processing (PDPL Art. 5)</h2>
      <ul>
        <li><strong>Explicit consent:</strong> the primary basis. At sign-up you provide separate consents for Terms, PDPL acknowledgment, and cross-border transfer (plus optional consents).</li>
        <li><strong>Legitimate interest:</strong> for platform security, fraud detection, and audit-trail integrity.</li>
      </ul>

      <h2>4. Purposes of Processing</h2>
      <ul>
        <li>Verifying your identity as an approved researcher and granting Closed Beta access.</li>
        <li>Providing journal verification and suggesting indexed alternatives.</li>
        <li>Improving methodology accuracy and system performance (Anonymized Analytics — optional).</li>
        <li>Complying with legal obligations, including audit records under PDPL Art. 18.</li>
      </ul>

      <h2>5. Automated Decisions (PDPL Art. 22)</h2>
      <p>
        The platform produces two algorithmic scores: <strong>Trust Score</strong> and <strong>Risk Score</strong>,
        derived from declared indicators in trusted scientific sources. These scores are <strong>automated
        decisions</strong> and do not constitute a final binding opinion.
      </p>
      <p>
        <strong>You have the right to request a human review</strong> of any score for a journal you care about.
        Submit a review request at <code>/appeal</code> (under construction) or directly via the email above.
      </p>

      <h2>6. Data Sharing and Recipients</h2>
      <p>We do not sell your data and do not share it for marketing. We rely on the following processors:</p>
      <ul>
        <li><strong>Supabase</strong> (Singapore) — database + authentication. <em>Receives:</em> all your data as a processor.</li>
        <li><strong>Vercel</strong> (United States) — hosting and runtime. <em>Receives:</em> technical data + logs.</li>
        <li><strong>Resend</strong> (United States) — transactional email. <em>Receives:</em> your email address and message content.</li>
        <li><strong>GitHub Inc.</strong> (United States) — code repository and deployment logs. <em>Does not receive:</em> user personal data.</li>
        <li><strong>Vercel's CDN providers</strong> — receive transient IP and User-Agent for site delivery.</li>
      </ul>
      <p>All processors are contractually bound to data-protection standards no lower than PDPL.</p>

      <h2>7. Cross-Border Data Transfer (PDPL Art. 29)</h2>
      <p>
        Because our processors (Supabase, Vercel, Resend, GitHub) are located outside Saudi Arabia, using the
        platform involves transferring your personal data abroad. We perform such transfers only after
        obtaining your separate, explicit Cross-border Transfer Consent at sign-up.
      </p>
      <p>
        <strong>Safeguards applied to transfers:</strong> TLS encryption, strict access control,
        database encryption at rest, and a complete audit log of all access operations.
      </p>
      <p>
        <strong>DPIA:</strong> A formal Data Protection Impact Assessment for cross-border transfers
        is in preparation and will be registered with the Saudi Data and AI Authority (SDAIA) before
        any geographic expansion of the service beyond Saudi Arabia.
      </p>

      <h2>8. Retention Periods</h2>
      <ul>
        <li><strong>Account data:</strong> for the life of your account + 12 months after last sign-in.</li>
        <li><strong>Declined access requests:</strong> 6 months, to allow appeals.</li>
        <li><strong>Consent records:</strong> for the lifetime of the platform as an immutable audit log (PDPL Art. 18).</li>
        <li><strong>Search history:</strong> 90 days, then anonymized; only aggregate statistics are retained.</li>
        <li><strong>Security/audit logs:</strong> 12 months.</li>
      </ul>
      <p>After the retention period, data is permanently deleted or anonymized.</p>

      <h2>9. Your Rights (PDPL Art. 7)</h2>
      <p>You may exercise the following rights by emailing <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>:</p>
      <ul>
        <li><strong>Right to be informed</strong> about your data and how it is processed.</li>
        <li><strong>Right of access</strong> — request a copy of the data we hold on you.</li>
        <li><strong>Right to rectification</strong> — update or correct inaccurate data.</li>
        <li><strong>Right to erasure</strong> ("right to be forgotten") — request deletion when processing is no longer necessary.</li>
        <li><strong>Right to withdraw consent</strong> at any time, without affecting prior lawful processing.</li>
        <li><strong>Right to object to automated decisions</strong> — request human review of any Trust/Risk score.</li>
        <li><strong>Right to lodge a complaint</strong> with the Saudi Data and AI Authority (SDAIA).</li>
      </ul>
      <p>We will respond within 30 days, or notify you of any necessary extension and its justification.</p>
      <p>
        <strong>How these rights are exercised:</strong> Currently, rights requests are processed manually
        via email within 30 days. As the platform grows, a dedicated management page (<code>/data-rights</code>)
        will be added.
      </p>

      <h2>10. Breach Notification (PDPL Art. 19)</h2>
      <p>If a breach occurs that may cause serious harm to data subjects, we commit to:</p>
      <ul>
        <li>Notifying SDAIA within 72 hours of becoming aware of the breach.</li>
        <li>Directly notifying you if the breach affects your data and is likely to cause harm.</li>
        <li>Documenting the nature, impact, and remediation in an internal incident register.</li>
      </ul>

      <h2>11. Security</h2>
      <ul>
        <li>Latest supported TLS versions in transit (TLS 1.2 or higher).</li>
        <li>Encryption at rest for the database.</li>
        <li>Magic-link authentication — no passwords to breach.</li>
        <li>Row Level Security enabled on tables storing user consents and access requests.</li>
        <li>Periodic security reviews and admin audit logs.</li>
      </ul>
      <p>No system is 100% secure. We commit to prompt notification when an incident requires it.</p>

      <h2>12. Cookies</h2>
      <ul>
        <li><strong>Essential:</strong> session token, language preference (no consent required).</li>
        <li><strong>Anonymized analytics:</strong> Vercel Analytics collects anonymized page-performance
          statistics with no personal identification. You may object to this processing by revoking
          "Anonymized Analytics consent" in your account settings.</li>
      </ul>
      <p>We do not use advertising or third-party tracking cookies.</p>

      <h2>13. Minors</h2>
      <p>
        The service is directed to adult researchers (18+) exclusively. When submitting an access
        request, users are required to confirm they are over 18. We do not knowingly collect data
        from minors. If we learn we have collected data from a minor without parental consent, we
        will delete it promptly.
      </p>

      <h2>14. Updates</h2>
      <p>
        We may update this Notice from time to time to reflect legal or operational changes. Material
        updates will be communicated by email at least 14 days before they take effect. The version and
        last-updated date appear at the top of this page.
      </p>

      <h2>15. Governing Law and Jurisdiction</h2>
      <p>
        This Notice is governed by the laws of the Kingdom of Saudi Arabia, in particular the PDPL.
        Any dispute arising from its interpretation or application is subject to the exclusive
        jurisdiction of the competent Saudi courts.
      </p>

      <h2>16. Contact</h2>
      <p>
        For any inquiry or to exercise any of your rights above, contact us at:{' '}
        <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
      </p>
      <p>
        Owner and Data Protection Lead: <strong>Abrar Aseeri</strong>.
      </p>
    </article>
  );
}
