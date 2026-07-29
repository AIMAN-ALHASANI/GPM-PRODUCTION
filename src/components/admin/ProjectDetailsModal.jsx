import React, { useState, useEffect } from 'react';
import projectService from '../../services/projectService';

const ProjectDetailsModal = ({ isOpen, onClose, projectTitle }) => {
    const [project, setProject] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isError, setIsError] = useState(false);

    useEffect(() => {
        const fetchProjectDetails = async () => {
            if (isOpen && projectTitle) {
                setIsLoading(true);
                setIsError(false);
                try {
                    const result = await projectService.getProjectByTitle(projectTitle);
                    // result is now the payload (data field or full response)
                    const projectData = Array.isArray(result) ? result[0] : result;
                    setProject(projectData);
                } catch (error) {
                    console.error("Failed to fetch project details:", error);
                    setIsError(true);
                } finally {
                    setIsLoading(false);
                }
            }
        };

        fetchProjectDetails();
    }, [isOpen, projectTitle]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose}></div>
            <div className="relative bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-3xl overflow-hidden border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in duration-200 text-right">
                {/* Header */}
                <div className="bg-primary p-6 text-white flex items-center justify-between">
                    <button onClick={onClose} className="hover:bg-white/20 p-2 rounded-full transition-colors">
                        <span className="material-symbols-outlined">close</span>
                    </button>
                    <h2 className="text-xl font-black">تفاصيل المشروع</h2>
                </div>

                {/* Content */}
                <div className="p-8 max-h-[80vh] overflow-y-auto">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center py-12 gap-4">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                            <p className="text-slate-500 font-medium">جاري جلب تفاصيل المشروع...</p>
                        </div>
                    ) : isError ? (
                        <div className="text-center py-12 text-rose-500">
                            <span className="material-symbols-outlined text-5xl mb-2">error</span>
                            <p className="font-bold">فشل في تحميل بيانات المشروع</p>
                        </div>
                    ) : project ? (() => {
                        const title = project.title || project.Title;
                        const status = project.status || project.Status;
                        const projectID = project.projectID || project.ProjectID;
                        const objective = project.objective || project.Objective;
                        const abstract = project.abstract || project.Abstract;
                        const teamName = project.teamName || project.TeamName;
                        const supervisorName = project.supervisorName || project.SupervisorName;
                        const createdAt = project.createdAt || project.CreatedAt;
                        const departmentName = project.departmentName || project.DepartmentName;
                        const collegeName = project.collegeName || project.CollegeName;

                        return (
                        <div className="space-y-8">
                            {/* Project Header */}
                            <div className="border-b border-slate-100 dark:border-slate-800 pb-6">
                                <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2">{title}</h3>
                                <div className="flex flex-wrap items-center gap-3 justify-end">
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                                        status === 'Completed' ? 'bg-indigo-100 text-indigo-700' : 
                                        status === 'InProgress' || status === 'Active' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                                    }`}>
                                        {status}
                                    </span>
                                    {departmentName && (
                                        <span className="px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-full text-xs font-bold">
                                            {departmentName}
                                        </span>
                                    )}
                                    <span className="text-xs text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">معرف: PRJ-{projectID}</span>
                                </div>
                            </div>

                            {/* Core Details */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-6">
                                    <div>
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">أهداف المشروع</label>
                                        <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800 whitespace-pre-wrap break-words overflow-wrap-break-word">
                                            {objective || 'لا توجد أهداف مسجلة لهذا المشروع حالياً.'}
                                        </p>
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">نبذة عن المشروع (Abstract)</label>
                                        <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800 whitespace-pre-wrap break-words overflow-wrap-break-word">
                                            {abstract || 'لا يوجد ملخص متاح.'}
                                        </p>
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <div>
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">الفريق والمشرف</label>
                                        <div className="space-y-3">
                                            <div className="flex items-center gap-3 p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
                                                <div className="size-10 rounded-lg bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                                                    <span className="material-symbols-outlined text-xl">groups</span>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-xs font-black text-slate-400 uppercase">الفريق</p>
                                                    <p className="text-sm font-bold text-slate-900 dark:text-white">{teamName || 'لم يتم الربط بفريق بعد'}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3 p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
                                                <div className="size-10 rounded-lg bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                                                    <span className="material-symbols-outlined text-xl">supervisor_account</span>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-xs font-black text-slate-400 uppercase">المشرف</p>
                                                    <p className="text-sm font-bold text-slate-900 dark:text-white">{supervisorName || 'لم يتم التعيين'}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">تاريخ التسجيل</label>
                                        <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                                            <span className="material-symbols-outlined text-lg">calendar_today</span>
                                            <span className="text-sm font-bold">{createdAt ? new Date(createdAt).toLocaleDateString('ar-SA') : 'غير متوفر'}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Reports/Files Section (Placeholder for functional integration) */}
                            <div className="pt-6 border-t border-slate-100 dark:border-slate-800">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-3">التقارير والمرفقات</label>
                                <div className="bg-slate-50 dark:bg-slate-800/30 rounded-xl p-6 text-center border-2 border-dashed border-slate-200 dark:border-slate-800">
                                    <span className="material-symbols-outlined text-slate-300 text-4xl mb-2">folder_zip</span>
                                    <p className="text-sm text-slate-500 italic">لا توجد تقارير مرفوعة حالياً لهذا المشروع.</p>
                                </div>
                            </div>
                        </div>
                        );
                    })() : (
                        <div className="text-center py-12 text-slate-500 italic">
                            لم يتم العثور على بيانات لهذا المشروع.
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="bg-slate-50 dark:bg-slate-800/50 p-6 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                    <button 
                        onClick={onClose}
                        className="px-8 py-3 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 transition-all shadow-lg shadow-primary/20"
                    >
                        فهمت
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProjectDetailsModal;
