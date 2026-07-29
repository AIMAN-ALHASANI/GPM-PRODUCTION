import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCollegeStudents, useUpdateUserStatus } from '../../hooks/useUsers';
import { useDepartments } from '../../hooks/useStructure';
import CreateUserModal from '../../components/admin/CreateUserModal';
import EditUserModal from '../../components/admin/EditUserModal';

const ActionMenu = ({ isOpen, onToggle, onClose, isActive, onActivate, onDeactivate, onEdit }) => {
    return (
        <div className="relative">
            <button 
                onClick={onToggle}
                className="text-slate-400 hover:text-primary p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
            >
                <span className="material-symbols-outlined">more_vert</span>
            </button>
            {isOpen && (
                <>
                    <div className="fixed inset-0 z-40" onClick={onClose}></div>
                    <div className="absolute left-0 top-full mt-2 w-48 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 z-50 overflow-hidden">
                        <button 
                            onClick={() => {
                                onEdit();
                                onClose();
                            }}
                            className="w-full flex items-center gap-2 px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                        >
                            <span className="material-symbols-outlined text-[16px]">edit</span> تعديل الملف
                        </button>
                        <button 
                            onClick={isActive ? onDeactivate : onActivate}
                            className={`w-full flex items-center gap-2 px-4 py-2 text-sm ${isActive ? 'text-amber-600 hover:bg-amber-50' : 'text-emerald-600 hover:bg-emerald-50'} transition-colors`}
                        >
                            <span className="material-symbols-outlined text-[16px]">{isActive ? 'block' : 'check_circle'}</span>
                            {isActive ? 'تعطيل الحساب' : 'تفعيل الحساب'}
                        </button>
                    </div>
                </>
            )}
        </div>
    );
};

const StudentsManagement = () => {
    const { data: apiResponse, isLoading, isError, refetch } = useCollegeStudents();
    const { data: departmentsResponse } = useDepartments();
    const updateStatusMutation = useUpdateUserStatus();

    const [searchTerm, setSearchTerm] = useState('');
    const [selectedDepartment, setSelectedDepartment] = useState('جميع الأقسام');
    const [activeActionRowId, setActiveActionRowId] = useState(null);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [selectedUserId, setSelectedUserId] = useState(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    const students = Array.isArray(apiResponse) ? apiResponse : (apiResponse?.data || []);
    const departments = Array.isArray(departmentsResponse) ? departmentsResponse : (departmentsResponse?.data || []);

    const filteredData = students.filter(student => {
        const matchesSearch = student.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                             student.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                             student.userName?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesDepartment = selectedDepartment === 'جميع الأقسام' || student.departmentName === selectedDepartment;
        return matchesSearch && matchesDepartment;
    });

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (isError) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] text-slate-500">
                <span className="material-symbols-outlined text-5xl mb-2 text-rose-500">error</span>
                <p>حدث خطأ أثناء تحميل بيانات الطلاب</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-6 w-full">
            <nav className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                <Link className="hover:text-primary" to="/admin/dashboard">الرئيسية</Link>
                <span className="material-symbols-outlined text-sm">chevron_right</span>
                <span className="text-slate-900 dark:text-white font-medium">إدارة الطلاب</span>
            </nav>

            <div className="max-w-7xl mx-auto w-full flex flex-col gap-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex flex-col gap-1">
                        <h1 className="text-3xl font-black leading-tight tracking-tight text-slate-900 dark:text-white">إدارة الطلاب</h1>
                        <p className="text-slate-500 dark:text-slate-400 text-base">عرض وإدارة حسابات الطلاب المسجلين في الكلية.</p>
                    </div>
                    <button 
                        onClick={() => setIsCreateModalOpen(true)}
                        className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 transition-all shadow-lg shadow-primary/20"
                    >
                        <span className="material-symbols-outlined">person_add</span>
                        <span>إضافة طالب جديد</span>
                    </button>
                </div>

                <CreateUserModal 
                    isOpen={isCreateModalOpen} 
                    onClose={() => setIsCreateModalOpen(false)} 
                    role="Student" 
                    onSuccess={() => refetch()} 
                />

                <EditUserModal 
                    isOpen={isEditModalOpen} 
                    onClose={() => setIsEditModalOpen(false)} 
                    userId={selectedUserId} 
                    role="Student" 
                    onSuccess={() => refetch()} 
                />

                <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                    <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                        <div className="flex-1 w-full">
                            <div className="relative">
                                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">search</span>
                                <input 
                                    type="text" 
                                    placeholder="بحث عن طالب (الاسم، البريد، الرقم الجامعي)..." 
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none text-sm"
                                />
                            </div>
                        </div>
                        <div className="flex gap-3 w-full sm:w-auto">
                            <select 
                                value={selectedDepartment}
                                onChange={(e) => setSelectedDepartment(e.target.value)}
                                className="px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none text-sm flex-1 sm:flex-none"
                            >
                                <option value="جميع الأقسام">جميع الأقسام</option>
                                {departments.map((dept) => (
                                    <option key={dept.departmentID} value={dept.departmentName}>{dept.departmentName}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden mb-10">
                    <div className="overflow-x-auto">
                        <table className="w-full text-right border-collapse">
                            <thead>
                                <tr className="bg-slate-50/50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
                                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">الطالب</th>
                                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">الرقم الجامعي</th>
                                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">القسم</th>
                                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">الحالة</th>
                                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 text-left">الإجراءات</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                {filteredData.map((student) => (
                                    <tr key={student.userID} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="size-9 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">
                                                    {student.fullName?.charAt(0) || '?'}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-semibold text-slate-900 dark:text-white">{student.fullName}</p>
                                                    <p className="text-xs text-slate-500">{student.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm font-mono text-slate-600 dark:text-slate-400">{student.userName || student.userID}</td>
                                        <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">{student.departmentName || 'غير محدد'}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-1.5">
                                                <div className={`size-1.5 rounded-full ${student.isActive ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-600'}`}></div>
                                                <span className={`text-xs font-medium ${student.isActive ? 'text-emerald-700 dark:text-emerald-400' : 'text-slate-500 dark:text-slate-400'}`}>
                                                    {student.isActive ? 'نشط' : 'غير نشط'}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-left">
                                            <ActionMenu 
                                                isOpen={activeActionRowId === student.userID}
                                                onToggle={() => setActiveActionRowId(activeActionRowId === student.userID ? null : student.userID)}
                                                onClose={() => setActiveActionRowId(null)}
                                                isActive={student.isActive}
                                                onActivate={() => updateStatusMutation.mutate({ id: student.userID, isActive: true })}
                                                onDeactivate={() => updateStatusMutation.mutate({ id: student.userID, isActive: false })}
                                                onEdit={() => {
                                                    setSelectedUserId(student.userID);
                                                    setIsEditModalOpen(true);
                                                }}
                                            />
                                        </td>
                                    </tr>
                                ))}
                                {filteredData.length === 0 && (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-10 text-center text-slate-500">لا توجد نتائج تطابق البحث</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StudentsManagement;
