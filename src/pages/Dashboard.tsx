import React, { useState } from 'react';
import { useVaccineStore } from '../store/useVaccineStore';
import { AlertTriangle, CheckCircle, Clock, Edit3, Save, Activity, Heart } from 'lucide-react';
import type { Vaccine } from '../types';
import { ChildAvatar } from '../components/ChildAvatar';

export const Dashboard: React.FC = () => {
  const { children, selectedChildId, vaccines, alerts, updateChildStats, toggleVaccineStatus, rescheduleVaccine, dismissAlert } = useVaccineStore();
  const child = children.find((c) => c.id === selectedChildId) || children[0];
  const childVaccines = vaccines[child.id] || [];
  const childAlerts = alerts[child.id] || [];

  const [isEditingStats, setIsEditingStats] = useState(false);
  const [weight, setWeight] = useState(child.weightKg || 0);
  const [height, setHeight] = useState(child.heightCm || 0);
  const [rescheduleVac, setRescheduleVac] = useState<Vaccine | null>(null);
  const [newDate, setNewDate] = useState('');

  const milestones = [
    { label: 'ولادة', months: 0, display: 'عند الولادة' },
    { label: '٢', months: 2, display: 'شهران' },
    { label: '٤', months: 4, display: '٤ أشهر' },
    { label: '٦', months: 6, display: '٦ أشهر' },
    { label: '٩', months: 9, display: '٩ أشهر' },
    { label: '١٢', months: 12, display: '١٢ شهراً' },
    { label: '١٨', months: 18, display: '١٨ شهراً' },
  ];

  const getChildAgeMonths = (dobString: string) => {
    const dob = new Date(dobString);
    return Math.floor((Date.now() - dob.getTime()) / (1000 * 60 * 60 * 24 * 30.4375));
  };

  const childAgeMonths = getChildAgeMonths(child.dateOfBirth);
  const closestMilestone = milestones.reduce((prev, curr) =>
    Math.abs(curr.months - childAgeMonths) < Math.abs(prev.months - childAgeMonths) ? curr : prev
  );
  const [selectedMilestone, setSelectedMilestone] = useState(closestMilestone.months);

  React.useEffect(() => {
    setWeight(child.weightKg || 0);
    setHeight(child.heightCm || 0);
    const newAge = getChildAgeMonths(child.dateOfBirth);
    const nc = milestones.reduce((prev, curr) =>
      Math.abs(curr.months - newAge) < Math.abs(prev.months - newAge) ? curr : prev
    );
    setSelectedMilestone(nc.months);
  }, [selectedChildId, child]);

  const completedCount = childVaccines.filter((v) => v.status === 'completed').length;
  const totalCount = childVaccines.length;
  const completionRate = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
  const upcomingCount = childVaccines.filter((v) => v.status === 'upcoming').length;

  const handleSaveStats = () => { updateChildStats(child.id, Number(weight), Number(height)); setIsEditingStats(false); };
  const handleRescheduleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (rescheduleVac && newDate) { rescheduleVaccine(child.id, rescheduleVac.id, newDate); setRescheduleVac(null); setNewDate(''); }
  };
  const currentMilestoneVaccines = childVaccines.filter((v) => v.targetAgeMonths === selectedMilestone);

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6 animate-fade-in pb-24 md:pb-8">
      {/* البانر العلوي */}
      <div className="relative overflow-hidden bg-gradient-to-l from-[#7B9669] to-[#6C8480] rounded-3xl p-6 md:p-8 text-white shadow-lg shadow-[#7B9669]/10">
        <div className="absolute left-0 bottom-0 top-0 opacity-10 flex items-center pointer-events-none pl-8">
          <Heart size={200} />
        </div>
        <div className="relative z-10 max-w-xl">
          <span className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-semibold tracking-wide">
            {child.gender === 'female' ? '👧 ابنة' : '👦 ابن'}
          </span>
          <h2 className="text-2xl md:text-4xl font-extrabold mt-3 tracking-tight leading-tight">
            مرحباً، أم {child.name.split(' ')[0]}
          </h2>
          <p className="text-white/80 text-sm md:text-base mt-2 font-medium">
            تابعي مراحل تطعيم {child.name.split(' ')[0]} وامنحيه بداية صحية وآمنة للحياة.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* بطاقة الملف الشخصي */}
        <div className="bg-white rounded-3xl p-6 border border-[#BAC8B1]/30 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-[#BAC8B1]/20">
              <h3 className="font-bold text-lg text-[#404E3B] flex items-center gap-2">
                <Activity size={18} className="text-[#7B9669]" /> النمو والإحصائيات
              </h3>
              <button onClick={() => { if (isEditingStats) handleSaveStats(); else setIsEditingStats(true); }}
                className="text-xs font-semibold text-[#7B9669] hover:text-[#404E3B] transition-colors flex items-center gap-1 bg-[#BAC8B1]/20 px-3 py-1.5 rounded-full">
                {isEditingStats ? <><Save size={12} /> حفظ</> : <><Edit3 size={12} /> تعديل</>}
              </button>
            </div>
            <div className="mt-5 flex flex-col items-center">
              <ChildAvatar name={child.name} size="xl" className="border-4 border-[#BAC8B1]/40" />
              <h4 className="font-bold text-[#404E3B] text-xl mt-3">{child.name}</h4>
              <p className="text-xs text-[#6C8480] font-semibold mt-1">تاريخ الميلاد: {child.dateOfBirth}</p>
              <p className="bg-[#BAC8B1]/20 text-[#404E3B] text-xs font-bold px-3 py-1 rounded-full mt-2.5">
                العمر الحالي: {childAgeMonths} شهراً
              </p>
            </div>
            <div className="mt-6 grid grid-cols-2 gap-4">
              <div className="bg-[#E6E6E6]/50 rounded-2xl p-4 text-center border border-[#BAC8B1]/10">
                <span className="text-xs font-bold text-[#6C8480] block">الوزن</span>
                {isEditingStats ? (
                  <input type="number" step="0.1" value={weight} onChange={(e) => setWeight(Number(e.target.value))}
                    className="w-20 text-center font-extrabold text-lg text-[#404E3B] bg-white border border-[#BAC8B1]/60 rounded-lg py-0.5 mt-1 focus:outline-none focus:border-[#7B9669]" />
                ) : (
                  <span className="text-2xl font-extrabold text-[#404E3B] mt-1 block">{child.weightKg ? `${child.weightKg} كغ` : '--'}</span>
                )}
              </div>
              <div className="bg-[#E6E6E6]/50 rounded-2xl p-4 text-center border border-[#BAC8B1]/10">
                <span className="text-xs font-bold text-[#6C8480] block">الطول</span>
                {isEditingStats ? (
                  <input type="number" value={height} onChange={(e) => setHeight(Number(e.target.value))}
                    className="w-20 text-center font-extrabold text-lg text-[#404E3B] bg-white border border-[#BAC8B1]/60 rounded-lg py-0.5 mt-1 focus:outline-none focus:border-[#7B9669]" />
                ) : (
                  <span className="text-2xl font-extrabold text-[#404E3B] mt-1 block">{child.heightCm ? `${child.heightCm} سم` : '--'}</span>
                )}
              </div>
            </div>
          </div>
          <div className="bg-[#7B9669]/10 rounded-2xl p-4 mt-6 border border-[#7B9669]/20 flex items-center gap-3">
            <div className="p-2 rounded-xl bg-white text-[#7B9669] shadow-sm"><CheckCircle size={20} /></div>
            <div>
              <p className="text-xs font-bold text-[#6C8480] leading-none">ملخص الدفتر</p>
              <p className="text-sm font-bold text-[#404E3B] mt-1.5">{completedCount} مكتمل | {upcomingCount} قادم</p>
            </div>
          </div>
        </div>

        {/* التنبيهات والتقدم */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-[#BAC8B1]/30 shadow-sm">
            <h3 className="font-bold text-lg text-[#404E3B] pb-4 border-b border-[#BAC8B1]/20 flex items-center gap-2">
              <AlertTriangle size={18} className="text-red-500" /> التنبيهات والإشعارات
            </h3>
            {childAlerts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <CheckCircle size={40} className="text-[#7B9669] stroke-1" />
                <h4 className="font-semibold text-sm text-[#404E3B] mt-2">كل شيء آمن! لا توجد تنبيهات عاجلة</h4>
                <p className="text-xs text-[#6C8480] mt-1">{child.name.split(' ')[0]} ملتزم/ة بجدول التطعيمات بالكامل.</p>
              </div>
            ) : (
              <div className="mt-4 space-y-3.5 max-h-[220px] overflow-y-auto pl-1">
                {childAlerts.map((alert) => {
                  const matchingVac = childVaccines.find(v => v.id === alert.vaccineId);
                  return (
                    <div key={alert.id} className={`p-4 rounded-2xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all duration-300 ${
                      alert.type === 'urgent' ? 'bg-red-50/70 border-red-200/60' : alert.type === 'warning' ? 'bg-amber-50/70 border-amber-200/60' : 'bg-[#BAC8B1]/10 border-[#BAC8B1]/30'
                    }`}>
                      <div className="flex gap-3">
                        <div className={`p-2 rounded-xl mt-0.5 h-fit ${alert.type === 'urgent' ? 'bg-red-100 text-red-600' : alert.type === 'warning' ? 'bg-amber-100 text-amber-600' : 'bg-white text-[#7B9669]'}`}>
                          {alert.type === 'urgent' ? <AlertTriangle size={16} /> : <Clock size={16} />}
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-[#404E3B]">{alert.title}</h4>
                          <p className="text-xs text-[#6C8480] mt-0.5 leading-relaxed">{alert.message}</p>
                          <span className="text-[10px] text-[#6C8480]/70 font-semibold block mt-1">تاريخ التنبيه: {alert.date}</span>
                        </div>
                      </div>
                      <div className="flex gap-2 self-end sm:self-center w-full sm:w-auto justify-end">
                        {matchingVac && (
                          <>
                            <button onClick={() => toggleVaccineStatus(child.id, matchingVac.id, 'completed')}
                              className="text-[11px] font-bold bg-[#7B9669] hover:bg-[#7B9669]/90 text-white px-3 py-1.5 rounded-xl transition-all shadow-sm">إكمال</button>
                            <button onClick={() => { setRescheduleVac(matchingVac); setNewDate(matchingVac.scheduledDate); }}
                              className="text-[11px] font-bold bg-[#BAC8B1]/40 hover:bg-[#BAC8B1]/60 text-[#404E3B] px-3 py-1.5 rounded-xl transition-all">إعادة جدولة</button>
                          </>
                        )}
                        <button onClick={() => dismissAlert(child.id, alert.id)}
                          className="text-[10px] font-bold text-[#6C8480] hover:text-[#404E3B] px-2 py-1.5 transition-all">تجاهل</button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* شريط التقدم */}
          <div className="bg-white rounded-3xl p-6 border border-[#BAC8B1]/30 shadow-sm">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
              <div>
                <h3 className="font-bold text-lg text-[#404E3B]">قائمة التغطية التطعيمية</h3>
                <p className="text-xs text-[#6C8480] mt-0.5">متتبع إكمال برنامج التطعيم الأردني</p>
              </div>
              <div className="bg-[#7B9669]/10 border border-[#7B9669]/20 px-3.5 py-1.5 rounded-2xl self-start sm:self-center">
                <span className="text-sm font-black text-[#7B9669]">{completionRate}% مكتمل</span>
              </div>
            </div>
            <div className="mt-5 bg-[#E6E6E6] h-3.5 w-full rounded-full overflow-hidden">
              <div className="bg-[#7B9669] h-full rounded-full transition-all duration-700 ease-out" style={{ width: `${completionRate}%` }} />
            </div>
            <div className="flex justify-between text-[11px] text-[#6C8480] font-bold mt-2 px-1">
              <span>{completedCount} جرعة مُعطاة</span>
              <span>{totalCount - completedCount} جرعة متبقية</span>
            </div>

            {/* خط الزمني */}
            <div className="mt-8 relative">
              <div className="absolute top-5 left-4 right-4 h-0.5 bg-[#BAC8B1]/40 -z-10 hidden sm:block" />
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4 sm:gap-0">
                {milestones.map((m) => {
                  const mv = childVaccines.filter(v => v.targetAgeMonths === m.months);
                  const allDone = mv.length > 0 && mv.every(v => v.status === 'completed');
                  const someDone = mv.some(v => v.status === 'completed');
                  const hasOverdue = mv.some(v => v.status === 'overdue');
                  const isCurrent = m.months === selectedMilestone;
                  let nodeBg = 'bg-white border-[#BAC8B1]';
                  let nodeColor = 'text-[#6C8480]';
                  if (allDone) { nodeBg = 'bg-[#7B9669] border-[#7B9669] text-white'; nodeColor = 'text-[#7B9669]'; }
                  else if (hasOverdue) { nodeBg = 'bg-red-500 border-red-500 text-white'; nodeColor = 'text-red-500 font-bold'; }
                  else if (isCurrent) { nodeBg = 'bg-white border-[#7B9669] ring-4 ring-[#7B9669]/15'; nodeColor = 'text-[#7B9669] font-bold'; }
                  else if (someDone) { nodeBg = 'bg-[#BAC8B1] border-[#BAC8B1] text-white'; nodeColor = 'text-[#6C8480]'; }
                  return (
                    <button key={m.months} onClick={() => setSelectedMilestone(m.months)} className="flex sm:flex-col items-center gap-3 sm:gap-1.5 focus:outline-none group w-full sm:w-auto">
                      <div className={`w-9 h-9 rounded-full border-2 flex items-center justify-center text-xs font-bold transition-all duration-300 shadow-sm ${nodeBg} group-hover:scale-110`}>
                        {allDone ? '✓' : hasOverdue ? '!' : m.label}
                      </div>
                      <div className="text-right sm:text-center">
                        <p className={`text-xs font-semibold transition-colors duration-300 ${nodeColor}`}>{m.display}</p>
                        <span className="text-[10px] text-[#6C8480] block sm:hidden">({mv.length} تطعيم)</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* تطعيمات المرحلة المختارة */}
            <div className="mt-8 bg-[#BAC8B1]/10 rounded-2xl p-5 border border-[#BAC8B1]/20">
              <div className="flex justify-between items-center pb-3 border-b border-[#BAC8B1]/30">
                <h4 className="font-bold text-sm text-[#404E3B]">
                  تطعيمات مرحلة {milestones.find((m) => m.months === selectedMilestone)?.display}
                </h4>
                <span className="text-xs text-[#6C8480] font-semibold">{currentMilestoneVaccines.length} تطعيم</span>
              </div>
              {currentMilestoneVaccines.length === 0 ? (
                <p className="text-xs text-[#6C8480] text-center py-6">لا توجد تطعيمات مسجلة لهذه المرحلة.</p>
              ) : (
                <div className="mt-3.5 space-y-3">
                  {currentMilestoneVaccines.map((v) => (
                    <div key={v.id} className="bg-white rounded-xl p-4 border border-[#BAC8B1]/20 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4 transition-all duration-200 hover:border-[#7B9669]/30">
                      <div className="flex items-start gap-3">
                        <button onClick={() => { toggleVaccineStatus(child.id, v.id, v.status === 'completed' ? 'upcoming' : 'completed'); }}
                          className={`mt-0.5 rounded-full p-0.5 transition-all focus:outline-none ${v.status === 'completed' ? 'text-[#7B9669]' : v.status === 'overdue' ? 'text-red-500' : 'text-gray-300 hover:text-[#7B9669]'}`}>
                          <CheckCircle size={22} className={v.status === 'completed' ? 'fill-[#7B9669]/10' : ''} />
                        </button>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-sm text-[#404E3B]">{v.name}</span>
                            <span className="bg-[#BAC8B1]/20 text-[#404E3B] text-[10px] font-bold px-2 py-0.5 rounded-md">{v.code}</span>
                            <span className={`text-[9px] font-black px-2 py-0.5 rounded-md ${
                              v.status === 'completed' ? 'bg-[#7B9669]/10 text-[#7B9669]' : v.status === 'overdue' ? 'bg-red-50 text-red-500 animate-pulse' : 'bg-amber-50 text-amber-600'
                            }`}>{v.status === 'completed' ? 'مكتمل' : v.status === 'overdue' ? 'متأخر' : 'قادم'}</span>
                          </div>
                          <p className="text-xs text-[#6C8480] mt-1.5 leading-relaxed max-w-xl">{v.description}</p>
                          {v.notes && <p className="text-[11px] text-[#6C8480]/80 italic mt-1 bg-[#BAC8B1]/10 px-2 py-1 rounded border-r-2 border-[#7B9669]/40">ملاحظة: {v.notes}</p>}
                        </div>
                      </div>
                      <div className="flex flex-row md:flex-col items-center md:items-end justify-between w-full md:w-auto border-t md:border-t-0 border-[#BAC8B1]/10 pt-2.5 md:pt-0">
                        <div className="text-right">
                          <span className="text-[10px] text-[#6C8480] font-bold block">{v.status === 'completed' ? 'تاريخ الإعطاء' : 'الموعد'}</span>
                          <span className="text-xs font-bold text-[#404E3B]">{v.status === 'completed' ? v.completedDate : v.scheduledDate}</span>
                        </div>
                        {v.status !== 'completed' && (
                          <button onClick={() => { setRescheduleVac(v); setNewDate(v.scheduledDate); }}
                            className="text-[11px] font-semibold text-[#7B9669] hover:underline mt-1 bg-[#BAC8B1]/10 hover:bg-[#BAC8B1]/20 px-2 py-1 rounded-md transition-all">إعادة جدولة</button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* نافذة إعادة الجدولة */}
      {rescheduleVac && (
        <div className="fixed inset-0 bg-[#404E3B]/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-[#BAC8B1]/30 animate-fade-in">
            <h3 className="text-lg font-bold text-[#404E3B]">إعادة جدولة موعد التطعيم</h3>
            <p className="text-xs text-[#6C8480] mt-1">تحديث موعد <strong className="text-[#404E3B]">{rescheduleVac.name}</strong> ({rescheduleVac.code}).</p>
            <form onSubmit={handleRescheduleSubmit} className="mt-5 space-y-4">
              <div>
                <label className="text-xs font-bold text-[#6C8480] block mb-1.5">التاريخ الجديد</label>
                <input type="date" required value={newDate} onChange={(e) => setNewDate(e.target.value)}
                  className="w-full bg-[#E6E6E6]/50 border border-[#BAC8B1]/60 text-[#404E3B] rounded-2xl px-4 py-3 focus:outline-none focus:border-[#7B9669] text-sm" />
              </div>
              <div className="flex justify-end gap-3.5 pt-4">
                <button type="button" onClick={() => setRescheduleVac(null)}
                  className="px-4 py-2.5 rounded-2xl bg-[#E6E6E6] hover:bg-[#E6E6E6]/80 text-[#404E3B] font-bold text-xs transition-all">إلغاء</button>
                <button type="submit"
                  className="px-5 py-2.5 rounded-2xl bg-[#7B9669] hover:bg-[#7B9669]/90 text-white font-bold text-xs transition-all shadow-md shadow-[#7B9669]/10">حفظ الموعد</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
