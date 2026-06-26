import React, { useState, useEffect } from 'react';
import { useVaccineStore } from '../store/useVaccineStore';
import { Baby, Mail, CreditCard, User as UserIcon, Eye, EyeOff, ArrowLeft, ArrowRight, CheckCircle, Shield } from 'lucide-react';

interface SignupPageProps {
  onNavigateToLogin: () => void;
}

export const SignupPage: React.FC<SignupPageProps> = ({ onNavigateToLogin }) => {
  const { signup, authError, clearAuthError } = useVaccineStore();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [idNumber, setIdNumber] = useState('');
  const [showId, setShowId] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [touched, setTouched] = useState({ name: false, email: false, idNumber: false });
  const [agreed, setAgreed] = useState(false);

  useEffect(() => {
    clearAuthError();
  }, []);

  const isNameValid = name.trim().length >= 2;
  const isEmailValid = email.includes('@') && email.includes('.');
  const isIdValid = /^\d{6,}$/.test(idNumber.trim());
  const isFormValid = isNameValid && isEmailValid && isIdValid && agreed;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return;
    setIsLoading(true);
    await new Promise((r) => setTimeout(r, 700));
    signup({ name: name.trim(), email: email.trim().toLowerCase(), idNumber: idNumber.trim() });
    setIsLoading(false);
  };

  const requirements = [
    { label: 'الاسم الكامل (حرفين أو أكثر)', met: isNameValid },
    { label: 'البريد الإلكتروني صحيح', met: isEmailValid },
    { label: 'رقم الهوية الوطنية (أرقام فقط، 6+)', met: isIdValid },
  ];

  return (
    <div className="min-h-screen bg-[#E6E6E6] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Decorative blobs */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-[#BAC8B1]/30 rounded-full -translate-x-1/3 -translate-y-1/3 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-80 h-80 bg-[#7B9669]/20 rounded-full translate-x-1/3 translate-y-1/3 blur-3xl pointer-events-none" />

      <div className="w-full max-w-md animate-fade-in">
        {/* Logo Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-[#7B9669] to-[#6C8480] rounded-3xl shadow-xl shadow-[#7B9669]/20 mb-4">
            <Baby size={30} className="text-white" />
          </div>
          <h1 className="text-3xl font-extrabold text-[#404E3B] tracking-tight text-center">إنشاء حسابك الجديد</h1>
          <p className="text-sm text-[#6C8480] mt-1.5 font-medium text-center">ابدأ في تتبع تطعيمات طفلك ونموه</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-3xl shadow-xl shadow-black/5 border border-[#BAC8B1]/30 p-8">
          <h2 className="text-lg font-bold text-[#404E3B] mb-1">بيانات ولي الأمر / الوصي</h2>
          <p className="text-xs text-[#6C8480] mb-6 font-medium">جميع الحقول مطلوبة للتحقق من هويتك.</p>

          {/* Auth Error */}
          {authError && (
            <div className="mb-5 bg-red-50 border border-red-200 text-red-700 text-sm font-medium px-4 py-3 rounded-2xl flex items-center gap-2 animate-fade-in">
              <Shield size={16} className="flex-shrink-0 text-red-500" />
              {authError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name */}
            <div>
              <label htmlFor="signup-name" className="block text-xs font-bold text-[#6C8480] uppercase tracking-wider mb-1.5">
                الاسم الكامل
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-[#6C8480]">
                  <UserIcon size={16} />
                </span>
                <input
                  id="signup-name"
                  type="text"
                  required
                  placeholder="مثال: ليلى محمد الأحمد"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onBlur={() => setTouched((t) => ({ ...t, name: true }))}
                  className={`w-full bg-[#E6E6E6]/50 border rounded-2xl pr-11 pl-12 py-3.5 text-sm text-[#404E3B] font-medium focus:outline-none transition-all ${
                    touched.name && !isNameValid
                      ? 'border-red-300 bg-red-50/30 focus:border-red-400'
                      : touched.name && isNameValid
                      ? 'border-[#7B9669]/60 bg-[#7B9669]/5 focus:border-[#7B9669]'
                      : 'border-[#BAC8B1]/50 focus:border-[#7B9669] focus:bg-white'
                  }`}
                />
                {touched.name && isNameValid && (
                  <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-[#7B9669]">
                    <CheckCircle size={16} />
                  </span>
                )}
              </div>
            </div>

            {/* Email */}
            <div>
              <label htmlFor="signup-email" className="block text-xs font-bold text-[#6C8480] uppercase tracking-wider mb-1.5">
                البريد الإلكتروني
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-[#6C8480]">
                  <Mail size={16} />
                </span>
                <input
                  id="signup-email"
                  type="email"
                  required
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onBlur={() => setTouched((t) => ({ ...t, email: true }))}
                  className={`w-full bg-[#E6E6E6]/50 border rounded-2xl pr-11 pl-12 py-3.5 text-sm text-[#404E3B] font-medium focus:outline-none transition-all ${
                    touched.email && !isEmailValid
                      ? 'border-red-300 bg-red-50/30 focus:border-red-400'
                      : touched.email && isEmailValid
                      ? 'border-[#7B9669]/60 bg-[#7B9669]/5 focus:border-[#7B9669]'
                      : 'border-[#BAC8B1]/50 focus:border-[#7B9669] focus:bg-white'
                  }`}
                />
                {touched.email && isEmailValid && (
                  <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-[#7B9669]">
                    <CheckCircle size={16} />
                  </span>
                )}
              </div>
            </div>

            {/* National ID */}
            <div>
              <label htmlFor="signup-id" className="block text-xs font-bold text-[#6C8480] uppercase tracking-wider mb-1.5">
                رقم الهوية الوطنية
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-[#6C8480]">
                  <CreditCard size={16} />
                </span>
                <input
                  id="signup-id"
                  type={showId ? 'text' : 'password'}
                  inputMode="numeric"
                  required
                  placeholder="أدخل رقم الهوية الوطنية"
                  value={idNumber}
                  onChange={(e) => setIdNumber(e.target.value.replace(/\D/g, ''))}
                  onBlur={() => setTouched((t) => ({ ...t, idNumber: true }))}
                  className={`w-full bg-[#E6E6E6]/50 border rounded-2xl pr-11 pl-12 py-3.5 text-sm text-[#404E3B] font-medium focus:outline-none transition-all ${
                    touched.idNumber && !isIdValid
                      ? 'border-red-300 bg-red-50/30 focus:border-red-400'
                      : touched.idNumber && isIdValid
                      ? 'border-[#7B9669]/60 bg-[#7B9669]/5 focus:border-[#7B9669]'
                      : 'border-[#BAC8B1]/50 focus:border-[#7B9669] focus:bg-white'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowId(!showId)}
                  className="absolute inset-y-0 left-0 pl-4 flex items-center text-[#6C8480] hover:text-[#404E3B] transition-colors"
                >
                  {showId ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              <p className="text-[10px] text-[#6C8480] mt-1 font-medium">يستخدم للتحقق من الهوية عند تسجيل الدخول. يجب ألا يقل عن 6 أرقام.</p>
            </div>

            {/* Live Validation Checklist */}
            <div className="bg-[#BAC8B1]/15 border border-[#BAC8B1]/30 rounded-2xl p-4 space-y-2">
              <p className="text-[10px] font-bold text-[#6C8480] uppercase tracking-wider mb-2 text-right">شروط الحساب</p>
              {requirements.map((req) => (
                <div key={req.label} className="flex items-center gap-2.5">
                  <div className={`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 transition-all ${req.met ? 'bg-[#7B9669] text-white' : 'bg-[#BAC8B1]/40 text-transparent'}`}>
                    <CheckCircle size={10} />
                  </div>
                  <span className={`text-xs font-medium transition-colors ${req.met ? 'text-[#404E3B]' : 'text-[#6C8480]'}`}>{req.label}</span>
                </div>
              ))}
            </div>

            {/* Agreement */}
            <label className="flex items-start gap-3 cursor-pointer group">
              <div
                onClick={() => setAgreed(!agreed)}
                className={`mt-0.5 w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                  agreed ? 'bg-[#7B9669] border-[#7B9669]' : 'border-[#BAC8B1] group-hover:border-[#7B9669]/60'
                }`}
              >
                {agreed && <CheckCircle size={12} className="text-white" />}
              </div>
              <span className="text-xs text-[#6C8480] font-medium leading-relaxed select-none text-right">
                أوافق على أن المعلومات المقدمة دقيقة ويمكن استخدامها للتحقق من هويتي داخل نظام تتبع تطعيمات تفلي.
              </span>
            </label>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading || !isFormValid}
              className="w-full bg-gradient-to-r from-[#7B9669] to-[#6C8480] hover:from-[#7B9669]/90 hover:to-[#6C8480]/90 text-white font-bold py-3.5 px-6 rounded-2xl transition-all duration-300 flex items-center justify-center gap-2.5 shadow-lg shadow-[#7B9669]/20 disabled:opacity-50 disabled:cursor-not-allowed mt-2"
            >
              {isLoading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  جاري إنشاء الحساب...
                </>
              ) : (
                <>
                  إنشاء الحساب
                  <ArrowLeft size={18} />
                </>
              )}
            </button>
          </form>

          {/* Back to login */}
          <button
            onClick={onNavigateToLogin}
            className="w-full mt-4 flex items-center justify-center gap-2 text-sm font-semibold text-[#6C8480] hover:text-[#404E3B] transition-colors py-2"
          >
            <ArrowRight size={15} /> لديك حساب بالفعل؟ تسجيل الدخول
          </button>
        </div>

        <p className="text-center text-[11px] text-[#6C8480] mt-6 font-medium">
          متتبع تطعيمات الأطفال تفلي · البرنامج الوطني الأردني للمطاعيم
        </p>
      </div>
    </div>
  );
};
