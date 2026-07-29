import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import apiClient from '../../api/apiClient';
import { useChangePassword } from '../../hooks/useUsers';
import toast from 'react-hot-toast';
import { translateRole } from '../../utils/arabicLocalization';

const MyProfile = () => {
    const location = useLocation();
    const basePath = '/' + location.pathname.split('/')[1];

    const [loading, setLoading] = useState(true);
    const [profile, setProfile] = useState(null);
    const changePasswordMutation = useChangePassword();
    const oldPasswordRef = useRef(null);

    const [passwordData, setPasswordData] = useState({
        oldPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    const [passwordErrors, setPasswordErrors] = useState({});

    useEffect(() => {
        const queryParams = new URLSearchParams(location.search);
        if (queryParams.get('tab') === 'password' && oldPasswordRef.current) {
            setTimeout(() => {
                oldPasswordRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
                oldPasswordRef.current.focus();
            }, 100);
        }
    }, [location.search, loading]);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const response = await apiClient.get('/auth/me');
                setProfile(response.data);
            } catch (error) {
                console.error("Failed to fetch profile details", error);
                toast.error("حدث خطأ أثناء تحميل بيانات الملف الشخصي");
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, []);

    const handlePasswordChange = (e) => {
        const { name, value } = e.target;
        setPasswordData(prev => ({ ...prev, [name]: value }));
        if (passwordErrors[name]) {
            setPasswordErrors(prev => ({ ...prev, [name]: null }));
        }
    };

    const validatePasswords = () => {
        const errors = {};
        if (!passwordData.oldPassword) {
            errors.oldPassword = "يجب إدخال كلمة المرور الحالية";
        }
        if (!passwordData.newPassword) {
            errors.newPassword = "يجب إدخال كلمة المرور الجديدة";
        } else if (passwordData.newPassword.length < 6) {
            errors.newPassword = "يجب أن تكون كلمة المرور ٦ أحرف على الأقل";
        }
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            errors.confirmPassword = "كلمة المرور الجديدة وتأكيدها غير متطابقين";
        }

        setPasswordErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handlePasswordSubmit = async (e) => {
        e.preventDefault();
        if (!validatePasswords()) return;

        try {
            await changePasswordMutation.mutateAsync({
                oldPassword: passwordData.oldPassword,
                newPassword: passwordData.newPassword
            });
            setPasswordData({
                oldPassword: '',
                newPassword: '',
                confirmPassword: ''
            });
            toast.success("تم تغيير كلمة المرور بنجاح");
        } catch (error) {
            const message = error.response?.data?.message || "فشلت عملية تغيير كلمة المرور";
            toast.error(message);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (!profile) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] text-slate-500">
                <span className="material-symbols-outlined text-5xl mb-2 text-rose-500">error</span>
                <p>تعذر تحميل بيانات الملف الشخصي</p>
            </div>
        );
    }

    const initial = (profile.fullName || profile.FullName) ? (profile.fullName || profile.FullName).charAt(0) : '?';

    return (
        <div className="max-w-6xl mx-auto w-full pb-10 rtl space-y-8" dir="rtl">
            {/* Breadcrumbs */}
            <nav className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                <Link className="hover:text-primary transition-colors" to={`${basePath}/dashboard`}>الرئيسية</Link>
                <span className="material-symbols-outlined text-sm">chevron_left</span>
                <span className="text-slate-900 dark:text-white font-bold">الملف الشخصي</span>
            </nav>

            {/* Premium SaaS Header Section */}
            <div className="bg-primary rounded-3xl border border-primary/10 shadow-lg overflow-hidden relative p-8">
                <div className="flex flex-col md:flex-row items-center gap-6 text-white">
                    {/* Avatar */}
                    <div className="size-32 rounded-full border-4 border-white/20 bg-white/10 text-white flex items-center justify-center text-4xl font-black shadow-inner shrink-0">
                        {initial}
                    </div>
                    
                    {/* Name and Basic badges */}
                    <div className="flex-grow flex flex-col md:flex-row items-center justify-between gap-6 w-full text-center md:text-right">
                        <div className="space-y-3">
                            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                                <h1 className="text-3xl font-black leading-tight text-white">
                                    {profile.fullName || profile.FullName}
                                </h1>
                                <span className="px-4 py-1 text-xs font-black rounded-full border bg-white/15 text-white border-white/25">
                                    {translateRole(profile.role || profile.Role)}
                                </span>
                            </div>
                            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-sm text-white/80">
                                <span className="flex items-center gap-1.5">
                                    <span className="material-symbols-outlined text-base">mail</span>
                                    {profile.email || profile.Email}
                                </span>
                                <span className="flex items-center gap-1.5">
                                    <span className={`inline-block w-2.5 h-2.5 rounded-full animate-pulse ${(profile.isActive !== undefined ? profile.isActive : profile.IsActive) ? 'bg-green-400' : 'bg-red-400'}`}></span>
                                    <span className="font-bold">
                                        {(profile.isActive !== undefined ? profile.isActive : profile.IsActive) ? 'نشط بالنظام' : 'حساب معطل'}
                                    </span>
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Profile Grid Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Left Side: Information Cards */}
                <div className="lg:col-span-7 space-y-6">
                    {/* Card 1: Personal Info */}
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
                        <div className="flex items-center gap-2 mb-6 border-b border-slate-100 dark:border-slate-800/80 pb-4">
                            <span className="material-symbols-outlined text-primary text-[22px]">person</span>
                            <h3 className="text-base font-black text-slate-900 dark:text-white">المعلومات الشخصية</h3>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                            <div>
                                <span className="text-xs font-bold text-slate-400 block mb-1">الاسم الكامل</span>
                                <p className="text-sm font-semibold text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-800/40 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                                    {profile.fullName || profile.FullName}
                                </p>
                            </div>
                            <div>
                                <span className="text-xs font-bold text-slate-400 block mb-1">البريد الإلكتروني</span>
                                <p className="text-sm font-semibold text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-800/40 p-3 rounded-xl border border-slate-100 dark:border-slate-800 font-mono select-all">
                                    {profile.email || profile.Email}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Card 2: Academic Info (shown conditionally depending on role) */}
                    {['Student', 'Supervisor', 'HeadOfDepartment', 'Admin'].includes(profile.role || profile.Role) && (
                        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
                            <div className="flex items-center gap-2 mb-6 border-b border-slate-100 dark:border-slate-800/80 pb-4">
                                <span className="material-symbols-outlined text-primary text-[22px]">school</span>
                                <h3 className="text-base font-black text-slate-900 dark:text-white">البيانات الأكاديمية والمهنية</h3>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                {/* Student-specific fields */}
                                {(profile.role || profile.Role) === 'Student' && (
                                    <>
                                        <div>
                                            <span className="text-xs font-bold text-slate-400 block mb-1">الرقم الجامعي للعمل</span>
                                            <p className="text-sm font-semibold text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-800/40 p-3 rounded-xl border border-slate-100 dark:border-slate-800 font-mono">
                                                {profile.studentNumber || profile.StudentNumber}
                                            </p>
                                        </div>
                                        <div>
                                            <span className="text-xs font-bold text-slate-400 block mb-1">السنة الأكاديمية</span>
                                            <p className="text-sm font-semibold text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-800/40 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                                                {profile.academicYear || profile.AcademicYear}
                                            </p>
                                        </div>
                                    </>
                                )}

                                {/* Department & College for Student, Supervisor, HOD */}
                                {['Student', 'Supervisor', 'HeadOfDepartment'].includes(profile.role || profile.Role) && (
                                    <>
                                        <div>
                                            <span className="text-xs font-bold text-slate-400 block mb-1">القسم العلمي</span>
                                            <p className="text-sm font-semibold text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-800/40 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                                                {profile.departmentName || profile.DepartmentName || 'غير محدد'}
                                            </p>
                                        </div>
                                        <div>
                                            <span className="text-xs font-bold text-slate-400 block mb-1">الكلية</span>
                                            <p className="text-sm font-semibold text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-800/40 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                                                {profile.collegeName || profile.CollegeName || 'غير محدد'}
                                            </p>
                                        </div>
                                    </>
                                )}

                                {/* Office Location for HOD & Supervisor */}
                                {['Supervisor', 'HeadOfDepartment'].includes(profile.role || profile.Role) && (
                                    <div>
                                        <span className="text-xs font-bold text-slate-400 block mb-1">المكتب / مقر التواجد</span>
                                        <p className="text-sm font-semibold text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-800/40 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                                            {profile.office || profile.Office || 'غير محدد'}
                                        </p>
                                    </div>
                                )}

                                {/* College for Admin */}
                                {(profile.role || profile.Role) === 'Admin' && (
                                    <div className="col-span-full">
                                        <span className="text-xs font-bold text-slate-400 block mb-1">الكلية المعين بها كمسؤول</span>
                                        <p className="text-sm font-semibold text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-800/40 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                                            {profile.collegeName || profile.CollegeName || 'غير محدد'}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Card 3: System Info */}
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
                        <div className="flex items-center gap-2 mb-6 border-b border-slate-100 dark:border-slate-800/80 pb-4">
                            <span className="material-symbols-outlined text-primary text-[22px]">settings</span>
                            <h3 className="text-base font-black text-slate-900 dark:text-white">معلومات الحساب بالنظام</h3>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                            <div>
                                <span className="text-xs font-bold text-slate-400 block mb-1">تاريخ إنشاء الحساب</span>
                                <p className="text-sm font-semibold text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-800/40 p-3 rounded-xl border border-slate-100 dark:border-slate-800 tabular-nums">
                                    {new Date(profile.createdAt || profile.CreatedAt).toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' })}
                                </p>
                            </div>
                            <div>
                                <span className="text-xs font-bold text-slate-400 block mb-1">نوع صلاحيات الوصول</span>
                                <p className="text-sm font-semibold text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-800/40 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                                    {profile.role || profile.Role}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Side: Change Password Form */}
                <div className="lg:col-span-5">
                    <section className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm sticky top-6">
                        <div className="flex items-center gap-2 mb-6 border-b border-slate-100 dark:border-slate-800/80 pb-4">
                            <span className="material-symbols-outlined text-primary text-[22px]">lock_reset</span>
                            <h3 className="text-base font-black text-slate-900 dark:text-white">تغيير كلمة المرور</h3>
                        </div>
                        <form onSubmit={handlePasswordSubmit} className="space-y-4">
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-slate-500 uppercase">كلمة المرور الحالية</label>
                                <input
                                    ref={oldPasswordRef}
                                    name="oldPassword"
                                    type="password"
                                    value={passwordData.oldPassword}
                                    onChange={handlePasswordChange}
                                    placeholder="••••••••"
                                    className={`w-full px-4 py-3 bg-slate-50 dark:bg-slate-850 border ${passwordErrors.oldPassword ? 'border-rose-500' : 'border-slate-200 dark:border-slate-700'} rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-sm transition-all`}
                                />
                                {passwordErrors.oldPassword && <p className="text-[10px] text-rose-500 font-bold mt-1">{passwordErrors.oldPassword}</p>}
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-bold text-slate-500 uppercase">كلمة المرور الجديدة</label>
                                <input
                                    name="newPassword"
                                    type="password"
                                    value={passwordData.newPassword}
                                    onChange={handlePasswordChange}
                                    placeholder="••••••••"
                                    className={`w-full px-4 py-3 bg-slate-50 dark:bg-slate-850 border ${passwordErrors.newPassword ? 'border-rose-500' : 'border-slate-200 dark:border-slate-700'} rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-sm transition-all`}
                                />
                                {passwordErrors.newPassword && <p className="text-[10px] text-rose-500 font-bold mt-1">{passwordErrors.newPassword}</p>}
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-bold text-slate-500 uppercase">تأكيد كلمة المرور الجديدة</label>
                                <input
                                    name="confirmPassword"
                                    type="password"
                                    value={passwordData.confirmPassword}
                                    onChange={handlePasswordChange}
                                    placeholder="••••••••"
                                    className={`w-full px-4 py-3 bg-slate-50 dark:bg-slate-850 border ${passwordErrors.confirmPassword ? 'border-rose-500' : 'border-slate-200 dark:border-slate-700'} rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-sm transition-all`}
                                />
                                {passwordErrors.confirmPassword && <p className="text-[10px] text-rose-500 font-bold mt-1">{passwordErrors.confirmPassword}</p>}
                            </div>

                            <button
                                type="submit"
                                disabled={changePasswordMutation.isPending}
                                className={`w-full py-3.5 mt-4 bg-primary text-white rounded-xl font-bold shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all flex items-center justify-center gap-2 ${changePasswordMutation.isPending ? 'opacity-70 cursor-wait' : ''}`}
                            >
                                {changePasswordMutation.isPending ? (
                                    <div className="size-4 border-2 border-white/30 border-b-white rounded-full animate-spin"></div>
                                ) : (
                                    <span className="material-symbols-outlined text-lg">save</span>
                                )}
                                <span>{changePasswordMutation.isPending ? 'جاري الحفظ...' : 'حفظ التغييرات الجديدة'}</span>
                            </button>
                        </form>
                    </section>
                </div>
            </div>
        </div>
    );
};

export default MyProfile;
