import React from 'react';
import { NavLink } from 'react-router-dom';
import Logo from '../assets/Logo';
import { useAuth } from '../context/AuthContext';
import useMyTeam from '../hooks/useMyTeam';
import toast from 'react-hot-toast';
import { useMobileNav } from '../context/MobileNavContext';

const StudentSidebar = () => {
  const { user } = useAuth();
  const { hasTeam, isApproved, isPending, isLoading } = useMyTeam();
  const { isMobileNavOpen, closeMobileNav } = useMobileNav();

  const getNavClass = ({ isActive }) =>
    `flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 ${
      isActive
        ? 'bg-primary/10 text-primary font-bold sidebar-active'
        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
    }`;

  const getIconStyle = (isActive) =>
    isActive ? { fontVariationSettings: "'FILL' 1" } : {};

  const navItems = [
    { to: '/student/dashboard',       icon: 'dashboard',       label: 'لوحة التحكم',    end: true },
    { to: '/student/team',            icon: 'group',           label: 'فريقي' },
    { to: '/student/project',         icon: 'folder',          label: 'تفاصيل المشروع' },
    { to: '/student/tasks',           icon: 'assignment',      label: 'المهام' },
    { to: '/student/proposals',       icon: 'lightbulb',       label: 'المقترح' },
    { to: '/student/reports',         icon: 'summarize',       label: 'التقارير' },
    { to: '/student/meetings',        icon: 'event_available', label: 'الاجتماعات' },
    { to: '/student/team/management', icon: 'manage_accounts', label: 'إدارة الفريق' },
    { to: '/student/notifications',   icon: 'notifications',   label: 'الإشعارات' },
    { to: '/student/profile',         icon: 'account_circle',  label: 'ملفي الشخصي' },
  ];

  // Routes that need a team (even pending)
  const requiresTeamRoutes = [
    '/student/team',
    '/student/team/management',
  ];

  // Routes that need an APPROVED team
  const requiresApprovalRoutes = [
    '/student/project',
    '/student/tasks',
    '/student/proposals',
    '/student/reports',
    '/student/meetings',
  ];

  const isLocked = (to) => {
    if (isLoading) return false;
    if (requiresTeamRoutes.includes(to))    return !hasTeam;
    if (requiresApprovalRoutes.includes(to)) return !isApproved;
    return false;
  };

  const getLockMessage = (to) => {
    if (requiresTeamRoutes.includes(to))
      return 'يجب أن تنضم إلى فريق أولاً للوصول إلى هذه الميزة';
    if (requiresApprovalRoutes.includes(to)) {
      if (isPending)
        return 'هذه الميزة متاحة بعد موافقة الأدمن على فريقك';
      return 'يجب أن تنضم إلى فريق معتمد للوصول إلى هذه الميزة';
    }
    return 'يجب أن تنضم إلى فريق أولاً للوصول إلى هذه الميزة';
  };

  const renderNavLinks = (onItemClick) => (
    <nav className="flex-1 space-y-0.5 overflow-y-auto">
      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-600 px-3 mb-2">
        القائمة الرئيسية
      </p>
      {navItems.map(({ to, icon, label, end }) => {
        const locked = isLocked(to);
        const linkTo = locked ? '#' : to;
        const handleClick = (e) => {
          if (locked) {
            e.preventDefault();
            toast.error(getLockMessage(to));
          } else if (onItemClick) {
            onItemClick();
          }
        };

        return (
          <NavLink
            key={to}
            to={linkTo}
            onClick={handleClick}
            className={({ isActive }) =>
              `${getNavClass({ isActive: isActive && !locked })} ${
                locked ? 'opacity-50 cursor-not-allowed' : ''
              }`
            }
            end={end}
          >
            {({ isActive }) => (
              <>
                <span className="material-symbols-outlined text-[20px] flex-shrink-0" style={getIconStyle(isActive && !locked)}>
                  {locked ? 'lock' : icon}
                </span>
                <span className="text-sm flex-1">{label}</span>
                {locked && (
                  <span className="material-symbols-outlined text-xs text-slate-400 dark:text-slate-500">lock</span>
                )}
              </>
            )}
          </NavLink>
        );
      })}
    </nav>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="w-64 border-l border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hidden lg:flex flex-col p-5 gap-5 flex-shrink-0" dir="rtl">
        {/* Logo + Brand */}
        <div className="flex items-center gap-3 px-1 py-2 mb-1">
          <Logo variant="icon" size="sm" />
          <div className="flex flex-col leading-tight">
            <span className="text-sm font-black text-slate-900 dark:text-white">بوابة الطالب</span>
            <span className="text-[10px] text-slate-400 font-medium truncate max-w-[120px]">
              {user?.fullName || 'الطالب'}
            </span>
          </div>
        </div>

        {/* Navigation */}
        {renderNavLinks()}

        {/* Status Card */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
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

      {/* Mobile Drawer Backdrop */}
      {isMobileNavOpen && (
        <div
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 lg:hidden"
          onClick={closeMobileNav}
          aria-hidden="true"
        />
      )}

      {/* Mobile Drawer */}
      <aside
        className={`fixed inset-y-0 right-0 z-50 w-72 max-w-[85vw] border-l border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col p-5 gap-5 shadow-2xl lg:hidden transition-transform duration-300 ease-in-out ${
          isMobileNavOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        dir="rtl"
        aria-label="قائمة التنقل للموبايل"
      >
        {/* Drawer Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <Logo variant="icon" size="sm" />
            <div className="flex flex-col leading-tight">
              <span className="text-sm font-black text-slate-900 dark:text-white">بوابة الطالب</span>
              <span className="text-[10px] text-slate-400 font-medium truncate max-w-[120px]">
                {user?.fullName || 'الطالب'}
              </span>
            </div>
          </div>
          <button
            onClick={closeMobileNav}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="إغلاق القائمة"
          >
            <span className="material-symbols-outlined text-xl">close</span>
          </button>
        </div>

        {/* Navigation */}
        {renderNavLinks(closeMobileNav)}

        {/* Status Card */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
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
    </>
  );
};

export default StudentSidebar;
