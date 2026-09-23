import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import NotificationDropdown from '../notifications/NotificationDropdown';
import Logo from '../../assets/Logo';
import { translateRole } from '../../utils/arabicLocalization';
import { useMobileNav } from '../../context/MobileNavContext';

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { isMobileNavOpen, toggleMobileNav } = useMobileNav();
  const basePath = '/' + location.pathname.split('/')[1];
  const [profileOpen, setProfileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const profileRef = useRef(null);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Close profile dropdown on outside click
  useEffect(() => {
    const handleClick = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  // Shadow on scroll
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 4);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const arabicRole = translateRole(user?.role);

  return (
    <header
      className={`flex items-center justify-between px-4 sm:px-6 lg:px-8 py-2.5 sm:py-3 sticky top-0 z-50 transition-all duration-300
        bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800/80
        ${scrolled ? 'shadow-card' : ''}`}
    >
      {/* ── Logo & Mobile Nav Toggle ── */}
      <div className="flex items-center gap-2 sm:gap-4 lg:gap-8 flex-shrink-0">
        <button
          onClick={toggleMobileNav}
          className="lg:hidden p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center justify-center"
          aria-label={isMobileNavOpen ? 'إغلاق القائمة' : 'فتح القائمة'}
          aria-expanded={isMobileNavOpen}
        >
          <span className="material-symbols-outlined text-2xl">
            {isMobileNavOpen ? 'close' : 'menu'}
          </span>
        </button>

        <Link to="/" className="flex items-center transition-opacity hover:opacity-90">
          <Logo variant="full" size="sm" />
        </Link>
      </div>

      {/* ── Actions ── */}
      <div className="flex items-center gap-2 flex-shrink-0">
        {/* Notifications */}
        <NotificationDropdown />

        {/* ── Profile Dropdown ── */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => setProfileOpen((v) => !v)}
            className="flex items-center gap-2.5 rounded-xl px-2 py-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
            aria-label="القائمة الشخصية"
            aria-expanded={profileOpen}
          >
            <div className="size-9 rounded-full bg-primary/20 border-2 border-white dark:border-slate-700 overflow-hidden flex-shrink-0 shadow-sm">
              <img
                alt={user?.fullName || 'مستخدم'}
                className="w-full h-full object-cover"
                src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user?.fullName || 'User')}&background=0b84da&color=fff&bold=true`}
              />
            </div>
            <div className="hidden lg:block text-right leading-tight">
              <p className="text-sm font-bold text-slate-900 dark:text-white truncate max-w-[120px]">
                {user?.fullName || 'مستخدم'}
              </p>
              <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-primary/10 text-primary">
                {arabicRole}
              </span>
            </div>
            <span
              className={`material-symbols-outlined text-slate-400 text-lg hidden lg:inline-block transition-transform duration-200 ${profileOpen ? 'rotate-180' : ''}`}
            >
              expand_more
            </span>
          </button>

          {/* Dropdown Panel */}
          <div
            className={`absolute left-0 mt-2 w-[calc(100vw-2rem)] max-w-xs sm:w-56 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden z-50 transition-all duration-200 origin-top-left
              ${profileOpen ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 -translate-y-2 pointer-events-none'}`}
          >
            {/* User info header */}
            <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50">
              <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{user?.fullName}</p>
              <p className="text-[10px] text-slate-500 truncate mt-0.5">{arabicRole}</p>
            </div>

            <div className="py-1.5">
              {[
                { to: `${basePath}/profile`,              icon: 'account_circle', label: 'ملفي الشخصي' },
                { to: `${basePath}/profile?tab=password`, icon: 'lock',           label: 'تغيير كلمة المرور' },
              ].map(({ to, icon, label }) => (
                <Link
                  key={to}
                  to={to}
                  onClick={() => setProfileOpen(false)}
                  className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/60 hover:text-primary transition-colors"
                >
                  <span className="material-symbols-outlined text-[18px] text-slate-400">{icon}</span>
                  {label}
                </Link>
              ))}
            </div>

            <div className="border-t border-slate-100 dark:border-slate-700 py-1.5">
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
              >
                <span className="material-symbols-outlined text-[18px]">logout</span>
                تسجيل الخروج
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
