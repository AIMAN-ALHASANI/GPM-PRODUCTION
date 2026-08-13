import React, { useState } from 'react';
import { useProposals, useProposal, useEvaluateProposal } from '../../hooks/useProposals';
import toast from 'react-hot-toast';

// ─── Helper components defined OUTSIDE the parent component ──────────────────
// Defining these inside HODProposals would create a new function reference on
// every render, causing React to unmount/remount the component (and lose focus).

const StatusBadge = ({ status }) => {
    const colors = {
        'Approved': 'bg-emerald-50 text-emerald-700 border-emerald-100',
        'Rejected': 'bg-red-50 text-red-700 border-red-100',
        'Pending': 'bg-amber-50 text-amber-700 border-amber-100'
    };
    return (
        <span className={`px-2.5 py-1 text-[10px] font-bold rounded-full border ${colors[status] || 'bg-slate-50 text-slate-700 border-slate-100'}`}>
            {status || 'غير محدد'}
        </span>
    );
};

const DetailItem = ({ label, value, className = "", isStatus = false, isLongText = false, isLink = false, isFeedback = false }) => (
    <div className={`space-y-1 ${className}`}>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{label}</p>
        {isStatus ? (
            <StatusBadge status={value} />
        ) : isLink ? (
            <a href={value} target="_blank" rel="noopener noreferrer" className="text-sm font-bold text-primary hover:underline flex items-center gap-1 justify-end">
                <span className="material-symbols-outlined text-sm">link</span>
                {value || 'لا يوجد ملف'}
            </a>
        ) : isLongText ? (
            <div className={`text-sm leading-relaxed p-4 rounded-xl border max-h-60 overflow-y-auto ${isFeedback ? 'bg-primary/5 border-primary/10 text-primary' : 'bg-slate-50 dark:bg-slate-800/50 border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-400'}`} style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', overflowWrap: 'break-word' }}>
                {value || (isFeedback ? 'لا توجد تغذية راجعة' : 'لا يوجد وصف متاح')}
            </div>
        ) : (
            <p className="text-sm font-bold text-slate-900 dark:text-white">{value ?? 'غير متوفر'}</p>
        )}
    </div>
);

const DetailsModal = ({ proposalDetails, detailsLoading, onClose }) => {
    if (!proposalDetails && !detailsLoading) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 duration-200 text-right" dir="rtl">
                <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center flex-row-reverse">
                    <h2 className="text-xl font-black text-slate-900 dark:text-white">تفاصيل المقترح</h2>
                    <button onClick={onClose} className="size-10 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center transition-colors">
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>
                {detailsLoading ? (
                    <div className="p-20 text-center text-slate-400 font-bold">جاري تحميل تفاصيل المقترح...</div>
                ) : (
                    <div className="p-8 space-y-6 max-h-[70vh] overflow-y-auto">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <DetailItem label="عنوان المقترح" value={proposalDetails.title} className="md:col-span-2" />
                            <DetailItem label="اسم مقدم المقترح" value={proposalDetails.submittedByUser?.fullName} />
                            <DetailItem label="البريد الإلكتروني" value={proposalDetails.submittedByUser?.email} />
                            <DetailItem label="نوع التقرير" value={proposalDetails.reportType} />
                            <DetailItem label="حالة المقترح" value={proposalDetails.status} isStatus />
                            <DetailItem label="تاريخ التقديم" value={new Date(proposalDetails.submissionDate).toLocaleDateString('ar-EG')} />
                            <DetailItem label="دور المستخدم" value={proposalDetails.submittedByUser?.role} />
                            <DetailItem label="حالة الحساب" value={proposalDetails.submittedByUser?.isActive ? 'نشط' : 'غير نشط'} />
                        </div>
                        <DetailItem label="رابط الملف" value={proposalDetails.filePath} isLink />
                        <DetailItem label="وصف المقترح" value={proposalDetails.description} isLongText />
                        <DetailItem label="التغذية الراجعة" value={proposalDetails.feedback} isLongText isFeedback />
                    </div>
                )}
            </div>
        </div>
    );
};

