import React, { useState } from 'react';
import { useVaccineStore } from '../store/useVaccineStore';
import { Search, Printer, CheckCircle, Clock, AlertTriangle, FileText, Plus, X } from 'lucide-react';
import type { Vaccine } from '../types';

export const HistoryView: React.FC = () => {
  const { children, selectedChildId, vaccines, toggleVaccineStatus } = useVaccineStore();
  const child = children.find(c => c.id === selectedChildId) || children[0];
  const childVaccines = vaccines[child.id] || [];

  // Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);

  // New Custom Vaccine Record Form State
  const [newName, setNewName] = useState('');
  const [newCode, setNewCode] = useState('');
  const [newDate, setNewDate] = useState('');
  const [newAdmin, setNewAdmin] = useState('');
  const [newClinic, setNewClinic] = useState('');
  const [newNotes, setNewNotes] = useState('');

  // Counts
  const completedCount = childVaccines.filter(v => v.status === 'completed').length;
  const upcomingCount = childVaccines.filter(v => v.status === 'upcoming').length;
  const overdueCount = childVaccines.filter(v => v.status === 'overdue').length;

  // Filtered vaccines list
  const filteredVaccines = childVaccines.filter((v) => {
    const matchesSearch = v.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          v.code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || v.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleAddCustomRecord = (e: React.FormEvent) => {
    e.preventDefault();
    if (newName && newCode && newDate) {
      const newVac: Vaccine = {
        id: `custom-${Date.now()}`,
        name: newName,
        code: newCode.toUpperCase(),
        description: 'سجل مضاف يدوياً من قبل الأهل.',
        ageGroup: 'سجل مخصص',
        targetAgeMonths: -1,
        scheduledDate: newDate,
        completedDate: newDate,
        status: 'completed',
        administratorName: newAdmin || 'تسجيل الأهل',
        clinicName: newClinic || 'عيادة خاصة',
        notes: newNotes,
      };

      // Push custom vaccine directly to Zustand store
      useVaccineStore.setState((state) => ({
        vaccines: {
          ...state.vaccines,
          [child.id]: [...(state.vaccines[child.id] || []), newVac]
        }
      }));

      // Reset Form
      setNewName('');
      setNewCode('');
      setNewDate('');
      setNewAdmin('');
      setNewClinic('');
      setNewNotes('');
      setShowAddModal(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-8 animate-fade-in pb-24 md:pb-8">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
          <div>
            <h2 className="text-2xl md:text-3xl font-extrabold text-[#404E3B] tracking-tight">الدفتر الرقمي</h2>
            <p className="text-xs md:text-sm text-[#6C8480] mt-1 font-medium">دفتر السجل الصحي المعتمد وتاريخ التطعيمات</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-[#7B9669] hover:bg-[#7B9669]/90 text-white px-4 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 shadow-sm shadow-[#7B9669]/10"
            >
              <Plus size={14} /> إضافة سجل
            </button>
            <button
              onClick={handlePrint}
              className="bg-white hover:bg-[#E6E6E6]/40 border border-[#BAC8B1]/40 text-[#404E3B] px-4 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 shadow-sm"
            >
              <Printer size={14} /> طباعة الدفتر
            </button>
          </div>
        </div>

        {/* Booklet Header Card */}
        <div className="bg-gradient-to-br from-[#BAC8B1]/40 to-[#6C8480]/20 border border-[#BAC8B1]/60 rounded-3xl p-6 shadow-sm">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-[#7B9669] shadow-sm">
                <FileText size={28} className="stroke-[1.5]" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-[#6C8480] uppercase tracking-wider block">السجل الرقمي الرسمي</span>
                <h3 className="text-xl font-extrabold text-[#404E3B] mt-0.5">{child.name}</h3>
                <p className="text-xs text-[#6C8480] font-semibold mt-1">
                  آخر تحديث: {new Date().toLocaleDateString('ar-JO', { month: 'long', year: 'numeric' })}
                </p>
              </div>
            </div>

            {/* Counts Boxes */}
            <div className="grid grid-cols-3 gap-3 w-full md:w-auto">
              <div className="bg-[#7B9669]/10 border border-[#7B9669]/30 rounded-2xl p-3 text-center min-w-[85px] sm:min-w-[100px]">
                <span className="text-xs font-bold text-[#7B9669] block">مكتمل</span>
                <span className="text-xl sm:text-2xl font-black text-[#7B9669] mt-0.5 block">{completedCount}</span>
              </div>
              <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-3 text-center min-w-[85px] sm:min-w-[100px]">
                <span className="text-xs font-bold text-amber-600 block">قادم</span>
                <span className="text-xl sm:text-2xl font-black text-amber-600 mt-0.5 block">{upcomingCount}</span>
              </div>
              <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-3 text-center min-w-[85px] sm:min-w-[100px]">
                <span className="text-xs font-bold text-red-500 block">متأخر</span>
                <span className="text-xl sm:text-2xl font-black text-red-500 mt-0.5 block">{overdueCount}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="bg-white rounded-3xl p-5 border border-[#BAC8B1]/30 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:max-w-md">
            <span className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-[#6C8480]">
              <Search size={16} />
            </span>
            <input
              type="text"
              placeholder="ابحث عن اللقاح بالاسم أو الرمز..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#E6E6E6]/50 border border-[#BAC8B1]/40 rounded-2xl pr-10 pl-4 py-2.5 text-sm text-[#404E3B] focus:outline-none focus:border-[#7B9669] transition-all"
            />
          </div>

          <div className="flex gap-2 w-full md:w-auto">
            {[
              { id: 'all', label: 'الكل' },
              { id: 'completed', label: 'مكتمل' },
              { id: 'upcoming', label: 'قادم' },
              { id: 'overdue', label: 'متأخر' }
            ].map((status) => (
              <button
                key={status.id}
                onClick={() => setStatusFilter(status.id)}
                className={`flex-1 md:flex-none px-4 py-2.5 rounded-2xl text-xs font-bold border transition-all ${
                  statusFilter === status.id
                    ? 'bg-[#404E3B] border-[#404E3B] text-white'
                    : 'bg-white border-[#BAC8B1]/40 text-[#6C8480] hover:bg-[#BAC8B1]/10'
                }`}
              >
                {status.label}
              </button>
            ))}
          </div>
        </div>

        {/* Vaccine Booklet Record Items */}
        <div className="bg-white rounded-3xl border border-[#BAC8B1]/30 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-[#BAC8B1]/20 bg-[#BAC8B1]/10 flex justify-between items-center">
            <h4 className="font-bold text-sm text-[#404E3B]">سجل التطعيمات</h4>
            <span className="text-xs text-[#6C8480] font-bold">عرض {filteredVaccines.length} سجلات</span>
          </div>

          {filteredVaccines.length === 0 ? (
            <div className="text-center py-16 flex flex-col items-center">
              <Search size={40} className="text-[#6C8480] stroke-1 mb-3" />
              <h4 className="font-bold text-sm text-[#404E3B]">لم يتم العثور على سجلات</h4>
              <p className="text-xs text-[#6C8480] mt-1">حاول تعديل الفلاتر أو كلمة البحث.</p>
            </div>
          ) : (
            <div className="divide-y divide-[#BAC8B1]/20 text-right">
              {filteredVaccines.map((v) => (
                <div
                  key={v.id}
                  className="p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:bg-gray-50/50 transition-colors"
                >
                  <div className="flex items-start gap-4 text-right">
                    <div className={`p-2.5 rounded-2xl mt-0.5 ${
                      v.status === 'completed'
                        ? 'bg-[#7B9669]/10 text-[#7B9669]'
                        : v.status === 'overdue'
                        ? 'bg-red-50 text-red-500'
                        : 'bg-amber-50 text-amber-600'
                    }`}>
                      {v.status === 'completed' ? <CheckCircle size={20} /> : v.status === 'overdue' ? <AlertTriangle size={20} /> : <Clock size={20} />}
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <h4 className="font-extrabold text-sm text-[#404E3B]">{v.name}</h4>
                        <span className="bg-[#BAC8B1]/20 border border-[#BAC8B1]/30 text-[#404E3B] text-[10px] font-bold px-2 py-0.5 rounded-md">
                          {v.code}
                        </span>
                        <span className="text-[10px] text-[#6C8480] font-medium">• {v.ageGroup}</span>
                      </div>

                      <p className="text-xs text-[#6C8480] leading-relaxed max-w-2xl">{v.description}</p>
                      
                      {/* Doctor & Clinic details if completed */}
                      {v.status === 'completed' && (v.administratorName || v.clinicName) && (
                        <div className="text-[11px] text-[#6C8480] flex flex-wrap gap-x-4 gap-y-1 mt-1 font-medium bg-[#E6E6E6]/40 px-3 py-1.5 rounded-xl w-fit">
                          <span>🩺 أعطي بواسطة: <strong className="text-[#404E3B]">{v.administratorName || 'N/A'}</strong></span>
                          <span>📍 الموقع: <strong className="text-[#404E3B]">{v.clinicName || 'N/A'}</strong></span>
                        </div>
                      )}

                      {v.notes && (
                        <p className="text-[11px] text-[#6C8480]/80 italic mt-1 bg-[#BAC8B1]/5 px-2.5 py-1.5 rounded border-r-2 border-[#7B9669]/40">
                          ملاحظات الأهل: {v.notes}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-row md:flex-col items-center md:items-end justify-between w-full md:w-auto border-t md:border-t-0 border-[#BAC8B1]/10 pt-3 md:pt-0 gap-3">
                    <div className="text-right">
                      <span className="text-[10px] text-[#6C8480] font-bold block uppercase tracking-wider">
                        {v.status === 'completed' ? 'تاريخ التطعيم' : 'التاريخ المجدول'}
                      </span>
                      <span className="text-xs font-bold text-[#404E3B]">
                        {v.status === 'completed' ? v.completedDate : v.scheduledDate}
                      </span>
                    </div>

                    <div className="flex gap-2">
                      {v.status !== 'completed' ? (
                        <button
                          onClick={() => toggleVaccineStatus(child.id, v.id, 'completed')}
                          className="bg-[#7B9669] hover:bg-[#7B9669]/90 text-white text-[11px] font-bold px-3 py-1.5 rounded-xl transition-all shadow-sm"
                        >
                          تحديد كمكتمل
                        </button>
                      ) : (
                        <button
                          onClick={() => toggleVaccineStatus(child.id, v.id, 'upcoming')}
                          className="bg-white hover:bg-gray-100 border border-[#BAC8B1]/30 text-[#404E3B] text-[11px] font-bold px-3 py-1.5 rounded-xl transition-all"
                        >
                          إلغاء الإكمال
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Add Custom Record Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-[#404E3B]/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-[#BAC8B1]/30 animate-fade-in relative text-right">
            <button
              onClick={() => setShowAddModal(false)}
              className="absolute top-4 left-4 p-1.5 hover:bg-[#E6E6E6] rounded-full text-[#6C8480] transition-all"
            >
              <X size={16} />
            </button>

            <h3 className="text-lg font-bold text-[#404E3B]">إضافة سجل تطعيم</h3>
            <p className="text-xs text-[#6C8480] mt-1">تسجيل تطعيم تم إجراؤه في عيادة خاصة أو مستشفى.</p>

            <form onSubmit={handleAddCustomRecord} className="mt-5 space-y-4">
              <div>
                <label className="text-[11px] font-bold text-[#6C8480] block mb-1 uppercase tracking-wider">اسم اللقاح</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: منشط لقاح الإنفلونزا"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full bg-[#E6E6E6]/50 border border-[#BAC8B1]/60 text-[#404E3B] rounded-2xl px-4 py-3 focus:outline-none focus:border-[#7B9669] text-xs font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[11px] font-bold text-[#6C8480] block mb-1 uppercase tracking-wider">رمز اللقاح</label>
                  <input
                    type="text"
                    required
                    placeholder="مثال: INFLUENZA"
                    value={newCode}
                    onChange={(e) => setNewCode(e.target.value)}
                    className="w-full bg-[#E6E6E6]/50 border border-[#BAC8B1]/60 text-[#404E3B] rounded-2xl px-4 py-3 focus:outline-none focus:border-[#7B9669] text-xs font-semibold"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-[#6C8480] block mb-1 uppercase tracking-wider">تاريخ الإعطاء</label>
                  <input
                    type="date"
                    required
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    className="w-full bg-[#E6E6E6]/50 border border-[#BAC8B1]/60 text-[#404E3B] rounded-2xl px-4 py-3 focus:outline-none focus:border-[#7B9669] text-xs font-semibold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[11px] font-bold text-[#6C8480] block mb-1 uppercase tracking-wider">اسم الطبيب</label>
                  <input
                    type="text"
                    placeholder="مثال: د. سمير"
                    value={newAdmin}
                    onChange={(e) => setNewAdmin(e.target.value)}
                    className="w-full bg-[#E6E6E6]/50 border border-[#BAC8B1]/60 text-[#404E3B] rounded-2xl px-4 py-3 focus:outline-none focus:border-[#7B9669] text-xs font-semibold"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-[#6C8480] block mb-1 uppercase tracking-wider">العيادة/المستشفى</label>
                  <input
                    type="text"
                    placeholder="مثال: عيادة الأمل"
                    value={newClinic}
                    onChange={(e) => setNewClinic(e.target.value)}
                    className="w-full bg-[#E6E6E6]/50 border border-[#BAC8B1]/60 text-[#404E3B] rounded-2xl px-4 py-3 focus:outline-none focus:border-[#7B9669] text-xs font-semibold"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-[#6C8480] block mb-1 uppercase tracking-wider">ملاحظات / آثار جانبية لوحظت</label>
                <textarea
                  placeholder="مثال: احمرار خفيف، حرارة طفيفة 37.8 مئوية"
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  className="w-full bg-[#E6E6E6]/50 border border-[#BAC8B1]/60 text-[#404E3B] rounded-2xl px-4 py-2.5 focus:outline-none focus:border-[#7B9669] text-xs font-semibold h-20 resize-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2.5 rounded-2xl bg-[#E6E6E6] hover:bg-[#E6E6E6]/80 text-[#404E3B] font-bold text-xs transition-all"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-2xl bg-[#7B9669] hover:bg-[#7B9669]/90 text-white font-bold text-xs transition-all shadow-md shadow-[#7B9669]/10"
                >
                  تسجيل السجل
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
