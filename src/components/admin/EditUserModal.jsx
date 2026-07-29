import React, { useState, useEffect } from 'react';
import { useUser, useUpdateUser } from '../../hooks/useUsers';
import toast from 'react-hot-toast';

const EditUserModal = ({ isOpen, onClose, userId, role, onSuccess }) => {
    const { data: user, isLoading: isUserLoading, isError } = useUser(userId);
    const updateUserMutation = useUpdateUser();

    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        password: '',
        studentNumber: '',
        academicYear: '',
        office: ''
    });

    const [errors, setErrors] = useState({});

    // Sync state with loaded user data
    useEffect(() => {
        if (isOpen && user) {
            setFormData({
                fullName: user.fullName || '',
                email: user.email || '',
                password: '',
                studentNumber: user.studentNumber || '',
                academicYear: user.academicYear || '',
                office: user.office || ''
            });
            setErrors({});
        }
    }, [isOpen, user, userId]);

    if (!isOpen) return null;

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: null }));
        }
    };

    const validate = () => {
        const newErrors = {};
        if (!formData.fullName.trim()) newErrors.fullName = 'الاسم الكامل مطلوب';
        if (!formData.email.trim()) {
            newErrors.email = 'البريد الإلكتروني مطلوب';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'البريد الإلكتروني غير صالح';
        }
        if (formData.password && formData.password.length < 6) {
            newErrors.password = 'كلمة المرور يجب أن تكون 6 أحرف على الأقل';
        }

        const activeRole = user?.role || role;
        if (activeRole === 'Student') {
            if (!formData.studentNumber.trim()) newErrors.studentNumber = 'الرقم الجامعي مطلوب';
            if (!formData.academicYear.trim()) newErrors.academicYear = 'السنة الدراسية مطلوبة';
        }
        if (activeRole === 'Supervisor') {
            if (!formData.office.trim()) newErrors.office = 'المكتب مطلوب';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;

        try {
            const activeRole = user?.role || role;
            const updateData = {
                fullName: formData.fullName,
                email: formData.email,
                password: formData.password || null
            };

            if (activeRole === 'Student') {
                updateData.studentNumber = formData.studentNumber;
                updateData.academicYear = formData.academicYear;
            } else if (activeRole === 'Supervisor' || activeRole === 'HeadOfDepartment') {
                updateData.office = formData.office;
            }

            await updateUserMutation.mutateAsync({
                id: userId,
                data: updateData
            });

            onSuccess?.();
            onClose();
        } catch (error) {
            console.error('Error updating user:', error);
        }
    };

    const activeRole = user?.role || role;
    const roleTitle = activeRole === 'Student' ? 'طالب' : activeRole === 'Supervisor' ? 'مشرف' : activeRole === 'HeadOfDepartment' ? 'رئيس قسم' : 'مستخدم';

    const getRoleArabicName = (roleStr) => {
        switch (roleStr) {
            case 'Student': return 'طالب';
            case 'Supervisor': return 'مشرف';
            case 'HeadOfDepartment': return 'رئيس قسم';
            case 'Admin': return 'أدمن';
            case 'SuperAdmin': return 'سوبر أدمن';
            default: return roleStr || 'غير محدد';
        }
    };

    const isSubmitting = updateUserMutation.isPending;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-in fade-in zoom-in duration-200">
                
                {/* Header */}
                <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <h3 className="text-xl font-black text-slate-900 dark:text-white">تعديل ملف ال{roleTitle}</h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-rose-500 transition-colors">
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                {isUserLoading ? (
                    <div className="p-12 flex flex-col items-center justify-center gap-3">
                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
                        <p className="text-sm text-slate-500 dark:text-slate-400">جاري تحميل بيانات المستخدم...</p>
                    </div>
                ) : isError ? (
                    <div className="p-12 flex flex-col items-center justify-center gap-2 text-rose-500">
                        <span className="material-symbols-outlined text-4xl">error</span>
                        <p className="text-sm font-bold">حدث خطأ أثناء تحميل بيانات المستخدم</p>
                        <button onClick={onClose} className="mt-4 px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-bold hover:bg-slate-200 dark:hover:bg-slate-700">إغلاق</button>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
                        <div className="grid grid-cols-1 gap-4">
                            
                            {/* Read-Only structural fields */}
                            <div className="grid grid-cols-2 gap-4 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-150 dark:border-slate-800 text-xs">
                                <div className="space-y-1">
                                    <span className="font-bold text-slate-400 uppercase block">الدور</span>
                                    <span className="font-semibold text-slate-700 dark:text-slate-300">{getRoleArabicName(user?.role)}</span>
                                </div>
                                <div className="space-y-1">
                                    <span className="font-bold text-slate-400 uppercase block">القسم</span>
                                    <span className="font-semibold text-slate-700 dark:text-slate-300">{user?.departmentName || 'غير محدد'}</span>
                                </div>
                                {user?.collegeName && (
                                    <div className="col-span-2 space-y-1 pt-1 border-t border-slate-200/50 dark:border-slate-700/50">
                                        <span className="font-bold text-slate-400 uppercase block">الكلية</span>
                                        <span className="font-semibold text-slate-700 dark:text-slate-300">{user?.collegeName}</span>
                                    </div>
                                )}
                            </div>

                            {/* Full Name */}
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">الاسم الكامل</label>
                                <input
                                    name="fullName"
                                    value={formData.fullName}
                                    onChange={handleInputChange}
                                    className={`w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-850 border ${errors.fullName ? 'border-rose-500' : 'border-slate-200 dark:border-slate-700'} rounded-xl focus:ring-2 focus:ring-primary/20 outline-none text-sm transition-all text-slate-900 dark:text-white`}
                                    placeholder="أدخل الاسم الرباعي"
                                />
                                {errors.fullName && <p className="text-[10px] text-rose-500 font-bold">{errors.fullName}</p>}
                            </div>

                            {/* Email */}
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">البريد الإلكتروني</label>
                                <input
                                    name="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    className={`w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-850 border ${errors.email ? 'border-rose-500' : 'border-slate-200 dark:border-slate-700'} rounded-xl focus:ring-2 focus:ring-primary/20 outline-none text-sm transition-all text-slate-900 dark:text-white`}
                                    placeholder="user@example.com"
                                />
                                {errors.email && <p className="text-[10px] text-rose-500 font-bold">{errors.email}</p>}
                            </div>

                            {/* Optional Password */}
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">كلمة المرور الجديدة (اختياري)</label>
                                <input
                                    name="password"
                                    type="password"
                                    value={formData.password}
                                    onChange={handleInputChange}
                                    className={`w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-850 border ${errors.password ? 'border-rose-500' : 'border-slate-200 dark:border-slate-700'} rounded-xl focus:ring-2 focus:ring-primary/20 outline-none text-sm transition-all text-slate-900 dark:text-white`}
                                    placeholder="اتركه فارغاً لإبقائه كما هو"
                                />
                                {errors.password && <p className="text-[10px] text-rose-500 font-bold">{errors.password}</p>}
                            </div>

                            {/* Student Specific Fields */}
                            {activeRole === 'Student' && (
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">الرقم الجامعي</label>
                                        <input
                                            name="studentNumber"
                                            value={formData.studentNumber}
                                            onChange={handleInputChange}
                                            className={`w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-850 border ${errors.studentNumber ? 'border-rose-500' : 'border-slate-200 dark:border-slate-700'} rounded-xl focus:ring-2 focus:ring-primary/20 outline-none text-sm transition-all text-slate-900 dark:text-white`}
                                            placeholder="2020XXXX"
                                        />
                                        {errors.studentNumber && <p className="text-[10px] text-rose-500 font-bold">{errors.studentNumber}</p>}
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">السنة الدراسية</label>
                                        <input
                                            name="academicYear"
                                            value={formData.academicYear}
                                            onChange={handleInputChange}
                                            className={`w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-850 border ${errors.academicYear ? 'border-rose-500' : 'border-slate-200 dark:border-slate-700'} rounded-xl focus:ring-2 focus:ring-primary/20 outline-none text-sm transition-all text-slate-900 dark:text-white`}
                                            placeholder="2023/2024"
                                        />
                                        {errors.academicYear && <p className="text-[10px] text-rose-500 font-bold">{errors.academicYear}</p>}
                                    </div>
                                </div>
                            )}

                            {/* Supervisor & HOD Specific Fields */}
                            {(activeRole === 'Supervisor' || activeRole === 'HeadOfDepartment') && (
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">المكتب</label>
                                    <input
                                        name="office"
                                        value={formData.office}
                                        onChange={handleInputChange}
                                        className={`w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-850 border ${errors.office ? 'border-rose-500' : 'border-slate-200 dark:border-slate-700'} rounded-xl focus:ring-2 focus:ring-primary/20 outline-none text-sm transition-all text-slate-900 dark:text-white`}
                                        placeholder="مثال: مبنى A - مكتب 204"
                                    />
                                    {errors.office && <p className="text-[10px] text-rose-500 font-bold">{errors.office}</p>}
                                </div>
                            )}

                        </div>

                        {/* Actions */}
                        <div className="flex gap-3 pt-4 border-t border-slate-100 dark:border-slate-850">
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className={`flex-1 py-3 bg-primary text-white rounded-xl font-bold shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all flex items-center justify-center gap-2 ${isSubmitting ? 'opacity-70 cursor-wait' : ''}`}
                            >
                                {isSubmitting ? (
                                    <div className="size-4 border-2 border-white/30 border-b-white rounded-full animate-spin"></div>
                                ) : (
                                    <span className="material-symbols-outlined text-lg">save</span>
                                )}
                                <span>{isSubmitting ? 'جاري الحفظ...' : 'حفظ التغييرات'}</span>
                            </button>
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-6 py-3 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-xl font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
                            >
                                إلغاء
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};

export default EditUserModal;
