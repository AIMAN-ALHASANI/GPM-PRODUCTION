import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useCreateStudent, useCreateSupervisor, useCreateHOD } from '../../hooks/useUsers';
import { useDepartments } from '../../hooks/useStructure';
import toast from 'react-hot-toast';

const FormInput = ({ label, type = "text", placeholder, icon, value, onChange, error }) => {
    return (
        <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">{label}</label>
            <div className="relative">
                {icon && <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">{icon}</span>}
                <input 
                    className={`w-full bg-slate-50 dark:bg-slate-800 border ${error ? 'border-red-500 focus:ring-red-500' : 'border-slate-200 dark:border-slate-700 focus:border-primary focus:ring-primary/20'} rounded-lg ${icon ? 'pl-10 pr-4' : 'px-4'} py-3 text-sm transition-all outline-none text-right`} 
                    placeholder={placeholder} 
                    type={type}
                    value={value}
                    onChange={onChange}
                />
            </div>
            {error && <p className="text-[10px] text-red-500 font-semibold">{error}</p>}
        </div>
    );
};

const AddNewUser = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const initialRole = queryParams.get('role') || 'Student';

    const createStudentMutation = useCreateStudent();
    const createSupervisorMutation = useCreateSupervisor();
    const createHODMutation = useCreateHOD();
    const { data: departmentsResponse } = useDepartments();
    
    const departments = departmentsResponse?.data || [];
    
    const [formData, setFormData] = useState({
        fullName: "",
        email: "",
        password: "",
        universityId: "",
        role: initialRole,
        departmentId: ""
    });

    const [errors, setErrors] = useState({});

    const roles = [
        { label: "طالب", value: "Student" },
        { label: "مشرف", value: "Supervisor" },
        { label: "رئيس قسم", value: "HeadOfDepartment" }
    ];

    const handleInputChange = (field) => (e) => {
        setFormData(prev => ({ ...prev, [field]: e.target.value }));
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: null }));
        }
    };

    const validateForm = () => {
        const newErrors = {};
        if (!formData.fullName.trim()) newErrors.fullName = "مطلوب";
        if (!formData.email.match(/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/)) newErrors.email = "بريد إلكتروني غير صالح";
        if (formData.password.length < 6) newErrors.password = "يجب أن تكون ٦ أحرف على الأقل";
        if (!formData.universityId.trim()) newErrors.universityId = "الرقم الجامعي مطلوب";
        if (!formData.departmentId) newErrors.departmentId = "يجب اختيار القسم";
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (validateForm()) {
            try {
                const payload = {
                    fullName: formData.fullName,
                    email: formData.email,
                    password: formData.password,
                    userName: formData.universityId,
                    departmentID: parseInt(formData.departmentId)
                };

                if (formData.role === 'Student') {
                    await createStudentMutation.mutateAsync(payload);
                    navigate('/admin/students');
                } else if (formData.role === 'Supervisor') {
                    await createSupervisorMutation.mutateAsync(payload);
                    navigate('/admin/supervisors');
                } else if (formData.role === 'HeadOfDepartment') {
                    await createHODMutation.mutateAsync(payload);
                    navigate('/admin/hods');
                }
            } catch (error) {
                console.error("Failed to create user:", error);
            }
        }
    };

    const isPending = createStudentMutation.isPending || createSupervisorMutation.isPending || createHODMutation.isPending;

    return (
        <div className="flex flex-col gap-6">
            <nav className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 mb-8">
                <Link className="hover:text-primary" to="/admin/dashboard">الرئيسية</Link>
                <span className="material-symbols-outlined text-sm">chevron_right</span>
                <span className="text-slate-900 dark:text-white font-medium">إضافة مستخدم جديد</span>
            </nav>

            <div className="max-w-5xl mx-auto w-full">
                <div className="mb-8">
                    <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">إضافة مستخدم جديد</h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">تسجيل عضو أكاديمي جديد في النظام. تأكد من تطابق المعلومات مع البيانات الرسمية.</p>
                </div>

                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-12 gap-8 pb-20">
                    <div className="md:col-span-8 space-y-6">
                        <section className="bg-white dark:bg-slate-900 rounded-2xl p-8 border border-slate-200 dark:border-slate-800 shadow-sm">
                            <div className="flex items-center gap-2 mb-8">
                                <div className="size-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                                    <span className="material-symbols-outlined">person</span>
                                </div>
                                <h2 className="text-lg font-black tracking-tight">المعلومات الشخصية</h2>
                            </div>
                            <div className="grid grid-cols-1 gap-6">
                                <FormInput 
                                    label="الاسم الكامل" 
                                    placeholder="مثال: أحمد محمد علي" 
                                    value={formData.fullName}
                                    onChange={handleInputChange('fullName')}
                                    error={errors.fullName}
                                />
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    <FormInput 
                                        label="البريد الإلكتروني" 
                                        type="email"
                                        placeholder="user@university.edu" 
                                        value={formData.email}
                                        onChange={handleInputChange('email')}
                                        error={errors.email}
                                    />
                                    <FormInput 
                                        label="الرقم الجامعي / اسم المستخدم" 
                                        placeholder="202300123" 
                                        value={formData.universityId}
                                        onChange={handleInputChange('universityId')}
                                        error={errors.universityId}
                                    />
                                </div>
                                <FormInput 
                                    label="كلمة المرور المؤقتة" 
                                    type="password"
                                    placeholder="••••••••" 
                                    value={formData.password}
                                    onChange={handleInputChange('password')}
                                    error={errors.password}
                                />
                            </div>
                        </section>
                    </div>

                    <div className="md:col-span-4 space-y-6">
                        <section className="bg-white dark:bg-slate-900 rounded-2xl p-8 border border-slate-200 dark:border-slate-800 shadow-sm">
                            <div className="flex items-center gap-2 mb-8">
                                <div className="size-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                                    <span className="material-symbols-outlined">school</span>
                                </div>
                                <h2 className="text-lg font-black tracking-tight">التعيين الأكاديمي</h2>
                            </div>
                            <div className="space-y-6">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">الدور</label>
                                    <select 
                                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                                        value={formData.role}
                                        onChange={handleInputChange('role')}
                                    >
                                        {roles.map(role => (
                                            <option key={role.value} value={role.value}>{role.label}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">القسم</label>
                                    <select 
                                        className={`w-full bg-slate-50 dark:bg-slate-800 border ${errors.departmentId ? 'border-red-500' : 'border-slate-200 dark:border-slate-700'} rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none`}
                                        value={formData.departmentId}
                                        onChange={handleInputChange('departmentId')}
                                    >
                                        <option value="">اختر القسم</option>
                                        {departments.map(dept => (
                                            <option key={dept.departmentID} value={dept.departmentID}>{dept.departmentName || dept.name}</option>
                                        ))}
                                    </select>
                                    {errors.departmentId && <p className="text-[10px] text-red-500 font-semibold">{errors.departmentId}</p>}
                                </div>
                            </div>
                        </section>

                        <div className="flex flex-col gap-4">
                            <button 
                                className={`w-full py-4 bg-primary text-white rounded-xl font-black text-lg shadow-xl shadow-primary/20 hover:bg-primary/90 transition-all flex items-center justify-center gap-2 ${isPending ? 'opacity-70 cursor-wait' : ''}`} 
                                type="submit"
                                disabled={isPending}
                            >
                                {isPending ? 'جاري المعالجة...' : 'تأكيد التسجيل'}
                                {!isPending && <span className="material-symbols-outlined">how_to_reg</span>}
                            </button>
                            <Link to="/admin/dashboard" className="w-full py-4 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-xl font-bold text-center hover:bg-slate-200 transition-all">إلغاء</Link>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddNewUser;
