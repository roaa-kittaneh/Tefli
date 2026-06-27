import React, { useState, useEffect } from 'react';
import { useVaccineStore } from '../store/useVaccineStore';
import { Baby, Mail, Lock, User as UserIcon, Eye, EyeOff, ArrowLeft, ArrowRight, CheckCircle, Shield, Calendar } from 'lucide-react';

interface SignupPageProps {
  onNavigateToLogin: () => void;
}

export const SignupPage: React.FC<SignupPageProps> = ({ onNavigateToLogin }) => {
  const { signup, authError, clearAuthError } = useVaccineStore();

  // Parent Info
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  // Child Info
  const [childName, setChildName] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [gender, setGender] = useState<'male' | 'female'>('male');

  const [isLoading, setIsLoading] = useState(false);
  const [touched, setTouched] = useState({ fullName: false, email: false, password: false, childName: false, birthDate: false });
  const [agreed, setAgreed] = useState(false);

  useEffect(() => {
    clearAuthError();
  }, []);

  const isFullNameValid = fullName.trim().length >= 3;
  const isEmailValid = email.includes('@') && email.includes('.');
  const isPasswordValid = password.length >= 8;
  const isChildNameValid = childName.trim().length >= 2;
  const isBirthDateValid = birthDate !== '';
  
  const isFormValid = isFullNameValid && isEmailValid && isPasswordValid && isChildNameValid && isBirthDateValid && agreed;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return;
    setIsLoading(true);
    await new Promise((r) => setTimeout(r, 500));
    
    // Calls the updated store signup that hits the backend register route
    await signup({
      fullName: fullName.trim(),
      email: email.trim().toLowerCase(),
      idNumber: password.trim(), // password mapped to idNumber for register schema
      childName: childName.trim(),
      birthDate,
      gender,
    });
    
    setIsLoading(false);
  };

  const requirements = [
    { label: 'الاسم الكامل لولي الأمر (3+ حروف)', met: isFullNameValid },
    { label: 'البريد الإلكتروني صحيح ومكتمل', met: isEmailValid },
    { label: 'كلمة مرور قوية (8+ خانات)', met: isPasswordValid },
    { label: 'اسم الطفل الثنائي أو الثلاثي', met: isChildNameValid },
    { label: 'تاريخ ولادة الطفل صحيح', met: isBirthDateValid },
  ];

  return (
    <div className="min-h-screen bg-[#E6E6E6] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Decorative blobs */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-[#BAC8B1]/30 rounded-full -translate-x-1/3 -translate-y-1/3 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-80 h-80 bg-[#7B9669]/20 rounded-full translate-x-1/3 translate-y-1/3 blur-3xl pointer-events-none" />

      <div className="w-full max-w-md animate-fade-in text-right my-8">
        {/* Logo Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-[#7B9669] to-[#6C8480] rounded-3xl shadow-xl shadow-[#7B9669]/20 mb-3">
            <Baby size={26} className="text-white" />
          </div>
          <h1 className="text-2xl font-extrabold text-[#404E3B] tracking-tight text-center">إنشاء حسابك الجديد</h1>
          <p className="text-xs text-[#6C8480] mt-1 font-medium text-center">ابدأ في تتبع تطعيمات طفلك ونموه رقمياً</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-3xl shadow-xl shadow-black/5 border border-[#BAC8B1]/30 p-6 md:p-8">
          {/* Auth Error */}
          {authError && (
            <div className="mb-5 bg-red-50 border border-red-200 text-red-700 text-xs font-semibold px-4 py-3 rounded-2xl flex items-center gap-2 animate-fade-in justify-start">
              <Shield size={14} className="flex-shrink-0 text-red-500" />
              <span>{authError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Section 1: Parent Info */}
            <div>
              <h3 className="text-xs font-extrabold text-[#7B9669] uppercase tracking-wider border-b border-[#BAC8B1]/20 pb-1 mb-3">بيانات ولي الأمر</h3>
              
              {/* Full Name */}
              <div className="mb-3">
                <label htmlFor="signup-name" className="block text-[10px] font-bold text-[#6C8480] uppercase tracking-wider mb-1.5">
                  الاسم الكامل لولي الأمر
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-[#6C8480]">
                    <UserIcon size={14} />
                  </span>
                  <input
                    id="signup-name"
                    type="text"
                    required
                    placeholder="ليلى محمد الأحمد"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    onBlur={() => setTouched((t) => ({ ...t, fullName: true }))}
                    className={`w-full bg-[#E6E6E6]/50 border rounded-2xl pr-10 pl-4 py-2.5 text-xs md:text-sm text-[#404E3B] font-medium focus:outline-none transition-all ${
                      touched.fullName && !isFullNameValid ? 'border-red-300 bg-red-50/30' : 'border-[#BAC8B1]/50 focus:border-[#7B9669] focus:bg-white'
                    }`}
                  />
                </div>
              </div>

              {/* Email */}
              <div className="mb-3">
                <label htmlFor="signup-email" className="block text-[10px] font-bold text-[#6C8480] uppercase tracking-wider mb-1.5">
                  البريد الإلكتروني
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-[#6C8480]">
                    <Mail size={14} />
                  </span>
                  <input
                    id="signup-email"
                    type="email"
                    required
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onBlur={() => setTouched((t) => ({ ...t, email: true }))}
                    className={`w-full bg-[#E6E6E6]/50 border rounded-2xl pr-10 pl-4 py-2.5 text-xs md:text-sm text-[#404E3B] font-medium focus:outline-none transition-all ${
                      touched.email && !isEmailValid ? 'border-red-300 bg-red-50/30' : 'border-[#BAC8B1]/50 focus:border-[#7B9669] focus:bg-white'
                    }`}
                  />
                </div>
              </div>

              {/* Password */}
              <div className="mb-1">
                <label htmlFor="signup-password" className="block text-[10px] font-bold text-[#6C8480] uppercase tracking-wider mb-1.5">
                  كلمة المرور
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-[#6C8480]">
                    <Lock size={14} />
                  </span>
                  <input
                    id="signup-password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="أدخل كلمة المرور"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onBlur={() => setTouched((t) => ({ ...t, password: true }))}
                    className={`w-full bg-[#E6E6E6]/50 border rounded-2xl pr-10 pl-10 py-2.5 text-xs md:text-sm text-[#404E3B] font-medium focus:outline-none transition-all ${
                      touched.password && !isPasswordValid ? 'border-red-300 bg-red-50/30' : 'border-[#BAC8B1]/50 focus:border-[#7B9669] focus:bg-white'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 left-0 pl-3 flex items-center text-[#6C8480] hover:text-[#404E3B] transition-colors"
                  >
                    {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </div>
            </div>

            {/* Section 2: Child Info */}
            <div>
              <h3 className="text-xs font-extrabold text-[#7B9669] uppercase tracking-wider border-b border-[#BAC8B1]/20 pb-1 mb-3">بيانات طفلك الأول</h3>
              
              {/* Child Name */}
              <div className="mb-3">
                <label htmlFor="signup-child-name" className="block text-[10px] font-bold text-[#6C8480] uppercase tracking-wider mb-1.5">
                  اسم الطفل
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-[#6C8480]">
                    <Baby size={14} />
                  </span>
                  <input
                    id="signup-child-name"
                    type="text"
                    required
                    placeholder="مثال: يوسف أو سارة"
                    value={childName}
                    onChange={(e) => setChildName(e.target.value)}
                    onBlur={() => setTouched((t) => ({ ...t, childName: true }))}
                    className={`w-full bg-[#E6E6E6]/50 border rounded-2xl pr-10 pl-4 py-2.5 text-xs md:text-sm text-[#404E3B] font-medium focus:outline-none transition-all ${
                      touched.childName && !isChildNameValid ? 'border-red-300 bg-red-50/30' : 'border-[#BAC8B1]/50 focus:border-[#7B9669] focus:bg-white'
                    }`}
                  />
                </div>
              </div>

              {/* Child Birthdate and Gender */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                <div>
                  <label htmlFor="signup-dob" className="block text-[10px] font-bold text-[#6C8480] uppercase tracking-wider mb-1.5">
                    تاريخ ولادة الطفل
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-[#6C8480]">
                      <Calendar size={14} />
                    </span>
                    <input
                      id="signup-dob"
                      type="date"
                      required
                      value={birthDate}
                      onChange={(e) => setBirthDate(e.target.value)}
                      onBlur={() => setTouched((t) => ({ ...t, birthDate: true }))}
                      className={`w-full bg-[#E6E6E6]/50 border rounded-2xl pr-9 pl-3 py-2.5 text-xs text-[#404E3B] font-medium focus:outline-none transition-all ${
                        touched.birthDate && !isBirthDateValid ? 'border-red-300 bg-red-50/30' : 'border-[#BAC8B1]/50 focus:border-[#7B9669] focus:bg-white'
                      }`}
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-[10px] font-bold text-[#6C8480] uppercase tracking-wider mb-1.5">
                    الجنس
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setGender('male')}
                      className={`py-2 rounded-xl text-xs font-bold border transition-all ${gender === 'male' ? 'bg-[#7B9669] text-white border-[#7B9669]' : 'bg-[#E6E6E6]/40 border-[#BAC8B1]/60 text-[#404E3B]'}`}
                    >
                      ذكر 👦
                    </button>
                    <button
                      type="button"
                      onClick={() => setGender('female')}
                      className={`py-2 rounded-xl text-xs font-bold border transition-all ${gender === 'female' ? 'bg-[#7B9669] text-white border-[#7B9669]' : 'bg-[#E6E6E6]/40 border-[#BAC8B1]/60 text-[#404E3B]'}`}
                    >
                      أنثى 👧
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Validation checklist */}
            <div className="bg-[#BAC8B1]/15 border border-[#BAC8B1]/30 rounded-2xl p-3.5 space-y-1.5">
              {requirements.map((req) => (
                <div key={req.label} className="flex items-center gap-2">
                  <div className={`w-3.5 h-3.5 rounded-full flex items-center justify-center flex-shrink-0 transition-all ${req.met ? 'bg-[#7B9669] text-white' : 'bg-[#BAC8B1]/40 text-transparent'}`}>
                    <CheckCircle size={8} />
                  </div>
                  <span className={`text-[10px] font-semibold transition-colors ${req.met ? 'text-[#404E3B]' : 'text-[#6C8480]'}`}>{req.label}</span>
                </div>
              ))}
            </div>

            {/* Agreement */}
            <label className="flex items-start gap-3 cursor-pointer group">
              <div
                onClick={() => setAgreed(!agreed)}
                className={`mt-0.5 w-4 h-4 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                  agreed ? 'bg-[#7B9669] border-[#7B9669]' : 'border-[#BAC8B1] group-hover:border-[#7B9669]/60'
                }`}
              >
                {agreed && <CheckCircle size={10} className="text-white" />}
              </div>
              <span className="text-[10px] text-[#6C8480] font-semibold leading-normal select-none text-right">
                أوافق على صحة ودقة البيانات المدخلة وتوليد جدول اللقاحات بناءً عليها.
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
                  جاري إنشاء حساب طفلك...
                </>
              ) : (
                <>
                  إنشاء الحساب والجدولة
                  <ArrowLeft size={16} />
                </>
              )}
            </button>
          </form>

          {/* Back to login */}
          <button
            onClick={onNavigateToLogin}
            className="w-full mt-4 flex items-center justify-center gap-2 text-xs font-semibold text-[#6C8480] hover:text-[#404E3B] transition-colors py-2"
          >
            <ArrowRight size={13} /> لديك حساب بالفعل؟ تسجيل الدخول
          </button>
        </div>

        <p className="text-center text-[10px] text-[#6C8480] mt-6 font-medium">
          متتبع تطعيمات الأطفال طفلي · البرنامج الوطني الأردني للمطاعيم
        </p>
      </div>
    </div>
  );
};
