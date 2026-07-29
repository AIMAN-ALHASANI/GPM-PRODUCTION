import React, { useState, useEffect } from 'react';
import { useCreateStudent, useCreateSupervisor, useCreateHOD } from '../../hooks/useUsers';
import { useDepartments } from '../../hooks/useStructure';
import toast from 'react-hot-toast';

const CreateUserModal = ({ isOpen, onClose, role, onSuccess }) => {
    const { data: departments } = useDepartments();
    const createStudentMutation = useCreateStudent();
    const createSupervisorMutation = useCreateSupervisor();
    const createHODMutation = useCreateHOD();

    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        password: '',
        studentNumber: '',
        academicYear: '',
        departmentID: '',
        office: '',
        isSupervisor: false
    });

    const [errors, setErrors] = useState({});

    // Reset form when modal opens or role changes
    useEffect(() => {
        if (isOpen) {
            setFormData({
                fullName: '',
                email: '',
                password: '',
                studentNumber: '',
                academicYear: '',
                departmentID: '',
                office: '',
                isSupervisor: false
            });
            setErrors({});
        }
    }, [isOpen, role]);

    if (!isOpen) return null;

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: null }));
        }
    };

    const validate = () => {
        const newErrors = {};
        if (!formData.fullName) newErrors.fullName = 'الاسم الكامل مطلوب';
        if (!formData.email) {
            newErrors.email = 'البريد الإلكتروني مطلوب';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'البريد الإلكتروني غير صالح';
        }
        if (!formData.password) newErrors.password = 'كلمة المرور مطلوبة';
        if (!formData.departmentID) newErrors.departmentID = 'يجب اختيار القسم';

        if (role === 'Student') {
            if (!formData.studentNumber) newErrors.studentNumber = 'الرقم الجامعي مطلوب';
            if (!formData.academicYear) newErrors.academicYear = 'السنة الدراسية مطلوبة';
        }

        if (role === 'Supervisor') {
            if (!formData.office) newErrors.office = 'المكتب مطلوب';
        }

        if (role === 'HeadOfDepartment') {
            if (formData.isSupervisor && !formData.office) {
                newErrors.office = 'المكتب مطلوب عندما يكون رئيس القسم مشرفاً أيضاً';
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;

        try {
            const commonData = {
                fullName: formData.fullName,
                email: formData.email,
                password: formData.password,
                departmentID: parseInt(formData.departmentID)
            };

            if (role === 'Student') {
                await createStudentMutation.mutateAsync({
                    ...commonData,
                    studentNumber: formData.studentNumber,
                    academicYear: formData.academicYear
                });
            } else if (role === 'Supervisor') {
                await createSupervisorMutation.mutateAsync({
                    ...commonData,
                    office: formData.office
                });
            } else if (role === 'HeadOfDepartment') {
                await createHODMutation.mutateAsync({
                    ...commonData,
                    isSupervisor: formData.isSupervisor,
                    office: formData.office || ''
                });
            }

            onSuccess?.();
            onClose();
        } catch (error) {
            // Error is handled by the mutation and toast
            console.error('Error creating user:', error);
        }
    };

    const isLoading = createStudentMutation.isPending || createSupervisorMutation.isPending || createHODMutation.isPending;

    const roleTitle = role === 'Student' ? 'طالب' : role === 'Supervisor' ? 'مشرف' : 'رئيس قسم';

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <h3 className="text-xl font-black text-slate-900 dark:text-white">إضافة {roleTitle} جديد</h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-rose-500 transition-colors">
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div className="grid grid-cols-1 gap-4">
                        {/* Common Fields */}
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">الاسم الكامل</label>
                            <input
                                name="fullName"
                                value={formData.fullName}
                                onChange={handleInputChange}
                                className={`w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border ${errors.fullName ? 'border-rose-500' : 'border-slate-200 dark:border-slate-700'} rounded-xl focus:ring-2 focus:ring-primary/20 outline-none text-sm transition-all`}
                                placeholder="أدخل الاسم الرباعي"
                            />
                            {errors.fullName && <p className="text-[10px] text-rose-500 font-bold">{errors.fullName}</p>}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">البريد الإلكتروني</label>
                                <input
                                    name="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    className={`w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border ${errors.email ? 'border-rose-500' : 'border-slate-200 dark:border-slate-700'} rounded-xl focus:ring-2 focus:ring-primary/20 outline-none text-sm transition-all`}
                                    placeholder="user@example.com"
                                />
                                {errors.email && <p className="text-[10px] text-rose-500 font-bold">{errors.email}</p>}
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">كلمة المرور</label>
                                <input
                                    name="password"
                                    type="password"
                                    value={formData.password}
                                    onChange={handleInputChange}
                                    className={`w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border ${errors.password ? 'border-rose-500' : 'border-slate-200 dark:border-slate-700'} rounded-xl focus:ring-2 focus:ring-primary/20 outline-none text-sm transition-all`}
                                    placeholder="••••••••"
                                />
                                {errors.password && <p className="text-[10px] text-rose-500 font-bold">{errors.password}</p>}
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">القسم</label>
                            <select
                                name="departmentID"
                                value={formData.departmentID}
                                onChange={handleInputChange}
                                className={`w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border ${errors.departmentID ? 'border-rose-500' : 'border-slate-200 dark:border-slate-700'} rounded-xl focus:ring-2 focus:ring-primary/20 outline-none text-sm transition-all`}
                            >
                                <option value="">اختر القسم</option>
                                {departments?.map(dept => (
                                    <option key={dept.departmentID} value={dept.departmentID}>{dept.departmentName || dept.name}</option>
                                ))}
                            </select>
                            {errors.departmentID && <p className="text-[10px] text-rose-500 font-bold">{errors.departmentID}</p>}
                        </div>

                        {/* Student Specific Fields */}
                        {role === 'Student' && (
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">الرقم الجامعي</label>
                                    <input
                                        name="studentNumber"
                                        value={formData.studentNumber}
                                        onChange={handleInputChange}
                                        className={`w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border ${errors.studentNumber ? 'border-rose-500' : 'border-slate-200 dark:border-slate-700'} rounded-xl focus:ring-2 focus:ring-primary/20 outline-none text-sm transition-all`}
                                        placeholder="2020XXXX"
                                    />
                                    {errors.studentNumber && <p className="text-[10px] text-rose-500 font-bold">{errors.studentNumber}</p>}
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">السنة الدراسية</label>
                                    <input
                                        name="academicYear"
                                        value={formData.academicYear}
                                        onChange={handleInputChange}
                                        className={`w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border ${errors.academicYear ? 'border-rose-500' : 'border-slate-200 dark:border-slate-700'} rounded-xl focus:ring-2 focus:ring-primary/20 outline-none text-sm transition-all`}
                                        placeholder="2023/2024"
                                    />
                                    {errors.academicYear && <p className="text-[10px] text-rose-500 font-bold">{errors.academicYear}</p>}
                                </div>
                            </div>
                        )}

                        {/* Supervisor Specific Fields */}
                        {role === 'Supervisor' && (
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">المكتب</label>
                                <input
                                    name="office"
                                    value={formData.office}
                                    onChange={handleInputChange}
                                    className={`w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border ${errors.office ? 'border-rose-500' : 'border-slate-200 dark:border-slate-700'} rounded-xl focus:ring-2 focus:ring-primary/20 outline-none text-sm transition-all`}
                                    placeholder="مثال: مبنى A - الطابق الثاني - مكتب 204"
                                />
                                {errors.office && <p className="text-[10px] text-rose-500 font-bold">{errors.office}</p>}
                            </div>
                        )}

                        {/* HOD Specific Fields */}
                        {role === 'HeadOfDepartment' && (
                            <div className="space-y-4">
                                <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                                    <input
                                        name="isSupervisor"
                                        type="checkbox"
                                        id="isSupervisor"
                                        checked={formData.isSupervisor}
                                        onChange={handleInputChange}
                                        className="size-5 rounded border-slate-300 text-primary focus:ring-primary"
                                    />
                                    <label htmlFor="isSupervisor" className="text-sm font-bold text-slate-700 dark:text-slate-300 cursor-pointer">
                                        هل رئيس القسم مشرف أيضاً؟
                                    </label>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                                        المكتب {formData.isSupervisor && <span className="text-rose-500">*</span>}
                                    </label>
                                    <input
                                        name="office"
                                        value={formData.office}
                                        onChange={handleInputChange}
                                        className={`w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border ${errors.office ? 'border-rose-500' : 'border-slate-200 dark:border-slate-700'} rounded-xl focus:ring-2 focus:ring-primary/20 outline-none text-sm transition-all`}
                                        placeholder="مثال: مبنى A - الطابق الثاني - مكتب 204"
                                    />
                                    {errors.office && <p className="text-[10px] text-rose-500 font-bold">{errors.office}</p>}
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="flex gap-3 pt-4">
                        <button
                            type="submit"
                            disabled={isLoading}
                            className={`flex-1 py-3 bg-primary text-white rounded-xl font-bold shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all flex items-center justify-center gap-2 ${isLoading ? 'opacity-70 cursor-wait' : ''}`}
                        >
                            {isLoading ? (
                                <div className="size-4 border-2 border-white/30 border-b-white rounded-full animate-spin"></div>
                            ) : (
                                <span className="material-symbols-outlined text-lg">add_circle</span>
                            )}
                            <span>{isLoading ? 'جاري الحفظ...' : 'إضافة المستخدم'}</span>
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
            </div>
        </div>
    );
};

export default CreateUserModal;
