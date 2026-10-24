import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import notificationService from '../../services/notificationService';

const SupervisorCreateNotificationModal = ({ isOpen, onClose, onSuccess }) => {
    const [teamId, setTeamId] = useState('');
    const [message, setMessage] = useState('');
    const [teams, setTeams] = useState([]);
    const [loadingTeams, setLoadingTeams] = useState(false);
    const [isSending, setIsSending] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setTeamId('');
            setMessage('');
            setIsSending(false);
            setLoadingTeams(true);

            notificationService.supervisorGetTeams()
                .then(res => {
                    const list = Array.isArray(res?.data) ? res.data
                               : Array.isArray(res)       ? res
                               : [];
                    setTeams(list);
                })
                .catch(() => {
                    toast.error('فشل تحميل قائمة الفرق المُشرف عليها.');
                })
                .finally(() => {
                    setLoadingTeams(false);
                });
        }
    }, [isOpen]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!teamId) {
            toast.error('يرجى اختيار الفريق.');
            return;
        }

        if (!message.trim()) {
            toast.error('يرجى كتابة نص الإشعار.');
            return;
        }

        setIsSending(true);
        try {
            await notificationService.supervisorSendNotification({
                teamId: parseInt(teamId, 10),
                message: message.trim(),
            });
            toast.success('تم إرسال الإشعار للفريق بنجاح.');
            onSuccess?.();
            onClose();
        } catch (err) {
            const msg = err?.response?.data?.message
                     || err?.response?.data?.Message
                     || 'فشل إرسال الإشعار. يرجى التحقق من الصلاحيات والمحاولة مرة أخرى.';
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
                        <span className="material-symbols-outlined text-2xl">send</span>
                        <h2 className="text-xl font-black">إرسال إشعار لفريق</h2>
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

                    {/* Team Selector */}
                    <div>
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">
                            اختر الفريق المُستهدف <span className="text-rose-500">*</span>
                        </label>
                        {loadingTeams ? (
                            <div className="flex items-center gap-2 py-3 text-slate-500 text-sm">
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary" />
                                جاري تحميل الفرق المُشرف عليها...
                            </div>
                        ) : (
                            <div className="relative">
                                <select
                                    value={teamId}
                                    onChange={e => setTeamId(e.target.value)}
                                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none text-sm appearance-none"
                                >
                                    <option value="">-- اختر فريقاً --</option>
                                    {teams.map(t => {
                                        const id = t.teamID ?? t.TeamID;
                                        const name = t.teamName ?? t.TeamName;
                                        return (
                                            <option key={id} value={id}>
                                                {name}
                                            </option>
                                        );
                                    })}
                                </select>
                                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none text-lg">
                                    expand_more
                                </span>
                            </div>
                        )}
                        {!loadingTeams && teams.length === 0 && (
                            <p className="text-xs text-amber-600 mt-2">لا توجد فرق مُعيّنة لك حالياً.</p>
                        )}
                    </div>

                    {/* Message Area */}
                    <div>
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">
                            نص الإشعار <span className="text-rose-500">*</span>
                        </label>
                        <textarea
                            rows={4}
                            value={message}
                            onChange={e => setMessage(e.target.value)}
                            placeholder="اكتب رسالتك لأعضاء الفريق هنا..."
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
                            disabled={isSending || loadingTeams || teams.length === 0}
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

export default SupervisorCreateNotificationModal;
