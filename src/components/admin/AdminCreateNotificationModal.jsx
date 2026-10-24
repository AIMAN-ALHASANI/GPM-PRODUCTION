import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import notificationService from '../../services/notificationService';

const TARGET_OPTIONS = [
    { value: 'EntireCollege',  label: 'الكلية بأكملها (جميع الأقسام)' },
    { value: 'Department',     label: 'قسم محدد' },
    { value: 'AllSupervisors', label: 'جميع المشرفين في الكلية' },
    { value: 'Supervisor',     label: 'مشرف محدد' },
    { value: 'AllTeams',       label: 'جميع فرق الكلية' },
    { value: 'Team',           label: 'فريق محدد' },
    { value: 'AllHods',        label: 'جميع رؤساء الأقسام (HODs)' },
    { value: 'HOD',            label: 'رئيس قسم محدد' },
];

const AdminCreateNotificationModal = ({ isOpen, onClose, onSuccess }) => {
    const [recipientType, setRecipientType] = useState('EntireCollege');
    const [recipientId, setRecipientId]     = useState('');
    const [message, setMessage]             = useState('');
    const [isSending, setIsSending]         = useState(false);

    // Dropdown options
    const [dropdownData, setDropdownData] = useState({
        departments: [],
        supervisors: [],
        teams: [],
        hods: []
    });
    const [loadingDropdowns, setLoadingDropdowns] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setRecipientType('EntireCollege');
            setRecipientId('');
            setMessage('');
            setIsSending(false);
            setLoadingDropdowns(true);

            notificationService.adminGetDropdowns()
                .then(res => {
                    const data = res?.data ?? res ?? {};
                    setDropdownData({
                        departments: data.departments ?? data.Departments ?? [],
                        supervisors: data.supervisors ?? data.Supervisors ?? [],
                        teams: data.teams ?? data.Teams ?? [],
                        hods: data.hods ?? data.Hods ?? []
                    });
                })
                .catch(() => {
                    toast.error('فشل تحميل خيارات المستلمين للكلية.');
                })
                .finally(() => {
                    setLoadingDropdowns(false);
                });
        }
    }, [isOpen]);

    const handleTypeChange = (e) => {
        setRecipientType(e.target.value);
        setRecipientId('');
    };

    const needsSpecificId = ['Department', 'Supervisor', 'Team', 'HOD'].includes(recipientType);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!message.trim()) {
            toast.error('يرجى إدخال نص الإشعار.');
            return;
        }

        if (needsSpecificId && !recipientId) {
            const labels = {
                Department: 'القسم',
                Supervisor: 'المشرف',
                Team: 'الفريق',
                HOD: 'رئيس القسم'
            };
            toast.error(`يرجى تحديد ${labels[recipientType] || 'المستلم'}.`);
            return;
        }

        setIsSending(true);
        try {
            await notificationService.adminSendNotification({
                message: message.trim(),
                recipientType: recipientType,
                recipientId: needsSpecificId ? parseInt(recipientId, 10) : null
            });

            toast.success('تم إرسال إشعار الكلية بنجاح.');
            onSuccess?.();
            onClose();
        } catch (err) {
            const msg = err?.response?.data?.message
                     || err?.response?.data?.Message
                     || 'فشل إرسال الإشعار. يرجى التأكد من الصلاحيات والتبعية للكلية.';
            toast.error(msg);
        } finally {
            setIsSending(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in duration-200 text-right" dir="rtl">

                {/* Header */}
                <div className="bg-primary p-6 text-white flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <span className="material-symbols-outlined text-2xl">campaign</span>
                        <h2 className="text-xl font-black">إرسال إشعار على مستوى الكلية</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="hover:bg-white/20 p-2 rounded-full transition-colors"
                        type="button"
                    >
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-8 space-y-6">

                    {/* Targeting Mode */}
                    <div>
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">
                            النطاق المستهدف للإشعار <span className="text-rose-500">*</span>
                        </label>
                        <div className="relative">
                            <select
                                value={recipientType}
                                onChange={handleTypeChange}
                                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none text-sm appearance-none"
                            >
                                {TARGET_OPTIONS.map(opt => (
                                    <option key={opt.value} value={opt.value}>
                                        {opt.label}
                                    </option>
                                ))}
                            </select>
                            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none text-lg">
                                expand_more
                            </span>
                        </div>
                    </div>

                    {/* Specific Department Dropdown */}
                    {recipientType === 'Department' && (
                        <div>
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">
                                اختر القسم <span className="text-rose-500">*</span>
                            </label>
                            {loadingDropdowns ? (
                                <p className="text-sm text-slate-400 py-2">جاري التحميل...</p>
                            ) : (
                                <div className="relative">
                                    <select
                                        value={recipientId}
                                        onChange={e => setRecipientId(e.target.value)}
                                        className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none text-sm appearance-none"
                                    >
                                        <option value="">-- اختر قسماً من كليتك --</option>
                                        {dropdownData.departments.map(d => (
                                            <option key={d.id ?? d.Id} value={d.id ?? d.Id}>
                                                {d.name ?? d.Name}
                                            </option>
                                        ))}
                                    </select>
                                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none text-lg">
                                        expand_more
                                    </span>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Specific Supervisor Dropdown */}
                    {recipientType === 'Supervisor' && (
                        <div>
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">
                                اختر المشرف <span className="text-rose-500">*</span>
                            </label>
                            {loadingDropdowns ? (
                                <p className="text-sm text-slate-400 py-2">جاري التحميل...</p>
                            ) : (
                                <div className="relative">
                                    <select
                                        value={recipientId}
                                        onChange={e => setRecipientId(e.target.value)}
                                        className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none text-sm appearance-none"
                                    >
                                        <option value="">-- اختر مشرفاً من كليتك --</option>
                                        {dropdownData.supervisors.map(s => (
                                            <option key={s.id ?? s.Id} value={s.id ?? s.Id}>
                                                {s.name ?? s.Name}
                                            </option>
                                        ))}
                                    </select>
                                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none text-lg">
                                        expand_more
                                    </span>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Specific Team Dropdown */}
                    {recipientType === 'Team' && (
                        <div>
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">
                                اختر الفريق <span className="text-rose-500">*</span>
                            </label>
                            {loadingDropdowns ? (
                                <p className="text-sm text-slate-400 py-2">جاري التحميل...</p>
                            ) : (
                                <div className="relative">
                                    <select
                                        value={recipientId}
                                        onChange={e => setRecipientId(e.target.value)}
                                        className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none text-sm appearance-none"
                                    >
                                        <option value="">-- اختر فريقاً من كليتك --</option>
                                        {dropdownData.teams.map(t => (
                                            <option key={t.id ?? t.Id} value={t.id ?? t.Id}>
                                                {t.name ?? t.Name}
                                            </option>
                                        ))}
                                    </select>
                                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none text-lg">
                                        expand_more
                                    </span>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Specific HOD Dropdown */}
                    {recipientType === 'HOD' && (
                        <div>
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">
                                اختر رئيس القسم (HOD) <span className="text-rose-500">*</span>
                            </label>
                            {loadingDropdowns ? (
                                <p className="text-sm text-slate-400 py-2">جاري التحميل...</p>
                            ) : (
                                <div className="relative">
                                    <select
                                        value={recipientId}
                                        onChange={e => setRecipientId(e.target.value)}
                                        className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none text-sm appearance-none"
                                    >
                                        <option value="">-- اختر رئيس قسم من كليتك --</option>
                                        {dropdownData.hods.map(h => (
                                            <option key={h.id ?? h.Id} value={h.id ?? h.Id}>
                                                {h.name ?? h.Name}
                                            </option>
                                        ))}
                                    </select>
                                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none text-lg">
                                        expand_more
                                    </span>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Message Area */}
                    <div>
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">
                            نص الإشعار <span className="text-rose-500">*</span>
                        </label>
                        <textarea
                            rows={4}
                            value={message}
                            onChange={e => setMessage(e.target.value)}
                            placeholder="اكتب التوجيه أو الإشعار الإداري هنا..."
                            className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none text-sm resize-none"
                        />
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-bold text-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
                        >
                            إلغاء
                        </button>
                        <button
                            type="submit"
                            disabled={isSending || loadingDropdowns}
                            className="flex items-center gap-2 px-6 py-2.5 bg-primary text-white rounded-xl font-bold text-sm hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isSending ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                                    جاري الإرسال...
                                </>
                            ) : (
                                <>
                                    <span className="material-symbols-outlined text-lg">send</span>
                                    إرسال الإشعار
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AdminCreateNotificationModal;
