import React, { useState } from 'react';
import { useRequests, useReviewRequest } from '../../hooks/useRequests';

const HODRequests = () => {
    const { data: requests, isLoading } = useRequests();
    const reviewMutation = useReviewRequest();
    const [reviewingId, setReviewingId] = useState(null);
    const [rejectionReason, setRejectionReason] = useState('');
    const [selectedRequest, setSelectedRequest] = useState(null);

    const formatDate = (dateStr) => {
        if (!dateStr) return '---';
        const d = new Date(dateStr);
        if (isNaN(d.getTime())) return '---';
        const day = String(d.getDate()).padStart(2, '0');
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const year = d.getFullYear();
        return `${day}/${month}/${year}`;
    };

    const getRequestTypeLabel = (type) => {
        if (type === 'ChangeSupervisor') return 'تغيير المشرف';
        if (type === 'ChangeProject') return 'تغيير المشروع';
        return type;
    };

    const getRequestTitle = (request) => {
        if (!request) return '';
        if (request.requestType === 'ChangeSupervisor') {
            return 'طلب تغيير المشرف الأكاديمي';
        }
        if (request.requestType === 'ChangeProject') {
            return 'طلب تغيير عنوان المشروع';
        }
        return 'طلب تعديل';
    };

    const getRequestDescription = (request) => {
        if (!request) return '';
        if (request.requestType === 'ChangeSupervisor') {
            return request.reason || 'لا توجد أسباب إضافية للطلب.';
        }
        if (request.requestType === 'ChangeProject') {
            const titleStr = request.newProjectTitle ? `العنوان الجديد المقترح: "${request.newProjectTitle}"\n\n` : '';
            return `${titleStr}السبب: ${request.reason || 'لا يوجد سبب محدد.'}`;
        }
        return request.reason || 'لا توجد تفاصيل إضافية للطلب.';
    };

    const handleReview = (id, decision) => {
        if (decision === 'Reject' && !rejectionReason) {
            setReviewingId(id);
            return;
        }
        reviewMutation.mutate({ id, reviewData: { decision, rejectionReason: decision === 'Reject' ? rejectionReason : null } }, {
            onSuccess: () => {
                setReviewingId(null);
                setRejectionReason('');
                setSelectedRequest(null);
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

    return (
        <div className="max-w-7xl mx-auto w-full pb-10 text-right" dir="rtl">
            <div className="mb-8">
                <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">طلبات الطلاب</h1>
                <p className="text-slate-500 dark:text-slate-400 mt-2 text-lg">مراجعة والرد على طلبات تغيير المشرفين أو المشاريع.</p>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
                <table className="w-full text-right border-collapse">
                    <thead>
                        <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
                            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">نوع الطلب</th>
                            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">اسم الطالب</th>
                            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">اسم الفريق</th>
                            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">الحالة</th>
                            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">تاريخ الإنشاء</th>
                            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-left">الإجراءات</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {Array.isArray(requests) && requests.map((request) => (
                            <tr key={request.requestID} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                                <td className="px-6 py-4">
                                    <span className="px-2.5 py-0.5 text-[10px] font-bold bg-indigo-50 text-indigo-700 rounded-full border border-indigo-100">
                                        {request.requestType}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <span className="text-sm font-semibold text-slate-900 dark:text-white">
                                        {request.studentName ?? request.StudentName ?? 'غير محدد'}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <span className="text-sm font-semibold text-slate-900 dark:text-white">
                                        {request.teamName ?? request.TeamName ?? request.team?.teamName ?? request.Team?.TeamName ?? 'غير محدد'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-center">
                                    <span className={`px-2.5 py-0.5 text-[10px] font-bold rounded-full border ${
                                        request.status === 'Approved' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                                        request.status === 'Rejected' ? 'bg-red-50 text-red-700 border-red-100' :
                                        'bg-amber-50 text-amber-700 border-amber-100'
                                    }`}>
                                        {request.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-center">
                                    <span className="text-xs text-slate-500 tabular-nums">
                                        {formatDate(request.requestDate || request.createdAt)}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-left">
                                    <div className="flex items-center justify-end gap-2">
                                        <button
                                            onClick={() => setSelectedRequest(request)}
                                            className="px-4 py-1.5 bg-slate-100 dark:bg-slate-850 hover:bg-slate-200 text-slate-700 dark:text-slate-300 rounded-lg text-[10px] font-bold transition-all"
                                        >
                                            عرض التفاصيل
                                        </button>
                                        
                                        {request.status === 'Pending' && (
                                            reviewingId === request.requestID ? (
                                                <div className="flex flex-col gap-2 w-full max-w-xs text-right">
                                                    <input
                                                        type="text"
                                                        value={rejectionReason}
                                                        onChange={(e) => setRejectionReason(e.target.value)}
                                                        placeholder="سبب الرفض..."
                                                        className="w-full px-3 py-1.5 text-xs rounded-lg border border-red-200 bg-red-50 dark:bg-red-900/10 focus:ring-1 focus:ring-red-500 outline-none"
                                                    />
                                                    <div className="flex gap-2">
                                                        <button
                                                            onClick={() => handleReview(request.requestID, 'Reject')}
                                                            className="flex-1 px-3 py-1 bg-red-600 text-white rounded-lg text-[10px] font-bold"
                                                        >
                                                            تأكيد
                                                        </button>
                                                        <button
                                                            onClick={() => setReviewingId(null)}
                                                            className="px-3 py-1 bg-slate-200 text-slate-600 rounded-lg text-[10px] font-bold"
                                                        >
                                                            إلغاء
                                                        </button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <>
                                                    <button
                                                        onClick={() => handleReview(request.requestID, 'Approve')}
                                                        className="px-4 py-1.5 bg-emerald-600 text-white rounded-lg text-[10px] font-bold hover:bg-emerald-700 transition-colors"
                                                    >
                                                        قبول
                                                    </button>
                                                    <button
                                                        onClick={() => setReviewingId(request.requestID)}
                                                        className="px-4 py-1.5 bg-red-600 text-white rounded-lg text-[10px] font-bold hover:bg-red-700 transition-colors"
                                                    >
                                                        رفض
                                                    </button>
                                                </>
                                            )
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {(!Array.isArray(requests) || requests.length === 0) && (
                            <tr>
                                <td colSpan="6" className="px-6 py-10 text-center text-slate-400">لا توجد طلبات معلقة حالياً</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {selectedRequest && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden animate-fade-in-up text-right" dir="rtl">
                        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center flex-row-reverse">
                            <div className="flex items-center gap-2 text-primary">
                                <span className="material-symbols-outlined">assignment_late</span>
                                <h3 className="text-lg font-black text-slate-900 dark:text-white"> تفاصيل طلب {getRequestTypeLabel(selectedRequest.requestType)} </h3>
                            </div>
                            <button onClick={() => setSelectedRequest(null)} className="size-10 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center transition-colors">
                                <span className="material-symbols-outlined text-slate-400">close</span>
                            </button>
                        </div>
                        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800">
                                    <span className="text-xs text-slate-400 block mb-1">نوع الطلب</span>
                                    <span className="text-sm font-black text-slate-900 dark:text-white">{getRequestTypeLabel(selectedRequest.requestType)}</span>
                                </div>
                                <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800">
                                    <span className="text-xs text-slate-400 block mb-1">عنوان الطلب</span>
                                    <span className="text-sm font-black text-slate-900 dark:text-white">{getRequestTitle(selectedRequest)}</span>
                                </div>
                                <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800">
                                    <span className="text-xs text-slate-400 block mb-1">حالة الطلب</span>
                                    <span className={`inline-block px-2.5 py-0.5 text-xs font-bold rounded-full mt-1 border ${
                                        selectedRequest.status === 'Approved' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                                        selectedRequest.status === 'Rejected' ? 'bg-red-50 text-red-700 border-red-100' :
                                        'bg-amber-50 text-amber-700 border-amber-100'
                                    }`}>{selectedRequest.status}</span>
                                </div>
                                <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800">
                                    <span className="text-xs text-slate-400 block mb-1">اسم الطالب</span>
                                    <span className="text-sm font-black text-slate-900 dark:text-white">{selectedRequest.studentName ?? selectedRequest.StudentName ?? 'غير محدد'}</span>
                                </div>
                                <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800">
                                    <span className="text-xs text-slate-400 block mb-1">اسم الفريق</span>
                                    <span className="text-sm font-black text-slate-900 dark:text-white">{selectedRequest.teamName ?? selectedRequest.TeamName ?? 'غير محدد'}</span>
                                </div>
                                <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800">
                                    <span className="text-xs text-slate-400 block mb-1">تاريخ الطلب</span>
                                    <span className="text-sm font-black text-slate-900 dark:text-white tabular-nums">
                                        {formatDate(selectedRequest.requestDate || selectedRequest.createdAt)}
                                    </span>
                                </div>
                                <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800 col-span-2">
                                    <span className="text-xs text-slate-400 block mb-1">تاريخ آخر تحديث</span>
                                    <span className="text-sm font-black text-slate-900 dark:text-white tabular-nums">
                                        {formatDate(selectedRequest.lastUpdatedDate || selectedRequest.requestDate || selectedRequest.updatedAt || selectedRequest.createdAt)}
                                    </span>
                                </div>
                            </div>
                            
                            <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800">
                                <span className="text-xs text-slate-400 block mb-2">وصف الطلب</span>
                                <div 
                                    className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed max-h-48 overflow-y-auto"
                                    style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', overflowWrap: 'break-word' }}
                                >
                                    {getRequestDescription(selectedRequest)}
                                </div>
                            </div>

                            {selectedRequest.rejectionReason && (
                                <div className="p-4 bg-red-50 dark:bg-red-950/20 rounded-xl border border-red-100 dark:border-red-900">
                                    <span className="text-xs text-red-500 block mb-2">سبب الرفض</span>
                                    <div 
                                        className="text-sm text-red-700 dark:text-red-400 leading-relaxed max-h-48 overflow-y-auto"
                                        style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', overflowWrap: 'break-word' }}
                                    >
                                        {selectedRequest.rejectionReason}
                                    </div>
                                </div>
                            )}

                            {selectedRequest.status === 'Pending' && (
                                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3">
                                    {reviewingId === selectedRequest.requestID ? (
                                        <div className="flex flex-col gap-2 w-full text-right">
                                            <input
                                                type="text"
                                                value={rejectionReason}
                                                onChange={(e) => setRejectionReason(e.target.value)}
                                                placeholder="سبب الرفض..."
                                                className="w-full px-4 py-2 text-sm rounded-xl border border-red-200 bg-red-50 dark:bg-red-900/10 focus:ring-2 focus:ring-red-500 outline-none"
                                            />
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => handleReview(selectedRequest.requestID, 'Reject')}
                                                    className="flex-1 py-2 px-4 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold transition-all"
                                                >
                                                    تأكيد الرفض
                                                </button>
                                                <button
                                                    onClick={() => setReviewingId(null)}
                                                    className="py-2 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 dark:text-slate-350 rounded-xl text-xs font-bold transition-all"
                                                >
                                                    إلغاء
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <>
                                            <button
                                                onClick={() => handleReview(selectedRequest.requestID, 'Approve')}
                                                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all"
                                            >
                                                قبول الطلب
                                            </button>
                                            <button
                                                onClick={() => setReviewingId(selectedRequest.requestID)}
                                                className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold transition-all"
                                            >
                                                رفض الطلب
                                            </button>
                                        </>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default HODRequests;
