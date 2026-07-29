import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCreateUser } from '../../hooks/useUsers';
import { useDepartments } from '../../hooks/useStructure';
import toast from 'react-hot-toast';

const FormInput = ({ label, icon, error, ...props }) => (
    <div>
        <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">{label}</label>
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

const FormSelect = ({ label, options, value, onChange }) => (
    <div>
        <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">{label}</label>
        <select 
            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-3 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary"
            value={value}
            onChange={onChange}
        >
            <option value="">ط§ط®طھط± ط§ظ„ظ‚ط³ظ…</option>
            {options.map(opt => <option key={opt.departmentID || opt} value={opt.departmentID || opt}>{opt.name || opt}</option>)}
        </select>
    </div>
);

const PermissionCheckbox = ({ label, checked, onChange }) => (
    <label className="flex items-center gap-2 cursor-pointer">
        <input type="checkbox" className="rounded border-slate-300 text-primary focus:ring-primary" checked={checked} onChange={onChange} />
        <span className="text-sm">{label}</span>
    </label>
);

const CommitteeCard = ({ committee, onRemove }) => (
    <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-800 p-3 rounded-lg group">
        <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                <span className="material-symbols-outlined">diversity_3</span>
            </div>
            <div>
                <p className="text-sm font-semibold">{committee.name}</p>
                <span className="text-[11px] text-slate-500">{committee.role || 'ط¹ط¶ظˆ'}</span>
            </div>
        </div>
        <button className="text-slate-400 opacity-0 group-hover:opacity-100 hover:text-red-500 transition-all" type="button" onClick={() => onRemove(committee.id)}>
            <span className="material-symbols-outlined text-lg">delete</span>
        </button>
    </div>
);

const AddNewHeadOfDepartment = () => {
    const navigate = useNavigate();
    const createUserMutation = useCreateUser();
    const { data: departmentsResponse } = useDepartments();
    const departments = departmentsResponse?.data || [];
    
    const [formData, setFormData] = useState({
        fullName: "",
        departmentId: "",
        academicDegree: "ط£ط³طھط§ط°",
        email: "",
        password: "",
        phone: "",
        startDate: "2024-09-01",
        appointmentDuration: "ط³ظ†طھط§ظ†",
        permissions: {
            manageFacultyMembers: true,
            approveProjectProposals: true,
            budgetDistribution: false,
            accessSystemReports: false
        },
        HeadsOfDepartment: []
    });

    const [errors, setErrors] = useState({});

    const academicDegrees = ["ط£ط³طھط§ط°", "ط£ط³طھط§ط° ظ…ط´ط§ط±ظƒ", "ط£ط³طھط§ط° ظ…ط³ط§ط¹ط¯", "ظ…ط­ط§ط¶ط±"];
    const durationOptions = ["ط³ظ†ط© ظˆط§ط­ط¯ط©", "ط³ظ†طھط§ظ†", "ظ£ ط³ظ†ظˆط§طھ", "ظ¤ ط³ظ†ظˆط§طھ", "ظ¥ ط³ظ†ظˆط§طھ"];

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }));
    };

    const handlePermissionToggle = (key) => setFormData(prev => ({ ...prev, permissions: { ...prev.permissions, [key]: !prev.permissions[key] } }));
    
    const validateForm = () => {
        const newErrors = {};
        if (!formData.fullName || formData.fullName.length < 3) newErrors.fullName = "ط§ظ„ط§ط³ظ… ظٹط¬ط¨ ط£ظ† ظٹظƒظˆظ† 3 ط£ط­ط±ظپ ط¹ظ„ظ‰ ط§ظ„ط£ظ‚ظ„";
        if (!formData.email || !/^\S+@\S+\.\S+$/.test(formData.email)) newErrors.email = "ظٹط±ط¬ظ‰ ط¥ط¯ط®ط§ظ„ ط¨ط±ظٹط¯ ط¥ظ„ظƒطھط±ظˆظ†ظٹ طµط­ظٹط­";
        if (!formData.password || formData.password.length < 6) newErrors.password = "ظٹط¬ط¨ ط£ظ† طھظƒظˆظ† 6 ط£ط­ط±ظپ ط¹ظ„ظ‰ ط§ظ„ط£ظ‚ظ„";
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;
        
        try {
            await createUserMutation.mutateAsync({
                fullName: formData.fullName,
                email: formData.email,
                password: formData.password,
                role: 4 // HOD
            });
            navigate('/admin/committee-management');
        } catch (error) {
            console.error("Failed to create HOD:", error);
            toast.error(error.response?.data?.message || 'ط­ط¯ط« ط®ط·ط£ ط£ط«ظ†ط§ط، ط¥ط¶ط§ظپط© ط¹ط¶ظˆ ط§ظ„ظ„ط¬ظ†ط©');
        }
    };

    return (
        <div className="flex flex-col gap-6">
            <nav className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 mb-8">
                <Link className="hover:text-primary" to="/admin/dashboard">ط§ظ„ط±ط¦ظٹط³ظٹط©</Link>
                <span className="material-symbols-outlined text-sm">chevron_right</span>
                <Link className="hover:text-primary" to="/admin/committee-management">ط¥ط¯ط§ط±ط© ط§ظ„ظ„ط¬ظ†ط©</Link>
                <span className="material-symbols-outlined text-sm">chevron_right</span>
                <span className="text-slate-900 dark:text-white font-medium">ط¥ط¶ط§ظپط© ط¹ط¶ظˆ ظ„ط¬ظ†ط© ط¬ط¯ظٹط¯</span>
            </nav>

            <div className="max-w-5xl mx-auto w-full">
                <div className="mb-8">
                    <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">ط¥ط¶ط§ظپط© ط¹ط¶ظˆ ظ„ط¬ظ†ط© ط¬ط¯ظٹط¯</h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">طھط¹ظٹظٹظ† ط¹ط¶ظˆ ط¬ط¯ظٹط¯ ظپظٹ ط§ظ„ظ„ط¬ظ†ط© ظ„ظ„ط¥ط´ط±ط§ظپ ط¹ظ„ظ‰ ط§ظ„ظ„ط¬ط§ظ† ط§ظ„ط£ظƒط§ط¯ظٹظ…ظٹط© ظˆط¥ط¯ط§ط±ط© ط§ظ„ظ…ط´ط§ط±ظٹط¹.</p>
                </div>

                <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    <div className="lg:col-span-7 space-y-8">
                        <section className="bg-white dark:bg-slate-900 rounded-xl p-8 border border-slate-200 dark:border-slate-800 shadow-sm">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">1</div>
                                <h2 className="text-xl font-bold">ط§ظ„ظ…ط¹ظ„ظˆظ…ط§طھ ط§ظ„ط±ط¦ظٹط³ظٹط©</h2>
                            </div>
                            <div className="space-y-5">
                                <FormInput label="ط§ظ„ط§ط³ظ… ط§ظ„ظƒط§ظ…ظ„" name="fullName" placeholder="ظ…ط«ط§ظ„: ط¯. ط£ط­ظ…ط¯ ظ…ط­ظ…ط¯ ط§ظ„ط¹ظ„ظٹ" value={formData.fullName} onChange={handleInputChange} error={errors.fullName} />
                                <div className="grid grid-cols-2 gap-4">
                                    <FormSelect label="ط§ظ„ظ‚ط³ظ…" options={departments} value={formData.departmentId} onChange={(e) => setFormData({...formData, departmentId: e.target.value})} />
                                    <FormSelect label="ط§ظ„ط¯ط±ط¬ط© ط§ظ„ط¹ظ„ظ…ظٹط©" options={academicDegrees} value={formData.academicDegree} onChange={(e) => setFormData({...formData, academicDegree: e.target.value})} />
                                </div>
                                <FormInput label="ط§ظ„ط¨ط±ظٹط¯ ط§ظ„ط¥ظ„ظƒطھط±ظˆظ†ظٹ ط§ظ„ط¬ط§ظ…ط¹ظٹ" name="email" type="email" icon="alternate_email" placeholder="ahmed.ali@university.edu" value={formData.email} onChange={handleInputChange} error={errors.email} />
                                <FormInput label="ظƒظ„ظ…ط© ط§ظ„ظ…ط±ظˆط±" name="password" type="password" icon="lock" placeholder="â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢" value={formData.password} onChange={handleInputChange} error={errors.password} />
                                <FormInput label="ط±ظ‚ظ… ط§ظ„ظ‡ط§طھظپ" name="phone" type="tel" icon="call" placeholder="+966 5X XXX XXXX" value={formData.phone} onChange={handleInputChange} error={errors.phone} />
                            </div>
                        </section>

                        <section className="bg-white dark:bg-slate-900 rounded-xl p-8 border border-slate-200 dark:border-slate-800 shadow-sm">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">3</div>
                                <h2 className="text-xl font-bold">طھظپط§طµظٹظ„ ط§ظ„طھط¹ظٹظٹظ†</h2>
                            </div>
                            <div className="space-y-5">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">طھط§ط±ظٹط® ط§ظ„ط¨ط¯ط،</label>
                                        <input className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-3 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" type="date" value={formData.startDate} onChange={(e) => setFormData({...formData, startDate: e.target.value})} />
                                    </div>
                                    <FormSelect label="ظ…ط¯ط© ط§ظ„طھط¹ظٹظٹظ† (ط³ظ†ظˆط§طھ)" options={durationOptions} value={formData.appointmentDuration} onChange={(e) => setFormData({...formData, appointmentDuration: e.target.value})} />
                                </div>
                            </div>
                        </section>
                    </div>

                    <div className="lg:col-span-5 space-y-8">
                        <div className="flex flex-col gap-3">
                            <button className={`w-full bg-primary text-white py-4 rounded-xl font-bold text-lg shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all flex items-center justify-center gap-2 ${createUserMutation.isPending ? 'opacity-70 cursor-wait' : ''}`} type="submit" disabled={createUserMutation.isPending}>
                                {createUserMutation.isPending ? <><span className="material-symbols-outlined animate-spin">sync</span> ط¬ط§ط±ظٹ ط§ظ„ط¥ظ†ط´ط§ط،...</> : 'ط¥ط¶ط§ظپط© ط¹ط¶ظˆ ط§ظ„ظ„ط¬ظ†ط©'}
                            </button>
                            <Link to="/admin/committee-management" className="w-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 py-4 rounded-xl font-bold text-sm hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors text-center block">ط¥ظ„ط؛ط§ط،</Link>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddNewHeadOfDepartment;

