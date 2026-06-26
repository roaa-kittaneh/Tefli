import React, { useState, useRef, useEffect } from 'react';
import { useVaccineStore } from '../store/useVaccineStore';
import { Sparkles, Send, User, RefreshCw, Baby } from 'lucide-react';

interface Message {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: Date;
}

const SUGGESTED_QUESTIONS = [
  'ماذا أفعل إذا أصيب طفلي بالحمى؟',
  'هل يمكن لطفلي الاستحمام بعد التطعيم؟',
  'هل الاحمرار في موقع الحقن طبيعي؟',
  'ما هي الوثائق التي يجب أن أحضرها للعيادة؟',
  'هل يجب إعطاء مسكنات ألم قبل الحقنة؟',
  'ما هي الآثار الجانبية الشائعة؟',
];

const getAIResponse = (input: string): string => {
  const text = input.toLowerCase();

  if (
    text.includes('fever') ||
    text.includes('temperature') ||
    text.includes('hot') ||
    text.includes('حرارة') ||
    text.includes('سخونة') ||
    text.includes('حمى')
  ) {
    return "🌡️ الحمى الخفيفة (أقل من 38.5 درجة مئوية) بعد التطعيم هي استجابة مناعية طبيعية - وهذا يعني أن اللقاح يعمل!\n\n**ماذا تفعل:**\n• قدم لطفلك الكثير من السوائل (الرضاعة الطبيعية أو الحليب الصناعي بشكل متكرر)\n• ألبس طفلك ملابس خفيفة ومريحة\n• ضع كمادات ماء فاتر على جبهته\n• يمكن إعطاء الباراسيتامول (الجرعة حسب الوزن) إذا أوصى طبيبك بذلك\n\n⚠️ **استشر الطبيب فوراً إذا:** تجاوزت الحرارة 39 درجة مئوية، أو استمرت لأكثر من 48 ساعة، أو بدا الطفل متعباً وخاملاً بشكل غير طبيعي.";
  }

  if (
    text.includes('pain') ||
    text.includes('cry') ||
    text.includes('sore') ||
    text.includes('hurt') ||
    text.includes('ألم') ||
    text.includes('وجع') ||
    text.includes('بكاء') ||
    text.includes('يبكي') ||
    text.includes('يصيح')
  ) {
    return "😢 من الطبيعي جداً أن يبكي الطفل بعد الحقنة بسبب الألم المؤقت للوخز.\n\n**لتهدئة طفلك:**\n• احضن طفلك وواسه فوراً\n• أرضعه طبيعياً أو صناعياً بعد الحقنة مباشرة (المص يساعد على التهدئة)\n• ضع كمادة نظيفة وباردة على موضع الحقن\n• دلك المنطقة بلطف شديد (إلا إذا نصحك الطبيب بغير ذلك)\n\n❌ **تجنب:** التدليك العنيف أو وضع الثلج مباشرة على الجلد.";
  }

  if (
    text.includes('bath') ||
    text.includes('shower') ||
    text.includes('wash') ||
    text.includes('swim') ||
    text.includes('حمام') ||
    text.includes('استحمام') ||
    text.includes('يستحم') ||
    text.includes('سباحة')
  ) {
    return "🛁 نعم! من الآمن تماماً تحميم طفلك بعد التطعيم.\n\n**نصائح:**\n• استخدم ماءً فاتراً (وليس ساخناً)\n• كن لطيفاً عند تنظيف منطقة موضع الحقن\n• تجنب فرك أو حك موضع الحقنة\n• جفف المنطقة برفق بقطعة قماش ناعمة\n\nالحمام الدافئ يمكن أن يساعد في استرخاء وتهدئة طفلك بعد التطعيم!";
  }

  if (
    text.includes('swelling') ||
    text.includes('lump') ||
    text.includes('bump') ||
    text.includes('redness') ||
    text.includes('red') ||
    text.includes('احمرار') ||
    text.includes('تورم') ||
    text.includes('انتفاخ') ||
    text.includes('كتلة') ||
    text.includes('حبة')
  ) {
    return "🔴 ظهور تورم خفيف أو احمرار أو كتلة صغيرة في موضع الحقن أمر طبيعي وشائع جداً.\n\n**ماذا يحدث:** جهاز طفلك المناعي يتفاعل مع اللقاح - وهذا أمر متوقع!\n\n**من المفترض أن:**\n• يقل حجم التورم تدريجياً خلال أيام إلى بضعة أسابيع\n• لا يسبب أكثر من انزعاج خفيف للطفل\n\n**استشير الطبيب إذا:**\n• انتشر الاحمرار لمساحة أكبر من 10 سم\n• كان موضع الحقنة ساخناً جداً، أو صلباً، أو يخرج منه صديد\n• كبر حجم الكتلة بدلاً من أن يصغر بعد مرور أسبوعين";
  }

  if (
    text.includes('cold') ||
    text.includes('sick') ||
    text.includes('cough') ||
    text.includes('runny nose') ||
    text.includes('sneezing') ||
    text.includes('رشح') ||
    text.includes('زكام') ||
    text.includes('كحة') ||
    text.includes('سعال') ||
    text.includes('مريض') ||
    text.includes('مرض')
  ) {
    return "🤧 الأمراض البسيطة لا تمنع عادة من أخذ التطعيم.\n\n**من الآمن عموماً التطعيم في الحالات التالية:**\n• الرشح الخفيف، أو سيلان الأنف، أو السعال البسيط\n• الحرارة المنخفضة (أقل من 38 درجة مئوية)\n• إذا كان الطفل نشيطاً ومتفاعلاً بشكل طبيعي\n\n**يُنصح بتأجيل التطعيم إذا:**\n• كان المرض متوسطاً أو شديداً\n• كانت الحرارة أعلى من 38 درجة مئوية\n• بدا الطفل مريضاً جداً أو خاملاً\n\n💡 دع الممرض أو الطبيب في المركز يفحص طفلك أولاً وسيقومون بتقديم النصيحة الأنسب.";
  }

  if (
    text.includes('painkiller') ||
    text.includes('paracetamol') ||
    text.includes('ibuprofen') ||
    text.includes('medicine before') ||
    text.includes('preventative') ||
    text.includes('مسكن') ||
    text.includes('باراسيتامول') ||
    text.includes('ريفو') ||
    text.includes('أدول') ||
    text.includes('بندول') ||
    text.includes('إيبوبروفين') ||
    text.includes('علاج') ||
    text.includes('دواء')
  ) {
    return "💊 **لا تعطي طفلك مسكنات الألم قبل التطعيم كإجراء وقائي.**\n\nهذه توصية هامة من الهيئات الصحية لطب الأطفال.\n\n**لماذا؟** تشير الدراسات إلى أن إعطاء الباراسيتامول أو الإيبوبروفين *قبل* التطعيم قد يقلل قليلاً من الاستجابة المناعية للجسم تجاه بعض اللقاحات، مما يقلل من فعاليتها.\n\n✅ **ماذا تفعل بدلاً من ذلك:** انتظر وراقب طفلك. إذا أصيب بحمى أو ألم واضح *بعد* التطعيم، يمكنك إعطاؤه الباراسيتامول المخصص لعمره بجرعة تعتمد على وزنه وبتوصية الطبيب.";
  }

  if (
    text.includes('document') ||
    text.includes('bring') ||
    text.includes('booklet') ||
    text.includes('papers') ||
    text.includes('id') ||
    text.includes('وثائق') ||
    text.includes('أوراق') ||
    text.includes('دفتر') ||
    text.includes('هوية') ||
    text.includes('إثبات')
  ) {
    return "📋 **الوثائق المطلوبة لإحضارها لعيادة التطعيم:**\n\n1. **الدفتر الصحي للطفل (الدفتر الورقي الوطني)** — لتسجيل وتوثيق المطاعيم بالأختام الرسمية\n2. **شهادة ميلاد الطفل أو صورة عن الهوية**\n3. **الهوية الشخصية لولي الأمر**\n4. **بطاقة التأمين الصحي** (إن وجدت)\n5. **تطبيق تفلي** — لعرض السجل الرقمي والمتابعة\n\n💡 على الرغم من سهولة استخدام تطبيق تفلي رقمياً، إلا أن الدفتر الورقي ضروري للأختام الرسمية في المراكز الصحية الحكومية.";
  }

  if (
    text.includes('schedule') ||
    text.includes('when') ||
    text.includes('next') ||
    text.includes('age') ||
    text.includes('months') ||
    text.includes('جدول') ||
    text.includes('برنامج') ||
    text.includes('مواعيد') ||
    text.includes('متى')
  ) {
    return "📅 **أبرز مواعيد جدول التطعيم الوطني الأردني:**\n\n• **عند الولادة:** السل (BCG)، التهاب الكبد البائي (HepB-1)\n• **شهران:** اللقاح السداسي-1، المكورات الرئوية-1، الروتا-1\n• **4 أشهر:** اللقاح السداسي-2، المكورات الرئوية-2، الروتا-2\n• **6 أشهر:** اللقاح السداسي-3، المكورات الرئوية-3\n• **9 أشهر:** الحصبة المفردة\n• **12 شهراً:** الثلاثي الفيروسي-1 (MMR-1)، المكورات السحائية\n• **18 شهراً:** جدري الماء-1\n• **4-6 سنوات:** الثلاثي الفيروسي-2، جدري الماء-2، منشط ثنائي الأطفال\n\nيمكنك الاطلاع على جدول طفلك المخصص بالكامل في صفحة **التقويم** في التطبيق!";
  }

  if (
    text.includes('hello') ||
    text.includes('hi') ||
    text.includes('hey') ||
    text.includes('salam') ||
    text.includes('مرحبا') ||
    text.includes('أهلاً') ||
    text.includes('السلام') ||
    text.includes('سلا')
  ) {
    return "👋 أهلاً بك! أنا مساعد تفلي الصحي الذكي للأطفال.\n\nأنا هنا للإجابة على أسئلتك حول:\n• 💉 جداول التطعيمات والإرشادات الوطنية\n• 🤒 التعامل مع الأعراض الجانبية بعد الحقن\n• 📋 الأوراق والوثائق المطلوبة في المواعيد\n• ❓ العناية العامة بالطفل بعد التطعيم\n\nما الذي ترغب في معرفته اليوم؟";
  }

  if (
    text.includes('breastfeed') ||
    text.includes('feed') ||
    text.includes('eat') ||
    text.includes('milk') ||
    text.includes('formula') ||
    text.includes('رضاعة') ||
    text.includes('حليب') ||
    text.includes('رضع') ||
    text.includes('طعام') ||
    text.includes('أكل')
  ) {
    return "🍼 **الرضاعة والتغذية قبل وبعد التطعيم:**\n\n• **قبل التطعيم:** أطعم طفلك كالمعتاد - لا توجد شروط صيام قبل اللقاحات\n• **أثناء التطعيم:** تسمح بعض المراكز بالرضاعة أثناء الحقن، حيث تساعد على تهدئة الطفل بشكل كبير!\n• **بعد التطعيم:** قدم لطفلك رضعات إضافية. عملية المص تعد مسكناً طبيعياً ممتازاً للألم ومصدراً للطمأنينة.\n\nالترطيب الجيد بعد التطعيم مهم جداً للمساعدة في خفض أي حمى خفيفة.";
  }

  if (
    text.includes('sleep') ||
    text.includes('sleepy') ||
    text.includes('tired') ||
    text.includes('drowsy') ||
    text.includes('نوم') ||
    text.includes('ينام') ||
    text.includes('خمول') ||
    text.includes('تعب') ||
    text.includes('نعاس')
  ) {
    return "😴 زيادة النوم بعد التطعيم أمر **طبيعي تماماً** بل وهو علامة جيدة تدل على أن جهاز طفلك المناعي يعمل بجد ويستجيب للقاح!\n\n**ما المتوقع:**\n• قد ينام الطفل أكثر من المعتاد لمدة يوم أو يومين\n• قد يكون سريع الانفعال أو أقل رغبة في الرضاعة لفترة وجيزة\n• تزول هذه الأعراض من تلقاء نفسها\n\n✅ **افعل:** دعه يرتاح وينام بقدر ما يحتاج\n\n⚠️ **استشر الطبيب إذا:** كان من الصعب جداً إيقاظ الطفل، أو رفض الرضاعة تماماً، أو بكى بكاءً متواصلاً بنبرة حادة ولفترات طويلة.";
  }

  return "🌿 شكراً لسؤالك! بينما أبذل قصارى جهدي لتوفير إرشادات عامة حول تطعيمات الأطفال بناءً على الجداول الصحية المعتمدة، فإنني أنصح دائماً باستشارة طبيب الأطفال الخاص بك أو زيارة مركز صحي معتمد للحصول على نصيحة طبية مخصصة.\n\n**يمكنني مساعدتك في الإجابة على أسئلة حول:**\n• الحمى، الاحمرار، التورم، البكاء بعد اللقاح\n• رعاية الطفل قبل وبعد التطعيم\n• جدول التطعيمات الوطني الأردني\n• الوثائق المطلوبة في المراكز الصحية\n\nحاول سؤالي عن شيء محدد مثل: *\"ماذا أفعل إذا أصيب طفلي بحمى؟\"*";
};

