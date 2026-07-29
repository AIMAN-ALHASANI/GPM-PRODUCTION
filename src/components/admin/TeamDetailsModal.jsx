import React from 'react';
import { useTeamDetails } from '../../hooks/useTeams';

const TeamDetailsModal = ({ isOpen, onClose, teamId }) => {
    const { data: team, isLoading, isError } = useTeamDetails(teamId);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose}></div>
            <div className="relative bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in duration-200 text-right">
                {/* Header */}
                <div className="bg-primary p-6 text-white flex items-center justify-between">
                    <button onClick={onClose} className="hover:bg-white/20 p-2 rounded-full transition-colors">
                        <span className="material-symbols-outlined">close</span>
                    </button>
                    <h2 className="text-xl font-black">تفاصيل الفريق</h2>
                </div>

                {/* Content */}
                <div className="p-8 max-h-[80vh] overflow-y-auto">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center py-12 gap-4">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                            <p className="text-slate-500 font-medium">جاري تحميل بيانات الفريق...</p>
                        </div>
                    ) : isError ? (
                        <div className="text-center py-12 text-rose-500">
                            <span className="material-symbols-outlined text-5xl mb-2">error</span>
                            <p className="font-bold">فشل في تحميل بيانات الفريق</p>
                        </div>
                    ) : team ? (() => {
                        const teamID = team?.teamID;
                        const teamName = team?.teamName;
                        const leaderName = team?.leaderName;
                        const supervisorName = team?.supervisorName;
                        const memberLimit = team?.memberLimit;
                        const status = team?.status;
                        const projectTitle = team?.projectTitle;
                        const createdAt = team?.createdAt;
                        const members = Array.isArray(team?.members) ? team.members : [];

                        return (
                        <div className="space-y-8">
                            {/* Team Header Info */}
                            <div className="flex flex-col items-center gap-4 text-center border-b border-slate-100 dark:border-slate-800 pb-8">
                                <div className="size-20 rounded-2xl bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                                    <span className="material-symbols-outlined text-4xl">groups</span>
                                </div>
                                <div>
                                    <h3 className="text-2xl font-black text-slate-900 dark:text-white">{teamName || 'بدون اسم'}</h3>
                                    <div className="flex items-center justify-center gap-2 mt-2">
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                                            status === 'Approved' || status === 'Active' ? 'bg-emerald-100 text-emerald-700' : 
                                            status === 'Pending' ? 'bg-amber-100 text-amber-700' : 'bg-rose-100 text-rose-700'
                                        }`}>
                                            {status === 'Approved' ? 'نشط' : status === 'Pending' ? 'قيد الانتظار' : status || 'معلق'}
                                        </span>
                                        <span className="px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-full text-xs font-bold">
                                            الحد الأقصى للأعضاء: {memberLimit || 0}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {/* Roles */}
                                <div className="space-y-6">
                                    <div>
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">قائد الفريق</label>
                                        <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
                                            <div className="size-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold">
                                                {leaderName?.charAt(0) || '?'}
                                            </div>
                                            <div className="text-right">
                                                <p className="text-sm font-bold text-slate-900 dark:text-white">{leaderName || 'غير محدد'}</p>
                                                <p className="text-xs text-slate-500">قائد الفريق</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">المشرف الأكاديمي</label>
                                        <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
                                            <div className="size-10 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                                                {supervisorName?.charAt(0) || '?'}
                                            </div>
                                            <div className="text-right">
                                                <p className="text-sm font-bold text-slate-900 dark:text-white">{supervisorName || 'لم يعين بعد'}</p>
                                                <p className="text-xs text-slate-500">المشرف على المشروع</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Members List */}
                                <div>
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">أعضاء الفريق ({members.length})</label>
                                    <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800 divide-y divide-slate-100 dark:divide-slate-800 overflow-hidden">
                                        {members.length > 0 ? (
                                            members.map((memberName, idx) => (
                                                <div key={idx} className="flex items-center gap-3 p-3 hover:bg-white/50 dark:hover:bg-slate-800 transition-colors">
                                                    <div className="size-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-[10px] font-bold">
                                                        {memberName?.charAt(0) || '?'}
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-xs font-bold text-slate-800 dark:text-slate-200">{memberName}</p>
                                                        <p className="text-[10px] text-slate-500">عضو فريق</p>
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <p className="p-4 text-xs text-slate-500 text-center">No members found</p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Project Section */}
                            <div className="pt-6 border-t border-slate-100 dark:border-slate-800">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-3">المشروع الحالي</label>
                                {projectTitle ? (
                                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-xl flex items-center justify-between group">
                                        <div className="flex items-center gap-3">
                                            <div className="size-10 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                                                <span className="material-symbols-outlined text-xl">description</span>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-sm font-bold text-slate-900 dark:text-white">{projectTitle}</p>
                                                <p className="text-xs text-slate-500">مشروع تخرج مسجل</p>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="bg-slate-50 dark:bg-slate-800/30 rounded-xl p-6 text-center border-2 border-dashed border-slate-200 dark:border-slate-800">
                                        <p className="text-sm text-slate-500 italic">لا توجد مشاريع مسجلة لهذا الفريق حالياً</p>
                                    </div>
                                )}
                            </div>

                            {/* Metadata */}
                            <div className="flex items-center justify-between pt-6 text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                                <span>معرف الفريق: TEAM-{teamID?.toString().padStart(4, '0')}</span>
                                <span>تاريخ الإنشاء: {createdAt ? new Date(createdAt).toLocaleDateString() : 'غير متوفر'}</span>
                            </div>
                        </div>
                        );
                    })() : null}
                </div>

                {/* Footer Actions */}
                <div className="bg-slate-50 dark:bg-slate-800/50 p-6 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                    <button 
                        onClick={onClose}
                        className="px-8 py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/20"
                    >
                        إغلاق
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TeamDetailsModal;
