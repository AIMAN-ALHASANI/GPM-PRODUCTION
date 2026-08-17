import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import Logo from '../../assets/Logo';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const user = await login(email, password);
      const displayName = user?.fullName || user?.name || '';
      toast.success(displayName ? `مرحباً ${displayName}` : 'مرحباً');
      switch (user.role) {
        case 'SuperAdmin': navigate('/superadmin/dashboard'); break;
        case 'Admin': navigate('/admin/dashboard'); break;
        case 'Student': navigate('/student/dashboard'); break;
        case 'Supervisor': navigate('/supervisor/dashboard'); break;
        case 'HeadOfDepartment': navigate('/hod/dashboard'); break;
        default: navigate('/');
      }
    } catch (error) {
      console.error('Login failed', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden" dir="rtl">
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-blue-50/40 to-cyan-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950" />

      {/* Floating orbs */}
      <div className="absolute top-1/4 right-1/4 w-72 h-72 hero-orb bg-primary/8 animate-float-slow pointer-events-none" />
      <div className="absolute bottom-1/3 left-1/4 w-56 h-56 hero-orb bg-accent/6 animate-float-medium pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 w-96 h-96 hero-orb bg-primary/4 animate-float-slow pointer-events-none" style={{ animationDelay: '3s' }} />

      {/* Card */}
      <div className="relative z-10 w-full max-w-md animate-fade-in-scale">
        <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/60 dark:border-slate-700/60 overflow-hidden">

          {/* Header gradient bar */}
          <div className="h-1.5 w-full bg-gradient-to-l from-accent via-primary to-primary-dark" />

          <div className="p-8 pb-6">
            {/* Logo + Title */}
            <div className="flex flex-col items-center mb-8 gap-4">
              <div className="relative">
                <div className="absolute inset-0 bg-primary/20 rounded-2xl blur-xl" />
                <div className="relative w-16 h-16 bg-gradient-to-br from-primary/10 to-accent/10 rounded-2xl border border-primary/20 flex items-center justify-center">
                  <Logo variant="icon" size="md" />
                </div>
              </div>
              <div className="text-center">
                <h1 className="text-2xl font-black text-slate-900 dark:text-white">تسجيل الدخول</h1>
                <p className="text-slate-500 dark:text-slate-400 mt-1.5 text-sm">
                  نظام إدارة مشاريع التخرج — GPM
                </p>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleLogin} className="space-y-5">
              {/* Email */}
              <div className="space-y-1.5">
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300">
                  البريد الإلكتروني
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                    <span className="material-symbols-outlined text-slate-400 text-[18px]">mail</span>
                  </span>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pr-10 pl-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-left"
                    dir="ltr"
                    placeholder="email@university.edu"
                  />
                </div>
                <p className="text-[11px] text-slate-400 pr-1"></p>
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300">كلمة المرور</label>
                  <a href="#" className="text-xs font-bold text-primary hover:underline">نسيت كلمة المرور؟</a>
                </div>
                <div className="relative">
                  <span className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                    <span className="material-symbols-outlined text-slate-400 text-[18px]">lock</span>
                  </span>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pr-10 pl-10 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-left"
                    dir="ltr"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute inset-y-0 left-3 flex items-center text-slate-400 hover:text-primary transition-colors"
                  >
                    <span className="material-symbols-outlined text-[18px]">
                      {showPassword ? 'visibility_off' : 'visibility'}
                    </span>
                  </button>
                </div>
              </div>

              {/* Remember me */}
              <div className="flex items-center gap-2.5">
                <input
                  type="checkbox"
                  id="remember"
                  className="w-4 h-4 rounded border-slate-300 text-primary focus:ring-primary"
                />
                <label htmlFor="remember" className="text-sm text-slate-600 dark:text-slate-400">
                  تذكرني على هذا الجهاز
                </label>
              </div>

              {/* Submit button */}
              <button
                type="submit"
                disabled={isLoading}
                style={{ color: '#ffffff' }}
                className="w-full py-3.5 bg-gradient-to-l from-primary-dark to-primary font-black rounded-xl shadow-lg shadow-primary/25 hover:brightness-110 hover:shadow-xl hover:shadow-primary/30 active:scale-[0.98] transition-all flex items-center justify-center gap-2.5 disabled:opacity-60 disabled:cursor-not-allowed select-none"
              >
                {isLoading ? (
                  <span className="inline-flex items-center gap-2.5" style={{ color: '#ffffff' }}>
                    <span className="material-symbols-outlined animate-spin text-xl" style={{ color: '#ffffff' }}>progress_activity</span>
                    <span style={{ color: '#ffffff' }}>جاري تسجيل الدخول...</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-2.5" style={{ color: '#ffffff' }}>
                    <span className="material-symbols-outlined text-xl" style={{ color: '#ffffff' }}>login</span>
                    <span style={{ color: '#ffffff' }}>تسجيل الدخول</span>
                  </span>
                )}
              </button>
            </form>
          </div>

          {/* Footer */}
          <div className="px-8 py-4 bg-slate-50/80 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-700/50 text-center">
            <Link
              to="/"
              className="text-slate-500 hover:text-primary transition-colors text-sm font-semibold inline-flex items-center justify-center gap-1.5"
            >
              <span className="material-symbols-outlined text-sm">arrow_forward</span>
              العودة إلى الصفحة الرئيسية
            </Link>
          </div>
        </div>

        {/* Branding below card */}
        <div className="mt-6 text-center">
          <Logo variant="full" size="sm" className="justify-center opacity-60" />
        </div>
      </div>
    </div>
  );
};

export default Login;
