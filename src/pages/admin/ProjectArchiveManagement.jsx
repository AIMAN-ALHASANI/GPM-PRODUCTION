import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useCompletedProjectsForArchive, useArchiveProjectWithScore } from '../../hooks/useArchive';
import toast from 'react-hot-toast';

const ProjectArchiveManagement = () => {
    const { data: eligibleProjectsResponse, isLoading, isError, refetch } = useCompletedProjectsForArchive();
    const archiveMutation = useArchiveProjectWithScore();

    const [searchTerm, setSearchTerm] = useState("");
    const [selectedProject, setSelectedProject] = useState(null);
    const [evaluationScore, setEvaluationScore] = useState("");
    const [projectFile, setProjectFile] = useState(null);           // Added for File object
    const [projectImage, setProjectImage] = useState(null);         // File object
    const [imagePreview, setImagePreview] = useState(null);         // Data URL for preview
    const [isDragging, setIsDragging] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [scoreError, setScoreError] = useState("");
    const fileInputRef = useRef(null);
    const documentInputRef = useRef(null);

    const projects = Array.isArray(eligibleProjectsResponse) ? eligibleProjectsResponse : (eligibleProjectsResponse?.data || []);

    const filteredProjects = projects.filter(project => {
        const title = project.title || project.Title || "";
        const teamName = project.teamName || project.TeamName || "";
        const supervisorName = project.supervisorName || project.SupervisorName || "";
        
        return title.toLowerCase().includes(searchTerm.toLowerCase()) ||
               teamName.toLowerCase().includes(searchTerm.toLowerCase()) ||
               supervisorName.toLowerCase().includes(searchTerm.toLowerCase());
    });

    const handleOpenArchiveModal = (project) => {
        setSelectedProject(project);
        setEvaluationScore("");
        setProjectFile(null);
        setScoreError("");
        setProjectImage(null);
        setImagePreview(null);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedProject(null);
        setEvaluationScore("");
        setProjectFile(null);
        setProjectImage(null);
        setImagePreview(null);
    };

    // ── Image handling helpers ──────────────────────────────────────────
    const processImageFile = (file) => {
        if (!file) return;
        const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
        if (!allowed.includes(file.type)) {
            toast.error('يُسمح فقط بصور: JPG، PNG، GIF، WEBP');
            return;
        }
        if (file.size > 1 * 1024 * 1024) {
            toast.error('حجم الصورة يجب ألا يتجاوز 1 ميجا');
            return;
        }
        setProjectImage(file);
        const reader = new FileReader();
        reader.onloadend = () => setImagePreview(reader.result);
        reader.readAsDataURL(file);
    };

    const handleFileChange = (e) => processImageFile(e.target.files[0]);
    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        processImageFile(e.dataTransfer.files[0]);
    };
    const handleRemoveImage = () => {
        setProjectImage(null);
        setImagePreview(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    // ── Project File handling helper ────────────────────────────────────
    const processProjectFile = (file) => {
        if (!file) return;
        const allowedExtensions = ['.pdf', '.doc', '.docx', '.ppt', '.pptx', '.zip', '.rar'];
        const fileExt = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
        if (!allowedExtensions.includes(fileExt)) {
            toast.error('نوع ملف المشروع غير مدعوم');
            return;
        }
        if (file.size > 3 * 1024 * 1024) {
            toast.error('حجم ملف المشروع يجب ألا يتجاوز 3 ميجا');
            return;
        }
        setProjectFile(file);
    };

    // ── Submit ──────────────────────────────────────────────────────────
    const handleArchiveSubmit = async (e) => {
        e.preventDefault();
        setScoreError("");

        const score = parseFloat(evaluationScore);
        if (isNaN(score) || score < 0 || score > 100) {
            setScoreError("يجب أن تكون الدرجة بين 0 و 100");
            return;
        }

        if (!projectFile) {
            toast.error("يرجى اختيار ملف المشروع");
            return;
        }

        // Frontend double check validation
        if (projectFile.size > 3 * 1024 * 1024) {
            toast.error("حجم ملف المشروع يجب ألا يتجاوز 3 ميجا");
            return;
        }

        const allowedExtensions = ['.pdf', '.doc', '.docx', '.ppt', '.pptx', '.zip', '.rar'];
        const fileExt = projectFile.name.substring(projectFile.name.lastIndexOf('.')).toLowerCase();
        if (!allowedExtensions.includes(fileExt)) {
            toast.error("نوع ملف المشروع غير مدعوم");
            return;
        }

        if (projectImage && projectImage.size > 1 * 1024 * 1024) {
            toast.error("حجم الصورة يجب ألا يتجاوز 1 ميجا");
            return;
        }

        try {
            await archiveMutation.mutateAsync({
                projectId: selectedProject.projectID || selectedProject.ProjectID,
                evaluationScore: score,
                projectImage: projectImage,     // File or null
                projectFile: projectFile        // File object
            });
            handleCloseModal();
            refetch();
        } catch (error) {
            console.error("Archiving failed:", error);
        }
    };

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                <p className="text-slate-500 font-medium">جاري تحميل المشاريع المؤهلة للأرشفة...</p>
            </div>
        );
    }

    if (isError) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
                <span className="material-symbols-outlined text-rose-500 text-5xl">error</span>
                <p className="text-rose-500 font-bold text-xl">فشل في تحميل المشاريع</p>
                <button 
                    onClick={() => refetch()}
                    className="px-6 py-2 bg-primary text-white rounded-lg font-bold"
                >
                    إعادة المحاولة
                </button>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-6 w-full text-right" dir="rtl">
            <nav className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                <Link className="hover:text-primary" to="/admin/dashboard">الرئيسية</Link>
                <span className="material-symbols-outlined text-sm rotate-180">chevron_right</span>
                <span className="text-slate-900 dark:text-white font-medium">أرشفة المشاريع</span>
            </nav>

            <div className="max-w-7xl mx-auto w-full space-y-8">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">أرشفة المشاريع المكتملة</h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">عرض وأرشفة المشاريع الأكاديمية المكتملة وتعيين درجات تقييم الأداء النهائية.</p>
                </div>

                <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
                    <div className="flex-1">
                        <div className="relative">
                            <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">search</span>
                            <input 
                                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg py-2.5 pr-10 pl-4 text-sm focus:ring-2 focus:ring-primary/20 outline-none" 
                                placeholder="ابحث باسم المشروع، الفريق، أو المشرف..." 
                                type="text" 
                                value={searchTerm} 
                                onChange={(e) => setSearchTerm(e.target.value)} 
                            />
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden mb-10">
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse">
                            <thead>
                                <tr className="bg-slate-50/50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-right">
                                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">عنوان المشروع</th>
                                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">اسم الفريق</th>
                                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">المشرف</th>
                                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">تاريخ الإنشاء</th>
                                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">الحالة</th>
                                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 text-left">الإجراءات</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-right">
                                {filteredProjects.map((project) => {
                                    const id = project.projectID || project.ProjectID;
                                    const title = project.title || project.Title;
                                    const teamName = project.teamName || project.TeamName;
                                    const supervisorName = project.supervisorName || project.SupervisorName;
                                    const createdAt = project.createdAt || project.CreatedAt;

                                    return (
                                        <tr key={id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors group">
                                            <td className="px-6 py-4">
                                                <span className="font-bold text-slate-900 dark:text-white">{title}</span>
                                            </td>
                                            <td className="px-6 py-4 text-slate-600 dark:text-slate-300 font-medium">
                                                {teamName || 'بدون فريق'}
                                            </td>
                                            <td className="px-6 py-4 text-slate-600 dark:text-slate-300">
                                                {supervisorName || 'لم يحدد'}
                                            </td>
                                            <td className="px-6 py-4 text-slate-500 dark:text-slate-400 text-sm">
                                                {createdAt ? new Date(createdAt).toLocaleDateString('ar-SA') : 'غير متوفر'}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-700">
                                                    مكتمل
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-left">
                                                <button 
                                                    onClick={() => handleOpenArchiveModal(project)}
                                                    className="px-4 py-2 bg-primary text-white rounded-lg text-xs font-bold hover:bg-primary/95 transition-all shadow-md shadow-primary/10"
                                                >
                                                    أرشفة المشروع
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                                {filteredProjects.length === 0 && (
                                    <tr>
                                        <td colSpan="6" className="px-6 py-20 text-center text-slate-400">
                                            <span className="material-symbols-outlined text-4xl mb-2">archive</span>
                                            <p>لا توجد مشاريع مكتملة مؤهلة للأرشفة حالياً.</p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* ── Archive Modal ─────────────────────────────────────────────── */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={handleCloseModal}></div>
                    <div className="relative bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in duration-200 text-right">
                        
                        {/* Header */}
                        <div className="bg-slate-900 p-6 text-white flex items-center justify-between">
                            <button onClick={handleCloseModal} className="hover:bg-white/20 p-2 rounded-full transition-colors">
                                <span className="material-symbols-outlined">close</span>
                            </button>
                            <div className="flex items-center gap-3">
                                <span className="material-symbols-outlined text-primary">inventory_2</span>
                                <h2 className="text-xl font-black">أرشفة المشروع الأكاديمي</h2>
                            </div>
                        </div>

                        {/* Form */}
                        <form onSubmit={handleArchiveSubmit}>
                            <div className="p-8 space-y-6 max-h-[70vh] overflow-y-auto">
                                {/* Project name */}
                                <div>
                                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
                                        {selectedProject?.title || selectedProject?.Title}
                                    </h3>
                                    <p className="text-sm text-slate-500">
                                        سيتم نقل هذا المشروع بشكل نهائي إلى الأرشيف الأكاديمي. يرجى إدخال درجة التقييم النهائية وصورة المشروع الاختيارية.
                                    </p>
                                </div>

                                {/* Evaluation Score */}
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-600 dark:text-slate-400 flex items-center gap-1">
                                        <span className="material-symbols-outlined text-sm text-primary">grade</span>
                                        درجة التقييم (0 - 100)
                                        <span className="text-rose-500">*</span>
                                    </label>
                                    <input 
                                        type="number"
                                        min="0"
                                        max="100"
                                        step="0.1"
                                        required
                                        value={evaluationScore}
                                        onChange={(e) => setEvaluationScore(e.target.value)}
                                        placeholder="مثال: 95.5"
                                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-3 px-4 text-sm focus:ring-2 focus:ring-primary/20 outline-none text-right"
                                    />
                                    {scoreError && <p className="text-rose-500 text-xs font-semibold">{scoreError}</p>}
                                </div>

                                {/* Project File Upload */}
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-600 dark:text-slate-400 flex items-center gap-1">
                                        <span className="material-symbols-outlined text-sm text-primary">description</span>
                                        ملف المشروع (Project File)
                                        <span className="text-rose-500">*</span>
                                    </label>
                                    
                                    {projectFile ? (
                                        <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl">
                                            <div className="flex items-center gap-3">
                                                <span className="material-symbols-outlined text-rose-500 font-bold">description</span>
                                                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 truncate max-w-[250px]">
                                                    {projectFile.name}
                                                </span>
                                                <span className="text-[10px] text-slate-400">
                                                    ({(projectFile.size / (1024 * 1024)).toFixed(2)} MB)
                                                </span>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => setProjectFile(null)}
                                                className="text-xs font-bold text-rose-500 hover:underline flex items-center gap-1"
                                            >
                                                إزالة
                                                <span className="material-symbols-outlined text-sm font-bold">close</span>
                                            </button>
                                        </div>
                                    ) : (
                                        <div
                                            onClick={() => documentInputRef.current?.click()}
                                            className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl p-6 text-center cursor-pointer hover:border-primary/60 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all"
                                        >
                                            <div className="flex flex-col items-center gap-2">
                                                <span className="material-symbols-outlined text-2xl text-slate-400">
                                                    cloud_upload
                                                </span>
                                                <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
                                                    اختر ملف المشروع أو اسحبه هنا
                                                </p>
                                                <p className="text-xs text-slate-400">
                                                    PDF, DOC, DOCX, PPT, PPTX, ZIP, RAR — بحد أقصى 3 ميجا
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                    <input
                                        ref={documentInputRef}
                                        type="file"
                                        accept=".pdf,.doc,.docx,.ppt,.pptx,.zip,.rar"
                                        className="hidden"
                                        onChange={(e) => processProjectFile(e.target.files[0])}
                                    />
                                </div>

                                {/* Project Image Upload */}
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-600 dark:text-slate-400 flex items-center gap-1">
                                        <span className="material-symbols-outlined text-sm text-primary">image</span>
                                        صورة المشروع (اختياري)
                                    </label>

                                    {imagePreview ? (
                                        /* Preview state */
                                        <div className="relative rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 group">
                                            <img
                                                src={imagePreview}
                                                alt="معاينة صورة المشروع"
                                                className="w-full h-48 object-cover"
                                            />
                                            <div className="absolute inset-0 bg-slate-900/0 group-hover:bg-slate-900/40 transition-all flex items-center justify-center">
                                                <button
                                                    type="button"
                                                    onClick={handleRemoveImage}
                                                    className="opacity-0 group-hover:opacity-100 transition-opacity px-4 py-2 bg-rose-500 text-white text-xs font-bold rounded-lg flex items-center gap-1 shadow-lg"
                                                >
                                                    <span className="material-symbols-outlined text-sm">delete</span>
                                                    إزالة الصورة
                                                </button>
                                            </div>
                                            <div className="absolute bottom-2 right-2 bg-slate-900/70 text-white text-[10px] font-bold px-2 py-1 rounded-md truncate max-w-[200px]">
                                                {projectImage?.name}
                                            </div>
                                        </div>
                                    ) : (
                                        /* Drop zone state */
                                        <div
                                            onClick={() => fileInputRef.current?.click()}
                                            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                                            onDragLeave={() => setIsDragging(false)}
                                            onDrop={handleDrop}
                                            className={`
                                                relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all
                                                ${isDragging
                                                    ? 'border-primary bg-primary/5 scale-[1.01]'
                                                    : 'border-slate-300 dark:border-slate-700 hover:border-primary/60 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                                                }
                                            `}
                                        >
                                            <div className="flex flex-col items-center gap-3">
                                                <div className={`size-14 rounded-2xl flex items-center justify-center transition-colors ${isDragging ? 'bg-primary/10' : 'bg-slate-100 dark:bg-slate-800'}`}>
                                                    <span className={`material-symbols-outlined text-3xl ${isDragging ? 'text-primary' : 'text-slate-400'}`}>
                                                        cloud_upload
                                                    </span>
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
                                                        {isDragging ? 'أفلت الصورة هنا' : 'اسحب الصورة أو انقر للاختيار'}
                                                    </p>
                                                    <p className="text-xs text-slate-400 mt-1">JPG، PNG، GIF، WEBP — الحد الأقصى لحجم الصورة: 1 ميجا</p>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                                        className="hidden"
                                        onChange={handleFileChange}
                                    />
                                </div>
                            </div>

                            {/* Footer */}
                            <div className="bg-slate-50 dark:bg-slate-800/50 p-6 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3">
                                <button 
                                    type="button"
                                    onClick={handleCloseModal}
                                    className="px-5 py-2.5 bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-xl font-bold hover:bg-slate-300 transition-all"
                                >
                                    إلغاء
                                </button>
                                <button 
                                    type="submit"
                                    disabled={archiveMutation.isPending}
                                    className="px-6 py-2.5 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 transition-all flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                                >
                                    {archiveMutation.isPending ? (
                                        <>
                                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                            جاري الأرشفة...
                                        </>
                                    ) : (
                                        <>
                                            <span className="material-symbols-outlined text-sm">inventory_2</span>
                                            تأكيد الأرشفة
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProjectArchiveManagement;
