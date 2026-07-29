import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useUsers } from '../../hooks/useUsers';
import { useDepartments } from '../../hooks/useStructure';

const ActionMenu = ({ isOpen, onToggle, onClose }) => {
    return (
        <div className="relative">
            <button 
                onClick={onToggle}
                className="text-slate-400 hover:text-primary p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
            >
                <span className="material-symbols-outlined">more_vert</span>
            </button>
            {isOpen && (
                <>
                    <div className="fixed inset-0 z-40" onClick={onClose}></div>
                    <div className="absolute left-0 top-full mt-2 w-48 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 z-50 overflow-hidden">
                        <button className="w-full flex items-center gap-2 px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                            <span className="material-symbols-outlined text-[16px]">edit</span> طھط¹ط¯ظٹظ„ ط§ظ„ظ…ظ„ظپ
                        </button>
                        <hr className="border-slate-200 dark:border-slate-700" />
                        <button className="w-full flex items-center gap-2 px-4 py-2 text-sm text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-colors">
                            <span className="material-symbols-outlined text-[16px]">delete</span> ط­ط°ظپ ط§ظ„ط­ط³ط§ط¨
                        </button>
                    </div>
                </>
            )}
        </div>
    );
};

const HeadOfDepartmentManagement = () => {
    const { data: usersResponse, isLoading } = useUsers({ role: 4 }); // Role 4: HOD
    const { data: allDepartmentsResponse } = useDepartments();
    const allDepartments = allDepartmentsResponse?.data || [];

    const [searchTerm, setSearchTerm] = useState('');
    const [selectedDepartment, setSelectedDepartment] = useState('ط¬ظ…ظٹط¹ ط§ظ„ط£ظ‚ط³ط§ظ…');
    const [activeActionRowId, setActiveActionRowId] = useState(null);

    const heads = usersResponse?.data?.items || [];

    const filteredData = heads.filter(head => {
        const matchesSearch = head.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                             head.email?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesDepartment = selectedDepartment === 'ط¬ظ…ظٹط¹ ط§ظ„ط£ظ‚ط³ط§ظ…' || head.departmentName === selectedDepartment;
        return matchesSearch && matchesDepartment;
    });

    const stats = [
        { title: "ط£ط¹ط¶ط§ط، ط§ظ„ظ„ط¬ظ†ط©", value: heads.length, icon: "badge", trend: "ط§ظ„ط­ط§ظ„ظٹ", trendIcon: "trending_up", trendColor: "text-emerald-600 dark:text-emerald-400" },
        { title: "ط§ظ„ط£ظ‚ط³ط§ظ… ط§ظ„ظ†ط´ط·ط©", value: allDepartments.length, icon: "account_balance", trend: "ظ†ط´ط·", trendIcon: "check_circle", trendColor: "text-emerald-600 dark:text-emerald-400" },
        { title: "ط±ط¤ط³ط§ط، ط§ظ„ط£ظ‚ط³ط§ظ…", value: heads.length, icon: "supervisor_account", trend: "ظ…ظˆط²ط¹ظٹظ†", trendIcon: "info", trendColor: "text-amber-600 dark:text-amber-400" }
    ];

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-6 w-full">
            <nav className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                <Link className="hover:text-primary" to="/admin/dashboard">ط§ظ„ط±ط¦ظٹط³ظٹط©</Link>
                <span className="material-symbols-outlined text-sm">chevron_right</span>
                <span className="text-slate-900 dark:text-white font-medium">ط§ظ„ظ„ط¬ظ†ط©</span>
            </nav>

            <div className="max-w-7xl mx-auto w-full flex flex-col gap-6">
                <div className="flex flex-col gap-2">
                    <h1 className="text-3xl font-black leading-tight tracking-tight text-slate-900 dark:text-white">ط§ظ„ظ„ط¬ظ†ط©</h1>
                    <p className="text-slate-500 dark:text-slate-400 text-base">ط¨ظˆط§ط¨ط© ط¥ط¯ط§ط±ظٹط© ظ„ظ…طھط§ط¨ط¹ط© ط±ط¤ط³ط§ط، ط§ظ„ط£ظ‚ط³ط§ظ… ط§ظ„ط£ظƒط§ط¯ظٹظ…ظٹط©طŒ ظˆط¥ط¯ط§ط±ط© طµظ„ط§ط­ظٹط§طھظ‡ظ… ظˆطµظ„ط§ط­ظٹط§طھ ط§ظ„ظ…ط´ط±ظپظٹظ†.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6">
                    {stats.map((stat, index) => (
                        <div key={index} className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col gap-1">
                            <div className="flex items-center justify-between">
                                <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">{stat.title}</p>
                                <span className="material-symbols-outlined text-primary text-[20px]">{stat.icon}</span>
                            </div>
                            <p className="text-slate-900 dark:text-white text-3xl font-bold">{stat.value}</p>
                            <p className={`${stat.trendColor} text-sm font-semibold flex items-center gap-1`}>
                                <span className="material-symbols-outlined text-[16px]">{stat.trendIcon}</span>
                                {stat.trend}
                            </p>
                        </div>
                    ))}
                </div>

                <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                    <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                        <div className="flex-1 w-full">
                            <div className="relative">
                                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">search</span>
                                <input 
                                    type="text" 
                                    placeholder="ط¨ط­ط« ط¹ظ† ط±ط¦ظٹط³ ظ‚ط³ظ…..." 
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none text-sm"
                                />
                            </div>
                        </div>
                        <div className="flex gap-3 w-full sm:w-auto">
                            <select 
                                value={selectedDepartment}
                                onChange={(e) => setSelectedDepartment(e.target.value)}
                                className="px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none text-sm flex-1 sm:flex-none"
                            >
                                <option value="ط¬ظ…ظٹط¹ ط§ظ„ط£ظ‚ط³ط§ظ…">ط¬ظ…ظٹط¹ ط§ظ„ط£ظ‚ط³ط§ظ…</option>
                                {allDepartments.map((dept) => (
                                    <option key={dept.departmentID} value={dept.departmentName}>{dept.departmentName}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden mb-10">
                    <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
                        <h3 className="font-bold text-slate-800 dark:text-slate-200">ط£ط¹ط¶ط§ط، ط§ظ„ظ„ط¬ظ†ط©</h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-right border-collapse">
                            <thead>
                                <tr className="bg-white dark:bg-slate-900">
                                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">ط§ظ„ط§ط³ظ…</th>
                                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">ط§ظ„ظ‚ط³ظ…</th>
                                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800 text-left">ط§ظ„ط¥ط¬ط±ط§ط،ط§طھ</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                                {filteredData.map((head) => (
                                    <tr key={head.userID} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="size-9 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">
                                                    {head.fullName?.charAt(0) || '?'}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-semibold text-slate-900 dark:text-white">{head.fullName}</p>
                                                    <p className="text-xs text-slate-500">{head.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">{head.departmentName || 'ط؛ظٹط± ظ…ط­ط¯ط¯'}</td>
                                        <td className="px-6 py-4 text-left">
                                            <ActionMenu 
                                                isOpen={activeActionRowId === head.userID}
                                                onToggle={() => setActiveActionRowId(activeActionRowId === head.userID ? null : head.userID)}
                                                onClose={() => setActiveActionRowId(null)}
                                            />
                                        </td>
                                    </tr>
                                ))}
                                {filteredData.length === 0 && (
                                    <tr>
                                        <td colSpan="3" className="px-6 py-10 text-center text-slate-500">ظ„ط§ طھظˆط¬ط¯ ظ†طھط§ط¦ط¬ طھط·ط§ط¨ظ‚ ط§ظ„ط¨ط­ط«</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HeadOfDepartmentManagement;