export const ChatbotPage: React.FC = () => {
  const { currentUser } = useVaccineStore();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '0',
      sender: 'ai',
      text: `👋 مرحباً${currentUser ? '، ' + currentUser.name.split(' ')[0] : ''}! أنا **مساعد تفلي الذكي**.\n\nيمكنني الإجابة على أسئلتك حول مواعيد اللقاحات، التعامل مع الأعراض الجانبية، رعاية طفلك قبل وبعد الحقن، والمزيد. كيف يمكنني مساعدتك اليوم؟`,
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const sendMessage = (text: string) => {
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

    // Simulate realistic typing delay based on response length
    const response = getAIResponse(text.trim());
    const delay = Math.min(800 + response.length * 1.5, 2500);

    setTimeout(() => {
      const aiMsg: Message = {
        id: `a-${Date.now()}`,
        sender: 'ai',
        text: response,
        timestamp: new Date(),
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
      },
    ]);
  };

  // Render message text with simple markdown-like formatting
  const renderText = (text: string) => {
    return text.split('\n').map((line, i) => {
      // Bold text
      const parts = line.split(/\*\*(.*?)\*\*/g);
      return (
        <p key={i} className={line === '' ? 'h-2' : 'leading-relaxed'}>
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
      {/* Page Header */}
      <div className="bg-white border-b border-[#BAC8B1]/30 px-4 md:px-8 py-4 flex items-center justify-between flex-shrink-0 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#7B9669] to-[#6C8480] flex items-center justify-center shadow-md shadow-[#7B9669]/20">
            <Sparkles size={18} className="text-white" />
          </div>
          <div>
            <h2 className="font-extrabold text-[#404E3B] text-base leading-none">مساعد تفلي الذكي</h2>
            <p className="text-[11px] text-[#6C8480] font-semibold flex items-center gap-1 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
              إرشادات حول تطعيمات الأطفال
            </p>
          </div>
        </div>
        <button
          onClick={clearChat}
          className="flex items-center gap-1.5 text-xs font-semibold text-[#6C8480] hover:text-[#404E3B] bg-[#BAC8B1]/20 hover:bg-[#BAC8B1]/30 px-3 py-2 rounded-xl transition-all"
        >
          <RefreshCw size={13} /> مسح المحادثة
        </button>
      </div>

      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Suggested Questions sidebar (desktop) */}
        <aside className="md:w-72 bg-white border-l border-[#BAC8B1]/30 flex-shrink-0 overflow-y-auto md:block hidden">
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

            {/* Disclaimer */}
            <div className="mt-6 bg-amber-50 border border-amber-200/60 rounded-2xl p-4">
              <p className="text-[10px] text-amber-700 font-semibold leading-relaxed">
                ⚠️ يقدم هذا المساعد إرشادات عامة فقط. استشر دائماً طبيب أطفال مرخص للقرارات الطبية.
              </p>
            </div>
          </div>
        </aside>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Mobile: Suggested Questions horizontal scroll */}
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

          {/* Messages */}
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
                <div className="flex flex-col gap-1">
                  <div
                    className={`px-4 py-3 rounded-2xl text-sm leading-relaxed shadow-sm ${msg.sender === 'user'
                        ? 'bg-[#404E3B] text-white rounded-tl-none'
                        : 'bg-white text-[#404E3B] border border-[#BAC8B1]/20 rounded-tr-none'
                      }`}
                  >
                    <div className="space-y-1">{renderText(msg.text)}</div>
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
                  className="w-full bg-[#E6E6E6]/60 border border-[#BAC8B1]/40 rounded-2xl px-5 py-3.5 pl-12 text-sm text-[#404E3B] font-medium focus:outline-none focus:border-[#7B9669] focus:bg-white transition-all placeholder:text-[#6C8480]/60 disabled:opacity-50"
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
              إرشادات عامة فقط · ليس بديلاً عن الاستشارة الطبية
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
