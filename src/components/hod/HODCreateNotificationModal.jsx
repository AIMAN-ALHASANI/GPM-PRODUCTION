import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import notificationService from '../../services/notificationService';

const RECIPIENT_TYPES = [
    { value: 'Department',    label: 'القسم بأكمله' },
    { value: 'AllSupervisors', label: 'جميع المشرفين' },
    { value: 'Team',          label: 'فريق محدد' },
    { value: 'Supervisor',    label: 'مشرف محدد' },
];

const HODCreateNotificationModal = ({ isOpen, onClose, onSuccess }) => {
    const [recipientType, setRecipientType] = useState('Department');
    const [recipientId, setRecipientId]     = useState('');
    const [message, setMessage]             = useState('');
    const [isSending, setIsSending]         = useState(false);

    // Dropdown data
    const [teams, setTeams]               = useState([]);
    const [supervisors, setSupervisors]   = useState([]);
    const [loadingTeams, setLoadingTeams] = useState(false);
    const [loadingSups, setLoadingSups]   = useState(false);

    // Reset form whenever the modal opens
    useEffect(() => {
        if (isOpen) {
            setRecipientType('Department');
            setRecipientId('');
            setMessage('');
            setIsSending(false);
        }
    }, [isOpen]);

    // Fetch teams when "Team" is selected for the first time
    useEffect(() => {
        if (recipientType === 'Team' && teams.length === 0) {
            setLoadingTeams(true);
            notificationService.hodGetDepartmentTeams()
                .then(res => {
                    const list = Array.isArray(res?.data) ? res.data
                               : Array.isArray(res)       ? res
                               : [];
                    setTeams(list);
                })
                .catch(() => toast.error('فشل تحميل قائمة الفرق.'))
                .finally(() => setLoadingTeams(false));
        }
    }, [recipientType]);

    // Fetch supervisors when "Supervisor" is selected for the first time
    useEffect(() => {
        if (recipientType === 'Supervisor' && supervisors.length === 0) {
            setLoadingSups(true);
            notificationService.hodGetDepartmentSupervisors()
                .then(res => {
                    const list = Array.isArray(res?.data) ? res.data
                               : Array.isArray(res)       ? res
                               : [];
                    setSupervisors(list);
                })
                .catch(() => toast.error('فشل تحميل قائمة المشرفين.'))
                .finally(() => setLoadingSups(false));
        }
    }, [recipientType]);

    // Reset recipientId whenever type changes
    const handleTypeChange = (e) => {
        setRecipientType(e.target.value);
        setRecipientId('');
    };

    const needsId = recipientType === 'Team' || recipientType === 'Supervisor';

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!message.trim()) {
            toast.error('يرجى كتابة نص الإشعار.');
            return;
        }
        if (needsId && !recipientId) {
            toast.error(
                recipientType === 'Team'
                    ? 'يرجى اختيار الفريق.'
                    : 'يرجى اختيار المشرف.'
            );
            return;
        }

        setIsSending(true);
        try {
            await notificationService.hodSendNotification({
                message:       message.trim(),
                recipientType: recipientType,
                recipientId:   needsId ? parseInt(recipientId, 10) : null,
            });
            toast.success('تم إرسال الإشعار بنجاح.');
            onSuccess?.();
            onClose();
        } catch (err) {
            const msg = err?.response?.data?.message
                     || err?.response?.data?.Message
                     || 'فشل إرسال الإشعار. يرجى المحاولة مرة أخرى.';
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
            <div className="relative bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in duration-200 text-right">

                {/* Header */}
                <div className="bg-primary p-6 text-white flex items-center justify-between">
                    <button
                        onClick={onClose}
                        className="hover:bg-white/20 p-2 rounded-full transition-colors"
                        type="button"
                    >
                        <span className="material-symbols-outlined">close</span>
                    </button>
                    <div className="flex items-center gap-3">
                        <span className="material-symbols-outlined text-2xl">send</span>
                        <h2 className="text-xl font-black">إنشاء إشعار جديد</h2>
                    </div>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-8 space-y-6">

                    {/* Recipient Type */}
                    <div>
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">
                            نوع المستلم
                        </label>
                        <div className="relative">
                            <select
                                value={recipientType}
                                onChange={handleTypeChange}
                                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none text-sm appearance-none"
                            >
                                {RECIPIENT_TYPES.map(t => (
                                    <option key={t.value} value={t.value}>{t.label}</option>
                                ))}
                            </select>
                            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none text-lg">
                                expand_more
                            </span>
                        </div>
                    </div>

                    {/* Team Selector */}
                    {recipientType === 'Team' && (
                        <div>
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">
                                اختر الفريق
                            </label>
                            {loadingTeams ? (
                                <div className="flex items-center gap-2 py-3 text-slate-500 text-sm">
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary" />
                                    جاري تحميل الفرق...
                                </div>
                            ) : (
                                <div className="relative">
                                    <select
                                        value={recipientId}
                                        onChange={e => setRecipientId(e.target.value)}
                                        className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none text-sm appearance-none"
                                    >
                                        <option value="">-- اختر فريقاً --</option>
                                        {teams.map(t => (
                                            <option key={t.teamID ?? t.TeamID} value={t.teamID ?? t.TeamID}>
                                                {t.teamName ?? t.TeamName}
                                            </option>
                                        ))}
                                    </select>
                                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none text-lg">
                                        expand_more
                                    </span>
                                </div>
                            )}
                            {teams.length === 0 && !loadingTeams && (
                                <p className="text-xs text-slate-400 mt-1">لا توجد فرق في قسمك.</p>
                            )}
                        </div>
                    )}

                    {/* Supervisor Selector */}
                    {recipientType === 'Supervisor' && (
                        <div>
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">
                                اختر المشرف
                            </label>
                            {loadingSups ? (
                                <div className="flex items-center gap-2 py-3 text-slate-500 text-sm">
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary" />
                                    جاري تحميل المشرفين...
                                </div>
                            ) : (
                                <div className="relative">
                                    <select
                                        value={recipientId}
                                        onChange={e => setRecipientId(e.target.value)}
                                        className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none text-sm appearance-none"
                                    >
                                        <option value="">-- اختر مشرفاً --</option>
                                        {supervisors.map(s => (
                                            <option key={s.userID ?? s.UserID} value={s.userID ?? s.UserID}>
                                                {s.fullName ?? s.FullName}
                                            </option>
                                        ))}
                                    </select>
                                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none text-lg">
                                        expand_more
                                    </span>
                                </div>
                            )}
                            {supervisors.length === 0 && !loadingSups && (
                                <p className="text-xs text-slate-400 mt-1">لا يوجد مشرفون في قسمك.</p>
                            )}
                        </div>
                    )}

                    {/* Message */}
                    <div>
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">
                            نص الإشعار
                        </label>
                        <textarea
                            value={message}
                            onChange={e => setMessage(e.target.value)}
                            rows={4}
                            placeholder="اكتب نص الإشعار هنا..."
                            className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none text-sm resize-none"
                        />
                        <p className="text-[10px] text-slate-400 mt-1">{message.trim().length} حرف</p>
                    </div>

                    {/* Footer Buttons */}
                    <div className="flex items-center justify-between gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-8 py-3 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-xl font-bold border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all"
                        >
                            إلغاء
                        </button>
                        <button
                            type="submit"
                            disabled={isSending}
                            className="px-8 py-3 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                            {isSending ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                                    <span>جاري الإرسال...</span>
                                </>
                            ) : (
                                <>
                                    <span className="material-symbols-outlined text-lg">send</span>
                                    <span>إرسال الإشعار</span>
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default HODCreateNotificationModal;
