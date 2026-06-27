import React, { useState, useRef, useEffect } from 'react';
import { useVaccineStore } from '../store/useVaccineStore';
import { Sparkles, Send, User, RefreshCw, Baby, AlertTriangle, Info, Zap } from 'lucide-react';
import type { FAQItem } from '../types';

const AI_API_URL = 'http://localhost:5000';

interface Message {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: Date;
  source?: string;
  urgency?: 'low' | 'medium' | 'high';
  recommendation?: string;
  isAI?: boolean; // true = answered by Groq AI, false = local rules
}

const SUGGESTED_QUESTIONS = [
  'ماذا أفعل إذا أصيب طفلي بالحمى؟',
  'هل يمكن لطفلي الاستحمام بعد التطعيم؟',
  'هل الاحمرار في موقع الحقن طبيعي؟',
  'ما هي الوثائق التي يجب أن أحضرها للعيادة؟',
  'هل يجب إعطاء مسكنات ألم قبل الحقنة؟',
  'ما هي الآثار الجانبية الشائعة؟',
];

const getAIResponse = (input: string, faqs: FAQItem[]): { text: string; source: string } => {
  const t = input.toLowerCase().trim();

  // 1. Search verified FAQs
  const found = faqs.find(f =>
    f.question.toLowerCase().includes(t) ||
    t.includes(f.question.toLowerCase()) ||
    f.question.split(' ').filter(w => w.length > 3 && t.includes(w.toLowerCase())).length >= 2
  );
  if (found) return { text: found.answer, source: found.source || 'وزارة الصحة الأردنية' };

  // 2. Topic matching
  if (/مرحب|أهل|سلام|hello|hi|صباح|مساء/.test(t))
    return { text: '👋 أهلاً بك! أنا المساعدة لينا، مساعد طفلي الذكي للأطفال.\n\nاسألني عن أي شيء في مجال تطعيم الأطفال:\n• 💉 جداول التطعيمات واللقاحات (BCG، MMR، سداسي، روتا...)\n• 🌡️ الأعراض الجانبية وكيفية التعامل معها\n• ⏭️ ماذا تفعل إذا فات موعد اللقاح\n• 🍼 التطعيم مع الرضاعة الطبيعية\n• 🏥 أين تحصل على اللقاحات مجاناً\n\nاسأل أي سؤال يخطر على بالك!', source: 'وزارة الصحة الأردنية' };

  if (/حرارة|سخونة|حمى|fever|temperature/.test(t))
    return { text: '🌡️ الحمى الخفيفة (أقل من 38.5°م) بعد التطعيم طبيعية — تعني أن اللقاح يعمل!\n\n**ماذا تفعل:**\n• أعطِ طفلك سوائل كافية\n• ألبسه ملابس خفيفة\n• كمادات ماء فاتر على الجبهة\n• الباراسيتامول (حسب وزنه) إذا لزم\n\n⚠️ **استشر الطبيب فوراً إذا:** تجاوزت 39°م أو استمرت أكثر من 48 ساعة.', source: 'منظمة الصحة العالمية (WHO)' };

  if (/ألم|وجع|بكاء|يبكي|عياط|pain|cry/.test(t))
    return { text: '😢 البكاء بعد الحقنة طبيعي تماماً.\n\n**لتهدئة طفلك:**\n• احضنه فوراً وواسيه\n• أرضعيه مباشرة بعد الحقن\n• كمادة باردة نظيفة على موضع الحقن\n• دلك المنطقة بلطف\n\n❌ تجنب الثلج مباشرة على الجلد.', source: 'وزارة الصحة الأردنية' };

  if (/احمرار|تورم|انتفاخ|كتلة|swelling|redness/.test(t))
    return { text: '🔴 التورم والاحمرار حول موضع الحقن شائع وطبيعي ويختفي خلال 3-5 أيام.\n\n🚨 **راجع الطبيب إذا:**\n• انتشر الاحمرار أكثر من 10 سم\n• ظهر صديد أو إفرازات\n• لم يتحسن بعد أسبوع', source: 'منظمة الصحة العالمية (WHO)' };

  if (/حمام|استحمام|يستحم|bath|shower/.test(t))
    return { text: '🛁 نعم! يمكن تحميم طفلك بعد التطعيم بأمان.\n\n• استخدم ماء فاتر\n• كن لطيفاً عند غسل منطقة الحقن\n• تجنب الفرك الشديد\n\nالحمام الدافئ يساعد في تهدئة طفلك!', source: 'مراكز السيطرة على الأمراض (CDC)' };

  if (/فات|نسيت|تأخر|متأخر|missed|delayed|late|فاتني/.test(t))
    return { text: '⏰ إذا فات موعد لقاح طفلك، لا داعي للقلق!\n\n**المبدأ:** لا تبدأ من الصفر — استمر من حيث توقفت.\n\n• توجه لأقرب مركز صحي حكومي\n• أحضر دفتر تطعيمات الطفل\n• سيحدد الطبيب الجرعة التالية\n\n💡 اللقاحات المتأخرة تعمل بفاعلية حتى بعد موعدها.', source: 'وزارة الصحة الأردنية' };

  if (/رضاعة|رضاعه|ارضاع|يرضع|breastfeed|حليب الأم/.test(t))
    return { text: '🍼 الرضاعة الطبيعية والتطعيم يتكاملان!\n\n• تقلل من ألم الحقن وبكاء الطفل\n• حليب الأم يعزز مفعول اللقاح\n• يمكنك إرضاعه أثناء أو بعد الحقن\n\n✅ اللقاحات آمنة تماماً مع الرضاعة.', source: 'منظمة الصحة العالمية (WHO)' };

  if (/حساسية|تحسس|طفح|حكة|allergy|allergic/.test(t))
    return { text: '⚠️ ردود الفعل التحسسية الشديدة نادرة جداً.\n\n🚨 **اتصل بالإسعاف فوراً (911) إذا:**\n• صعوبة تنفس أو ابتلاع\n• تورم الوجه أو اللسان\n• شحوب مفاجئ أو فقدان الوعي\n\nهذه الأعراض تظهر خلال 15-30 دقيقة من الحقن.', source: 'منظمة الصحة العالمية (WHO)' };

  if (/مجاناً|مجانية|مجان|سعر|كلفة|حكومي|مركز صحي|free|cost/.test(t))
    return { text: '🏥 جميع لقاحات الجدول الوطني الأردني مجانية!\n\n**أين:** مراكز الرعاية الأولية لوزارة الصحة، مستشفيات حكومية\n\n**المجانية:** BCG، HepB، السداسي، PCV13، الحصبة، MMR\n\n💡 الروتا وجدري الماء في العيادات الخاصة.', source: 'وزارة الصحة الأردنية' };

  if (/جدول|برنامج|مواعيد|متى|schedule/.test(t))
    return { text: '📅 **جدول التطعيم الوطني الأردني:**\n\n• **الولادة:** BCG + HepB-1\n• **شهران:** سداسي-1 + PCV13-1 + روتا-1\n• **4 أشهر:** سداسي-2 + PCV13-2 + روتا-2\n• **6 أشهر:** سداسي-3 + PCV13-3\n• **9 أشهر:** حصبة مفردة\n• **12 شهراً:** MMR-1 + مكورات سحائية\n• **18 شهراً:** جدري الماء\n\nجدول طفلك المخصص موجود في صفحة **التقويم** بالتطبيق!', source: 'وزارة الصحة الأردنية' };

  if (/مسكن|باراسيتامول|أدول|بندول|إيبوبروفين|painkiller|paracetamol/.test(t))
    return { text: '💊 **لا تعطِ مسكنات ألم قبل التطعيم وقاية.**\n\nالباراسيتامول قبل اللقاح قد يضعف الاستجابة المناعية.\n\n✅ **بعد التطعيم فقط:** إذا ظهرت حمى أو ألم، يمكن إعطاء الباراسيتامول بجرعة حسب الوزن وبتوجيه الطبيب.', source: 'منظمة الصحة العالمية (WHO)' };

  if (/وثائق|أوراق|دفتر|هوية|document|booklet|شهادة ميلاد/.test(t))
    return { text: '📋 **ما تحتاجه لموعد التطعيم:**\n\n1. دفتر تطعيم الطفل الوطني\n2. شهادة ميلاد الطفل\n3. هوية ولي الأمر\n4. بطاقة التأمين الصحي (إن وجدت)\n5. تطبيق طفلي للسجل الرقمي', source: 'وزارة الصحة الأردنية' };

  if (/bcg|بسج|لقاح السل|السل/.test(t))
    return { text: '💉 **لقاح السل (BCG):**\n\n• **متى:** عند الولادة\n• **يحمي من:** التهاب السحايا السلّي والسل المنتشر\n• **الأثر:** ندبة صغيرة في الكتف — طبيعي\n• **مجاني:** في جميع المراكز الحكومية', source: 'وزارة الصحة الأردنية' };

  if (/mmr|حصبة|نكاف|الحصبة الألمانية/.test(t))
    return { text: '💉 **لقاح MMR (الثلاثي الفيروسي):**\n\n• **يحمي من:** الحصبة + النكاف + الحصبة الألمانية\n• **الجرعة الأولى:** عمر 12 شهراً\n• **الفعالية:** 97٪ ضد الحصبة\n• **أعراض بعد 7-12 يوم:** حمى خفيفة وطفح عابر — طبيعي', source: 'مراكز السيطرة على الأمراض (CDC)' };

  if (/سداسي|دفتيريا|تيتانوس|سعال ديكي|شلل أطفال|dtp|hexavalent/.test(t))
    return { text: '💉 **اللقاح السداسي:**\n\n**يحمي من 6 أمراض:** الدفتيريا، التيتانوس، السعال الديكي، شلل الأطفال، Hib، التهاب الكبد B\n\n**مواعيده:** شهرين، 4 أشهر، 6 أشهر\n\n**الآثار الشائعة:** حمى خفيفة وتورم موضع الحقن — تختفي خلال 48 ساعة.', source: 'وزارة الصحة الأردنية' };

  if (/pcv|مكورات رئوية|رئوي|pneumo/.test(t))
    return { text: '💉 **لقاح المكورات الرئوية (PCV13):**\n\n• **يحمي من:** الالتهاب الرئوي والتهاب السحايا البكتيري\n• **مواعيده:** شهرين، 4 أشهر، 6 أشهر\n• **مجاني:** في المراكز الحكومية', source: 'وزارة الصحة الأردنية' };

  if (/روتا|rotavirus|إسهال/.test(t))
    return { text: '💊 **لقاح الروتا:**\n\n• **نوعه:** قطرات فموية (وليس حقنة!)\n• **يحمي من:** الإسهال الشديد عند الرضّع\n• **مواعيده:** شهرين، 4 أشهر\n• ⚠️ الجرعة الأولى قبل 15 أسبوعاً كحد أقصى\n• **متوفر:** في المستشفيات الخاصة', source: 'وزارة الصحة الأردنية' };

  if (/varicella|جدري الماء|عنقز|جديري/.test(t))
    return { text: '💉 **لقاح جدري الماء (Varicella):**\n\n• **متى:** 18 شهراً\n• **يحمي من:** مرض جدري الماء الفيروسي\n• **متوفر:** في المستشفيات والعيادات الخاصة', source: 'مراكز السيطرة على الأمراض (CDC)' };

  if (/كبد|هيباتيتس|hepatitis|hepb/.test(t))
    return { text: '💉 **لقاح التهاب الكبد البائي (HepB):**\n\n• **الجرعة الأولى:** خلال 24 ساعة من الولادة\n• **يحمي من:** التهاب الكبد B المزمن وتشمع الكبد\n• **مجاني:** في جميع المراكز الحكومية', source: 'وزارة الصحة الأردنية' };

  if (/خديج|مبتسر|premature|preterm|ناقص شهور/.test(t))
    return { text: '👶 الأطفال الخدج يحتاجون التطعيم بنفس القدر!\n\n• المواعيد تُحسب من **تاريخ الولادة الفعلي**\n• الجدول يبدأ مباشرة بعد الولادة\n\n💡 تحدث مع طبيب الأطفال لخطة مخصصة.', source: 'منظمة الصحة العالمية (WHO)' };

  if (/طوارئ|خطر|إسعاف|خطير|عاجل|emergency|911/.test(t))
    return { text: '🚨 **علامات الخطر — اتصل بالإسعاف (911) فوراً:**\n\n• صعوبة في التنفس أو الابتلاع\n• تورم الوجه أو اللسان\n• شحوب شديد أو زرقة\n• فقدان الوعي أو نوبة تشنج', source: 'وزارة الصحة الأردنية' };

  if (/مناعة|immunity|كيف يعمل|لماذا اللقاح|فاعلية|أهمية التطعيم/.test(t))
    return { text: '🛡️ **كيف تعمل اللقاحات؟**\n\nاللقاح يُدخل نسخة ضعيفة من الجرثوم، فيتعلم الجهاز المناعي:\n1. التعرف على العدو\n2. بناء أجسام مضادة\n3. تذكّره دائماً\n\n💡 الحمى الخفيفة بعد اللقاح = الجهاز المناعي يعمل!', source: 'مراكز السيطرة على الأمراض (CDC)' };

  if (/توأم|توأمين|twins/.test(t))
    return { text: '👶👶 **تطعيم التوائم:**\n\nكل طفل يأخذ جرعته الكاملة بشكل مستقل — حتى المتطابقة.\n\n• في نفس الموعد\n• جرعات منفصلة لكل واحد\n• أماكن حقن مختلفة عند تعدد اللقاحات', source: 'منظمة الصحة العالمية (WHO)' };

  if (/أعراض جانبية|آثار جانبية|مضاعفات|side effects/.test(t))
    return { text: '📋 **الآثار الجانبية الشائعة (طبيعية، تختفي خلال 1-3 أيام):**\n\n• 🌡️ حمى خفيفة\n• 🔴 احمرار وتورم موضع الحقن\n• 😢 بكاء وعصبية\n• 😴 نعاس وفقدان شهية\n\n**نادرة (راجع الطبيب):** حمى فوق 39°م أو بكاء أكثر من 3 ساعات\n\n🚨 **طوارئ:** صعوبة تنفس أو تورم وجه — اتصل 911', source: 'منظمة الصحة العالمية (WHO)' };

  if (/سفر|travel|خارج الأردن|حج|عمرة/.test(t))
    return { text: '✈️ **لقاحات السفر للأطفال:**\n\nأكمل اللقاحات الأساسية أولاً. قد تحتاج إضافياً:\n• الحمى الصفراء (أفريقيا، أمريكا الجنوبية)\n• التيفوئيد (بعض الدول النامية)\n• التهاب الكبد A\n\n💡 استشر طبيب الأطفال قبل 4-6 أسابيع من السفر.', source: 'منظمة الصحة العالمية (WHO)' };

  if (/رشح|زكام|كحة|سعال|cold|cough/.test(t))
    return { text: '🤧 **هل يمكن تطعيم طفل مريض؟**\n\n✅ **يمكن التطعيم مع:** رشح خفيف، سعال بسيط، حرارة أقل من 38°م\n\n⏸️ **أجّل إذا:** مرض شديد أو حرارة فوق 38°م أو طفل خامل جداً\n\n💡 الطاقم الطبي سيفحصه ويقرر.', source: 'وزارة الصحة الأردنية' };

  // Fallback
  return {
    text: 'عذراً، لم أجد إجابة محددة لسؤالك في قاعدة بياناتي حالياً.\n\nللحصول على إجابة دقيقة:\n• أعد صياغة سؤالك بكلمات مختلفة\n• زر أقرب مركز صحي لوزارة الصحة الأردنية\n• اتصل بطبيب أطفال مرخص',
    source: 'unverified'
  };
};


