import React, { useState } from 'react';
import { useProjects, useUpdateProjectStatus } from '../../hooks/useProjects';
import projectService from '../../services/projectService';
import { useQuery } from '@tanstack/react-query';

const HODProjectsOverview = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedProject, setSelectedProject] = useState(null);
    const { data: allProjects, isLoading: allLoading, isError: allFatalError } = useProjects();
    const updateStatusMutation = useUpdateProjectStatus();

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
    }));

    const displayProjects = searchTerm.trim().length > 0 
        ? normalizedProjects.filter(project => {
            const term = searchTerm.toLowerCase();
            return (
                project.title.toLowerCase().includes(term) ||
                project.teamName.toLowerCase().includes(term) ||
                project.supervisorName.toLowerCase().includes(term) ||
                project.status.toLowerCase().includes(term)
            );
        })
        : normalizedProjects;
    
    const isLoading = allLoading;
    const isError = allFatalError;

    const handleStatusUpdate = (id, status) => {
        updateStatusMutation.mutate({ id, status });
    };

    const statusOptions = ["Pending", "Active", "InActive", "Approved", "InProgress", "Completed", "Archived", "Rejected"];

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
                            <DetailItem label="تاريخ الإنشاء" value={new Date(project.createdAt).toLocaleDateString('ar-EG')} />
                        </div>
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
                <span className="inline-block px-2.5 py-0.5 text-[10px] font-bold bg-blue-50 text-blue-700 rounded-full border border-blue-100 mt-1">
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
            <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">إدارة المشاريع</h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-2 text-lg">نظرة عامة على جميع المشاريع الأكاديمية والتحكم في حالاتها.</p>
                </div>
                <div className="w-full md:w-80 relative">
                    <span className="absolute inset-y-0 right-0 flex items-center pr-3">
                        <span className="material-symbols-outlined text-slate-400">search</span>
                    </span>
                    <input
                        type="text"
                        placeholder="البحث عن مشروع..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pr-10 pl-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm focus:ring-2 focus:ring-primary/50 outline-none transition-all shadow-sm"
                    />
                </div>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
                <table className="w-full text-right border-collapse">
                    <thead>
                        <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
                            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">عنوان المشروع</th>
                            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">اسم الفريق</th>
                            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">اسم المشرف</th>
                            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">الحالة</th>
                            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">تاريخ الإنشاء</th>
                            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-left">الإجراءات</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {isLoading ? (
                            Array(5).fill(0).map((_, i) => (
                                <tr key={i} className="animate-pulse">
                                    <td colSpan="6" className="px-6 py-4 text-center text-slate-400">جاري تحميل المشاريع...</td>
                                </tr>
                            ))
                        ) : isError ? (
                            <tr>
                                <td colSpan="6" className="px-6 py-10 text-center text-red-500 font-bold">تعذر تحميل المشاريع</td>
                            </tr>
                        ) : (
                            Array.isArray(displayProjects) && displayProjects.map((project) => (
                                <tr key={project.projectID} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors group">
                                    <td className="px-6 py-4">
                                        <p className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-primary transition-colors">{project.title}</p>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{project.teamName}</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{project.supervisorName || 'غير محدد'}</span>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <span className={`px-2.5 py-1 text-[10px] font-bold rounded-full border ${
                                            project.status === 'Approved' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                                            project.status === 'Rejected' ? 'bg-red-50 text-red-700 border-red-100' :
                                            'bg-blue-50 text-blue-700 border-blue-100'
                                        }`}>
                                            {project.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <span className="text-[10px] font-bold text-slate-500 tabular-nums">
                                            {new Date(project.createdAt).toLocaleDateString('ar-EG')}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-left">
                                        <div className="flex items-center justify-end gap-3">
                                            <select
                                                value={project.status}
                                                onChange={(e) => handleStatusUpdate(project.projectID, e.target.value)}
                                                className="bg-slate-100 dark:bg-slate-800 border-none rounded-lg px-3 py-1.5 text-[10px] font-bold focus:ring-2 focus:ring-primary/50 outline-none cursor-pointer"
                                            >
                                                {statusOptions.map(opt => (
                                                    <option key={opt} value={opt}>{opt}</option>
                                                ))}
                                            </select>
                                            <button
                                                onClick={() => setSelectedProject(project)}
                                                className="px-3 py-1.5 bg-primary/10 text-primary hover:bg-primary hover:text-white rounded-lg text-[10px] font-bold transition-all flex items-center gap-1"
                                            >
                                                عرض التفاصيل
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                        {(!Array.isArray(displayProjects) || displayProjects.length === 0) && !isLoading && !isError && (
                            <tr>
                                <td colSpan="6" className="px-6 py-10 text-center text-slate-400">
                                    {searchTerm.trim().length > 0 ? "لا توجد مشاريع مطابقة للبحث" : "لا توجد مشاريع"}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

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
