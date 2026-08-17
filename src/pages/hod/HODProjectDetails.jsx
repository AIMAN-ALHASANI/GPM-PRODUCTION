import React from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useProjects } from '../../hooks/useProjects';

const HODProjectDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { data: projects, isLoading } = useProjects();

    const project = Array.isArray(projects) ? projects.find(p => p.projectID === parseInt(id)) : null;

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (!project) {
        return (
            <div className="max-w-4xl mx-auto w-full py-20 text-center" dir="rtl">
                <span className="material-symbols-outlined text-6xl text-slate-200 mb-4">error</span>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">المشروع غير موجود</h2>
                <p className="text-slate-500 mb-8">عذراً، لم نتمكن من العثور على تفاصيل هذا المشروع.</p>
                <Link to="/hod/projects" className="text-primary font-bold hover:underline">العودة لقائمة المشاريع</Link>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto w-full pb-10 text-right" dir="rtl">
            <div className="mb-8">
                <button 
                    onClick={() => navigate('/hod/projects')}
                    className="flex items-center gap-2 text-slate-500 hover:text-primary transition-colors text-sm font-bold mb-4"
                >
                    <span className="material-symbols-outlined">arrow_forward</span>
                    العودة للمشاريع
                </button>
                <div className="flex justify-between items-start flex-row-reverse">
                    <span className={`px-3 py-1 text-xs font-bold rounded-full border ${
                        project.status === 'Approved' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                        project.status === 'Rejected' ? 'bg-red-50 text-red-700 border-red-100' :
                        'bg-blue-50 text-blue-700 border-blue-100'
                    }`}>
                        {project.status}
                    </span>
                    <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">{project.title}</h1>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-6">
                <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                    <div className="space-y-8">
                        <div>
                            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-3">وصف المشروع / الأهداف</h3>
                            <div className="max-h-64 overflow-y-auto">
                              <p className="text-slate-700 dark:text-slate-300 leading-relaxed text-lg whitespace-pre-wrap break-words overflow-wrap-break-word">
                                  {project.objective || 'لا يوجد وصف متاح'}
                              </p>
                            </div>
                        </div>

                        {project.abstract && (
                            <div>
                                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-3">الملخص</h3>
                                <div className="max-h-48 overflow-y-auto">
                                  <p className="text-slate-600 dark:text-slate-400 leading-relaxed whitespace-pre-wrap break-words overflow-wrap-break-word">
                                      {project.abstract}
                                  </p>
                                </div>
                            </div>
                        )}

                        {project.memberNames && project.memberNames.length > 0 && (
                            <div>
                                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-3">أعضاء الفريق</h3>
                                <div className="flex flex-wrap gap-2">
                                    {project.memberNames.map((name, idx) => (
                                        <span key={idx} className="px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs text-slate-700 dark:text-slate-300 font-bold border border-slate-200/55 dark:border-slate-700/55">
                                            {name}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pt-8 border-t border-slate-100 dark:border-slate-800">
                            <div>
                                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">اسم الفريق</h4>
                                <p className="text-sm font-bold text-slate-900 dark:text-white">{project.teamName || 'غير محدد'}</p>
                            </div>
                            <div>
                                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">القسم</h4>
                                <p className="text-sm font-bold text-slate-900 dark:text-white">{project.departmentName || 'غير محدد'}</p>
                            </div>
                            <div>
                                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">المشرف</h4>
                                <p className="text-sm font-bold text-slate-900 dark:text-white">{project.supervisorName || 'لم يتم التعيين بعد'}</p>
                            </div>
                            <div>
                                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">تاريخ الإنشاء</h4>
                                <p className="text-sm font-bold text-slate-900 dark:text-white tabular-nums">
                                    {new Date(project.createdAt).toLocaleDateString('ar-EG')}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HODProjectDetails;