export const ChatbotPage: React.FC = () => {
  const { faqs, children, selectedChildId } = useVaccineStore();
  const selectedChild = children.find(c => c.id === selectedChildId) || children[0];
  const childAgeMonths = selectedChild
    ? Math.floor((Date.now() - new Date(selectedChild.dateOfBirth).getTime()) / (1000 * 60 * 60 * 24 * 30.4375))
    : undefined;

  const [messages, setMessages] = useState<Message[]>([
    {
      id: '0',
      sender: 'ai',
      text: `مرحباً بك! أنا المساعدة لينا، مساعدتك الذكية المتخصصة في التطعيمات لدى الأطفال — مدعومة بتقنية الذكاء الاصطناعي المتوافقة مع إرشادات وزارة الصحة الأردنية. يمكنني الإجابة على أسئلتك حول جداول التطعيم، الأعراض الجانبية، والعناية بطفلك. كيف يمكنني مساعدتك اليوم؟`,
      timestamp: new Date(),
      source: 'ذكاء اصطناعي · Dr. Lena',
      isAI: true,
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [aiOnline, setAiOnline] = useState<boolean | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Check if AI server is reachable
  useEffect(() => {
    fetch(`${AI_API_URL}/api/health`)
      .then(r => r.json())
      .then(data => {
        if (data && data.groq_configured) {
          setAiOnline(true);
        } else {
          setAiOnline(false);
        }
      })
      .catch(() => setAiOnline(false));
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const sendMessage = async (text: string) => {
    if (!text.trim()) return;

    const userMsg: Message = {
      id: `u-${Date.now()}`,
      sender: 'user',
      text: text.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputValue('');
    setIsTyping(true);

    try {
      // 1. Try the backend AI endpoint
      const res = await fetch(`${AI_API_URL}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text.trim(),
          child_age_months: childAgeMonths,
          language: 'ar',
        }),
        signal: AbortSignal.timeout(12000),
      });

      if (res.ok) {
        const data = await res.json();
        setAiOnline(data.source === 'groq-ai');
        const aiMsg: Message = {
          id: `a-${Date.now()}`,
          sender: 'ai',
          text: data.message,
          timestamp: new Date(),
          source: data.source === 'groq-ai' ? 'ذكاء اصطناعي · Dr. Lena' : 'وزارة الصحة الأردنية',
          urgency: data.urgency,
          recommendation: data.recommendation,
          isAI: data.source === 'groq-ai',
        };
        setMessages((prev) => [...prev, aiMsg]);
        setIsTyping(false);
        return;
      }
    } catch {
      setAiOnline(false);
    }

    // 2. Fallback to local rule-based response
    const { text: responseText, source: responseSource } = getAIResponse(text.trim(), faqs);
    const delay = Math.min(800 + responseText.length * 1.5, 2000);
    setTimeout(() => {
      const aiMsg: Message = {
        id: `a-${Date.now()}`,
        sender: 'ai',
        text: responseText,
        timestamp: new Date(),
        source: responseSource,
        isAI: false,
      };
      setMessages((prev) => [...prev, aiMsg]);
      setIsTyping(false);
    }, delay);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(inputValue);
  };

  const clearChat = () => {
    setMessages([
      {
        id: '0',
        sender: 'ai',
        text: `تم مسح المحادثة! كيف يمكنني مساعدتك اليوم؟`,
        timestamp: new Date(),
        source: 'وزارة الصحة الأردنية'
      },
    ]);
  };

  const renderText = (text: string) => {
    return text.split('\n').map((line, i) => {
      const parts = line.split(/\*\*(.*?)\*\*/g);
      return (
        <p key={i} className={line === '' ? 'h-2' : 'leading-relaxed text-right'}>
          {parts.map((part, j) =>
            j % 2 === 1 ? (
              <strong key={j} className="font-bold">
                {part}
              </strong>
            ) : (
              <span key={j}>{part}</span>
            )
          )}
        </p>
      );
    });
  };

  const formatTime = (date: Date) =>
    date.toLocaleTimeString('ar-JO', { hour: '2-digit', minute: '2-digit', hour12: true });

  return (
    <div className="flex-1 flex flex-col h-screen md:h-auto md:min-h-[calc(100vh-0px)] animate-fade-in pb-16 md:pb-0">
      {/* Header */}
      <div className="bg-white border-b border-[#BAC8B1]/30 px-4 md:px-8 py-4 flex items-center justify-between flex-shrink-0 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#7B9669] to-[#6C8480] flex items-center justify-center shadow-md shadow-[#7B9669]/20">
            <Sparkles size={18} className="text-white" />
          </div>
          <div className="text-right">
            <h2 className="font-extrabold text-[#404E3B] text-base leading-none">المساعدة لينا · مساعد طفلي الذكي</h2>
          </div>
        </div>
        <button
          onClick={clearChat}
          className="flex items-center gap-1.5 text-xs font-semibold text-[#6C8480] hover:text-[#404E3B] bg-[#BAC8B1]/20 hover:bg-[#BAC8B1]/30 px-3 py-2 rounded-xl transition-all"
        >
          <RefreshCw size={13} /> مسح
        </button>
      </div>

      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Suggested Questions (Desktop) */}
        <aside className="md:w-72 bg-white border-l border-[#BAC8B1]/30 flex-shrink-0 overflow-y-auto md:block hidden text-right">
          <div className="p-5">
            <p className="text-[10px] font-bold text-[#6C8480] uppercase tracking-widest mb-4">أسئلة مقترحة</p>
            <div className="space-y-2">
              {SUGGESTED_QUESTIONS.map((q) => (
                <button
                  key={q}
                  onClick={() => sendMessage(q)}
                  className="w-full text-right text-xs font-medium text-[#404E3B] bg-[#BAC8B1]/10 hover:bg-[#7B9669]/10 hover:text-[#7B9669] border border-[#BAC8B1]/30 hover:border-[#7B9669]/30 px-3.5 py-3 rounded-2xl transition-all leading-relaxed"
                >
                  {q}
                </button>
              ))}
            </div>

            <div className="mt-6 bg-amber-50 border border-amber-200/60 rounded-2xl p-4">
              <p className="text-[10px] text-amber-700 font-semibold leading-relaxed">
                ⚠️ يقدم هذا المساعد إرشادات عامة فقط بناءً على المراجع الطبية. استشر دائماً طبيب أطفال مرخص للقرارات التشخيصية والطبية.
              </p>
            </div>
          </div>
        </aside>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Mobile: Suggested Questions */}
          <div className="md:hidden px-4 py-3 border-b border-[#BAC8B1]/20 bg-white flex-shrink-0">
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
              {SUGGESTED_QUESTIONS.map((q) => (
                <button
                  key={q}
                  onClick={() => sendMessage(q)}
                  className="whitespace-nowrap text-[11px] font-medium text-[#404E3B] bg-[#BAC8B1]/20 hover:bg-[#7B9669]/10 border border-[#BAC8B1]/30 px-3 py-1.5 rounded-full transition-all flex-shrink-0"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>

          {/* Messages Container */}
          <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 bg-gray-50/50">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex items-start gap-3 max-w-[90%] md:max-w-[75%] animate-fade-in ${msg.sender === 'user' ? 'mr-auto flex-row-reverse' : ''}`}
              >
                {/* Avatar */}
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm ${msg.sender === 'user' ? 'bg-[#BAC8B1] text-white' : 'bg-gradient-to-br from-[#7B9669] to-[#6C8480] text-white'
                    }`}
                >
                  {msg.sender === 'user' ? <User size={15} /> : <Baby size={15} />}
                </div>

                {/* Bubble */}
                <div className="flex flex-col gap-1 w-full text-right">
                  <div
                    className={`px-4 py-3 rounded-3xl text-sm leading-relaxed shadow-sm ${msg.sender === 'user'
                        ? 'bg-[#404E3B] text-white rounded-tl-none text-right'
                        : 'bg-white text-[#404E3B] border border-[#BAC8B1]/20 rounded-tr-none text-right'
                      }`}
                  >
                    <div className="space-y-1">{renderText(msg.text)}</div>

                    {/* AI Meta: urgency + recommendation + source */}
                    {msg.sender === 'ai' && (
                      <div className="mt-2.5 pt-2 border-t border-[#BAC8B1]/10 space-y-1.5">
                        {/* Urgency badge */}
                        {msg.urgency && (
                          <div className="flex justify-start">
                            {msg.urgency === 'high' ? (
                              <span className="bg-red-50 text-red-700 border border-red-200 text-[9px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1">
                                <AlertTriangle size={9} /> أولوية عالية
                              </span>
                            ) : msg.urgency === 'medium' ? (
                              <span className="bg-amber-50 text-amber-700 border border-amber-200 text-[9px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1">
                                <Info size={9} /> أولوية متوسطة
                              </span>
                            ) : (
                              <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[9px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1">
                                <Zap size={9} /> معلوماتي
                              </span>
                            )}
                          </div>
                        )}
                        {/* Recommendation */}
                        {msg.recommendation && (
                          <p className="text-[10px] text-[#6C8480] font-semibold bg-[#BAC8B1]/10 px-2.5 py-1.5 rounded-lg text-right leading-relaxed">
                            💡 {msg.recommendation}
                          </p>
                        )}
                        {/* Source badge */}
                        <div className="flex justify-start">
                          {msg.isAI ? (
                            <span className="bg-purple-50 text-purple-700 border border-purple-200 text-[9px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1">
                              🤖 {msg.source || 'ذكاء اصطناعي · Dr. Lena'}
                            </span>
                          ) : msg.source && msg.source !== 'unverified' ? (
                            <span className="bg-green-50 text-green-700 border border-green-200 text-[9px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1">
                              🛡️ {msg.source}
                            </span>
                          ) : (
                            <span className="bg-red-50 text-red-700 border border-red-200 text-[9px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1">
                              ⚠️ إجابة استرشادية
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                  <span className={`text-[10px] font-semibold text-[#6C8480]/70 ${msg.sender === 'user' ? 'text-left' : 'text-right'} px-1`}>
                    {formatTime(msg.timestamp)}
                  </span>
                </div>
              </div>
            ))}

            {/* Typing Indicator */}
            {isTyping && (
              <div className="flex items-start gap-3 max-w-[85%] animate-fade-in">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#7B9669] to-[#6C8480] text-white flex items-center justify-center flex-shrink-0 shadow-sm">
                  <Baby size={15} />
                </div>
                <div className="bg-white border border-[#BAC8B1]/20 px-4 py-3 rounded-2xl rounded-tr-none shadow-sm flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 bg-[#7B9669] rounded-full animate-bounce [animation-delay:0ms]" />
                  <span className="w-1.5 h-1.5 bg-[#7B9669] rounded-full animate-bounce [animation-delay:150ms]" />
                  <span className="w-1.5 h-1.5 bg-[#7B9669] rounded-full animate-bounce [animation-delay:300ms]" />
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="bg-white border-t border-[#BAC8B1]/20 p-4 flex-shrink-0">
            <form onSubmit={handleSubmit} className="flex gap-3 items-end">
              <div className="flex-1 relative">
                <input
                  ref={inputRef}
                  type="text"
                  placeholder="اسأل عن اللقاحات، الآثار الجانبية، رعاية الطفل..."
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  disabled={isTyping}
                  className="w-full bg-[#E6E6E6]/60 border border-[#BAC8B1]/40 rounded-2xl px-5 py-3.5 pl-12 text-sm text-[#404E3B] font-medium focus:outline-none focus:border-[#7B9669] focus:bg-white transition-all placeholder:text-[#6C8480]/60 disabled:opacity-50 text-right"
                />
                {inputValue && (
                  <button
                    type="button"
                    onClick={() => setInputValue('')}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6C8480] hover:text-[#404E3B] text-lg leading-none transition-colors"
                  >
                    ×
                  </button>
                )}
              </div>
              <button
                type="submit"
                disabled={isTyping || !inputValue.trim()}
                className="bg-gradient-to-br from-[#7B9669] to-[#6C8480] hover:from-[#7B9669]/90 hover:to-[#6C8480]/90 text-white p-3.5 rounded-2xl transition-all shadow-md shadow-[#7B9669]/20 disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
              >
                <Send size={18} />
              </button>
            </form>
            <p className="text-[10px] text-[#6C8480]/70 text-center mt-2 font-medium">
              🤖 إرشادات عامة فقط - يرجى استشارة طبيبك في الحالات الطارئة
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
