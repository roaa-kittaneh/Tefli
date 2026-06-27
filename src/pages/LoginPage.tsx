import React, { useState, useEffect } from 'react';
import { useVaccineStore } from '../store/useVaccineStore';
import { Baby, Mail, Lock, Eye, EyeOff, ArrowLeft, Shield } from 'lucide-react';

interface LoginPageProps {
  onNavigateToSignup: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onNavigateToSignup }) => {
  const { login, authError, clearAuthError } = useVaccineStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [touched, setTouched] = useState({ email: false, password: false });

  useEffect(() => {
    clearAuthError();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulate network delay for UX polish
    await new Promise((r) => setTimeout(r, 500));
    const success = await login(email.trim(), password.trim());
    setIsLoading(false);
  };

  const isEmailValid = email.includes('@') && email.includes('.');
  const isPasswordValid = password.length >= 8;

  return (
    <div className="min-h-screen bg-[#E6E6E6] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background decorative blobs */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#BAC8B1]/30 rounded-full translate-x-1/3 -translate-y-1/3 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-[#7B9669]/20 rounded-full -translate-x-1/3 translate-y-1/3 blur-3xl pointer-events-none" />

      <div className="w-full max-w-md animate-fade-in text-right">
        {/* Logo Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-[#7B9669] to-[#6C8480] rounded-3xl shadow-xl shadow-[#7B9669]/20 mb-4">
            <Baby size={30} className="text-white" />
          </div>
          <h1 className="text-3xl font-extrabold text-[#404E3B] tracking-tight">أهلاً بكم في طفلي</h1>
          <p className="text-sm text-[#6C8480] mt-1.5 font-medium">سجل الدخول لتتبع مسيرة تطعيمات طفلك</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-3xl shadow-xl shadow-black/5 border border-[#BAC8B1]/30 p-8">
          <h2 className="text-lg font-bold text-[#404E3B] mb-6">تسجيل الدخول إلى حسابك</h2>

          {/* Auth Error */}
          {authError && (
            <div className="mb-5 bg-red-50 border border-red-200 text-red-700 text-sm font-medium px-4 py-3 rounded-2xl flex items-center gap-2 animate-fade-in justify-start">
              <Shield size={16} className="flex-shrink-0 text-red-500" />
              <span>{authError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email Field */}
            <div>
              <label htmlFor="login-email" className="block text-xs font-bold text-[#6C8480] uppercase tracking-wider mb-1.5">
                البريد الإلكتروني
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-[#6C8480]">
                  <Mail size={16} />
                </span>
                <input
                  id="login-email"
                  type="email"
                  required
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onBlur={() => setTouched((t) => ({ ...t, email: true }))}
                  className={`w-full bg-[#E6E6E6]/50 border rounded-2xl pr-11 pl-4 py-3.5 text-sm text-[#404E3B] font-medium focus:outline-none transition-all ${
                    touched.email && !isEmailValid
                      ? 'border-red-300 focus:border-red-400 bg-red-50/30'
                      : 'border-[#BAC8B1]/50 focus:border-[#7B9669] focus:bg-white'
                  }`}
                />
              </div>
              {touched.email && !isEmailValid && (
                <p className="text-xs text-red-500 mt-1 font-medium text-right">يرجى إدخال بريد إلكتروني صحيح.</p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="login-password" className="block text-xs font-bold text-[#6C8480] uppercase tracking-wider mb-1.5">
                كلمة المرور
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-[#6C8480]">
                  <Lock size={16} />
                </span>
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="أدخل كلمة المرور"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onBlur={() => setTouched((t) => ({ ...t, password: true }))}
                  className={`w-full bg-[#E6E6E6]/50 border rounded-2xl pr-11 pl-12 py-3.5 text-sm text-[#404E3B] font-medium focus:outline-none transition-all ${
                    touched.password && !isPasswordValid
                      ? 'border-red-300 focus:border-red-400 bg-red-50/30'
                      : 'border-[#BAC8B1]/50 focus:border-[#7B9669] focus:bg-white'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 left-0 pl-4 flex items-center text-[#6C8480] hover:text-[#404E3B] transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {touched.password && !isPasswordValid && (
                <p className="text-xs text-red-500 mt-1 font-medium text-right">يجب أن تتكون كلمة المرور من 6 خانات على الأقل.</p>
              )}
            </div>

            {/* Demo hint */}
            <div className="bg-[#BAC8B1]/20 border border-[#BAC8B1]/40 rounded-2xl px-4 py-3">
              <p className="text-[11px] text-[#6C8480] font-semibold leading-relaxed text-right">
                <span className="text-[#7B9669] font-bold">الحساب التجريبي:</span> البريد الإلكتروني: <code className="bg-white/70 px-1 rounded">sara@tifli.jo</code> · كلمة المرور: <code className="bg-white/70 px-1 rounded">1234567890</code>
              </p>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading || !isEmailValid || !isPasswordValid}
              className="w-full bg-gradient-to-r from-[#7B9669] to-[#6C8480] hover:from-[#7B9669]/90 hover:to-[#6C8480]/90 text-white font-bold py-3.5 px-6 rounded-2xl transition-all duration-300 flex items-center justify-center gap-2.5 shadow-lg shadow-[#7B9669]/20 disabled:opacity-60 disabled:cursor-not-allowed mt-2"
            >
              {isLoading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  جاري تسجيل الدخول...
                </>
              ) : (
                <>
                  تسجيل الدخول
                  <ArrowLeft size={18} />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-[#BAC8B1]/40" />
            <span className="text-xs text-[#6C8480] font-semibold">ليس لديك حساب؟</span>
            <div className="flex-1 h-px bg-[#BAC8B1]/40" />
          </div>

          <button
            onClick={onNavigateToSignup}
            className="w-full bg-transparent border-2 border-[#BAC8B1]/60 hover:border-[#7B9669]/60 hover:bg-[#BAC8B1]/10 text-[#404E3B] font-bold py-3.5 px-6 rounded-2xl transition-all duration-300 text-sm"
          >
            إنشاء حساب جديد
          </button>
        </div>

        <p className="text-center text-[11px] text-[#6C8480] mt-6 font-medium">
          متتبع تطعيمات الأطفال طفلي · البرنامج الوطني الأردني للمطاعيم
        </p>
      </div>
    </div>
  );
};
