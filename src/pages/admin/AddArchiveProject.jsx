import React, { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCreateArchive } from '../../hooks/useArchive';
import { useCollegeProjects } from '../../hooks/useProjects';
import toast from 'react-hot-toast';

const AddArchiveProject = () => {
    const navigate = useNavigate();
    const fileInputRef = useRef(null);
    const createArchiveMutation = useCreateArchive();
    const { data: projectsData } = useCollegeProjects();
    const projects = Array.isArray(projectsData) ? projectsData : (projectsData?.data || []);

    const [formData, setFormData] = useState({
        projectId: "",
        year: new Date().getFullYear().toString(),
        summary: "",
        confirmationChecked: false
    });

    const [uploadedFiles, setUploadedFiles] = useState([]);
    const [isDragging, setIsDragging] = useState(false);
    const [errors, setErrors] = useState({});

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const handleFileUpload = (e) => {
        const files = Array.from(e.target.files);
        if (files.length > 0) {
            setUploadedFiles(files);
            if (errors.uploadedFiles) setErrors(prev => ({ ...prev, uploadedFiles: '' }));
        }
    };

    const validateForm = () => {
        const newErrors = {};
        
        if (!formData.projectId) newErrors.projectId = "يرجى اختيار المشروع";
        if (!formData.year) newErrors.year = "السنة مطلوبة";
        if (!formData.summary || formData.summary.length < 10) newErrors.summary = "الملخص مطلوب ويجب أن يكون 10 أحرف على الأقل";
        if (!formData.confirmationChecked) newErrors.confirmationChecked = "يجب التأكيد على الأرشفة";

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        try {
            await createArchiveMutation.mutateAsync({
                projectID: parseInt(formData.projectId),
                year: formData.year,
                summary: formData.summary,
                filePath: uploadedFiles[0]?.name || "no-file-provided.pdf"
            });
            navigate('/admin/archived-projects');
        } catch (error) {
            console.error("Archive failed:", error);
        }
    };

    return (
        <div className="flex flex-col gap-6">
            <nav className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 mb-8">
                <Link className="hover:text-primary" to="/admin/dashboard">الرئيسية</Link>
                <span className="material-symbols-outlined text-sm">chevron_right</span>
                <Link className="hover:text-primary" to="/admin/archived-projects">الأرشيف الأكاديمي</Link>
                <span className="material-symbols-outlined text-sm">chevron_right</span>
                <span className="text-slate-900 dark:text-white font-medium">أرشفة مشروع جديد</span>
            </nav>

            <div className="max-w-6xl mx-auto w-full">
                <div className="mb-10 text-right">
                    <span className="text-primary text-sm font-black uppercase tracking-[0.2em]">المستودع المؤسسي</span>
                    <h1 className="text-4xl font-black text-slate-900 dark:text-white mt-2 mb-4 tracking-tight">أرشفة مشروع جديد</h1>
                    <p className="text-slate-500 dark:text-slate-400 text-lg max-w-2xl leading-relaxed">إكمال الأبحاث بشكل رسمي ونقلها إلى الخزنة الرقمية الدائمة.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-8">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2 space-y-8">
                            <section className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="size-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                                        <span className="material-symbols-outlined">description</span>
                                    </div>
                                    <h2 className="text-xl font-black tracking-tight">هوية المشروع</h2>
                                </div>
                                <div className="space-y-6">
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">اختر المشروع المكتمل</label>
                                        <select 
                                            name="projectId"
                                            value={formData.projectId}
                                            onChange={handleInputChange}
                                            className={`w-full bg-slate-50 dark:bg-slate-800 border ${errors.projectId ? 'border-red-500' : 'border-slate-200 dark:border-slate-700'} rounded-lg py-3.5 px-4 text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary`}
                                        >
                                            <option value="">اختر المشروع...</option>
                                            {projects.map((proj) => (
                                                <option key={proj.projectID} value={proj.projectID}>{proj.title}</option>
                                            ))}
                                        </select>
                                        {errors.projectId && <p className="text-red-500 text-[10px] font-bold mt-1">{errors.projectId}</p>}
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-right">
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">السنة الأكاديمية</label>
                                            <input 
                                                name="year"
                                                value={formData.year}
                                                onChange={handleInputChange}
                                                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg py-3.5 px-4 text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-right" 
                                                placeholder="مثال: 2024" 
                                                type="text"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </section>

                            <section className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="size-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                                        <span className="material-symbols-outlined">cloud_upload</span>
                                    </div>
                                    <h2 className="text-xl font-black tracking-tight">الأصول الأرشيفية</h2>
                                </div>
                                <div 
                                    className={`border-2 border-dashed ${isDragging ? 'border-primary bg-primary/5' : 'border-slate-200 dark:border-slate-700'} rounded-2xl p-10 flex flex-col items-center justify-center bg-slate-50/50 dark:bg-slate-800/30 cursor-pointer transition-all hover:bg-slate-100 dark:hover:bg-slate-800/50`}
                                    onClick={() => fileInputRef.current.click()}
                                >
                                    <input type="file" className="hidden" ref={fileInputRef} onChange={handleFileUpload} />
                                    <div className="size-16 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center mb-4">
                                        <span className="material-symbols-outlined text-slate-400 text-3xl">upload_file</span>
                                    </div>
                                    <p className="text-slate-700 dark:text-slate-300 font-bold">ارفع الأطروحة النهائية (PDF)</p>
                                    <p className="text-slate-400 text-xs mt-1">اسحب الملف هنا أو انقر للتصفح</p>
                                    {uploadedFiles.length > 0 && (
                                        <div className="mt-6 flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-lg border border-primary/20">
                                            <span className="material-symbols-outlined text-sm">check_circle</span>
                                            <span className="text-sm font-bold">{uploadedFiles[0].name}</span>
                                        </div>
                                    )}
                                </div>
                            </section>
                        </div>

                        <div className="space-y-8">
                            <section className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="size-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                                        <span className="material-symbols-outlined">label</span>
                                    </div>
                                    <h2 className="text-xl font-black tracking-tight">البيانات الوصفية</h2>
                                </div>
                                <div className="space-y-4">
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">ملخص المشروع</label>
                                        <textarea 
                                            name="summary"
                                            value={formData.summary}
                                            onChange={handleInputChange}
                                            className={`w-full bg-slate-50 dark:bg-slate-800 border ${errors.summary ? 'border-red-500' : 'border-slate-200 dark:border-slate-700'} rounded-lg py-3.5 px-4 text-sm outline-none resize-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-right`} 
                                            placeholder="ملخص مختصر للبحث والنتائج الأساسية..." 
                                            rows="6"
                                        ></textarea>
                                        {errors.summary && <p className="text-red-500 text-[10px] font-bold mt-1">{errors.summary}</p>}
                                    </div>
                                </div>
                            </section>

                            <section className="bg-slate-900 dark:bg-primary/10 p-8 rounded-2xl border border-slate-800 dark:border-primary/20 shadow-xl space-y-6">
                                <label className="flex items-start gap-4 cursor-pointer group">
                                    <div className="relative flex items-center pt-1">
                                        <input 
                                            name="confirmationChecked"
                                            checked={formData.confirmationChecked}
                                            onChange={handleInputChange}
                                            className="rounded text-primary focus:ring-primary border-slate-700 h-6 w-6 cursor-pointer bg-slate-800" 
                                            type="checkbox"
                                        />
                                    </div>
                                    <p className="text-sm font-bold leading-relaxed text-slate-300 dark:text-indigo-200 group-hover:text-white transition-colors">أقر بأن هذا المشروع قد استوفى كافة المتطلبات الأكاديمية وهو جاهز للنشر في الأرشيف الرسمي.</p>
                                </label>
                                {errors.confirmationChecked && <p className="text-red-400 text-[10px] font-black">{errors.confirmationChecked}</p>}
                                
                                <div className="pt-4 space-y-4">
                                    <button 
                                        disabled={createArchiveMutation.isPending} 
                                        className="w-full bg-primary text-white py-4 rounded-xl font-black text-lg shadow-xl shadow-primary/30 hover:bg-primary/90 transition-all flex items-center justify-center gap-2 disabled:opacity-70" 
                                        type="submit"
                                    >
                                        {createArchiveMutation.isPending ? <span className="material-symbols-outlined animate-spin">sync</span> : <span className="material-symbols-outlined">archive</span>}
                                        تأكيد الأرشفة النهائية
                                    </button>
                                    <Link to="/admin/archived-projects" className="w-full text-slate-400 py-3 rounded-xl font-bold text-sm text-center block hover:text-white transition-colors">إلغاء العملية</Link>
                                </div>
                            </section>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddArchiveProject;
