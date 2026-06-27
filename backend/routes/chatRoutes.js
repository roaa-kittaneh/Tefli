const express = require('express');
const router = express.Router();

const SYSTEM_PROMPT = `You are SmartCare Jordan AI, an expert pediatric vaccination assistant designed exclusively for the SmartCare Jordan application.

Your knowledge domain is CHILDHOOD VACCINATION ONLY.

Your primary reference is the Jordan Ministry of Health (MOH) National Immunization Program. When appropriate, you may also rely on internationally accepted guidance (WHO and CDC) as long as it does not contradict the Jordanian vaccination schedule.

YOUR RESPONSIBILITIES:
You should confidently answer ANY question related to childhood vaccination, including but not limited to:
- Jordan vaccination schedule, recommended vaccine ages, missed or delayed vaccines, catch-up vaccination guidance
- Vaccine eligibility, contraindications, precautions, safety, effectiveness
- Common side effects and serious warning signs after vaccination
- Diseases prevented by vaccines
- Fever, pain, or swelling after vaccination
- Vaccination during illness, breastfeeding and vaccines, premature babies and vaccines
- Vaccine doses, booster doses, combination vaccines, live vs inactivated vaccines
- Vaccination records, preparing for vaccination, what to do after vaccination
- Importance of completing vaccine schedules, vaccination myths and misconceptions
- Frequently asked questions from parents

WHEN CHILD AGE IS PROVIDED:
- Use the child's age to tailor the answer.
- Mention which vaccines are expected at that age according to Jordan MOH.
- If vaccines are overdue, explain that the child should visit the nearest MOH health center for a catch-up schedule.
- Never invent vaccination schedules.

Jordan MOH Schedule Reference:
- Birth: BCG + HepB-1
- 2 months: Hexavalent-1 + PCV13-1 + Rotavirus-1
- 4 months: Hexavalent-2 + PCV13-2 + Rotavirus-2
- 6 months: Hexavalent-3 + PCV13-3
- 9 months: Measles (single antigen)
- 12 months: MMR-1 + Meningococcal ACWY
- 18 months: Varicella (Chickenpox)

MISSED VACCINES:
- Explain that vaccination should continue and usually does not need to restart.
- Encourage booking an appointment as soon as possible.
- Never tell parents to skip remaining doses.

SIDE EFFECTS:
Common: Mild fever, pain, redness, swelling, fussiness, sleepiness, temporary appetite loss.
Warning signs needing medical attention: Difficulty breathing, persistent high fever, seizures, severe allergic reactions, continuous crying for several hours, extreme lethargy.
Do NOT diagnose diseases.

OUT OF SCOPE:
If the user asks about unrelated topics (diabetes, cancer, heart disease, pregnancy, adult medicine, surgery), politely explain that SmartCare specializes only in childhood vaccination.

EMERGENCIES:
If the user describes: trouble breathing, blue lips, severe allergic reaction, loss of consciousness, continuous seizures — Immediately advise seeking emergency medical care or going to the nearest hospital.

STYLE:
- Speak in the SAME LANGUAGE as the user. If Arabic, answer COMPLETELY in Arabic.
- Be friendly, reassuring, and warm.
- Explain things in simple language parents can understand.
- Keep answers concise but informative.

NEVER:
- Diagnose illnesses, prescribe medications, recommend drug dosages, replace a physician.
- Invent vaccination schedules or medical facts.
- Give dangerous advice.

OUTPUT FORMAT - CRITICAL:
Always return ONLY valid JSON with NO markdown, NO code blocks, NO text outside JSON.
{
  "intent": "",
  "urgency": "",
  "recommendation": "",
  "message": ""
}
intent: vaccine_schedule | missed_vaccine | side_effects | contraindications | vaccine_information | catch_up_schedule | vaccine_safety | myths | general_info | emergency_referral | out_of_scope
urgency: low | medium | high
Never include Markdown in message. Never break the JSON format.`;


