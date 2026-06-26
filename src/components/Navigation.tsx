import React from 'react';
import { useVaccineStore } from '../store/useVaccineStore';
import { LayoutDashboard, Calendar, BookOpen, HelpCircle, Baby, ChevronDown, MessageSquare, LogOut } from 'lucide-react';
import { ChildAvatar } from './ChildAvatar';

export const Navigation: React.FC = () => {
  const { activeTab, setActiveTab, children, selectedChildId, setSelectedChildId, currentUser, logout } = useVaccineStore();
  const selectedChild = children.find(c => c.id === selectedChildId) || children[0];
  const [dropdownOpen, setDropdownOpen] = React.useState(false);

  const menuItems = [
    { id: 'dashboard', label: 'الرئيسية',     icon: LayoutDashboard },
    { id: 'calendar',  label: 'التقويم',       icon: Calendar },
    { id: 'history',   label: 'الدفتر الرقمي', icon: BookOpen },
    { id: 'faq',       label: 'الأسئلة والدعم', icon: HelpCircle },
    { id: 'chatbot',   label: 'المساعد الذكي',  icon: MessageSquare },
  ] as const;

  const getAge = (dobString: string) => {
    const dob = new Date(dobString);
    const diffMs = Date.now() - dob.getTime();
    const diffMonths = Math.floor(diffMs / (1000 * 60 * 60 * 24 * 30.4375));
    if (diffMonths < 12) return `${diffMonths} شهراً`;
    const years = Math.floor(diffMonths / 12);
    const months = diffMonths % 12;
    return months > 0 ? `${years} سنة ${months} شهر` : `${years} سنة`;
  };

  return (
    <>
      {/* ─── سايدبار الكمبيوتر ─── */}
      <aside className="hidden md:flex flex-col w-64 bg-[#BAC8B1]/10 border-r border-[#BAC8B1]/30 h-screen sticky top-0 p-6 justify-between select-none">
        <div className="flex flex-col gap-7">
          {/* شعار التطبيق */}
          <div className="flex items-center gap-3 px-2">
            <div className="bg-[#7B9669] text-white p-2.5 rounded-2xl shadow-md shadow-[#7B9669]/20 flex items-center justify-center">
              <Baby size={24} />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-wide text-[#404E3B] font-sans m-0">تفلي</h1>
              <p className="text-xs text-[#6C8480] font-medium">متتبع تطعيمات الأطفال</p>
            </div>
          </div>

          {/* بيانات المستخدم */}
          {currentUser && (
            <div className="bg-white/70 rounded-2xl px-4 py-3 border border-[#BAC8B1]/30 flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#7B9669] to-[#6C8480] flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                {currentUser.name.charAt(0)}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-[#404E3B] truncate">{currentUser.name}</p>
                <p className="text-[10px] text-[#6C8480] truncate">{currentUser.email}</p>
              </div>
            </div>
          )}

          {/* محدد الطفل */}
          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center justify-between w-full p-3 bg-white/70 backdrop-blur-md rounded-2xl border border-[#BAC8B1]/40 hover:bg-white hover:border-[#7B9669]/60 transition-all duration-300 shadow-sm"
            >
              <div className="flex items-center gap-2.5">
                <ChildAvatar name={selectedChild.name} size="md" />
                <div className="text-right">
                  <p className="text-sm font-semibold text-[#404E3B] leading-none truncate max-w-[100px]">{selectedChild.name}</p>
                  <p className="text-[11px] text-[#6C8480] font-medium mt-0.5">{getAge(selectedChild.dateOfBirth)}</p>
                </div>
              </div>
              <ChevronDown size={16} className={`text-[#6C8480] transition-transform duration-300 ${dropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {dropdownOpen && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-xl border border-[#BAC8B1]/30 py-2 z-50 animate-fade-in">
                {children.map((child) => (
                  <button
                    key={child.id}
                    onClick={() => { setSelectedChildId(child.id); setDropdownOpen(false); }}
                    className={`flex items-center gap-3 w-full px-4 py-2.5 hover:bg-[#BAC8B1]/20 transition-all text-right ${selectedChild.id === child.id ? 'bg-[#BAC8B1]/10 font-semibold' : ''}`}
                  >
                    <ChildAvatar name={child.name} size="md" />
                    <div>
                      <p className="text-sm text-[#404E3B] leading-tight">{child.name}</p>
                      <p className="text-xs text-[#6C8480]">{getAge(child.dateOfBirth)}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* روابط التنقل */}
          <nav className="flex flex-col gap-1.5">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-3.5 px-4 py-3 rounded-2xl transition-all duration-300 text-right text-sm ${
                    isActive
                      ? 'bg-[#7B9669] text-white shadow-md shadow-[#7B9669]/20 font-semibold'
                      : 'text-[#404E3B] hover:bg-[#BAC8B1]/20'
                  }`}
                >
                  <Icon size={18} className={isActive ? 'text-white' : 'text-[#6C8480]'} />
                  <span>{item.label}</span>
                  {item.id === 'chatbot' && (
                    <span className="mr-auto bg-[#7B9669]/20 text-[#7B9669] text-[9px] font-bold px-1.5 py-0.5 rounded-full">
                      ذكاء
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* الأسفل: تسجيل الخروج */}
        <div className="space-y-3">
          <button
            onClick={logout}
            className="w-full flex items-center gap-2.5 px-4 py-2.5 rounded-2xl text-sm text-[#6C8480] hover:text-red-500 hover:bg-red-50 transition-all duration-300 font-semibold"
          >
            <LogOut size={16} />
            <span>تسجيل الخروج</span>
          </button>
          <div className="text-center">
            <p className="text-[11px] text-[#6C8480] font-medium">برنامج تفلي الوطني v1.2</p>
            <p className="text-[9px] text-[#6C8480]/60 mt-0.5">التطعيمات الأردنية للأطفال</p>
          </div>
        </div>
      </aside>

      {/* ─── رأس الصفحة للجوال ─── */}
      <header className="md:hidden flex items-center justify-between bg-white/80 backdrop-blur-md border-b border-[#BAC8B1]/30 px-5 py-3 sticky top-0 z-40 select-none shadow-sm">
        <div className="flex items-center gap-2">
          <div className="bg-[#7B9669] text-white p-1.5 rounded-xl">
            <Baby size={18} />
          </div>
          <span className="font-bold text-lg text-[#404E3B]">تفلي</span>
        </div>

        <div className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-1.5 bg-[#BAC8B1]/20 px-2.5 py-1.5 rounded-xl border border-[#BAC8B1]/30"
          >
            <ChildAvatar name={selectedChild.name} size="sm" />
            <span className="text-xs font-semibold text-[#404E3B] max-w-[70px] truncate">{selectedChild.name.split(' ')[0]}</span>
            <ChevronDown size={12} className={`text-[#6C8480] transition-transform duration-300 ${dropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {dropdownOpen && (
            <div className="absolute left-0 mt-2 w-52 bg-white rounded-2xl shadow-xl border border-[#BAC8B1]/30 py-2 z-50 animate-fade-in">
              {children.map((child) => (
                <button
                  key={child.id}
                  onClick={() => { setSelectedChildId(child.id); setDropdownOpen(false); }}
                  className={`flex items-center gap-2 w-full px-3 py-2 hover:bg-[#BAC8B1]/20 text-right ${selectedChild.id === child.id ? 'bg-[#BAC8B1]/10' : ''}`}
                >
                  <ChildAvatar name={child.name} size="sm" />
                  <div>
                    <p className="text-xs text-[#404E3B] font-semibold">{child.name}</p>
                    <p className="text-[10px] text-[#6C8480]">{getAge(child.dateOfBirth)}</p>
                  </div>
                </button>
              ))}
              <div className="border-t border-[#BAC8B1]/20 mt-1 pt-1">
                <button
                  onClick={() => { logout(); setDropdownOpen(false); }}
                  className="flex items-center gap-2 w-full px-3 py-2 hover:bg-red-50 text-red-500 text-xs font-semibold"
                >
                  <LogOut size={13} /> تسجيل الخروج
                </button>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* ─── شريط التنقل السفلي للجوال ─── */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-lg border-t border-[#BAC8B1]/30 py-2 px-1 flex justify-around items-center z-40 shadow-lg">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className="flex flex-col items-center gap-0.5 transition-all duration-300 px-1"
            >
              <div className={`p-1.5 rounded-xl transition-all duration-300 ${isActive ? 'bg-[#7B9669] text-white shadow-sm' : 'text-[#6C8480]'}`}>
                <Icon size={17} />
              </div>
              <span className={`text-[9px] font-bold transition-colors duration-300 ${isActive ? 'text-[#7B9669]' : 'text-[#6C8480]'}`}>
                {item.label === 'المساعد الذكي' ? 'الذكاء' : item.label}
              </span>
            </button>
          );
        })}
      </nav>
    </>
  );
};