const EvaluateModal = ({
    evaluationDecision,
    setEvaluationDecision,
    evaluationFeedback,
    setEvaluationFeedback,
    onClose,
    onSubmit,
    isPending
}) => (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
        <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-3xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 duration-200 text-right" dir="rtl">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center flex-row-reverse">
                <h2 className="text-xl font-black text-slate-900 dark:text-white">تقييم المقترح</h2>
                <button onClick={onClose} className="size-10 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center transition-colors">
                    <span className="material-symbols-outlined">close</span>
                </button>
            </div>
            <div className="p-8 space-y-6">
                <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">قرار اللجنة</label>
                    <select
                        value={evaluationDecision}
                        onChange={(e) => setEvaluationDecision(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 text-sm font-bold focus:ring-2 focus:ring-primary/50 outline-none transition-all"
                    >
                        <option value="Approved">قبول المقترح (Approved)</option>
                        <option value="Rejected">رفض المقترح (Rejected)</option>
                    </select>
                </div>
                <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">التغذية الراجعة</label>
                    <textarea
                        value={evaluationFeedback}
                        onChange={(e) => setEvaluationFeedback(e.target.value)}
                        placeholder="اكتب ملاحظاتك هنا..."
                        rows="4"
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 text-sm focus:ring-2 focus:ring-primary/50 outline-none transition-all resize-none"
                    ></textarea>
                </div>
                <button
                    onClick={onSubmit}
                    disabled={isPending}
                    className="w-full py-4 bg-primary text-white rounded-2xl font-black text-sm shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:scale-100"
                >
                    {isPending ? 'جاري حفظ التقييم...' : 'حفظ التقييم وإرساله'}
                </button>
            </div>
        </div>
    </div>
);

// ─── Main HODProposals component ──────────────────────────────────────────────

const HODProposals = () => {
    const { data: proposals, isLoading: proposalsLoading, isError: proposalsError } = useProposals();
    const [selectedProposalId, setSelectedProposalId] = useState(null);
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
    const [isEvaluateModalOpen, setIsEvaluateModalOpen] = useState(false);
    const [evaluationDecision, setEvaluationDecision] = useState('Approved');
    const [evaluationFeedback, setEvaluationFeedback] = useState('');

    const { data: proposalDetails, isLoading: detailsLoading } = useProposal(selectedProposalId);
    const evaluateMutation = useEvaluateProposal();

    const handleOpenDetails = (id) => {
        setSelectedProposalId(id);
        setIsDetailsModalOpen(true);
    };

    const handleOpenEvaluate = (proposal) => {
        setSelectedProposalId(proposal.reportID);
        setEvaluationDecision(proposal.status === 'Pending' ? 'Approved' : proposal.status);
        setEvaluationFeedback(proposal.feedback || '');
        setIsEvaluateModalOpen(true);
    };

    const handleEvaluate = () => {
        if (!evaluationFeedback.trim()) {
            toast.error('يرجى إضافة التغذية الراجعة');
            return;
        }

        evaluateMutation.mutate({
            id: selectedProposalId,
            evaluationData: {
                Decision: evaluationDecision,
                Feedback: evaluationFeedback
            }
        }, {
            onSuccess: () => {
                setIsEvaluateModalOpen(false);
                setSelectedProposalId(null);
            }
        });
    };

    return (
        <div className="max-w-7xl mx-auto w-full pb-10 text-right" dir="rtl">
            <div className="mb-8">
                <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">مقترحات المشاريع</h1>
                <p className="text-slate-500 dark:text-slate-400 mt-2 text-lg">مراجعة وتقييم المقترحات المقدمة من الطلاب والمشرفين.</p>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
                <table className="w-full text-right border-collapse">
                    <thead>
                        <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
                            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">عنوان المقترح</th>
                            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">مقدم المقترح / الفريق</th>
                            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">الحالة</th>
                            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">تاريخ التقديم</th>
                            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-left">الإجراءات</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {proposalsLoading ? (
                            Array(5).fill(0).map((_, i) => (
                                <tr key={i} className="animate-pulse">
                                    <td colSpan="5" className="px-6 py-4 text-center text-slate-400 font-bold">جاري تحميل المقترحات...</td>
                                </tr>
                            ))
                        ) : proposalsError ? (
                            <tr>
                                <td colSpan="5" className="px-6 py-10 text-center text-red-500 font-bold">تعذر تحميل المقترحات</td>
                            </tr>
                        ) : (
                            Array.isArray(proposals) && proposals.map((proposal) => {
                                const submitterName =
                                    proposal.submitterName ??
                                    proposal.SubmitterName ??
                                    proposal.studentName ??
                                    proposal.StudentName ??
                                    proposal.submittedByUser?.fullName ??
                                    proposal.submittedByUser?.FullName ??
                                    'غير محدد';

                                const proposalTeamName =
                                    proposal.teamName ??
                                    proposal.TeamName ??
                                    proposal.team?.teamName ??
                                    proposal.Team?.TeamName ??
                                    'غير محدد';

                                return (
                                    <tr key={proposal.reportID} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors group">
                                        <td className="px-6 py-4">
                                            <p className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-primary transition-colors">{proposal.title}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col gap-0.5">
                                                <span className="text-xs font-bold text-slate-900 dark:text-white">{submitterName}</span>
                                                <span className="text-[10px] text-slate-500 flex items-center gap-1">
                                                    <span className="material-symbols-outlined text-[12px]">group</span>
                                                    {proposalTeamName}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <StatusBadge status={proposal.status} />
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className="text-[10px] font-bold text-slate-500 tabular-nums">
                                                {new Date(proposal.submissionDate).toLocaleDateString('ar-EG')}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-left">
                                            <div className="flex items-center justify-end gap-3">
                                                <button
                                                    onClick={() => handleOpenDetails(proposal.reportID)}
                                                    className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-primary hover:text-white rounded-lg text-[10px] font-bold transition-all"
                                                >
                                                    عرض التفاصيل
                                                </button>
                                                <button
                                                    onClick={() => handleOpenEvaluate(proposal)}
                                                    className="px-3 py-1.5 bg-primary/10 text-primary hover:bg-primary hover:text-white rounded-lg text-[10px] font-bold transition-all"
                                                >
                                                    تقييم المقترح
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                        {(!Array.isArray(proposals) || proposals.length === 0) && !proposalsLoading && !proposalsError && (
                            <tr>
                                <td colSpan="6" className="px-6 py-10 text-center text-slate-400">لا توجد مقترحات</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {isDetailsModalOpen && (
                <DetailsModal
                    proposalDetails={proposalDetails}
                    detailsLoading={detailsLoading}
                    onClose={() => setIsDetailsModalOpen(false)}
                />
            )}
            {isEvaluateModalOpen && (
                <EvaluateModal
                    evaluationDecision={evaluationDecision}
                    setEvaluationDecision={setEvaluationDecision}
                    evaluationFeedback={evaluationFeedback}
                    setEvaluationFeedback={setEvaluationFeedback}
                    onClose={() => setIsEvaluateModalOpen(false)}
                    onSubmit={handleEvaluate}
                    isPending={evaluateMutation.isPending}
                />
            )}
        </div>
    );
};

export default HODProposals;
