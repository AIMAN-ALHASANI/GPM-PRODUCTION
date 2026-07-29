import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDepartments, useCreateDepartment, useUpdateDepartment } from '../../hooks/useStructure';
import DepartmentCard from '../../components/DepartmentCard';

const DepartmentModal = ({ isOpen, onClose, onSubmit, department = null }) => {
    const [departmentName, setDepartmentName] = useState('');

    useEffect(() => {
        if (isOpen) {
            setDepartmentName(department?.departmentName || '');
        }
    }, [isOpen, department]);

    if (!isOpen) return null;

    const handleFormSubmit = (e) => {
        e.preventDefault();
        onSubmit({ 
            departmentName
        });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose}></div>
            <div className="relative bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md p-8 border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in duration-200">
                <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-6">
                    {department ? 'تعديل قسم' : 'إضافة قسم جديد'}
                </h2>
                <form onSubmit={handleFormSubmit} className="space-y-5">
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">اسم القسم</label>
                        <input 
                            type="text" 
                            required
                            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-3.5 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                            placeholder="مثال: هندسة البرمجيات"
                            value={departmentName}
                            onChange={(e) => setDepartmentName(e.target.value)}
                        />
                    </div>

                    <div className="flex gap-3 mt-8">
                        <button 
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-6 py-3.5 rounded-xl text-slate-600 dark:text-slate-400 font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
                        >
                            إلغاء
                        </button>
                        <button 
                            type="submit"
                            className="flex-[2] px-6 py-3.5 bg-primary text-white rounded-xl font-bold shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all"
                        >
                            {department ? 'تحديث القسم' : 'إضافة القسم'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const DepartmentsManagement = () => {
    const { data: departmentsResponse = [], isLoading, isError } = useDepartments();
    const createMutation = useCreateDepartment();
    const updateMutation = useUpdateDepartment();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedDept, setSelectedDept] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    const departments = Array.isArray(departmentsResponse) ? departmentsResponse : (departmentsResponse?.data || []);

    const filteredDepartments = departments.filter(dept => 
        dept.departmentName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        dept.collegeName?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleAdd = () => {
        setSelectedDept(null);
        setIsModalOpen(true);
    };

    const handleEdit = (dept) => {
        setSelectedDept(dept);
        setIsModalOpen(true);
    };

    const handleSubmit = (data) => {
        if (selectedDept) {
            updateMutation.mutate({ id: selectedDept.departmentID, data }, {
                onSuccess: () => setIsModalOpen(false)
            });
        } else {
            createMutation.mutate(data, {
                onSuccess: () => setIsModalOpen(false)
            });
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (isError) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
                <span className="material-symbols-outlined text-rose-500 text-5xl mb-4">error</span>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">حدث خطأ أثناء تحميل الأقسام</h2>
                <p className="text-slate-500 mt-2">يرجى المحاولة مرة أخرى لاحقاً</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-6 w-full">
            <nav className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                <Link className="hover:text-primary" to="/admin/dashboard">الرئيسية</Link>
                <span className="material-symbols-outlined text-sm">chevron_right</span>
                <span className="text-slate-900 dark:text-white font-medium">إدارة الأقسام</span>
            </nav>

            <div className="max-w-7xl mx-auto w-full flex flex-col gap-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex flex-col gap-1 text-right">
                        <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">إدارة الأقسام</h1>
                        <p className="text-slate-500 dark:text-slate-400 text-lg">تنظيم الهيكل الأكاديمي للكليات والأقسام العلمية.</p>
                    </div>
                    <button 
                        onClick={handleAdd}
                        className="flex items-center gap-2 px-6 py-4 bg-primary text-white rounded-2xl font-black hover:bg-primary/90 transition-all shadow-xl shadow-primary/20"
                    >
                        <span className="material-symbols-outlined">add</span>
                        <span>إضافة قسم جديد</span>
                    </button>
                </div>

                <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                    <div className="relative">
                        <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">search</span>
                        <input 
                            type="text" 
                            placeholder="بحث عن قسم أو كلية..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none text-sm"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredDepartments.map((dept) => (
                        <DepartmentCard 
                            key={dept.departmentID} 
                            dept={dept} 
                            onEdit={handleEdit} 
                        />
                    ))}
                    {filteredDepartments.length === 0 && (
                        <div className="col-span-full py-24 text-center bg-white dark:bg-slate-900 rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-800">
                            <div className="size-20 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center mx-auto mb-4">
                                <span className="material-symbols-outlined text-4xl text-slate-300">inventory_2</span>
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white">لا توجد نتائج تطابق البحث</h3>
                            <p className="text-slate-500 mt-1">جرب كلمات بحث مختلفة أو أضف قسماً جديداً</p>
                        </div>
                    )}
                </div>
            </div>

            <DepartmentModal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
                onSubmit={handleSubmit}
                department={selectedDept}
            />
        </div>
    );
};

export default DepartmentsManagement;
