import React, { useState } from 'react';
import { useVaccineStore } from '../store/useVaccineStore';
import { ChevronDown, MessageSquare, Sparkles } from 'lucide-react';

export const FaqView: React.FC = () => {
  const { faqs, setActiveTab } = useVaccineStore();
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [expandedFaqId, setExpandedFaqId] = useState<string | null>(null);

  const categories = [
    { id: 'all', label: 'جميع الأسئلة' },
    { id: 'before', label: 'قبل التطعيم' },
    { id: 'after', label: 'بعد التطعيم' },
    { id: 'side-effects', label: 'الآثار الجانبية' },
    { id: 'general', label: 'إرشادات عامة' },
  ];

  const filteredFaqs = faqs.filter(faq => activeCategory === 'all' || faq.category === activeCategory);

  const toggleFaq = (id: string) => {
    setExpandedFaqId(expandedFaqId === id ? null : id);
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-8 animate-fade-in pb-24 md:pb-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h2 className="text-2xl md:text-3xl font-extrabold text-[#404E3B] tracking-tight">الأسئلة الشائعة والدعم الصحي</h2>
          <p className="text-xs md:text-sm text-[#6C8480] mt-1 font-medium">إرشادات الخبراء ونصائح للعناية بالأطفال وتطعيماتهم</p>
        </div>

        {/* AI Assistant Banner */}
        <div className="relative overflow-hidden bg-gradient-to-r from-[#404E3B] to-[#6C8480] rounded-3xl p-6 shadow-lg">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 opacity-10 pointer-events-none">
            <Sparkles size={100} />
          </div>
          <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center flex-shrink-0">
                <Sparkles size={22} className="text-amber-300" />
              </div>
              <div>
                <h3 className="font-extrabold text-white text-base leading-tight">مساعد طفلي الذكي</h3>
                <p className="text-xs text-white/70 mt-0.5 font-medium">احصل على إجابات فورية واستشارات حول تطعيمات الأطفال طوال الوقت 24/7</p>
              </div>
            </div>
            <button
              onClick={() => setActiveTab('chatbot')}
              className="bg-white hover:bg-white/90 text-[#404E3B] font-bold text-sm px-5 py-2.5 rounded-2xl transition-all flex items-center gap-2 shadow-sm flex-shrink-0 w-full sm:w-auto justify-center"
            >
              <MessageSquare size={16} /> فتح المحادثة الذكية
            </button>
          </div>
        </div>

        {/* Category Filters */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => {
                setActiveCategory(cat.id);
                setExpandedFaqId(null);
              }}
              className={`px-4 py-2.5 rounded-2xl text-xs font-bold border whitespace-nowrap transition-all ${
                activeCategory === cat.id
                  ? 'bg-[#7B9669] border-[#7B9669] text-white shadow-sm shadow-[#7B9669]/10'
                  : 'bg-white border-[#BAC8B1]/30 text-[#6C8480] hover:bg-[#BAC8B1]/10'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* FAQ Accordion List */}
        <div className="space-y-3">
          {filteredFaqs.length === 0 ? (
            <div className="bg-white rounded-3xl p-10 text-center border border-[#BAC8B1]/30">
              <p className="text-sm text-[#6C8480] font-medium">لم يتم العثور على أسئلة شائعة في هذا القسم.</p>
            </div>
          ) : (
            filteredFaqs.map((faq) => {
              const isExpanded = expandedFaqId === faq.id;
              return (
                <div
                  key={faq.id}
                  className="bg-white rounded-3xl border border-[#BAC8B1]/30 overflow-hidden shadow-sm transition-all duration-300 hover:border-[#7B9669]/30"
                >
                  <button
                    onClick={() => toggleFaq(faq.id)}
                    className="w-full flex items-center justify-between p-5 md:p-6 text-right focus:outline-none hover:bg-gray-50/50 gap-4"
                  >
                    <span className="font-bold text-sm md:text-base text-[#404E3B] leading-snug">{faq.question}</span>
                    <ChevronDown
                      size={18}
                      className={`flex-shrink-0 text-[#6C8480] transition-transform duration-300 ${isExpanded ? 'rotate-180 text-[#7B9669]' : ''}`}
                    />
                  </button>

                  <div
                    className={`overflow-hidden transition-all duration-300 ${
                      isExpanded ? 'max-h-[400px] border-t border-[#BAC8B1]/20' : 'max-h-0'
                    }`}
                  >
                    <div className="p-5 md:p-6 text-xs sm:text-sm text-[#6C8480] leading-relaxed bg-[#BAC8B1]/5 text-right space-y-3">
                      <p>{faq.answer}</p>
                      
                      <div className="pt-2.5 flex items-center justify-start border-t border-[#BAC8B1]/10">
                        {faq.source && faq.source !== 'unverified' ? (
                          <span className="bg-green-50 text-green-700 border border-green-200 text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
                            🛡️ مصدر طبي معتمد: {faq.source}
                          </span>
                        ) : (
                          <span className="bg-red-50 text-red-700 border border-red-200 text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
                            ⚠️ مصدر طبي غير موثق (unverified)
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Bottom CTA */}
        <div className="bg-[#BAC8B1]/30 border border-[#BAC8B1]/60 rounded-3xl p-6 shadow-sm flex flex-col md:flex-row items-center justify-between gap-5">
          <div className="flex items-center gap-4 text-center md:text-right flex-col md:flex-row">
            <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center text-[#7B9669] shadow-sm flex-shrink-0">
              <MessageSquare size={22} className="stroke-[1.5]" />
            </div>
            <div>
              <h4 className="font-extrabold text-[#404E3B] text-sm">لم تجد إجابتك؟</h4>
              <p className="text-xs text-[#6C8480] mt-0.5">المساعد الذكي يحتوي على إجابات لمئات الأسئلة المتعلقة باللقاحات.</p>
            </div>
          </div>
          <button
            onClick={() => setActiveTab('chatbot')}
            className="w-full md:w-auto bg-[#404E3B] hover:bg-[#404E3B]/90 text-white px-6 py-3 rounded-2xl text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-sm"
          >
            <Sparkles size={14} className="text-amber-300" /> اسأل المساعد الذكي
          </button>
        </div>
      </div>
    </div>
  );
};
