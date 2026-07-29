import React from 'react';
import { NavLink } from 'react-router-dom';
import Logo from '../assets/Logo';
import { useAuth } from '../context/AuthContext';

const SupervisorSidebar = () => {
  const { user } = useAuth();

  const getNavClass = ({ isActive }) =>
    `flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 ${
      isActive
        ? 'bg-primary/10 text-primary font-bold sidebar-active'
        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
    }`;

  const getIconStyle = (isActive) =>
    isActive ? { fontVariationSettings: "'FILL' 1" } : {};

  const navItems = [
    { to: '/supervisor/dashboard',     icon: 'dashboard',       label: 'لوحة التحكم',  end: true },
    { to: '/supervisor/projects',      icon: 'folder',          label: 'المشاريع' },
    { to: '/supervisor/reports',       icon: 'rate_review',     label: 'تقارير الفريق' },
    { to: '/supervisor/meetings',      icon: 'event_available', label: 'الاجتماعات' },
    { to: '/supervisor/notifications', icon: 'notifications',   label: 'الإشعارات' },
    { to: '/supervisor/profile',       icon: 'account_circle',  label: 'ملفي الشخصي' },
  ];

  return (
    <aside className="w-64 border-l border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hidden lg:flex flex-col p-5 gap-5 flex-shrink-0" dir="rtl">
      {/* Logo + Brand */}
      <div className="flex items-center gap-3 px-1 py-2 mb-1">
        <Logo variant="icon" size="sm" />
        <div className="flex flex-col leading-tight">
          <span className="text-sm font-black text-slate-900 dark:text-white">لوحة المشرف</span>
          <span className="text-[10px] text-slate-400 font-medium">{user?.fullName || 'المشرف'}</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-0.5">
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-600 px-3 mb-2">
          القائمة الرئيسية
        </p>
        {navItems.map(({ to, icon, label, end }) => (
          <NavLink key={to} to={to} className={getNavClass} end={end}>
            {({ isActive }) => (
              <>
                <span className="material-symbols-outlined text-[20px] flex-shrink-0" style={getIconStyle(isActive)}>
                  {icon}
                </span>
                <span className="text-sm">{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Status Card */}
      <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
        <div className="bg-gradient-to-br from-primary/5 to-accent/5 dark:from-primary/10 dark:to-accent/10 rounded-2xl p-4 border border-primary/10">
          <p className="text-[10px] font-black text-primary uppercase tracking-wider mb-2">حالة النظام</p>
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <span className="text-[11px] text-slate-600 dark:text-slate-300 font-semibold">جميع الأنظمة تعمل</span>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default SupervisorSidebar;
