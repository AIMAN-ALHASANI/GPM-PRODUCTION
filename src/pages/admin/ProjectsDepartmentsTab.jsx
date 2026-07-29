import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useDepartments, useColleges } from '../../hooks/useStructure';

const StatCard = ({ stat }) => (
    <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden group">
        <div className="absolute top-0 left-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <span className="material-symbols-outlined text-6xl text-primary">{stat.icon}</span>
        </div>
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{stat.title}</p>
        <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-slate-900 dark:text-white">{stat.value}</span>
            <span className={`text-xs font-medium text-${stat.trendColor}-600 dark:text-${stat.trendColor}-400`}>{stat.trend}</span>
        </div>
    </div>
);

const ProjectsDepartmentsTab = () => {
    const { data: departments = [], isLoading: isDeptsLoading } = useDepartments();
    const { data: colleges = [], isLoading: isCollegesLoading } = useColleges();

    const [searchTerm, setSearchTerm] = useState("");
    const [selectedCollege, setSelectedCollege] = useState("جميع الكليات");
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);

    const filteredDepartments = departments.filter(dept => {
        const matchesSearch = dept.departmentName?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCollege = selectedCollege === "جميع الكليات" || dept.college?.collegeName === selectedCollege;
        return matchesSearch && matchesCollege; 
    });

    const totalPages = Math.ceil(filteredDepartments.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedDepartments = filteredDepartments.slice(startIndex, startIndex + itemsPerPage);

    const statsCards = [
        { title: "إجمالي الأقسام", value: departments.length, trend: "+٢ هذا العام", icon: "account_balance", trendColor: "emerald" },
        { title: "الكليات المتاحة", value: colleges.length, trend: "تغطية شاملة", icon: "school", trendColor: "primary" },
        { title: "المشرفين النشطين", value: "...", trend: "جاري التحميل", icon: "groups", trendColor: "slate" },
        { title: "مجالات البحث", value: "١٢", trend: "معامل متخصصة", icon: "biotech", trendColor: "slate" }
    ];

    if (isDeptsLoading || isCollegesLoading) {
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
                <span className="text-slate-900 dark:text-white font-medium">الأقسام</span>
            </nav>

            <div className="max-w-7xl mx-auto w-full space-y-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">إدارة الأقسام الأكاديمية</h1>
                        <p className="text-slate-500 dark:text-slate-400 mt-1">إدارة الأقسام الأكاديمية، رؤساء الأقسام، والمشاريع المرتبطة بكل قسم.</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <Link to="/admin/departments" className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm font-semibold hover:bg-primary/90 transition-colors shadow-sm">
                            <span className="material-symbols-outlined text-[18px]">manage_accounts</span>
                            لوحة إدارة الأقسام
                        </Link>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {statsCards.map((stat, index) => (
                        <StatCard key={index} stat={stat} />
                    ))}
                </div>

                <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row gap-4 items-center">
                    <div className="relative flex-1 w-full">
                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">search</span>
                        <input 
                            className="w-full border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 rounded-lg py-2 pr-4 pl-10 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all" 
                            placeholder="ابحث باسم القسم..." 
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="flex gap-3 w-full md:w-auto">
                        <select 
                            className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm px-4 py-2 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                            value={selectedCollege}
                            onChange={(e) => setSelectedCollege(e.target.value)}
                        >
                            <option value="جميع الكليات">جميع الكليات</option>
                            {colleges.map((college) => (
                                <option key={college.collegeID} value={college.collegeName}>{college.collegeName}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-right border-collapse">
                            <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
                                <tr>
                                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">اسم القسم</th>
                                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">الكلية</th>
                                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 text-left">الإجراءات</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                                {paginatedDepartments.map((dept) => (
                                    <tr key={dept.departmentID} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded flex items-center justify-center bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400">
                                                    <span className="material-symbols-outlined text-sm">account_balance</span>
                                                </div>
                                                <span className="font-semibold text-slate-900 dark:text-white">{dept.departmentName}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">{dept.college?.collegeName || 'غير محدد'}</td>
                                        <td className="px-6 py-4 text-left">
                                            <div className="flex justify-start gap-2">
                                                <Link to="/admin/departments" className="p-1.5 text-slate-400 hover:text-primary transition-colors"><span className="material-symbols-outlined">edit</span></Link>
                                                <Link to="/admin/departments" className="p-1.5 text-slate-400 hover:text-red-500 transition-colors"><span className="material-symbols-outlined">delete</span></Link>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    
                    <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
                        <span className="text-sm text-slate-500 dark:text-slate-400">
                            عرض {filteredDepartments.length === 0 ? 0 : startIndex + 1} إلى {Math.min(startIndex + itemsPerPage, filteredDepartments.length)} من أصل {filteredDepartments.length} قسم
                        </span>
                        <div className="flex gap-2">
                            <button 
                                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                disabled={currentPage === 1}
                                className="px-3 py-1 border border-slate-200 dark:border-slate-700 rounded text-sm text-slate-500 disabled:opacity-50 hover:bg-white dark:hover:bg-slate-700 transition-colors"
                            >
                                السابق
                            </button>
                            <button 
                                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                disabled={currentPage === totalPages || totalPages === 0}
                                className="px-3 py-1 border border-slate-200 dark:border-slate-700 rounded text-sm text-slate-600 hover:bg-white dark:hover:bg-slate-700 transition-colors disabled:opacity-50"
                            >
                                التالي
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProjectsDepartmentsTab;
