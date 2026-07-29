import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCreateUser } from '../../hooks/useUsers';
import { useDepartments } from '../../hooks/useStructure';
import toast from 'react-hot-toast';

const FormInput = ({ label, icon, error, ...props }) => (
    <div className="flex flex-col gap-1.5">
        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider pl-1">{label}</label>
        <div className="relative">
            {icon && <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">{icon}</span>}
            <input 
                className={`w-full bg-slate-50 dark:bg-slate-800 border ${error ? 'border-red-500' : 'border-slate-200 dark:border-slate-700'} rounded-lg ${icon ? 'pl-10 pr-4' : 'px-4'} py-3 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all`} 
                {...props} 
            />
        </div>
        {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
);

const FormSelect = ({ label, options, value, onChange, className = "" }) => (
    <div className={`flex flex-col gap-1.5 ${className}`}>
        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider pl-1">{label}</label>
        <select 
            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            value={value}
            onChange={onChange}
        >
            <option value="">اختر القسم</option>
            {options.map(opt => <option key={opt.departmentID || opt} value={opt.departmentID || opt}>{opt.name || opt}</option>)}
        </select>
    </div>
);

const PasswordInput = ({ label, value, onChange, showPassword, togglePasswordVisibility, error, description }) => (
    <div className="flex flex-col gap-1.5">
        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider pl-1">{label}</label>
        <div className="relative">
            <input 
                className={`w-full bg-slate-50 dark:bg-slate-800 border ${error ? 'border-red-500' : 'border-slate-200 dark:border-slate-700'} rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all`} 
                type={showPassword ? "text" : "password"} 
                value={value}
                onChange={onChange}
            />
            <button 
                type="button" 
                onClick={togglePasswordVisibility} 
                className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 transition-colors"
            >
                <span className="material-symbols-outlined text-lg">{showPassword ? 'visibility_off' : 'visibility'}</span>
            </button>
        </div>
        {description && <p className="text-[10px] text-slate-500 mt-1 leading-relaxed">{description}</p>}
        {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
);

const PermissionsList = ({ permissions }) => (
    <div className="mt-4 pt-6 border-t border-slate-100 dark:border-slate-700">
        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4 block">معاينة الصلاحيات</label>
        <ul className="space-y-3">
            {permissions.map((perm, index) => (
                <li key={index} className="flex items-start gap-3 text-xs text-slate-600 dark:text-slate-400">
                    <span className="material-symbols-outlined text-primary text-sm mt-0.5" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                    {perm}
                </li>
            ))}
        </ul>
    </div>
);

const AddNewSupervisor = () => {
    const navigate = useNavigate();
    const createUserMutation = useCreateUser();
    const { data: departmentsResponse } = useDepartments();
    const departments = departmentsResponse?.data || [];

    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        departmentId: "",
        academicDegree: "أستاذ",
        employmentNumber: ""
    });

    const [temporaryPassword, setTemporaryPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [errors, setErrors] = useState({});

    const academicDegrees = ["أستاذ", "أستاذ مشارك", "أستاذ مساعد", "محاضر"];
    const supervisorPermissions = [
        "الموافقة على مقترحات المشاريع",
        "إدارة مجموعة الطلاب المسندين",
        "الوصول إلى بيانات الأبحاث المؤرشفة"
    ];

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }));
    };

    const handleGeneratePassword = () => {
        const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
        let password = "";
        for (let i = 0; i < 12; i++) {
            password += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        setTemporaryPassword(password);
        if (errors.temporaryPassword) setErrors(prev => ({ ...prev, temporaryPassword: null }));
    };

    const handlePasswordChange = (e) => {
        setTemporaryPassword(e.target.value);
        if (errors.temporaryPassword) setErrors(prev => ({ ...prev, temporaryPassword: null }));
    };

    const validateForm = () => {
        const newErrors = {};
        if (!formData.firstName) newErrors.firstName = "الاسم الأول مطلوب";
        if (!formData.lastName) newErrors.lastName = "الاسم الأخير مطلوب";
        if (!formData.email || !/^\S+@\S+\.\S+$/.test(formData.email)) newErrors.email = "يرجى إدخال بريد إلكتروني صحيح";
        if (!temporaryPassword || temporaryPassword.length < 6) newErrors.temporaryPassword = "كلمة المرور يجب أن تكون 6 أحرف على الأقل";
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        try {
            await createUserMutation.mutateAsync({
                fullName: `${formData.firstName} ${formData.lastName}`,
                email: formData.email,
                password: temporaryPassword,
                role: 3 // Supervisor
            });
            navigate('/admin/supervisors');
        } catch (error) {
            console.error("Failed to create supervisor:", error);
            toast.error(error.response?.data?.message || 'حدث خطأ أثناء إضافة المشرف');
        }
    };

    return (
        <div className="flex flex-col gap-6">
            {/* Breadcrumbs */}
            <nav className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 mb-8">
                <Link className="hover:text-primary" to="/admin/dashboard">الرئيسية</Link>
                <span className="material-symbols-outlined text-sm">chevron_right</span>
                <Link className="hover:text-primary" to="/admin/supervisors">المشرفون</Link>
                <span className="material-symbols-outlined text-sm">chevron_right</span>
                <span className="text-slate-900 dark:text-white font-medium">إضافة مشرف جديد</span>
            </nav>

            <form onSubmit={handleSubmit} className="max-w-5xl mx-auto w-full">
                {/* Header */}
                <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">إضافة مشرف جديد</h1>
                        <p className="text-slate-500 dark:text-slate-400 mt-1">تسجيل عضو هيئة تدريس جديد للإشراف على المشاريع البحثية.</p>
                    </div>
                    <div className="flex gap-3">
                        <Link to="/admin/supervisors" className="px-6 py-2.5 rounded-lg text-primary bg-slate-100 dark:bg-slate-800 font-semibold text-sm hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors text-center">إلغاء</Link>
                        <button disabled={createUserMutation.isPending} className={`px-8 py-2.5 rounded-lg text-white bg-primary font-bold text-sm shadow-md transition-all hover:bg-primary/90 flex items-center gap-2 ${createUserMutation.isPending ? 'opacity-70 cursor-wait' : ''}`} type="submit">
                            {createUserMutation.isPending ? <><span className="material-symbols-outlined animate-spin text-sm">sync</span> جاري الإضافة...</> : 'إضافة المشرف'}
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                    {/* Left Column */}
                    <div className="md:col-span-8 flex flex-col gap-8">
                        {/* Personal Information Section */}
                        <section className="bg-white dark:bg-slate-900 rounded-xl p-8 border border-slate-200 dark:border-slate-800 shadow-sm">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                    <span className="material-symbols-outlined">person</span>
                                </div>
                                <h2 className="text-xl font-bold">المعلومات الشخصية</h2>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <FormInput 
                                    label="الاسم الأول" 
                                    name="firstName"
                                    placeholder="مثال: أحمد" 
                                    value={formData.firstName}
                                    onChange={handleInputChange}
                                    error={errors.firstName}
                                />
                                <FormInput 
                                    label="الاسم الأخير" 
                                    name="lastName"
                                    placeholder="مثال: محمد" 
                                    value={formData.lastName}
                                    onChange={handleInputChange}
                                    error={errors.lastName}
                                />
                                <FormInput 
                                    label="البريد الإلكتروني" 
                                    name="email"
                                    type="email"
                                    icon="alternate_email"
                                    placeholder="ahmed.mohammed@university.edu" 
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    error={errors.email}
                                />
                                <FormInput 
                                    label="رقم الهاتف" 
                                    name="phone"
                                    type="tel"
                                    icon="call"
                                    placeholder="+966 5X XXX XXXX" 
                                    value={formData.phone}
                                    onChange={handleInputChange}
                                    error={errors.phone}
                                />
                            </div>
                        </section>

                        {/* Academic Qualifications Section */}
                        <section className="bg-white dark:bg-slate-900 rounded-xl p-8 border border-slate-200 dark:border-slate-800 shadow-sm">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                    <span className="material-symbols-outlined">history_edu</span>
                                </div>
                                <h2 className="text-xl font-bold">المؤهلات الأكاديمية</h2>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <FormSelect 
                                    label="القسم" 
                                    className="md:col-span-2"
                                    options={departments} 
                                    value={formData.departmentId}
                                    onChange={(e) => setFormData({...formData, departmentId: e.target.value})}
                                />
                                <FormSelect 
                                    label="الدرجة العلمية" 
                                    options={academicDegrees} 
                                    value={formData.academicDegree}
                                    onChange={(e) => setFormData({...formData, academicDegree: e.target.value})}
                                />
                                <FormInput 
                                    label="الرقم الوظيفي" 
                                    name="employmentNumber"
                                    placeholder="OX-99201" 
                                    value={formData.employmentNumber}
                                    onChange={handleInputChange}
                                    error={errors.employmentNumber}
                                />
                            </div>
                        </section>
                    </div>

                    {/* Right Column */}
                    <div className="md:col-span-4 flex flex-col gap-8">
                        {/* Security Section */}
                        <section className="bg-white dark:bg-slate-900 rounded-xl p-8 border border-slate-200 dark:border-slate-800 shadow-sm border-t-4 border-primary">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                                    <span className="material-symbols-outlined text-slate-600">lock</span>
                                </div>
                                <h2 className="text-xl font-bold">الأمان</h2>
                            </div>
                            <div className="flex flex-col gap-6">
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider pl-1">دور الحساب</label>
                                    <div className="bg-slate-50 dark:bg-slate-800 border border-primary/20 rounded-lg px-4 py-3 flex items-center justify-between">
                                        <span className="text-primary font-bold">مشرف</span>
                                        <span className="material-symbols-outlined text-sm text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>verified_user</span>
                                    </div>
                                </div>
                                <div className="relative">
                                    <PasswordInput 
                                        label="كلمة المرور المؤقتة" 
                                        value={temporaryPassword}
                                        onChange={handlePasswordChange}
                                        showPassword={showPassword}
                                        togglePasswordVisibility={() => setShowPassword(!showPassword)}
                                        description="سيُطلب من المستخدم تغيير هذه الكلمة عند أول تسجيل دخول."
                                        error={errors.temporaryPassword}
                                    />
                                    <button 
                                        type="button" 
                                        onClick={handleGeneratePassword} 
                                        className="text-xs text-primary font-semibold hover:underline mt-2 inline-block"
                                    >
                                        توليد كلمة مرور
                                    </button>
                                </div>
                                <PermissionsList permissions={supervisorPermissions} />
                            </div>
                        </section>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default AddNewSupervisor;
