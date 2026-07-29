import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCollegeArchivedProjects, useUpdateArchive, useDeleteArchive } from '../../hooks/useArchive';
import ArchiveDetailsModal from '../../components/admin/ArchiveDetailsModal';
import toast from 'react-hot-toast';

const BASE_URL = import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || '';

const ArchivedProjectsManagement = () => {
    const { data: archivedData, isLoading, isError } = useCollegeArchivedProjects();
    
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedYear, setSelectedYear] = useState("السنة الأكاديمية (الكل)");
    const [selectedArchiveId, setSelectedArchiveId] = useState(null);
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
    const [lightboxImage, setLightboxImage] = useState(null);  // Full-size image lightbox

    // Edit modal state
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedProject, setSelectedProject] = useState(null);
    const [editYear, setEditYear] = useState("");
    const [editSummary, setEditSummary] = useState("");
    const [editScore, setEditScore] = useState("");
    const [editImage, setEditImage] = useState(null);
    const [editFile, setEditFile] = useState(null);

    // Delete modal state
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [projectToDelete, setProjectToDelete] = useState(null);

    const updateArchiveMutation = useUpdateArchive();
    const deleteArchiveMutation = useDeleteArchive();

    const archivedProjects = Array.isArray(archivedData) ? archivedData : (archivedData?.data || []);
    const academicYears = ["السنة الأكاديمية (الكل)", "2026", "2025", "2024", "2023", "2022"];

    const filteredProjects = archivedProjects.filter(project => {
        const title = project.projectTitle || project.ProjectTitle || "";
        const summary = project.summary || project.Summary || "";
        const deptName = project.departmentName || project.DepartmentName || "";
        const year = project.year || project.Year || "";

        const matchesSearch = title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                             summary.toLowerCase().includes(searchTerm.toLowerCase()) ||
                             deptName.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesYear = selectedYear === "السنة الأكاديمية (الكل)" || year === selectedYear;
        return matchesSearch && matchesYear;
    });

    const handleViewDetails = (id) => {
        setSelectedArchiveId(id);
        setIsDetailsModalOpen(true);
    };

    const handleOpenEditModal = (project) => {
        setSelectedProject(project);
        setEditYear(project.year || project.Year || "");
        setEditSummary(project.summary || project.Summary || "");
        const score = project.evaluationScore !== undefined ? project.evaluationScore : project.EvaluationScore;
        setEditScore(score !== undefined && score !== null ? score : "");
        setEditImage(null);
        setEditFile(null);
        setIsEditModalOpen(true);
    };

    const handleEditSubmit = (e) => {
        e.preventDefault();
        const id = selectedProject.archiveID || selectedProject.ArchiveID;
        if (!editYear || !editSummary || editScore === "") {
            toast.error("يرجى ملء جميع الحقول المطلوبة");
            return;
        }

        updateArchiveMutation.mutate({
            id: id,
            data: {
                year: editYear,
                summary: editSummary,
                evaluationScore: parseFloat(editScore),
                projectImage: editImage,
                projectFile: editFile
            }
        }, {
            onSuccess: () => {
                setIsEditModalOpen(false);
            }
        });
    };

    const handleDeleteClick = (project) => {
        setProjectToDelete(project);
        setIsDeleteModalOpen(true);
    };

    const handleDeleteConfirm = () => {
        const id = projectToDelete.archiveID || projectToDelete.ArchiveID;
        deleteArchiveMutation.mutate(id, {
            onSuccess: () => {
                setIsDeleteModalOpen(false);
            }
        });
    };

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

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                <p className="text-slate-500 font-medium">جاري تحميل الأرشيف...</p>
            </div>
        );
    }

    if (isError) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
                <span className="material-symbols-outlined text-rose-500 text-5xl">error</span>
                <p className="text-rose-500 font-bold text-xl">فشل في تحميل الأرشيف</p>
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
                <span className="text-slate-900 dark:text-white font-medium">الأرشيف الأكاديمي</span>
            </nav>

            <div className="max-w-7xl mx-auto w-full space-y-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">الأرشيف الأكاديمي</h1>
                        <p className="text-slate-500 dark:text-slate-400 mt-1">إدارة السجلات التاريخية للمشاريع المكتملة والمؤرشفة.</p>
                    </div>
                    <Link to="/admin/project-archive">
                        <button className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 transition-all shadow-lg shadow-primary/20">
                            <span className="material-symbols-outlined">add_task</span>
                            <span>أرشفة مشروع جديد</span>
                        </button>
                    </Link>
                </div>

                {/* Search & Filter */}
                <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-wrap items-center gap-4">
                    <div className="flex-1 min-w-[240px]">
                        <div className="relative">
                            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">search</span>
                            <input 
                                className="w-full bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-lg py-2.5 pl-10 pr-4 text-sm focus:ring-2 focus:ring-primary/20 outline-none" 
                                placeholder="ابحث في الأرشيف..." 
                                type="text" 
                                value={searchTerm} 
                                onChange={(e) => setSearchTerm(e.target.value)} 
                            />
                        </div>
                    </div>
                    <select 
                        className="bg-slate-50 dark:bg-slate-800 border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:ring-primary outline-none" 
                        value={selectedYear} 
                        onChange={(e) => setSelectedYear(e.target.value)}
                    >
                        {academicYears.map((year, idx) => (
                            <option key={idx} value={year}>{year}</option>
                        ))}
                    </select>
                </div>

                {/* Table */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden mb-10">
                    <div className="overflow-x-auto">
                        <table className="w-full text-right border-collapse">
                            <thead>
                                <tr className="bg-slate-50/50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
                                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">اسم المشروع</th>
                                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 text-center">القسم</th>
                                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 text-center">السنة</th>
                                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 text-center">درجة التقييم</th>
                                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 text-center">صورة المشروع</th>
                                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 text-left">الإجراءات</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                {filteredProjects.map((project) => {
                                    const id = project.archiveID || project.ArchiveID;
                                    const title = project.projectTitle || project.ProjectTitle;
                                    const year = project.year || project.Year;
                                    const score = project.evaluationScore !== undefined ? project.evaluationScore : project.EvaluationScore;
                                    const deptName = project.departmentName || project.DepartmentName || '—';
                                    const rawImagePath = project.projectImagePath || project.ProjectImagePath;
                                    const imageUrl = getImageUrl(rawImagePath);

                                    return (
                                    <tr key={id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors group">
                                        <td className="px-6 py-4">
                                            <span className="font-bold text-slate-900 dark:text-white group-hover:text-primary transition-colors">{title}</span>
                                        </td>

                                        {/* Department */}
                                        <td className="px-6 py-4 text-center">
                                            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-violet-50 dark:bg-violet-900/20 text-violet-700 dark:text-violet-400 rounded-lg text-xs font-semibold">
                                                <span className="material-symbols-outlined text-sm">school</span>
                                                {deptName}
                                            </span>
                                        </td>

                                        <td className="px-6 py-4 text-center">
                                            <span className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-xs font-bold text-slate-600 dark:text-slate-400">{year}</span>
                                        </td>

                                        <td className="px-6 py-4 text-center">
                                            <span className="font-bold text-slate-900 dark:text-white">{score !== undefined && score !== null ? score : '-'}</span>
                                        </td>

                                        {/* Project Image thumbnail */}
                                        <td className="px-6 py-4 text-center">
                                            {imageUrl ? (
                                                <button
                                                    onClick={() => setLightboxImage(imageUrl)}
                                                    className="group/img inline-block rounded-lg overflow-hidden border-2 border-transparent hover:border-primary transition-all shadow-sm hover:shadow-md"
                                                    title="انقر لعرض الصورة كاملة"
                                                >
                                                    <img
                                                        src={imageUrl}
                                                        alt={`صورة ${title}`}
                                                        className="w-12 h-12 object-cover group-hover/img:scale-110 transition-transform duration-200"
                                                        onError={(e) => { e.currentTarget.style.display = 'none'; }}
                                                    />
                                                </button>
                                            ) : (
                                                <span className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-slate-100 dark:bg-slate-800 mx-auto">
                                                    <span className="material-symbols-outlined text-slate-400 text-xl">hide_image</span>
                                                </span>
                                            )}
                                        </td>

                                        <td className="px-6 py-4 text-left">
                                            <div className="flex justify-start items-center gap-1">
                                                <button 
                                                    onClick={() => handleViewDetails(id)}
                                                    className="p-1.5 rounded-lg text-slate-500 hover:text-primary hover:bg-primary/10 transition-colors flex items-center" 
                                                    title="عرض التفاصيل"
                                                >
                                                    <span className="material-symbols-outlined text-[20px]">visibility</span>
                                                </button>
                                                {(() => {
                                                    const rawUrl =
                                                        project.projectFileUrl ||
                                                        project.ProjectFileUrl ||
                                                        project.filePath ||
                                                        project.FilePath;
                                                    const resolvedUrl = rawUrl ? getFileUrl(rawUrl) : null;
                                                    return resolvedUrl ? (
                                                        <a
                                                            href={resolvedUrl}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="p-1.5 rounded-lg text-slate-500 hover:text-primary hover:bg-primary/10 transition-colors flex items-center"
                                                            title="تحميل الملف المرفق"
                                                        >
                                                            <span className="material-symbols-outlined text-[20px]">download</span>
                                                        </a>
                                                    ) : null;
                                                })()}
                                                
                                                {/* Edit Button */}
                                                <button 
                                                    onClick={() => handleOpenEditModal(project)}
                                                    className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/30 transition-colors flex items-center" 
                                                    title="تعديل"
                                                >
                                                    <span className="material-symbols-outlined text-[20px]">edit</span>
                                                </button>

                                                {/* Delete Button */}
                                                <button 
                                                    onClick={() => handleDeleteClick(project)}
                                                    className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors flex items-center" 
                                                    title="حذف"
                                                >
                                                    <span className="material-symbols-outlined text-[20px]">delete</span>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                    );
                                })}
                                {filteredProjects.length === 0 && (
                                    <tr>
                                        <td colSpan="6" className="px-6 py-20 text-center text-slate-400">
                                            <span className="material-symbols-outlined text-4xl mb-2">inventory_2</span>
                                            <p>لا توجد مشاريع مؤرشفة تطابق البحث</p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Archive Details Modal */}
            <ArchiveDetailsModal 
                isOpen={isDetailsModalOpen}
                onClose={() => setIsDetailsModalOpen(false)}
                archiveId={selectedArchiveId}
            />

            {/* Edit Modal */}
            {isEditModalOpen && selectedProject && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl max-w-lg w-full overflow-hidden transform scale-100 transition-all flex flex-col max-h-[90vh]">
                        
                        {/* Header */}
                        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/50">
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white">تعديل بيانات مشروع الأرشيف</h3>
                            <button 
                                onClick={() => setIsEditModalOpen(false)}
                                className="w-8 h-8 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition-all"
                            >
                                <span className="material-symbols-outlined text-[20px]">close</span>
                            </button>
                        </div>

                        {/* Form */}
                        <form onSubmit={handleEditSubmit} className="p-6 space-y-4 overflow-y-auto flex-1 text-right" dir="rtl">
                            {/* Project Title (Readonly) */}
                            <div>
                                <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1.5">عنوان المشروع</label>
                                <div className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-slate-600 dark:text-slate-300 text-sm font-semibold select-none">
                                    {selectedProject.projectTitle || selectedProject.ProjectTitle}
                                </div>
                            </div>

                            {/* Year & Score row */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1.5">السنة الأكاديمية</label>
                                    <input 
                                        type="text" 
                                        className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-slate-900 dark:text-white text-sm focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all"
                                        placeholder="مثال: 2024"
                                        value={editYear}
                                        onChange={(e) => setEditYear(e.target.value)}
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1.5">درجة التقييم (100)</label>
                                    <input 
                                        type="number" 
                                        min="0"
                                        max="100"
                                        step="0.1"
                                        className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-slate-900 dark:text-white text-sm focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all"
                                        placeholder="درجة التقييم"
                                        value={editScore}
                                        onChange={(e) => setEditScore(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>

                            {/* Summary */}
                            <div>
                                <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1.5">الملخص</label>
                                <textarea 
                                    className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-slate-900 dark:text-white text-sm focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all h-24 resize-none"
                                    placeholder="اكتب ملخصاً للمشروع..."
                                    value={editSummary}
                                    onChange={(e) => setEditSummary(e.target.value)}
                                    required
                                />
                            </div>

                            {/* Image upload */}
                            <div>
                                <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1.5">صورة المشروع (اختياري)</label>
                                <div className="border border-dashed border-slate-200 dark:border-slate-800 rounded-xl p-4 flex flex-col items-center justify-center bg-slate-50/50 dark:bg-slate-950/20 hover:bg-slate-50 dark:hover:bg-slate-950/30 transition-all relative">
                                    <span className="material-symbols-outlined text-3xl text-slate-400 mb-2">image</span>
                                    <span className="text-xs text-slate-500 dark:text-slate-400 font-medium font-sans">اختر ملف صورة جديد</span>
                                    <span className="text-[10px] text-slate-400 mt-1">PNG, JPG, WEBP (بحد أقصى 1 ميجا)</span>
                                    <input 
                                        type="file" 
                                        accept="image/*"
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                        onChange={(e) => setEditImage(e.target.files[0])}
                                    />
                                </div>
                                {editImage && (
                                    <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-800/50 px-4 py-2.5 rounded-lg mt-2 text-xs">
                                        <span className="text-slate-600 dark:text-slate-300 truncate max-w-[200px]">{editImage.name}</span>
                                        <button type="button" onClick={() => setEditImage(null)} className="text-rose-500 hover:text-rose-600 font-semibold">إلغاء</button>
                                    </div>
                                )}
                            </div>

                            {/* File upload */}
                            <div>
                                <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1.5">ملف المشروع (PDF, Word, ZIP - اختياري)</label>
                                <div className="border border-dashed border-slate-200 dark:border-slate-800 rounded-xl p-4 flex flex-col items-center justify-center bg-slate-50/50 dark:bg-slate-950/20 hover:bg-slate-50 dark:hover:bg-slate-950/30 transition-all relative">
                                    <span className="material-symbols-outlined text-3xl text-slate-400 mb-2">upload_file</span>
                                    <span className="text-xs text-slate-500 dark:text-slate-400 font-medium font-sans">اختر ملف مشروع جديد</span>
                                    <span className="text-[10px] text-slate-400 mt-1">PDF, ZIP, Word (بحد أقصى 3 ميجا)</span>
                                    <input 
                                        type="file" 
                                        accept=".pdf,.doc,.docx,.ppt,.pptx,.zip,.rar"
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                        onChange={(e) => setEditFile(e.target.files[0])}
                                    />
                                </div>
                                {editFile && (
                                    <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-800/50 px-4 py-2.5 rounded-lg mt-2 text-xs">
                                        <span className="text-slate-600 dark:text-slate-300 truncate max-w-[200px]">{editFile.name}</span>
                                        <button type="button" onClick={() => setEditFile(null)} className="text-rose-500 hover:text-rose-600 font-semibold">إلغاء</button>
                                    </div>
                                )}
                            </div>
                        </form>

                        {/* Footer */}
                        <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex justify-end gap-3">
                            <button 
                                type="button"
                                onClick={() => setIsEditModalOpen(false)}
                                className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 text-sm font-semibold transition-all"
                            >
                                إلغاء
                            </button>
                            <button 
                                type="button"
                                onClick={handleEditSubmit}
                                disabled={updateArchiveMutation.isPending}
                                className="px-5 py-2.5 rounded-xl bg-primary text-white hover:bg-primary/95 text-sm font-semibold shadow-md disabled:opacity-50 flex items-center gap-2 transition-all"
                            >
                                {updateArchiveMutation.isPending && (
                                    <span className="material-symbols-outlined animate-spin text-base">sync</span>
                                )}
                                حفظ التغييرات
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {isDeleteModalOpen && projectToDelete && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl max-w-md w-full overflow-hidden transform scale-100 transition-all flex flex-col">
                        
                        {/* Body */}
                        <div className="p-6 text-center space-y-4" dir="rtl">
                            <div className="w-16 h-16 rounded-full bg-rose-50 dark:bg-rose-950/20 text-rose-500 flex items-center justify-center mx-auto">
                                <span className="material-symbols-outlined text-3xl">warning</span>
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white">هل أنت متأكد من حذف المشروع من الأرشيف؟</h3>
                                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                                    سيتم إرجاع حالة المشروع "<span className="font-semibold text-slate-700 dark:text-slate-300">{projectToDelete.projectTitle || projectToDelete.ProjectTitle}</span>" إلى 'مكتمل' وحذف سجل الأرشيف والملفات المرتبطة به نهائياً. لا يمكن التراجع عن هذا الإجراء.
                                </p>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex justify-end gap-3">
                            <button 
                                type="button"
                                onClick={() => setIsDeleteModalOpen(false)}
                                className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 text-sm font-semibold transition-all"
                            >
                                إلغاء
                            </button>
                            <button 
                                type="button"
                                onClick={handleDeleteConfirm}
                                disabled={deleteArchiveMutation.isPending}
                                className="px-5 py-2.5 rounded-xl bg-rose-600 text-white hover:bg-rose-700 text-sm font-semibold shadow-md disabled:opacity-50 flex items-center gap-2 transition-all"
                            >
                                {deleteArchiveMutation.isPending && (
                                    <span className="material-symbols-outlined animate-spin text-base">sync</span>
                                )}
                                نعم، احذف السجل
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Image Lightbox */}
            {lightboxImage && (
                <div
                    className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md"
                    onClick={() => setLightboxImage(null)}
                >
                    <div className="relative max-w-4xl w-full" onClick={(e) => e.stopPropagation()}>
                        <button
                            onClick={() => setLightboxImage(null)}
                            className="absolute -top-12 left-0 text-white hover:text-slate-300 transition-colors flex items-center gap-2 font-bold"
                        >
                            <span className="material-symbols-outlined">close</span>
                            إغلاق
                        </button>
                        <img
                            src={lightboxImage}
                            alt="صورة المشروع بالحجم الكامل"
                            className="w-full max-h-[80vh] object-contain rounded-2xl shadow-2xl border border-white/10"
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

export default ArchivedProjectsManagement;
