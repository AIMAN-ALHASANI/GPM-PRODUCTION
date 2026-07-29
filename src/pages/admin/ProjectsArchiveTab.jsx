import React, { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useArchivedProjects, useUpdateArchive, useDeleteArchive } from '../../hooks/useArchive';
import toast from 'react-hot-toast';

const StatCard = ({ title, value, subtitle, icon }) => (
    <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden group">
        <div className="absolute top-0 left-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
            <span className="material-symbols-outlined text-6xl text-primary">{icon}</span>
        </div>
        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">{title}</p>
        <span className="text-4xl font-extrabold text-primary">{value}</span>
        <p className="text-xs text-slate-500 mt-1">{subtitle}</p>
    </div>
);

const FeaturedAssetCard = ({ title, description, gradient }) => (
    <div className={`relative rounded-xl overflow-hidden aspect-video group cursor-pointer bg-gradient-to-br ${gradient}`}>
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent flex flex-col justify-end p-5">
            <span className="text-white font-bold text-base">{title}</span>
            <span className="text-white/70 text-xs">{description}</span>
        </div>
    </div>
);

const ProjectsArchiveTab = () => {
    const { data: archivedProjectsResponse, isLoading, isError } = useArchivedProjects();
    const archivedProjects = archivedProjectsResponse?.data || [];

    const [searchTerm, setSearchTerm] = useState("");
    const [selectedYear, setSelectedYear] = useState("السنة الأكاديمية (الكل)");
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(5);

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

    const BASE_URL = import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || '';
    const getFileUrl = (path) => {
        if (!path) return '';
        if (path.startsWith('http')) return path;
        return `${BASE_URL}${path}`;
    };

    const handleOpenEditModal = (project) => {
        setSelectedProject(project);
        setEditYear(project.year || "");
        setEditSummary(project.summary || "");
        setEditScore(project.evaluationScore || "");
        setEditImage(null);
        setEditFile(null);
        setIsEditModalOpen(true);
    };

    const handleEditSubmit = (e) => {
        e.preventDefault();
        if (!editYear || !editSummary || !editScore) {
            toast.error("يرجى ملء جميع الحقول المطلوبة");
            return;
        }

        updateArchiveMutation.mutate({
            id: selectedProject.archiveID,
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
        deleteArchiveMutation.mutate(projectToDelete.archiveID, {
            onSuccess: () => {
                setIsDeleteModalOpen(false);
            }
        });
    };

    const academicYears = ["السنة الأكاديمية (الكل)", "2024", "2023", "2022"];

    const statsCards = [
        { title: "إجمالي المؤرشف", value: archivedProjects.length.toString(), subtitle: "مشاريع معتمدة", icon: "inventory_2" },
        { title: "متوسط الدرجة النهائية", value: "٣.٨٢", subtitle: "المعدل التراكمي", icon: "grade" },
        { title: "إجمالي الخريجين", value: "٣٬١٠٥", subtitle: "منذ التأسيس", icon: "diversity_3" },
        { title: "السنوات الأكاديمية", value: "١٢", subtitle: "٢٠١٢ — ٢٠٢٤", icon: "history_edu" }
    ];

    const featuredAssets = [
        { title: "مستودعات مشاريع علوم الحاسوب", description: "الكود المصدر والوثائق المؤرشفة", gradient: "from-indigo-500 to-purple-600" },
        { title: "المخططات الهندسية", description: "نماذج CAD والنماذج الأولية", gradient: "from-emerald-500 to-teal-600" },
        { title: "الأطروحات التاريخية", description: "المخطوطات الرقمية منذ ٢٠١٢", gradient: "from-amber-500 to-orange-600" }
    ];

    const filteredProjects = archivedProjects.filter(project => {
        const matchesSearch = project.projectTitle?.toLowerCase().includes(searchTerm.toLowerCase()) || project.summary?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesYear = selectedYear === "السنة الأكاديمية (الكل)" || project.year === selectedYear;
        return matchesSearch && matchesYear;
    });

    const totalPages = Math.ceil(filteredProjects.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedProjects = filteredProjects.slice(startIndex, startIndex + itemsPerPage);

    if (isLoading) return <div className="flex justify-center py-20"><span className="material-symbols-outlined animate-spin text-primary text-4xl">sync</span></div>;

    return (
        <div className="flex flex-col gap-6">
            <nav className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 mb-8">
                <Link className="hover:text-primary" to="/admin/dashboard">الرئيسية</Link>
                <span className="material-symbols-outlined text-sm">chevron_right</span>
                <span className="text-slate-900 dark:text-white font-medium">الأرشيف</span>
            </nav>

            <div className="max-w-7xl mx-auto w-full space-y-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">الأرشيف الأكاديمي</h1>
                        <p className="text-slate-500 dark:text-slate-400 mt-1">الوصول إلى المشاريع المكتملة وإدارة السجلات المؤرشفة من السنوات السابقة.</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <Link to="/admin/project-archive" className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm font-semibold hover:bg-primary/90 transition-colors shadow-sm">
                            <span className="material-symbols-outlined text-[18px]">add</span>
                            أرشفة مشروع جديد
                        </Link>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    {statsCards.map((stat, index) => (
                        <StatCard key={index} {...stat} />
                    ))}
                </div>

                <div className="border-b border-slate-200 dark:border-slate-800">
                    <nav className="flex gap-8">
                        <NavLink to="/admin/projects" className={({ isActive }) => isActive ? "flex items-center gap-2 px-1 py-3 text-primary border-b-2 border-primary font-semibold" : "flex items-center gap-2 px-1 py-3 text-slate-500 hover:text-primary transition-colors"} end>
                            <span className="material-symbols-outlined">account_tree</span> المشاريع
                        </NavLink>
                        <NavLink to="/admin/projects/archive" className={({ isActive }) => isActive ? "flex items-center gap-2 px-1 py-3 text-primary border-b-2 border-primary font-semibold" : "flex items-center gap-2 px-1 py-3 text-slate-500 hover:text-primary transition-colors"}>
                            <span className="material-symbols-outlined">inventory_2</span> الأرشيف
                        </NavLink>
                    </nav>
                </div>

                <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-wrap items-center gap-4">
                    <div className="flex-1 min-w-[240px]">
                        <div className="relative">
                            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">search</span>
                            <input className="w-full bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-lg py-2.5 pl-10 pr-4 text-sm focus:ring-2 focus:ring-primary/20 outline-none" placeholder="ابحث حسب عنوان المشروع..." type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                        </div>
                    </div>
                    <select className="bg-slate-50 dark:bg-slate-800 border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:ring-primary outline-none" value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)}>
                        {academicYears.map((year, idx) => (
                            <option key={idx} value={year}>{year}</option>
                        ))}
                    </select>
                </div>

                <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-right border-collapse">
                            <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
                                <tr>
                                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">اسم المشروع</th>
                                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">السنة الأكاديمية</th>
                                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">الملخص</th>
                                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 text-left">الإجراءات</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                {paginatedProjects.map((project) => (
                                    <tr key={project.archiveID} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                                        <td className="px-6 py-4">
                                            <span className="font-semibold text-slate-900 dark:text-white">{project.projectTitle}</span>
                                        </td>
                                        <td className="px-6 py-4 text-slate-600 dark:text-slate-300 font-medium">{project.year}</td>
                                        <td className="px-6 py-4 text-slate-500 text-sm max-w-xs truncate">{project.summary}</td>
                                        <td className="px-6 py-4 text-left">
                                            <div className="flex justify-start items-center gap-1">
                                                {(project.projectFileUrl || project.filePath) ? (
                                                    <a 
                                                        href={getFileUrl(project.projectFileUrl || project.filePath)}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="p-1.5 rounded-lg text-slate-500 hover:text-primary hover:bg-primary/10 transition-colors flex items-center" 
                                                        title="تحميل الملف"
                                                    >
                                                        <span className="material-symbols-outlined text-[20px]">download</span>
                                                    </a>
                                                ) : null}
                                                <button 
                                                    onClick={() => handleOpenEditModal(project)}
                                                    className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/30 transition-colors flex items-center" 
                                                    title="تعديل"
                                                >
                                                    <span className="material-symbols-outlined text-[20px]">edit</span>
                                                </button>
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
                                ))}
                                {filteredProjects.length === 0 && (
                                    <tr>
                                        <td colSpan="4" className="px-6 py-10 text-center text-slate-500">لا توجد مشاريع مؤرشفة تطابق البحث</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

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
                                    {selectedProject.projectTitle}
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
                                    سيتم إرجاع حالة المشروع "<span className="font-semibold text-slate-700 dark:text-slate-300">{projectToDelete.projectTitle}</span>" إلى 'مكتمل' وحذف سجل الأرشيف والملفات المرتبطة به نهائياً. لا يمكن التراجع عن هذا الإجراء.
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
        </div>
    );
};

export default ProjectsArchiveTab;
