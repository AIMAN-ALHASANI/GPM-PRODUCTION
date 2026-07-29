import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useProposal, useEvaluateProposal } from '../../hooks/useProposals';
import toast from 'react-hot-toast';

const HODProposalDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { data: proposal, isLoading, isError } = useProposal(id);
    const evaluateMutation = useEvaluateProposal();
    const [feedback, setFeedback] = useState('');
    const [decision, setDecision] = useState('Approved');

    // Sync feedback/decision when proposal loads
    React.useEffect(() => {
        if (proposal) {
            setFeedback(proposal.feedback || '');
            setDecision(proposal.status === 'Pending' ? 'Approved' : proposal.status);
        }
    }, [proposal]);

    const handleEvaluate = () => {
        if (!feedback.trim()) {
            toast.error('يرجى إضافة التغذية الراجعة');
            return;
        }

        evaluateMutation.mutate({
            id,
            evaluationData: { 
                Decision: decision, 
                Feedback: feedback 
            }
        }, {
            onSuccess: () => {
                navigate('/hod/proposals');
            }
        });
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (isError || !proposal) {
        return (
            <div className="max-w-4xl mx-auto w-full py-20 text-center" dir="rtl">
                <span className="material-symbols-outlined text-6xl text-red-100 mb-4">error</span>
                <p className="text-slate-500 font-bold">تعذر تحميل تفاصيل المقترح</p>
                <button onClick={() => navigate('/hod/proposals')} className="mt-4 text-primary font-bold hover:underline">العودة للمقترحات</button>
            </div>
        );
    }

    const DetailItem = ({ label, value, isStatus = false, isLongText = false, isLink = false }) => (
        <div className="space-y-1">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{label}</p>
            {isStatus ? (
                <span className={`inline-block px-2.5 py-1 text-[10px] font-bold rounded-full border ${
                    value === 'Approved' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                    value === 'Rejected' ? 'bg-red-50 text-red-700 border-red-100' :
                    'bg-amber-50 text-amber-700 border-amber-100'
                }`}>
                     {value || 'غير محدد'}
                </span>
            ) : isLink ? (
                <a href={value} target="_blank" rel="noopener noreferrer" className="text-sm font-bold text-primary hover:underline flex items-center gap-1 justify-end">
                    <span className="material-symbols-outlined text-sm">link</span>
                    {value || 'لا يوجد ملف'}
                </a>
            ) : isLongText ? (
                <div className="max-h-72 overflow-y-auto bg-slate-50 dark:bg-slate-800/50 p-6 rounded-2xl border border-slate-100 dark:border-slate-800" style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', overflowWrap: 'break-word' }}>
                  <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                      {value || 'لا يوجد وصف متاح'}
                  </p>
                </div>
            ) : (
                <p className="text-sm font-bold text-slate-900 dark:text-white">{value ?? 'غير متوفر'}</p>
            )}
        </div>
    );

    return (
        <div className="max-w-5xl mx-auto w-full pb-10 text-right" dir="rtl">
            <div className="mb-8">
                <button 
                    onClick={() => navigate('/hod/proposals')}
                    className="flex items-center gap-2 text-slate-500 hover:text-primary transition-colors text-sm font-bold mb-4"
                >
                    <span className="material-symbols-outlined">arrow_forward</span>
                    العودة للمقترحات
                </button>
                <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">{proposal.title}</h1>
                <p className="text-slate-500 dark:text-slate-400 mt-2 text-lg">تفاصيل وتقييم مقترح المشروع.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-8">
                        <div>
                            <h3 className="text-xl font-bold mb-4 text-slate-900 dark:text-white">وصف المشروع</h3>
                            <DetailItem label="" value={proposal.description} isLongText />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8 border-t border-slate-100 dark:border-slate-800">
                            <DetailItem label="مقدم المقترح" value={proposal.submittedByUser?.fullName} />
                            <DetailItem label="البريد الإلكتروني" value={proposal.submittedByUser?.email} />
                            <DetailItem label="تاريخ التقديم" value={new Date(proposal.submissionDate).toLocaleDateString('ar-EG')} />
                            <DetailItem label="رابط الملف" value={proposal.filePath} isLink />
                            <DetailItem label="الحالة الحالية" value={proposal.status} isStatus />
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
                        <h3 className="text-xl font-bold mb-6 text-slate-900 dark:text-white">تقييم اللجنة</h3>
                        
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">القرار</label>
                                <select 
                                    value={decision} 
                                    onChange={(e) => setDecision(e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 text-sm font-bold focus:ring-2 focus:ring-primary/50 outline-none transition-all"
                                >
                                    <option value="Approved">قبول (Approved)</option>
                                    <option value="Rejected">رفض (Rejected)</option>
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">التغذية الراجعة</label>
                                <textarea
                                    value={feedback}
                                    onChange={(e) => setFeedback(e.target.value)}
                                    placeholder="اكتب ملاحظاتك..."
                                    rows="5"
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 text-sm focus:ring-2 focus:ring-primary/50 outline-none transition-all resize-none"
                                ></textarea>
                            </div>

                            <button
                                onClick={handleEvaluate}
                                disabled={evaluateMutation.isPending}
                                className="w-full py-4 bg-primary text-white rounded-2xl font-black text-sm shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:scale-100"
                            >
                                {evaluateMutation.isPending ? 'جاري الحفظ...' : 'اعتماد التقييم'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HODProposalDetails;
