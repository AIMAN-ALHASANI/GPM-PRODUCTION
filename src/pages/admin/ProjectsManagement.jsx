import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useCollegeProjects } from '../../hooks/useProjects';
import { useDepartments } from '../../hooks/useStructure';
import projectService from '../../services/projectService';
import ProjectDetailsModal from '../../components/admin/ProjectDetailsModal';

const getStatusBadgeClasses = (status) => {
    const statusStr = String(status);
    switch (statusStr) {
        case 'InProgress':
        case 'Active': return 'bg-emerald-100 text-emerald-700';
        case 'Pending':
        case 'PendingSupervisor': return 'bg-amber-100 text-amber-700';
        case 'Approved': return 'bg-blue-100 text-blue-700';
        case 'Completed': return 'bg-indigo-100 text-indigo-700';
        case 'Archived': return 'bg-slate-100 text-slate-700';
        case 'Rejected':
        case 'InActive': return 'bg-rose-100 text-rose-700';
        default: return 'bg-slate-100 text-slate-700';
    }
};

const getStatusText = (status) => {
    const statusStr = String(status);
    switch (statusStr) {
        case 'Pending': return 'قيد الانتظار';
        case 'PendingSupervisor': return 'بانتظار المشرف';
        case 'Approved': return 'موافق عليه';
        case 'InProgress': return 'قيد التنفيذ';
        case 'Active': return 'نشط';
        case 'Completed': return 'مكتمل';
        case 'Rejected': return 'مرفوض';
        case 'InActive': return 'غير نشط';
        case 'Archived': return 'مؤرشف';
        default: return status;
    }
};

const ProjectsManagement = () => {
    const { data: projectsData, isLoading, isError } = useCollegeProjects();
    const { data: departmentsResponse } = useDepartments();
    
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedDepartment, setSelectedDepartment] = useState('جميع الأقسام');
    const [searchResults, setSearchResults] = useState(null);
    const [isSearching, setIsSearching] = useState(false);
    const [selectedProjectTitle, setSelectedProjectTitle] = useState(null);
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

    const projects = Array.isArray(projectsData) ? projectsData : (projectsData?.data || []);
    const departments = Array.isArray(departmentsResponse) ? departmentsResponse : (departmentsResponse?.data || []);

    useEffect(() => {
        const delayDebounceFn = setTimeout(async () => {
            if (searchTerm) {
                setIsSearching(true);
                try {
                    const result = await projectService.getProjectByTitle(searchTerm);
                    const data = Array.isArray(result) ? result : (result ? [result] : []);
                    setSearchResults(data);
                } catch (error) {
                    console.error("Search failed:", error);
                    setSearchResults([]);
                } finally {
                    setIsSearching(false);
                }
            } else {
                setSearchResults(null);
            }
        }, 500);

        return () => clearTimeout(delayDebounceFn);
    }, [searchTerm]);

    const displayProjects = searchResults || projects;

    const filteredProjects = displayProjects.filter(project => {
        const matchesDept = selectedDepartment === 'جميع الأقسام' || project.departmentName === selectedDepartment;
        return matchesDept;
    });

    const handleViewDetails = (title) => {
        setSelectedProjectTitle(title);
        setIsDetailsModalOpen(true);
    };

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                <p className="text-slate-500 font-medium">جاري تحميل المشاريع...</p>
            </div>
        );
    }

    if (isError) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
                <span className="material-symbols-outlined text-rose-500 text-5xl">error</span>
                <p className="text-rose-500 font-bold text-xl">فشل في تحميل المشاريع</p>
                <button 
                    onClick={() => window.location.reload()}
                    className="px-6 py-2 bg-primary text-white rounded-lg font-bold"
                >
                    إعادة المحاولة
                </button>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-6 w-full">
            <nav className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                <Link className="hover:text-primary" to="/admin/dashboard">الرئيسية</Link>
                <span className="material-symbols-outlined text-sm">chevron_right</span>
                <span className="text-slate-900 dark:text-white font-medium">إدارة المشاريع</span>
            </nav>

            <div className="max-w-7xl mx-auto w-full space-y-8">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">قائمة المشاريع الأكاديمية</h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">استعراض ومتابعة المشاريع الجارية في جميع الأقسام (عرض فقط).</p>
                </div>

                <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">بحث بالعنوان</label>
                            <div className="relative">
                                <input 
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full text-sm border-slate-200 dark:border-slate-700 dark:bg-slate-800 rounded-lg focus:ring-primary focus:border-primary px-3 py-3 outline-none" 
                                    placeholder="ادخل عنوان المشروع..." 
                                    type="text"
                                />
                                {isSearching && <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 animate-spin text-primary text-sm">sync</span>}
                            </div>
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">تصفية حسب القسم</label>
                            <select 
                                value={selectedDepartment}
                                onChange={(e) => setSelectedDepartment(e.target.value)}
                                className="w-full text-sm border-slate-200 dark:border-slate-700 dark:bg-slate-800 rounded-lg focus:ring-primary focus:border-primary px-3 py-3 outline-none"
                            >
                                <option value="جميع الأقسام">جميع الأقسام</option>
                                {departments.map((dept) => (
                                    <option key={dept.departmentID} value={dept.departmentName}>{dept.departmentName}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden mb-10">
                    <div className="overflow-x-auto">
                        <table className="w-full text-right border-collapse">
                            <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
                                <tr>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">اسم المشروع</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">اسم الفريق</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">المشرف</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">الحالة</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-left">التفاصيل</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                {filteredProjects.map((project) => {
                                    const id = project.projectID || project.ProjectID;
                                    const title = project.title || project.Title;
                                    const teamName = project.teamName || project.TeamName;
                                    const supervisorName = project.supervisorName || project.SupervisorName;
                                    const status = project.status || project.Status;

                                    return (
                                    <tr key={id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="font-bold text-primary">{title}</div>
                                            <div className="text-[10px] text-slate-400">PRJ-{id}</div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-300 font-medium">{teamName || 'بدون فريق'}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <div className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-[10px] font-bold">
                                                    {supervisorName?.charAt(0) || '?'}
                                                </div>
                                                <span className="text-sm text-slate-700 dark:text-slate-300">{supervisorName || 'لم يحدد'}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${getStatusBadgeClasses(status)}`}>
                                                {getStatusText(status)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-left">
                                            <button 
                                                onClick={() => handleViewDetails(title)}
                                                className="text-primary hover:bg-primary/10 p-2 rounded-lg transition-colors"
                                            >
                                                <span className="material-symbols-outlined">visibility</span>
                                            </button>
                                        </td>
                                    </tr>
                                )})}
                                {filteredProjects.length === 0 && (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-10 text-center text-slate-500">لا توجد مشاريع تطابق البحث</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <ProjectDetailsModal 
                isOpen={isDetailsModalOpen}
                onClose={() => setIsDetailsModalOpen(false)}
                projectTitle={selectedProjectTitle}
            />
        </div>
    );
};

export default ProjectsManagement;
