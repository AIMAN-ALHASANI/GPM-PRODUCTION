import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCreateDepartment, useColleges } from '../../hooks/useStructure';
import { useUsers } from '../../hooks/useUsers';
import toast from 'react-hot-toast';

const AddNewDepartment = () => {
    const navigate = useNavigate();
    const createDepartmentMutation = useCreateDepartment();
    const { data: collegesResponse } = useColleges();
    const colleges = collegesResponse?.data || [];

    const [formData, setFormData] = useState({
        departmentName: "",
        collegeId: "",
        description: "",
        researchAreas: [],
        newResearchArea: "",
        selectedHead: null,
        headSearchTerm: "",
        showHeadSearchResults: false,
        operationalStatus: "active",
        academicYear: "٢٠٢٤ / ٢٠٢٥"
    });

    // Fetch Supervisors for HOD selection
    const { data: supervisorsResponse } = useUsers({ role: 3 });
    const supervisors = supervisorsResponse?.data?.items || [];

    const [errors, setErrors] = useState({});

    const validateForm = () => {
        const newErrors = {};
        if (!formData.departmentName || formData.departmentName.length < 3) {
            newErrors.departmentName = "اسم القسم مطلوب ويجب أن يكون 3 أحرف على الأقل";
        }
        if (!formData.collegeId) {
            newErrors.collegeId = "يرجى اختيار الكلية";
        }
        if (!formData.selectedHead) {
            newErrors.selectedHead = "يرجى اختيار رئيس القسم";
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const handleAddResearchArea = () => {
        const area = formData.newResearchArea.trim();
        if (area && !formData.researchAreas.includes(area)) {
            setFormData(prev => ({
                ...prev,
                researchAreas: [...prev.researchAreas, area],
                newResearchArea: ""
            }));
        }
    };

    const handleRemoveResearchArea = (areaToRemove) => {
        setFormData(prev => ({
            ...prev,
            researchAreas: prev.researchAreas.filter(area => area !== areaToRemove)
        }));
    };

    const handleHeadSearch = (e) => {
        const value = e.target.value;
        setFormData(prev => ({
            ...prev,
            headSearchTerm: value,
            showHeadSearchResults: value.length > 0
        }));
    };

    const handleSelectHead = (head) => {
        setFormData(prev => ({
            ...prev,
            selectedHead: head,
            headSearchTerm: "",
            showHeadSearchResults: false
        }));
        if (errors.selectedHead) {
            setErrors(prev => ({ ...prev, selectedHead: '' }));
        }
    };

    const handleClearHeadSelection = () => {
        setFormData(prev => ({
            ...prev,
            selectedHead: null
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        try {
            await createDepartmentMutation.mutateAsync({
                departmentName: formData.departmentName,
                collegeID: parseInt(formData.collegeId)
            });
            navigate('/admin/projects/departments');
        } catch (error) {
            console.error("Failed to create department:", error);
        }
    };

    const filteredSupervisors = supervisors.filter(s => 
        s.fullName.toLowerCase().includes(formData.headSearchTerm.toLowerCase())
    );

    return (
        <div className="flex flex-col gap-6">
            {/* Breadcrumbs */}
            <nav className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 mb-8">
                <Link className="hover:text-primary" to="/admin/dashboard">الرئيسية</Link>
                <span className="material-symbols-outlined text-sm">chevron_right</span>
                <Link className="hover:text-primary" to="/admin/projects/departments">اللجان</Link>
                <span className="material-symbols-outlined text-sm">chevron_right</span>
                <span className="text-slate-900 dark:text-white font-medium">إضافة قسم جديد</span>
            </nav>

            <div className="max-w-6xl mx-auto w-full">
                {/* Header */}
                <div className="mb-10">
                    <div className="flex items-center gap-2 mb-2">
                        <Link className="text-[10px] uppercase tracking-[0.2em] font-bold text-primary hover:text-primary/80 transition-colors" to="/admin/projects/departments">إدارة الأقسام</Link>
                        <span className="material-symbols-outlined text-xs text-slate-400">chevron_right</span>
                        <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-slate-400">إضافة جديد</span>
                    </div>
                    <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">تسجيل قسم جديد</h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-2 max-w-2xl leading-relaxed">قم بتوسيع النظام الأكاديمي عن طريق إنشاء وحدة تنظيمية جديدة. حدد القيادة والتخصصات البحثية والحالة التشغيلية الأولية.</p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="grid grid-cols-12 gap-8">
                    {/* Left Column: Main Details */}
                    <div className="col-span-12 lg:col-span-8 flex flex-col gap-8">
                        
                        {/* Section 1: Department Basics */}
                        <section className="bg-white dark:bg-slate-900 rounded-xl p-8 border border-slate-200 dark:border-slate-800 shadow-sm">
                            <div className="flex items-center gap-3 mb-8">
                                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                                    <span className="material-symbols-outlined text-lg">info</span>
                                </div>
                                <h3 className="text-lg font-bold">أساسيات القسم</h3>
                            </div>
                            <div className="space-y-6">
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="col-span-2 md:col-span-1">
                                        <label className="block text-[10px] uppercase tracking-widest font-bold text-slate-500 mb-2">اسم القسم</label>
                                        <input 
                                            name="departmentName"
                                            value={formData.departmentName}
                                            onChange={handleInputChange}
                                            className={`w-full px-4 py-3 rounded-lg bg-slate-50 dark:bg-slate-800 border ${errors.departmentName ? 'border-red-500' : 'border-slate-200 dark:border-slate-700'} focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm outline-none`} 
                                            placeholder="مثال: قسم الحوسبة الكمية" 
                                            type="text"
                                        />
                                        {errors.departmentName && <p className="text-red-500 text-xs mt-1">{errors.departmentName}</p>}
                                    </div>
                                    <div className="col-span-2 md:col-span-1">
                                        <label className="block text-[10px] uppercase tracking-widest font-bold text-slate-500 mb-2">الكلية / المدرسة</label>
                                        <select 
                                            name="collegeId"
                                            value={formData.collegeId}
                                            onChange={handleInputChange}
                                            className={`w-full px-4 py-3 rounded-lg bg-slate-50 dark:bg-slate-800 border ${errors.collegeId ? 'border-red-500' : 'border-slate-200 dark:border-slate-700'} focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm outline-none`}
                                        >
                                            <option value="">اختر الكلية...</option>
                                            {colleges.map(c => <option key={c.collegeID} value={c.collegeID}>{c.collegeName}</option>)}
                                        </select>
                                        {errors.collegeId && <p className="text-red-500 text-xs mt-1">{errors.collegeId}</p>}
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-[10px] uppercase tracking-widest font-bold text-slate-500 mb-2">وصف مختصر</label>
                                    <textarea 
                                        name="description"
                                        value={formData.description}
                                        onChange={handleInputChange}
                                        className={`w-full px-4 py-3 rounded-lg bg-slate-50 dark:bg-slate-800 border ${errors.description ? 'border-red-500' : 'border-slate-200 dark:border-slate-700'} focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm resize-none outline-none`} 
                                        placeholder="قدم بيان المهمة أو نظرة عامة مختصرة عن القسم..." 
                                        rows="4"
                                    ></textarea>
                                    {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description}</p>}
                                </div>
                            </div>
                        </section>

                        {/* Section 2: Research & Labs */}
                        <section className="bg-white dark:bg-slate-900 rounded-xl p-8 border border-slate-200 dark:border-slate-800 shadow-sm">
                            <div className="flex items-center gap-3 mb-8">
                                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                                    <span className="material-symbols-outlined text-lg">biotech</span>
                                </div>
                                <h3 className="text-lg font-bold">البحث والمعامل</h3>
                            </div>
                            <div className="space-y-6">
                                <div>
                                    <label className="block text-[10px] uppercase tracking-widest font-bold text-slate-500 mb-2">مجالات البحث المتخصصة</label>
                                    <div className="flex flex-wrap gap-2 mb-3">
                                        {formData.researchAreas.map((area, idx) => (
                                            <span key={idx} className="inline-flex items-center gap-1.5 px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-semibold">
                                                {area}
                                                <button onClick={() => handleRemoveResearchArea(area)} className="material-symbols-outlined text-xs" type="button">close</button>
                                            </span>
                                        ))}
                                    </div>
                                    <div className="flex gap-2">
                                        <input 
                                            name="newResearchArea"
                                            value={formData.newResearchArea}
                                            onChange={handleInputChange}
                                            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddResearchArea())}
                                            className="flex-1 px-4 py-3 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm outline-none" 
                                            placeholder="إضافة مجال بحثي أو اسم معمل" 
                                            type="text"
                                        />
                                        <button onClick={handleAddResearchArea} className="px-6 py-3 bg-primary text-white rounded-lg text-sm font-bold hover:bg-primary/90 transition-opacity" type="button">إضافة</button>
                                    </div>
                                </div>
                                <div className="p-4 rounded-xl bg-primary/5 border border-dashed border-primary/20">
                                    <p className="text-xs text-slate-600 dark:text-slate-400 flex items-center gap-2 italic">
                                        <span className="material-symbols-outlined text-sm">info</span>
                                        سيتم إتاحة المعامل المدرجة هنا تلقائياً لجدولة الموارد.
                                    </p>
                                </div>
                            </div>
                        </section>
                    </div>

                    {/* Right Column: Leadership & Settings */}
                    <div className="col-span-12 lg:col-span-4 flex flex-col gap-8">
                        
                        {/* Section 3: Leadership Assignment */}
                        <section className="bg-white dark:bg-slate-900 rounded-xl p-8 border border-slate-200 dark:border-slate-800 shadow-sm">
                            <div className="flex items-center gap-3 mb-8">
                                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                                    <span className="material-symbols-outlined text-lg">badge</span>
                                </div>
                                <h3 className="text-lg font-bold">القيادة</h3>
                            </div>
                            <div>
                                <label className="block text-[10px] uppercase tracking-widest font-bold text-slate-500 mb-2">رئيس القسم</label>
                                
                                {!formData.selectedHead ? (
                                    <>
                                        <div className="relative">
                                            <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <span className="material-symbols-outlined text-slate-400 text-lg">search</span>
                                            </span>
                                            <input 
                                                value={formData.headSearchTerm}
                                                onChange={handleHeadSearch}
                                                className={`w-full pl-10 pr-4 py-3 rounded-lg bg-slate-50 dark:bg-slate-800 border ${errors.selectedHead ? 'border-red-500' : 'border-slate-200 dark:border-slate-700'} focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm outline-none`} 
                                                placeholder="ابحث عن عضو هيئة تدريس..." 
                                                type="text"
                                            />
                                        </div>
                                        {errors.selectedHead && <p className="text-red-500 text-xs mt-1">{errors.selectedHead}</p>}
                                        
                                        {/* Suggested Search Results */}
                                        {formData.showHeadSearchResults && (
                                            <div className="mt-2 max-h-48 overflow-y-auto border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 shadow-lg z-10">
                                                {filteredSupervisors.map(head => (
                                                    <div key={head.userID} onClick={() => handleSelectHead(head)} className="p-3 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                                                            <span className="material-symbols-outlined text-sm">person</span>
                                                        </div>
                                                        <div className="flex-1">
                                                            <p className="text-xs font-bold text-slate-900 dark:text-white">{head.fullName}</p>
                                                            <p className="text-[10px] text-slate-500">{head.email}</p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </>
                                ) : (
                                    /* Selected Head Display */
                                    <div className="p-3 rounded-lg bg-primary/5 border border-primary/10 flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center text-primary">
                                            <span className="material-symbols-outlined">person</span>
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-xs font-bold text-primary">{formData.selectedHead.fullName}</p>
                                            <p className="text-[10px] text-primary/70">{formData.selectedHead.email}</p>
                                        </div>
                                        <button onClick={handleClearHeadSelection} className="text-slate-400 hover:text-red-500 transition-colors" title="إزالة" type="button">
                                            <span className="material-symbols-outlined text-sm">close</span>
                                        </button>
                                    </div>
                                )}
                            </div>
                        </section>

                        {/* Section 4: Settings */}
                        <section className="bg-white dark:bg-slate-900 rounded-xl p-8 border border-slate-200 dark:border-slate-800 shadow-sm">
                            <div className="flex items-center gap-3 mb-8">
                                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                                    <span className="material-symbols-outlined text-lg">settings</span>
                                </div>
                                <h3 className="text-lg font-bold">الإعدادات</h3>
                            </div>
                            <div className="space-y-6">
                                <div>
                                    <label className="block text-[10px] uppercase tracking-widest font-bold text-slate-500 mb-2">الحالة التشغيلية</label>
                                    <div className="flex gap-2">
                                        <label className="flex-1 relative cursor-pointer">
                                            <input 
                                                checked={formData.operationalStatus === 'active'} 
                                                onChange={() => setFormData(prev => ({...prev, operationalStatus: 'active'}))}
                                                className="sr-only peer" 
                                                name="status" 
                                                type="radio"
                                            />
                                            <div className="w-full text-center py-3 px-4 rounded-lg bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-600 dark:text-slate-400 peer-checked:bg-primary peer-checked:text-white transition-all">نشط</div>
                                        </label>
                                        <label className="flex-1 relative cursor-pointer">
                                            <input 
                                                checked={formData.operationalStatus === 'inactive'} 
                                                onChange={() => setFormData(prev => ({...prev, operationalStatus: 'inactive'}))}
                                                className="sr-only peer" 
                                                name="status" 
                                                type="radio"
                                            />
                                            <div className="w-full text-center py-3 px-4 rounded-lg bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-600 dark:text-slate-400 peer-checked:bg-primary peer-checked:text-white transition-all">غير نشط</div>
                                        </label>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-[10px] uppercase tracking-widest font-bold text-slate-500 mb-2">السنة الأكاديمية</label>
                                    <select 
                                        name="academicYear"
                                        value={formData.academicYear}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm outline-none"
                                    >
                                        <option>٢٠٢٤ / ٢٠٢٥</option>
                                        <option>٢٠٢٥ / ٢٠٢٦</option>
                                    </select>
                                </div>
                            </div>
                        </section>

                         {/* Action Buttons */}
                         <div className="flex flex-col gap-3">
                             <button disabled={createDepartmentMutation.isPending} className="w-full py-4 bg-primary text-white rounded-xl font-bold text-base shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all disabled:opacity-70 flex justify-center items-center gap-2" type="submit">
                                 {createDepartmentMutation.isPending ? <span className="material-symbols-outlined animate-spin">sync</span> : null}
                                 إنشاء القسم
                             </button>
                            <Link to="/admin/projects/departments" className="w-full py-4 bg-slate-100 dark:bg-slate-800 text-primary rounded-xl font-bold text-sm hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors text-center block">
                                إلغاء
                            </Link>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddNewDepartment;
