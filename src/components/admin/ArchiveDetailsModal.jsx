import React from 'react';
import { useArchivedProject } from '../../hooks/useArchive';

const BASE_URL = import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || '';

const ArchiveDetailsModal = ({ isOpen, onClose, archiveId }) => {
    const { data: archive, isLoading, isError } = useArchivedProject(archiveId);

    if (!isOpen) return null;

    const getImageUrl = (path) => {
        if (!path) return null;
        if (path.startsWith('http')) return path;
        return `${BASE_URL}${path}`;
    };

    const getFileUrl = (path) => {
        if (!path) return '';
        if (path.startsWith('http')) return path;
        return `${BASE_URL}${path}`;
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose}></div>
            <div className="relative bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in duration-200 text-right">
                {/* Header */}
                <div className="bg-slate-900 p-6 text-white flex items-center justify-between">
                    <button onClick={onClose} className="hover:bg-white/20 p-2 rounded-full transition-colors">
                        <span className="material-symbols-outlined">close</span>
                    </button>
                    <h2 className="text-xl font-black">تفاصيل المشروع المؤرشف</h2>
                </div>

                {/* Content */}
                <div className="p-8 max-h-[80vh] overflow-y-auto">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center py-12 gap-4">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                            <p className="text-slate-500 font-medium">جاري تحميل بيانات الأرشيف...</p>
                        </div>
                    ) : isError ? (
                        <div className="text-center py-12 text-rose-500">
                            <span className="material-symbols-outlined text-5xl mb-2">error</span>
                            <p className="font-bold">فشل في تحميل بيانات الأرشيف</p>
                        </div>
                    ) : archive ? (() => {
                        const projectTitle = archive.projectTitle || archive.ProjectTitle;
                        const year = archive.year || archive.Year;
                        const summary = archive.summary || archive.Summary;
                        const archiveID = archive.archiveID || archive.ArchiveID;
                        const archivedAt = archive.archivedAt || archive.ArchivedAt;
                        const score = archive.evaluationScore !== undefined ? archive.evaluationScore : archive.EvaluationScore;
                        const deptName = archive.departmentName || archive.DepartmentName;
                        const rawImagePath = archive.projectImagePath || archive.ProjectImagePath;
                        const imageUrl = getImageUrl(rawImagePath);

                        return (
                        <div className="space-y-8">
                            {/* Header card */}
                            <div className="flex flex-col items-center gap-4 text-center border-b border-slate-100 dark:border-slate-800 pb-8">
                                {imageUrl ? (
                                    /* Project image hero */
                                    <div className="w-full rounded-2xl overflow-hidden shadow-lg border border-slate-200 dark:border-slate-700 aspect-video">
                                        <img
                                            src={imageUrl}
                                            alt={`صورة المشروع: ${projectTitle}`}
                                            className="w-full h-full object-cover"
                                            onError={(e) => {
                                                e.currentTarget.parentElement.innerHTML =
                                                    '<div class="w-full h-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center"><span class="material-symbols-outlined text-slate-400 text-5xl">image_not_supported</span></div>';
                                            }}
                                        />
                                    </div>
                                ) : (
                                    <div className="size-20 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 flex items-center justify-center">
                                        <span className="material-symbols-outlined text-4xl">inventory_2</span>
                                    </div>
                                )}
                                <div>
                                    <h3 className="text-2xl font-black text-slate-900 dark:text-white">{projectTitle}</h3>
                                    <span className="inline-block mt-2 px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-bold uppercase tracking-widest">
                                        سنة التخرج: {year}
                                    </span>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {/* Left column */}
                                <div className="space-y-6">
                                    {/* Summary */}
                                    <div>
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">ملخص المشروع</label>
                                        <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800 leading-relaxed text-sm text-slate-600 dark:text-slate-300 whitespace-pre-wrap break-words overflow-wrap-break-word">
                                            {summary || 'لا يوجد ملخص متاح.'}
                                        </div>
                                    </div>

                                    {/* Attached File */}
                                    <div>
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">الملف المرفق</label>
                                        {(() => {
                                            const resolvedPath =
                                                archive.projectFileUrl ||
                                                archive.ProjectFileUrl ||
                                                archive.filePath ||
                                                archive.FilePath;
                                            const resolvedUrl = resolvedPath ? getFileUrl(resolvedPath) : null;
                                            const fileName = resolvedPath
                                                ? resolvedPath.substring(resolvedPath.lastIndexOf('/') + 1)
                                                : null;
                                            return resolvedUrl ? (
                                                <div className="flex items-center justify-between p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl group hover:border-primary transition-colors">
                                                    <div className="flex items-center gap-3">
                                                        <span className="material-symbols-outlined text-primary">description</span>
                                                        <span className="text-xs font-bold text-slate-700 dark:text-slate-300 truncate max-w-[200px]">
                                                            {fileName || 'project-file.pdf'}
                                                        </span>
                                                    </div>
                                                    <a
                                                        href={resolvedUrl}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
                                                    >
                                                        عرض الملف المرفق
                                                        <span className="material-symbols-outlined text-sm">download</span>
                                                    </a>
                                                </div>
                                            ) : (
                                                <div className="py-2.5 px-4 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded-lg text-center text-xs font-semibold">
                                                    لا يوجد ملف مرفق
                                                </div>
                                            );
                                        })()}
                                    </div>

                                    {/* Project image download (if available) */}
                                    {imageUrl && (
                                        <div>
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">صورة المشروع</label>
                                            <a
                                                href={imageUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center justify-between p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl hover:border-primary transition-colors group"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <img
                                                        src={imageUrl}
                                                        alt="صورة المشروع"
                                                        className="w-10 h-10 rounded-lg object-cover border border-slate-200"
                                                    />
                                                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300">عرض الصورة بالحجم الكامل</span>
                                                </div>
                                                <span className="material-symbols-outlined text-primary text-sm">open_in_new</span>
                                            </a>
                                        </div>
                                    )}
                                </div>

                                {/* Right column */}
                                <div className="space-y-6">
                                    <div>
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">معلومات إضافية</label>
                                        <div className="space-y-3">

                                            {/* Reference ID */}
                                            <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800">
                                                <span className="material-symbols-outlined text-slate-400">fingerprint</span>
                                                <div className="text-right">
                                                    <p className="text-[10px] font-black text-slate-400 uppercase">المعرف المرجعي</p>
                                                    <p className="text-sm font-bold text-slate-900 dark:text-white">ARCH-{archiveID?.toString().padStart(4, '0')}</p>
                                                </div>
                                            </div>

                                            {/* Department */}
                                            <div className="flex items-center gap-3 p-3 bg-violet-50 dark:bg-violet-900/20 rounded-xl border border-violet-100 dark:border-violet-800/30">
                                                <span className="material-symbols-outlined text-violet-500">school</span>
                                                <div className="text-right">
                                                    <p className="text-[10px] font-black text-violet-400 uppercase">القسم / التخصص</p>
                                                    <p className="text-sm font-bold text-violet-900 dark:text-violet-200">{deptName || 'غير محدد'}</p>
                                                </div>
                                            </div>

                                            {/* Archive date */}
                                            <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800">
                                                <span className="material-symbols-outlined text-slate-400">calendar_month</span>
                                                <div className="text-right">
                                                    <p className="text-[10px] font-black text-slate-400 uppercase">تاريخ الأرشفة</p>
                                                    <p className="text-sm font-bold text-slate-900 dark:text-white">{archivedAt ? new Date(archivedAt).toLocaleDateString('ar-SA') : 'غير متوفر'}</p>
                                                </div>
                                            </div>

                                            {/* Evaluation score */}
                                            <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800">
                                                <span className="material-symbols-outlined text-slate-400">grade</span>
                                                <div className="text-right">
                                                    <p className="text-[10px] font-black text-slate-400 uppercase">درجة التقييم</p>
                                                    <p className="text-sm font-bold text-slate-900 dark:text-white">
                                                        {score !== undefined && score !== null ? `${score} / 100` : 'غير متوفر'}
                                                    </p>
                                                    {score !== undefined && score !== null && (
                                                        <span className={`inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-bold ${
                                                            score >= 90 ? 'bg-emerald-100 text-emerald-700' :
                                                            score >= 80 ? 'bg-blue-100 text-blue-700' :
                                                            score >= 70 ? 'bg-amber-100 text-amber-700' :
                                                            'bg-rose-100 text-rose-700'
                                                        }`}>
                                                            {score >= 90 ? 'ممتاز' :
                                                             score >= 80 ? 'جيد جداً' :
                                                             score >= 70 ? 'جيد' :
                                                             'يحتاج تحسين'}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        );
                    })() : null}
                </div>

                <div className="bg-slate-50 dark:bg-slate-800/50 p-6 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                    <button 
                        onClick={onClose}
                        className="px-8 py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/20"
                    >
                        إغلاق
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ArchiveDetailsModal;
