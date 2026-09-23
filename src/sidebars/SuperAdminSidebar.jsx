import React from 'react';
import { NavLink } from 'react-router-dom';
import Logo from '../assets/Logo';
import { useAuth } from '../context/AuthContext';
import { useMobileNav } from '../context/MobileNavContext';

const SuperAdminSidebar = () => {
  const { user } = useAuth();
  const { isMobileNavOpen, closeMobileNav } = useMobileNav();

  const getNavClass = ({ isActive }) =>
    `flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 ${
      isActive
        ? 'bg-primary/10 text-primary font-bold sidebar-active'
        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
    }`;

  const getIconStyle = (isActive) =>
    isActive ? { fontVariationSettings: "'FILL' 1" } : {};

  const groups = [
    {
      label: 'النظام والتحليلات',
      items: [
        { to: '/superadmin/dashboard', icon: 'dashboard',  label: 'لوحة التحكم الرئيسية', end: true },
        { to: '/superadmin/analytics', icon: 'monitoring', label: 'التحليلات المتقدمة' },
        { to: '/superadmin/activity',  icon: 'history',    label: 'نشاط النظام' },
      ],
    },
    {
      label: 'إدارة المؤسسات',
      items: [
        { to: '/superadmin/colleges', icon: 'domain', label: 'الكليات والأقسام' },
      ],
    },
    {
      label: 'إدارة الحسابات',
      items: [
        { to: '/superadmin/admins',            icon: 'manage_accounts', label: 'مدراء الكليات' },
        { to: '/superadmin/users',             icon: 'person_search',   label: 'المستخدمين العامين' },
        { to: '/superadmin/archived-projects', icon: 'inventory_2',     label: 'المشاريع المؤرشفة' },
        { to: '/superadmin/notifications',     icon: 'notifications',   label: 'الإشعارات' },
        { to: '/superadmin/profile',           icon: 'account_circle',  label: 'الملف الشخصي' },
      ],
    },
  ];

  const renderNavGroups = (onItemClick) => (
    <nav className="flex-1 space-y-4 overflow-y-auto">
      {groups.map((group) => (
        <div key={group.label} className="space-y-0.5">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-600 px-3 mb-2">
            {group.label}
          </p>
          {group.items.map(({ to, icon, label, end }) => (
            <NavLink
              key={to}
              to={to}
              onClick={onItemClick}
              className={getNavClass}
              end={end}
            >
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
        </div>
      ))}
    </nav>
  );

  const statusCard = (
    <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
      <div className="bg-red-50 dark:bg-red-950/20 rounded-2xl p-4 border border-red-100 dark:border-red-900/30">
        <p className="text-[10px] font-black text-red-600 uppercase tracking-wider mb-2">صلاحيات المدير العام</p>
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
          </span>
          <span className="text-[11px] text-slate-600 dark:text-slate-300 font-semibold">كامل الصلاحيات نشطة</span>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="w-64 border-l border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hidden lg:flex flex-col p-5 gap-5 flex-shrink-0" dir="rtl">
        {/* Logo + Brand */}
        <div className="flex items-center gap-3 px-1 py-2 mb-1">
          <Logo variant="icon" size="sm" />
          <div className="flex flex-col leading-tight">
            <span className="text-sm font-black text-slate-900 dark:text-white">المدير العام</span>
            <span className="text-[10px] text-red-500 font-bold">كامل الصلاحيات</span>
          </div>
        </div>

        {/* Navigation Groups */}
        {renderNavGroups()}

        {/* Status Card */}
        {statusCard}
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
              <span className="text-sm font-black text-slate-900 dark:text-white">المدير العام</span>
              <span className="text-[10px] text-red-500 font-bold">كامل الصلاحيات</span>
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

        {/* Navigation Groups */}
        {renderNavGroups(closeMobileNav)}

        {/* Status Card */}
        {statusCard}
      </aside>
    </>
  );
};

export default SuperAdminSidebar;
