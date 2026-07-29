import React from 'react';
import { NavLink } from 'react-router-dom';

const roles = [
  { id: "student", name: "الطلاب", icon: "group", path: "/admin/roles/student" },
  { id: "leader", name: "القائد", icon: "stars", path: "/admin/roles/leader" },
  { id: "supervisor", name: "المشرفون", icon: "supervisor_account", path: "/admin/roles/supervisor" },
  { id: "committee", name: "رؤساء الأقسام", icon: "diversity_3", path: "/admin/roles/committee" },
  { id: "systemAdmin", name: "مدير النظام", icon: "admin_panel_settings", path: "/admin/roles/system-admin" }
];

const RoleSidebar = () => {
    return (
        <aside className="w-full lg:w-80 flex-shrink-0 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col p-6 space-y-6 h-fit">
            <div>
                <h3 className="text-slate-900 dark:text-white font-bold text-lg mb-1">أدوار المستخدمين</h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm">تحديد وإدارة مستويات الوصول للنظام.</p>
            </div>
            <div className="space-y-1">
                {roles.map(role => (
                    <NavLink 
                        key={role.id}
                        to={role.path} 
                        className={({ isActive }) =>
                            isActive
                                ? "w-full flex items-center gap-3 px-4 py-3 rounded-lg active-role text-primary transition-colors"
                                : "w-full flex items-center gap-3 px-4 py-3 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                        }
                    >
                        {({ isActive }) => (
                            <>
                                <span className="material-symbols-outlined" style={{ fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" }}>
                                    {role.icon}
                                </span>
                                <span className={isActive ? "text-sm font-bold" : "text-sm font-medium"}>
                                    {role.name}
                                </span>
                            </>
                        )}
                    </NavLink>
                ))}
            </div>
            <div className="pt-4 mt-auto">
                <button className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-primary/10 text-primary rounded-lg font-bold text-sm hover:bg-primary/20 transition-all">
                    <span className="material-symbols-outlined text-lg">add_circle</span>
                    إضافة دور مخصص
                </button>
            </div>
        </aside>
    );
};

export default RoleSidebar;
