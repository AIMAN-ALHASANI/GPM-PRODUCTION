import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useUsers } from '../../hooks/useUsers';

const UsersManagement = () => {
    const [page, setPage] = useState(1);
    const [roleFilter, setRoleFilter] = useState(null);
    const [search, setSearch] = useState('');

    const { data: apiResponse, isLoading, isError, error } = useUsers({
        PageNumber: page,
        PageSize: 10,
        Role: roleFilter,
    });

    const users = apiResponse?.data?.items || [];
    const pagination = apiResponse?.data || {};

    // Helper function to map roles to Arabic and styles
    const getRoleDetails = (role) => {
        const roleStr = String(role);
        switch (roleStr) {
            case '2':
            case 'Student':
                return { text: 'طالب', bg: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' };
            case '3':
            case 'Supervisor':
                return { text: 'مشرف', bg: 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300' };
            case '4':
            case 'HeadOfDepartment':
                return { text: 'رئيس قسم', bg: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300' };
            case '1':
            case 'Admin':
                return { text: 'أدمن', bg: 'bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300' };
            case '0':
            case 'SuperAdmin':
                return { text: 'سوبر أدمن', bg: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300' };
            default:
                return { text: role, bg: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300' };
        }
    };

    const getAvatarBg = (role) => {
        const roleStr = String(role);
        switch (roleStr) {
            case '2':
            case 'Student': return 'bg-primary/10 text-primary';
            case '3':
            case 'Supervisor': return 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300';
            case '4':
            case 'HeadOfDepartment': return 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300';
            case '1':
            case 'Admin': return 'bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300';
            case '0':
            case 'SuperAdmin': return 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300';
            default: return 'bg-slate-100 text-slate-700';
        }
    };

    const getInitial = (name) => {
        if (!name) return '?';
        if (name.startsWith("د. ")) {
            return name.replace("د. ", "").charAt(0);
        }
        return name.charAt(0);
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-6">
            <nav className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 mb-8">
                <Link className="hover:text-primary" to="/admin/dashboard">الرئيسية</Link>
                <span className="material-symbols-outlined text-sm">chevron_right</span>
                <span className="text-slate-900 dark:text-white font-medium">إدارة المستخدمين</span>
            </nav>

            <div className="max-w-7xl mx-auto w-full flex flex-col gap-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">حسابات المستخدمين</h2>
                        <p className="text-slate-500 dark:text-slate-400 text-base mt-1">إدارة {pagination.totalCount || 0} مستخدم في جميع الأقسام</p>
                    </div>
                    <div className="flex gap-3">
                        <Link to="/admin/users/add">
                            <button className="flex items-center justify-center gap-2 rounded-lg h-10 px-5 bg-primary text-white font-bold text-sm hover:bg-primary/90 transition-all shadow-md shadow-primary/20">
                                <span className="material-symbols-outlined text-lg">person_add</span>
                                <span>إضافة مستخدم</span>
                            </button>
                        </Link>
                    </div>
                </div>

                <div className="flex flex-col gap-4 bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
                    <div>
                        <h3 className="text-slate-900 dark:text-slate-100 text-sm font-bold uppercase tracking-wider mb-2">تصفية حسب الدور</h3>
                        <div className="flex flex-wrap gap-2">
                            {['الجميع', 'Student', 'Supervisor', 'HeadOfDepartment', 'Admin'].map((role) => (
                                <button 
                                    key={role}
                                    onClick={() => setRoleFilter(role === 'الجميع' ? null : role)}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${((role === 'الجميع' && roleFilter === null) || roleFilter === role) ? 'bg-primary text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'}`}
                                >
                                    {role === 'الجميع' ? 'الجميع' : role === 'HeadOfDepartment' ? 'رئيس قسم' : role}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col">
                    <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex flex-col md:flex-row gap-4 justify-between bg-slate-50/50 dark:bg-slate-800/20">
                        <label className="flex-1 max-w-md">
                            <div className="flex items-stretch rounded-lg h-10 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 focus-within:border-primary transition-all">
                                <div className="text-slate-400 flex items-center justify-center pr-3">
                                    <span className="material-symbols-outlined text-xl">search</span>
                                </div>
                                <input 
                                    className="form-input flex w-full border-none bg-transparent focus:outline-0 focus:ring-0 text-sm h-full placeholder:text-slate-400 px-3" 
                                    placeholder="ابحث بالاسم، البريد الإلكتروني..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                />
                            </div>
                        </label>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-right border-collapse">
                            <thead>
                                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">اسم المستخدم</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider hidden sm:table-cell">البريد الإلكتروني</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">الرقم التعريفي</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">الدور</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">الحالة</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-left">الإجراءات</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                {users.filter(u => u.fullName?.toLowerCase().includes(search.toLowerCase()) || u.email?.toLowerCase().includes(search.toLowerCase())).map((user, index) => (
                                    <tr key={user.id || index} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className={`size-9 rounded-full flex items-center justify-center font-bold text-xs ${getAvatarBg(user.role)}`}>
                                                    {getInitial(user.fullName)}
                                                </div>
                                                <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">{user.fullName}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 hidden sm:table-cell">
                                            <span className="text-sm text-slate-600 dark:text-slate-400">{user.email}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-sm font-mono text-slate-500 dark:text-slate-400">{user.userName || user.id}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleDetails(user.role).bg}`}>
                                                {getRoleDetails(user.role).text}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-1.5">
                                                <div className={`size-1.5 rounded-full ${user.isActive ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-600'}`}></div>
                                                <span className={`text-xs font-medium ${user.isActive ? 'text-emerald-700 dark:text-emerald-400' : 'text-slate-500 dark:text-slate-400'}`}>
                                                    {user.isActive ? 'نشط' : 'غير نشط'}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-left">
                                            <button className="p-1.5 rounded-lg text-slate-400 hover:text-primary hover:bg-primary/10 transition-all">
                                                <span className="material-symbols-outlined text-xl leading-none">more_vert</span>
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between bg-white dark:bg-slate-900/50">
                        <span className="text-sm text-slate-500 dark:text-slate-400">
                            عرض صفحة {pagination.currentPage} من أصل {pagination.totalPages}
                        </span>
                        <div className="flex gap-1">
                            <button 
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={!pagination.hasPrevious}
                                className="h-8 px-2 rounded border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-500 disabled:opacity-50"
                            >
                                <span className="material-symbols-outlined text-lg">chevron_right</span>
                            </button>
                            <button 
                                onClick={() => setPage(p => p + 1)}
                                disabled={!pagination.hasNext}
                                className="h-8 px-2 rounded border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-500 disabled:opacity-50"
                            >
                                <span className="material-symbols-outlined text-lg">chevron_left</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UsersManagement;
