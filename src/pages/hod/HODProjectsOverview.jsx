import React, { useState } from 'react';
import { useProjects } from '../../hooks/useProjects';

const HODProjectsOverview = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const [supervisorFilter, setSupervisorFilter] = useState('All');
    const [selectedProject, setSelectedProject] = useState(null);
    const { data: allProjects, isLoading: allLoading, isError: allFatalError } = useProjects();

    const normalizedProjects = (Array.isArray(allProjects) ? allProjects : []).map(project => ({
        ...project,
        title: project.title ?? project.Title ?? project.projectTitle ?? project.ProjectTitle ?? "",
        teamName: project.teamName ?? project.TeamName ?? "",
        supervisorName: project.supervisorName ?? project.SupervisorName ?? "غير محدد",
        status: project.status ?? project.Status ?? "",
        createdAt: project.createdAt ?? project.CreatedAt,
        projectID: project.projectID ?? project.ProjectID ?? project.id,
        teamID: project.teamID ?? project.TeamID,
        objective: project.objective ?? project.Objective,
        abstract: project.abstract ?? project.Abstract,
        departmentName: project.departmentName ?? project.DepartmentName ?? "",
        memberNames: project.memberNames ?? project.MemberNames ?? []
    }));

    const displayProjects = normalizedProjects.filter(project => {
        // Search filter
        const term = searchTerm.toLowerCase().trim();
        const matchesSearch = term.length === 0 || (
            project.title.toLowerCase().includes(term) ||
            project.teamName.toLowerCase().includes(term) ||
            (project.supervisorName && project.supervisorName.toLowerCase().includes(term)) ||
            (project.memberNames && project.memberNames.some(m => m.toLowerCase().includes(term)))
        );

        // Status filter
        const matchesStatus = statusFilter === 'All' || project.status === statusFilter;

        // Supervisor assignment filter
        const hasSupervisor = project.supervisorName && project.supervisorName !== 'غير محدد' && project.supervisorName !== '';
        const matchesSupervisor = supervisorFilter === 'All' ||
            (supervisorFilter === 'Assigned' && hasSupervisor) ||
            (supervisorFilter === 'Unassigned' && !hasSupervisor);

        return matchesSearch && matchesStatus && matchesSupervisor;
    });

    const statusOptions = ["All", "Pending", "Active", "InActive", "Approved", "InProgress", "Completed", "Archived", "Rejected"];

    const ProjectDetailsModal = ({ project, onClose }) => {
        if (!project) return null;
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
                <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 duration-200 text-right" dir="rtl">
                    <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center flex-row-reverse">
                        <h2 className="text-xl font-black text-slate-900 dark:text-white">تفاصيل المشروع</h2>
                        <button onClick={onClose} className="size-10 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center transition-colors">
                            <span className="material-symbols-outlined">close</span>
                        </button>
                    </div>
                    <div className="p-8 space-y-6 max-h-[70vh] overflow-y-auto">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <DetailItem label="عنوان المشروع" value={project.title} className="md:col-span-2" />
                            <DetailItem label="اسم الفريق" value={project.teamName} />
                            <DetailItem label="اسم المشرف" value={project.supervisorName || 'غير محدد'} />
                            <DetailItem label="حالة المشروع" value={project.status} isStatus />
                            <DetailItem label="القسم" value={project.departmentName || 'غير محدد'} />
                            <DetailItem label="تاريخ الإنشاء" value={new Date(project.createdAt).toLocaleDateString('ar-EG')} />
                        </div>
                        {project.memberNames && project.memberNames.length > 0 && (
                            <div className="space-y-1">
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">أعضاء الفريق</p>
                                <div className="flex flex-wrap gap-2 mt-1">
                                    {project.memberNames.map((name, idx) => (
                                        <span key={idx} className="px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 border border-slate-200/55 dark:border-slate-700/55">
                                            {name}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                        <DetailItem label="هدف المشروع" value={project.objective} isLongText />
                        <DetailItem label="ملخص المشروع" value={project.abstract} isLongText />
                    </div>
                </div>
            </div>
        );
    };

    const DetailItem = ({ label, value, className = "", isStatus = false, isLongText = false }) => (
        <div className={`space-y-1 ${className}`}>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{label}</p>
            {isStatus ? (
                <span className="inline-block px-2.5 py-0.5 text-[10px] font-bold bg-blue-50 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400 rounded-full border border-blue-100 dark:border-blue-900/30 mt-1">
                    {value}
                </span>
            ) : isLongText ? (
                <div className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800 max-h-60 overflow-y-auto" style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', overflowWrap: 'break-word' }}>
                    {value || 'لا يوجد نص متاح'}
                </div>
            ) : (
                <p className="text-sm font-bold text-slate-900 dark:text-white">{value || 'غير متوفر'}</p>
            )}
        </div>
    );

    return (
        <div className="max-w-7xl mx-auto w-full pb-10 text-right" dir="rtl">
            {/* Header section with Read-Only Notice */}
            <div className="mb-8 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                <div>
                    <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                        مشاريع القسم
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-2 text-lg">
                        تصفح وعرض المشاريع الأكاديمية الخاصة بقسمك (لوحة قراءة فقط).
                    </p>
                </div>
                <div className="bg-blue-50/60 dark:bg-blue-950/20 text-blue-800 dark:text-blue-400 border border-blue-100/50 dark:border-blue-900/30 px-4 py-2.5 rounded-2xl text-xs flex items-center gap-2 font-medium">
                    <span className="material-symbols-outlined text-[18px]">info</span>
                    هذه الصفحة مخصصة للعرض والبحث فقط، ولا يمكن تعديل بيانات المشاريع من هنا.
                </div>
            </div>

            {/* Search and Filters bar */}
            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm mb-8 flex flex-col md:flex-row items-center gap-4">
                {/* Search Field */}
                <div className="w-full md:flex-1 relative">
                    <span className="absolute inset-y-0 right-0 flex items-center pr-3">
                        <span className="material-symbols-outlined text-slate-400">search</span>
                    </span>
                    <input
                        type="text"
                        placeholder="البحث باسم المشروع، المشرف، الفريق، أو الطالب..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pr-10 pl-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm focus:ring-2 focus:ring-primary/50 outline-none transition-all text-slate-800 dark:text-slate-100"
                    />
                </div>

                {/* Status Filter */}
                <div className="w-full md:w-52 flex flex-col gap-1">
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs focus:ring-2 focus:ring-primary/50 outline-none text-slate-700 dark:text-slate-300 font-semibold cursor-pointer"
                    >
                        <option value="All">كل الحالات</option>
                        {statusOptions.filter(opt => opt !== "All").map(opt => (
                            <option key={opt} value={opt}>{opt}</option>
                        ))}
                    </select>
                </div>

                {/* Supervisor Assignment Filter */}
                <div className="w-full md:w-52 flex flex-col gap-1">
                    <select
                        value={supervisorFilter}
                        onChange={(e) => setSupervisorFilter(e.target.value)}
                        className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs focus:ring-2 focus:ring-primary/50 outline-none text-slate-700 dark:text-slate-300 font-semibold cursor-pointer"
                    >
                        <option value="All">حالة الإشراف (الكل)</option>
                        <option value="Assigned">تم تعيين مشرف</option>
                        <option value="Unassigned">لم يتم تعيين مشرف</option>
                    </select>
                </div>
            </div>

            {/* Main Cards Grid */}
            {allLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {Array(6).fill(0).map((_, i) => (
                        <div key={i} className="animate-pulse bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 h-64"></div>
                    ))}
                </div>
            ) : allFatalError ? (
                <div className="p-10 text-center text-red-500 font-bold bg-red-50 dark:bg-red-950/20 rounded-3xl border border-red-100 dark:border-red-900/50">
                    تعذر تحميل المشاريع. يرجى التحقق من الاتصال وإعادة المحاولة.
                </div>
            ) : displayProjects.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {displayProjects.map((project) => (
                        <div 
                            key={project.projectID} 
                            className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
                        >
                            <div className="space-y-4">
                                {/* Header with Department and Status */}
                                <div className="flex justify-between items-center">
                                    <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                                        {project.departmentName || 'القسم'}
                                    </span>
                                    <span className={`px-2.5 py-1 text-[10px] font-bold rounded-full border ${
                                        project.status === 'Approved' ? 'bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-900/30' :
                                        project.status === 'Completed' ? 'bg-blue-50 text-blue-700 border-blue-100 dark:bg-blue-950/30 dark:text-blue-400 dark:border-blue-900/30' :
                                        project.status === 'Rejected' ? 'bg-red-50 text-red-700 border-red-100 dark:bg-red-950/30 dark:text-red-400 dark:border-red-900/30' :
                                        project.status === 'InProgress' ? 'bg-indigo-50 text-indigo-700 border-indigo-100 dark:bg-indigo-950/30 dark:text-indigo-400 dark:border-indigo-900/30' :
                                        'bg-slate-50 text-slate-700 border-slate-100 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700'
                                    }`}>
                                        {project.status}
                                    </span>
                                </div>

                                {/* Project Title */}
                                <h3 className="text-lg font-black text-slate-900 dark:text-white line-clamp-2 leading-tight">
                                    {project.title}
                                </h3>

                                {/* Project description */}
                                <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-3 leading-relaxed">
                                    {project.abstract || project.objective || 'لا يوجد ملخص متوفر للمشروع.'}
                                </p>

                                {/* Divider */}
                                <div className="border-t border-slate-100 dark:border-slate-800 my-2"></div>

                                {/* Metadata Details */}
                                <div className="space-y-2 text-xs">
                                    <div className="flex items-center justify-between">
                                        <span className="text-slate-400">الفريق:</span>
                                        <span className="font-bold text-slate-800 dark:text-slate-200">{project.teamName}</span>
                                    </div>

                                    {/* Team Members list */}
                                    {project.memberNames && project.memberNames.length > 0 && (
                                        <div className="flex flex-col gap-1">
                                            <span className="text-slate-400">أعضاء الفريق:</span>
                                            <div className="flex flex-wrap gap-1 mt-1">
                                                {project.memberNames.map((name, idx) => (
                                                    <span key={idx} className="px-2 py-0.5 bg-slate-50 dark:bg-slate-800/80 rounded-lg text-[10px] text-slate-600 dark:text-slate-400 font-semibold border border-slate-100 dark:border-slate-800">
                                                        {name}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    <div className="flex items-center justify-between">
                                        <span className="text-slate-400">المشرف:</span>
                                        <span className={`font-semibold ${project.supervisorName && project.supervisorName !== 'غير محدد' ? 'text-primary' : 'text-amber-600 dark:text-amber-500 font-bold'}`}>
                                            {project.supervisorName || 'غير محدد'}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Footer with view-only action */}
                            <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
                                <span className="text-[10px] text-slate-400 dark:text-slate-500 tabular-nums">
                                    {project.createdAt ? new Date(project.createdAt).toLocaleDateString('ar-EG') : ''}
                                </span>
                                <button
                                    onClick={() => setSelectedProject(project)}
                                    className="px-4 py-2 bg-primary/10 text-primary hover:bg-primary hover:text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
                                >
                                    <span className="material-symbols-outlined text-[16px]">visibility</span>
                                    عرض التفاصيل
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="p-16 text-center text-slate-400 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
                    <span className="material-symbols-outlined text-5xl text-slate-300 dark:text-slate-600 mb-3">folder_open</span>
                    <p className="text-base font-bold">لا توجد مشاريع مطابقة للبحث أو التصفية.</p>
                    <p className="text-xs text-slate-400 mt-1">تأكد من كتابة الاسم بشكل صحيح أو اختيار فلاتر مختلفة.</p>
                </div>
            )}

            {/* Details Modal */}
            {selectedProject && (
                <ProjectDetailsModal 
                    project={selectedProject} 
                    onClose={() => setSelectedProject(null)} 
                />
            )}
        </div>
    );
};

export default HODProjectsOverview;