// POST /api/chat
router.post('/', async (req, res) => {
  const { message, child_age_months } = req.body;

  if (!message || typeof message !== 'string' || !message.trim()) {
    return res.status(400).json({ success: false, message: 'الرسالة مطلوبة' });
  }

  const groqApiKey = process.env.GROQ_API_KEY;

  // ── If no Groq key configured, use the smart local rules ──────────────────
  if (!groqApiKey || groqApiKey === 'your_groq_api_key_here') {
    const localAnswer = getLocalAnswer(message.trim(), child_age_months);
    return res.json({
      success: true,
      intent: localAnswer.intent,
      urgency: localAnswer.urgency,
      recommendation: localAnswer.recommendation,
      message: localAnswer.message,
      disclaimer: 'هذه المعلومات للإرشاد العام فقط وليست بديلاً عن الاستشارة الطبية.',
      source: 'local',
    });
  }

  // ── Call Groq API ──────────────────────────────────────────────────────────
  try {
    let userContent = message.trim();
    if (child_age_months !== undefined && child_age_months !== null) {
      userContent += `\n\n[عمر الطفل: ${child_age_months} شهراً]`;
    }

    const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${groqApiKey}`,
      },
      body: JSON.stringify({
        model: 'llama3-8b-8192',
        temperature: 0.3,
        max_tokens: 600,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: userContent },
        ],
      }),
    });

    if (!groqRes.ok) {
      const errText = await groqRes.text();
      console.error('Groq API error:', groqRes.status, errText);
      const localAnswer = getLocalAnswer(message.trim(), child_age_months);
      return res.json({ ...localAnswer, success: true, source: 'local-fallback', disclaimer: 'هذه المعلومات للإرشاد العام فقط.' });
    }

    const data = await groqRes.json();
    const rawText = data.choices?.[0]?.message?.content || '';

    // Parse JSON response from AI
    let parsed = null;
    try {
      const cleaned = rawText.replace(/```(?:json)?/g, '').replace(/```/g, '').trim();
      const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
      if (jsonMatch) parsed = JSON.parse(jsonMatch[0]);
    } catch (e) {
      console.error('Failed to parse AI JSON:', e);
    }

    if (parsed && parsed.message) {
      return res.json({
        success: true,
        intent: parsed.intent || 'general_info',
        urgency: parsed.urgency || 'low',
        recommendation: parsed.recommendation || '',
        message: parsed.message,
        disclaimer: 'هذه المعلومات للإرشاد العام فقط وليست بديلاً عن الاستشارة الطبية المتخصصة.',
        source: 'groq-ai',
      });
    }

    // If JSON parsing failed, use raw text as message
    return res.json({
      success: true,
      intent: 'general_info',
      urgency: detectUrgency(rawText),
      recommendation: '',
      message: rawText,
      disclaimer: 'هذه المعلومات للإرشاد العام فقط وليست بديلاً عن الاستشارة الطبية المتخصصة.',
      source: 'groq-ai',
    });

  } catch (err) {
    console.error('Chat route error:', err);
    const localAnswer = getLocalAnswer(message.trim(), child_age_months);
    return res.json({ ...localAnswer, success: true, source: 'local-fallback', disclaimer: 'هذه المعلومات للإرشاد العام فقط.' });
  }
});

// ── Urgency detection ────────────────────────────────────────────────────────
function detectUrgency(text) {
  const high = /911|طوارئ|إسعاف|خطر|فوراً|لا تتأخر|مستشفى الآن/;
  const medium = /استشر|راجع الطبيب|اذهب للعيادة|احجز موعد/;
  if (high.test(text)) return 'high';
  if (medium.test(text)) return 'medium';
  return 'low';
}

// ── Smart local rule-based answers (fallback when Groq is unavailable) ───────
function getLocalAnswer(msg, ageMonths) {
  const t = msg.toLowerCase();

  const base = (message, urgency = 'low', recommendation = '') => ({
    intent: 'general_info', urgency, recommendation, message,
  });

  if (/مرحب|أهل|سلام|hello|hi|صباح|مساء/.test(t))
    return base('👋 أهلاً بك! أنا الدكتورة لينا، مساعدة طفلي الذكية لتطعيمات الأطفال.\n\nاسألني عن أي شيء:\n• 💉 جداول التطعيمات واللقاحات (BCG، MMR، سداسي، روتا...)\n• 🌡️ الأعراض الجانبية وكيفية التعامل معها\n• ⏭️ ماذا تفعل إذا فات موعد اللقاح\n• 🏥 التطعيم المجاني في الأردن\n\nكيف يمكنني مساعدتك اليوم?');

  if (/حرارة|سخونة|حمى|fever|temperature/.test(t))
    return base('🌡️ **الحمى بعد التطعيم**\n\nالحمى الخفيفة (أقل من 38.5°م) طبيعية تماماً — تعني أن اللقاح يعمل!\n\n**ماذا تفعل:**\n• أعطِ طفلك سوائل كافية\n• ألبسه ملابس خفيفة\n• كمادات ماء فاتر على الجبهة\n• الباراسيتامول حسب وزنه وبتوصية الطبيب\n\n⚠️ **استشر الطبيب فوراً إذا:** تجاوزت 39°م أو استمرت أكثر من 48 ساعة.', 'low', 'راقب درجة الحرارة وأعطِ سوائل كافية');

  if (/ألم|وجع|بكاء|يبكي|عياط|pain|cry/.test(t))
    return base('😢 **البكاء بعد الحقنة طبيعي تماماً**\n\n**لتهدئة طفلك:**\n• احضنه فوراً\n• أرضعيه مباشرة بعد الحقن (المص يهدّئ)\n• كمادة باردة نظيفة على موضع الحقن\n• دلك المنطقة بلطف\n\n❌ تجنب الثلج مباشرة على الجلد.', 'low', 'احضن طفلك وأرضعيه لتهدئته');

  if (/احمرار|تورم|انتفاخ|كتلة|swelling|redness/.test(t))
    return base('🔴 **التورم والاحمرار في موضع الحقن**\n\nهذا شائع وطبيعي ويختفي خلال 3-5 أيام.\n\n🚨 **راجع الطبيب إذا:**\n• انتشر الاحمرار أكثر من 10 سم\n• ظهر صديد أو إفرازات\n• لم يتحسن بعد أسبوع', 'low', 'راقب موضع الحقن وراجع الطبيب إذا تطور');

  if (/حمام|استحمام|يستحم|bath|shower/.test(t))
    return base('🛁 **الاستحمام بعد التطعيم**\n\nنعم! يمكن تحميم طفلك بأمان.\n• استخدم ماء فاتر\n• كن لطيفاً عند غسل منطقة الحقن\n• تجنب الفرك الشديد\n\nالحمام الدافئ يساعد في تهدئة طفلك! 🛁');

  if (/فات|نسيت|تأخر|متأخر|missed|delayed|late|فاتني/.test(t))
    return base('⏰ **موعد التطعيم الفائت**\n\nلا داعي للقلق! لا تبدأ من الصفر.\n\n**ماذا تفعل:**\n• توجه لأقرب مركز صحي حكومي\n• أحضر دفتر تطعيمات الطفل\n• الطبيب سيحدد الجرعة التالية المناسبة\n\n💡 اللقاحات المتأخرة تعمل بفاعلية.', 'medium', 'توجه لأقرب مركز صحي لتحديد الجرعة التالية');

  if (/رضاعة|رضاعه|ارضاع|يرضع|breastfeed|حليب الأم/.test(t))
    return base('🍼 **الرضاعة الطبيعية والتطعيم**\n\nيتكاملان بشكل رائع!\n• الرضاعة تقلل من ألم الحقن والبكاء\n• حليب الأم يعزز مفعول اللقاح\n• يمكنك إرضاعه أثناء أو بعد الحقن مباشرة\n\n✅ اللقاحات آمنة تماماً مع الرضاعة.');

  if (/حساسية|تحسس|طفح|حكة|allergy|allergic/.test(t))
    return base('⚠️ **ردود الفعل التحسسية**\n\nردود الفعل الشديدة نادرة جداً.\n\n🚨 **اتصل بالإسعاف فوراً (911) إذا:**\n• صعوبة تنفس أو ابتلاع\n• تورم الوجه أو اللسان\n• شحوب مفاجئ أو فقدان الوعي\n\nهذه الأعراض تظهر خلال 15-30 دقيقة لذا انتظر في العيادة بعد الحقن.', 'high', 'اتصل بالإسعاف 911 فوراً إذا ظهرت أعراض خطيرة');

  if (/مجاناً|مجانية|مجان|سعر|كلفة|حكومي|مركز صحي|free|cost/.test(t))
    return base('🏥 **التطعيم المجاني في الأردن**\n\nجميع لقاحات الجدول الوطني مجانية!\n\n**أين:** مراكز الرعاية الأولية لوزارة الصحة\n\n**المجانية:** BCG، HepB، السداسي، PCV13، الحصبة، MMR، المكورات السحائية\n\n💡 الروتا وجدري الماء في العيادات الخاصة فقط.');

  if (/جدول|برنامج|مواعيد|متى|schedule|لقاحات الطفل/.test(t))
    return base('📅 **جدول التطعيم الوطني الأردني:**\n\n• **الولادة:** BCG + HepB-1\n• **شهران:** سداسي-1 + PCV13-1 + روتا-1\n• **4 أشهر:** سداسي-2 + PCV13-2 + روتا-2\n• **6 أشهر:** سداسي-3 + PCV13-3\n• **9 أشهر:** حصبة مفردة\n• **12 شهراً:** MMR-1 + مكورات سحائية\n• **18 شهراً:** جدري الماء\n\nجدول طفلك الشخصي موجود في صفحة **التقويم** بالتطبيق!');

  if (/مسكن|باراسيتامول|أدول|بندول|إيبوبروفين|painkiller|paracetamol/.test(t))
    return base('💊 **المسكنات والتطعيم**\n\n**لا تعطِ مسكنات قبل التطعيم.** الباراسيتامول قبل اللقاح يضعف الاستجابة المناعية.\n\n✅ **إذا احتاج بعد التطعيم:** باراسيتامول بجرعة حسب الوزن وبتوجيه الطبيب.', 'low', 'تجنب المسكنات قبل التطعيم');

  if (/وثائق|أوراق|دفتر|هوية|document/.test(t))
    return base('📋 **ما تحتاجه لموعد التطعيم:**\n\n1. دفتر تطعيم الطفل الوطني\n2. شهادة ميلاد الطفل\n3. هوية ولي الأمر\n4. بطاقة التأمين الصحي (إن وجدت)\n5. تطبيق طفلي للسجل الرقمي\n\n💡 الدفتر الورقي ضروري للأختام الرسمية.');

  if (/bcg|بسج|السل|لقاح السل/.test(t))
    return base('💉 **لقاح السل (BCG)**\n\n• **متى:** عند الولادة\n• **يحمي من:** التهاب السحايا السلّي والسل المنتشر\n• **الأثر:** ندبة صغيرة في الكتف — طبيعي جداً\n• **مجاني:** في جميع المراكز الحكومية');

  if (/mmr|حصبة|نكاف|الحصبة الألمانية/.test(t))
    return base('💉 **لقاح MMR (الثلاثي الفيروسي)**\n\n• **يحمي من:** الحصبة + النكاف + الحصبة الألمانية\n• **الجرعة الأولى:** عمر 12 شهراً\n• **الفعالية:** 97٪ ضد الحصبة\n• **أعراض بعد 7-12 يوم:** حمى خفيفة وطفح عابر — طبيعي');

  if (/سداسي|دفتيريا|تيتانوس|سعال ديكي|شلل أطفال|dtp|hexavalent/.test(t))
    return base('💉 **اللقاح السداسي**\n\n**يحمي من 6 أمراض دفعة واحدة:**\nالدفتيريا، التيتانوس، السعال الديكي، شلل الأطفال، Hib، التهاب الكبد B\n\n**مواعيده:** شهرين، 4 أشهر، 6 أشهر\n\n**الآثار الشائعة:** حمى خفيفة وتورم موضع الحقن — تختفي خلال 48 ساعة');

  if (/pcv|مكورات رئوية|رئوي|pneumo/.test(t))
    return base('💉 **لقاح المكورات الرئوية (PCV13)**\n\n• **يحمي من:** الالتهاب الرئوي والتهاب السحايا البكتيري\n• **مواعيده:** شهرين، 4 أشهر، 6 أشهر\n• **مجاني:** في المراكز الحكومية');

  if (/روتا|rotavirus|إسهال/.test(t))
    return base('💊 **لقاح الروتا**\n\n• **نوعه:** قطرات فموية (وليس حقنة!)\n• **يحمي من:** الإسهال الشديد عند الرضّع\n• **مواعيده:** شهرين، 4 أشهر\n• ⚠️ الجرعة الأولى قبل 15 أسبوعاً كحد أقصى\n• **متوفر:** في المستشفيات الخاصة');

  if (/varicella|جدري الماء|عنقز|جديري/.test(t))
    return base('💉 **لقاح جدري الماء (Varicella)**\n\n• **متى:** 18 شهراً\n• **يحمي من:** مرض جدري الماء الفيروسي\n• **متوفر:** في المستشفيات والعيادات الخاصة');

  if (/كبد|هيباتيتس|hepatitis|hepb/.test(t))
    return base('💉 **لقاح التهاب الكبد البائي (HepB)**\n\n• **الجرعة الأولى:** خلال 24 ساعة من الولادة\n• **يحمي من:** التهاب الكبد B المزمن وتشمع الكبد\n• **مجاني:** في جميع المراكز الحكومية');

  if (/خديج|مبتسر|premature|preterm|ناقص شهور/.test(t))
    return base('👶 **تطعيم الأطفال الخدج**\n\nيحتاجون التطعيم بنفس القدر أو أكثر!\n\n• المواعيد تُحسب من **تاريخ الولادة الفعلي**\n• الجدول يبدأ مباشرة بعد الولادة\n\n💡 تحدث مع طبيب الأطفال لخطة مخصصة.');

  if (/طوارئ|خطر|إسعاف|خطير|عاجل|emergency|911/.test(t))
    return base('🚨 **علامات الخطر — اتصل بالإسعاف (911) فوراً:**\n\n• صعوبة في التنفس أو الابتلاع\n• تورم الوجه أو اللسان\n• شحوب شديد أو زرقة\n• فقدان الوعي أو نوبة تشنج', 'high', 'اتصل بالإسعاف 911 الآن');

  if (/مناعة|immunity|كيف يعمل|لماذا اللقاح|فاعلية/.test(t))
    return base('🛡️ **كيف تعمل اللقاحات؟**\n\nاللقاح يُدخل نسخة ضعيفة من الجرثوم، فيتعلم الجهاز المناعي:\n1. التعرف على العدو\n2. بناء أجسام مضادة\n3. تذكّره دائماً\n\n💡 الحمى الخفيفة بعد اللقاح = الجهاز المناعي يعمل!');

  if (/توأم|توأمين|twins/.test(t))
    return base('👶👶 **تطعيم التوائم**\n\nكل طفل يأخذ جرعته الكاملة بشكل مستقل — حتى التوائم المتطابقة.\n\n• في نفس الموعد\n• جرعات منفصلة لكل واحد\n• أماكن حقن مختلفة عند تعدد اللقاحات');

  if (/أعراض جانبية|آثار جانبية|مضاعفات|side effects/.test(t))
    return base('📋 **الآثار الجانبية الشائعة (طبيعية، تختفي خلال 1-3 أيام):**\n\n• 🌡️ حمى خفيفة\n• 🔴 احمرار وتورم موضع الحقن\n• 😢 بكاء وعصبية\n• 😴 نعاس وفقدان شهية\n\n**نادرة (راجع الطبيب):** حمى فوق 39°م أو بكاء أكثر من 3 ساعات\n\n🚨 **طوارئ:** صعوبة تنفس أو تورم وجه — اتصل 911');

  if (/سفر|travel|خارج الأردن|حج|عمرة/.test(t))
    return base('✈️ **لقاحات السفر للأطفال**\n\nأكمل اللقاحات الأساسية أولاً.\n\n**لقاحات إضافية حسب الوجهة:**\n• الحمى الصفراء (أفريقيا، أمريكا الجنوبية)\n• التيفوئيد\n• التهاب الكبد A\n\n💡 استشر طبيب الأطفال قبل 4-6 أسابيع من السفر.', 'medium', 'راجع طبيب الأطفال قبل السفر');

  if (/رشح|زكام|كحة|سعال|مريض|cold|cough/.test(t))
    return base('🤧 **هل يمكن تطعيم طفل مريض؟**\n\n✅ **يمكن التطعيم مع:** رشح خفيف، سعال بسيط، حرارة أقل من 38°م\n\n⏸️ **أجّل إذا:** مرض شديد، حرارة فوق 38°م، طفل خامل جداً\n\n💡 الطاقم الطبي سيفحصه ويقرر.');

  // Fallback
  return base('عذراً، لم أجد إجابة محددة لسؤالك في قاعدة بياناتي حالياً. أعد صياغة سؤالك أو زر أقرب مركز صحي لوزارة الصحة الأردنية.');
}

module.exports = router;
