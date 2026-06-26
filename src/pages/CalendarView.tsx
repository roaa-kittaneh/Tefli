import React, { useState } from 'react';
import { useVaccineStore } from '../store/useVaccineStore';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, CheckCircle } from 'lucide-react';

export const CalendarView: React.FC = () => {
  const { children, selectedChildId, vaccines, toggleVaccineStatus } = useVaccineStore();
  const child = children.find(c => c.id === selectedChildId) || children[0];
  const childVaccines = vaccines[child.id] || [];

  const [currentDate, setCurrentDate] = useState(new Date(2026, 6, 1));
  const [selectedDate, setSelectedDate] = useState<string>('2026-07-12');

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const monthNames = ['يناير','فبراير','مارس','أبريل','مايو','يونيو','يوليو','أغسطس','سبتمبر','أكتوبر','نوفمبر','ديسمبر'];
  const dayNames = ['أحد','إثنين','ثلاثاء','أربعاء','خميس','جمعة','سبت'];

  const getDaysInMonth = (y: number, m: number) => new Date(y, m + 1, 0).getDate();
  const getFirstDayOfMonth = (y: number, m: number) => new Date(y, m, 1).getDay();
  const daysInMonth = getDaysInMonth(year, month);
  const firstDayIndex = getFirstDayOfMonth(year, month);

  const formatDateString = (day: number) => {
    const mm = String(month + 1).padStart(2, '0');
    const dd = String(day).padStart(2, '0');
    return `${year}-${mm}-${dd}`;
  };
  const getVaccinesForDate = (dateStr: string) => childVaccines.filter(v => v.scheduledDate === dateStr);

  const calendarCells = [];
  for (let i = 0; i < firstDayIndex; i++) {
    calendarCells.push(<div key={`empty-${i}`} className="h-14 sm:h-20 bg-gray-50/40 border border-gray-100 rounded-lg opacity-40" />);
  }
  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = formatDateString(day);
    const dayVaccines = getVaccinesForDate(dateStr);
    const isSelected = selectedDate === dateStr;
    const isToday = new Date().toDateString() === new Date(year, month, day).toDateString();
    calendarCells.push(
      <button key={`day-${day}`} onClick={() => setSelectedDate(dateStr)}
        className={`h-14 sm:h-20 p-1 sm:p-2 border rounded-xl flex flex-col justify-between items-start transition-all relative text-right focus:outline-none ${
          isSelected ? 'bg-[#7B9669] border-[#7B9669] text-white shadow-md shadow-[#7B9669]/10'
            : isToday ? 'bg-white border-[#7B9669] text-[#404E3B] font-bold ring-2 ring-[#7B9669]/20'
            : 'bg-white border-[#BAC8B1]/20 hover:border-[#7B9669]/50 text-[#404E3B]'
        }`}>
        <span className={`text-xs sm:text-sm font-bold ${isSelected ? 'text-white' : 'text-[#404E3B]'}`}>{day}</span>
        {dayVaccines.length > 0 && (
          <div className="flex gap-1 flex-wrap mt-auto">
            {dayVaccines.slice(0, 3).map((v) => {
              let dotColor = 'bg-amber-400';
              if (v.status === 'completed') dotColor = 'bg-emerald-500';
              if (v.status === 'overdue') dotColor = 'bg-red-500 animate-pulse';
              return <span key={v.id} className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-white' : dotColor}`} title={v.name} />;
            })}
            {dayVaccines.length > 3 && <span className={`text-[8px] leading-none font-bold ${isSelected ? 'text-white' : 'text-[#6C8480]'}`}>+{dayVaccines.length - 3}</span>}
          </div>
        )}
      </button>
    );
  }

  const selectedDateVaccines = getVaccinesForDate(selectedDate);

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-8 animate-fade-in pb-24 md:pb-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <div>
          <h2 className="text-2xl md:text-3xl font-extrabold text-[#404E3B] tracking-tight">تقويم التطعيمات</h2>
          <p className="text-xs md:text-sm text-[#6C8480] mt-1 font-medium">الجدول الزمني التفاعلي ومواعيد التطعيم</p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-white rounded-3xl p-5 border border-[#BAC8B1]/30 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-[#BAC8B1]/20">
                <div className="flex items-center gap-2">
                  <CalendarIcon className="text-[#7B9669]" size={20} />
                  <span className="font-bold text-lg text-[#404E3B]">{monthNames[month]} {year}</span>
                </div>
                <div className="flex gap-1 bg-[#BAC8B1]/10 p-1 rounded-xl">
                  <button onClick={() => setCurrentDate(new Date(year, month + 1, 1))} className="p-2 hover:bg-white rounded-lg text-[#404E3B] transition-all"><ChevronRight size={16} /></button>
                  <button onClick={() => setCurrentDate(new Date(year, month - 1, 1))} className="p-2 hover:bg-white rounded-lg text-[#404E3B] transition-all"><ChevronLeft size={16} /></button>
                </div>
              </div>
              <div className="grid grid-cols-7 gap-1.5 text-center py-4 text-xs font-bold text-[#6C8480] tracking-wider">
                {dayNames.map(d => <div key={d}>{d}</div>)}
              </div>
              <div className="grid grid-cols-7 gap-1.5">{calendarCells}</div>
            </div>
            <div className="flex justify-start gap-4 mt-6 pt-4 border-t border-[#BAC8B1]/20 text-[11px] text-[#6C8480] font-bold">
              <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /><span>مكتمل</span></div>
              <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-amber-400" /><span>قادم</span></div>
              <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-red-500" /><span>متأخر</span></div>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-[#BAC8B1]/30 shadow-sm flex flex-col h-full justify-between min-h-[400px]">
            <div>
              <div className="pb-4 border-b border-[#BAC8B1]/20">
                <span className="text-[10px] font-bold text-[#6C8480] block">الجدول المختار</span>
                <h3 className="font-extrabold text-sm text-[#404E3B] mt-0.5">{selectedDate}</h3>
              </div>
              <div className="mt-5 space-y-4 max-h-[360px] overflow-y-auto pl-1">
                {selectedDateVaccines.length === 0 ? (
                  <div className="text-center py-12 flex flex-col items-center">
                    <div className="w-16 h-16 rounded-full bg-[#E6E6E6]/60 flex items-center justify-center text-[#6C8480] mb-3"><CalendarIcon size={24} /></div>
                    <h4 className="font-bold text-sm text-[#404E3B]">لا توجد تطعيمات مجدولة</h4>
                    <p className="text-xs text-[#6C8480] mt-1 px-4 leading-relaxed">لا توجد تطعيمات مجدولة لـ {child.name.split(' ')[0]} في هذا اليوم.</p>
                  </div>
                ) : (
                  selectedDateVaccines.map((v) => (
                    <div key={v.id} className="bg-[#BAC8B1]/10 rounded-2xl p-4 border border-[#BAC8B1]/20 space-y-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="bg-white/90 text-[#404E3B] text-[10px] font-bold px-2 py-0.5 rounded-md border border-[#BAC8B1]/20">{v.code}</span>
                          <h4 className="font-bold text-sm text-[#404E3B] mt-1.5 leading-tight">{v.name}</h4>
                        </div>
                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded-md ${
                          v.status === 'completed' ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                            : v.status === 'overdue' ? 'bg-red-100 text-red-700 border border-red-200 animate-pulse'
                            : 'bg-amber-100 text-amber-700 border border-amber-200'
                        }`}>{v.status === 'completed' ? 'مكتمل' : v.status === 'overdue' ? 'متأخر' : 'قادم'}</span>
                      </div>
                      <p className="text-xs text-[#6C8480] leading-relaxed">{v.description}</p>
                      {v.administratorName && (
                        <div className="text-[10px] text-[#6C8480]/90 bg-white/60 p-2 rounded-xl border border-[#BAC8B1]/20">
                          <p>🩺 الطبيب: <strong className="text-[#404E3B]">{v.administratorName}</strong></p>
                          <p className="mt-0.5">📍 العيادة: <strong className="text-[#404E3B]">{v.clinicName}</strong></p>
                        </div>
                      )}
                      <div className="pt-2 flex justify-end gap-2">
                        {v.status !== 'completed' ? (
                          <button onClick={() => toggleVaccineStatus(child.id, v.id, 'completed')}
                            className="bg-[#7B9669] hover:bg-[#7B9669]/90 text-white text-[11px] font-bold px-3 py-1.5 rounded-xl transition-all flex items-center gap-1 shadow-sm">
                            <CheckCircle size={12} /> تم التطعيم
                          </button>
                        ) : (
                          <button onClick={() => toggleVaccineStatus(child.id, v.id, 'upcoming')}
                            className="bg-white hover:bg-[#E6E6E6]/40 border border-[#BAC8B1]/30 text-[#404E3B] text-[11px] font-bold px-3 py-1.5 rounded-xl transition-all">إلغاء الإكمال</button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
            <div className="border-t border-[#BAC8B1]/20 pt-4 mt-4">
              <div className="bg-[#7B9669]/10 rounded-2xl p-4 flex items-center justify-between border border-[#7B9669]/20">
                <div className="text-right">
                  <p className="text-[10px] font-bold text-[#6C8480] leading-none">نصيحة</p>
                  <p className="text-xs text-[#404E3B] font-semibold mt-1">تحققي من تفاصيل التطعيم قبل زيارة العيادة.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
