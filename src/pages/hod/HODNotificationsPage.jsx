import React, { useState, useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { formatDate } from '../../utils/formatNumber';
import notificationService from '../../services/notificationService';
import HODCreateNotificationModal from '../../components/hod/HODCreateNotificationModal';

// ── Recipient type badge ──────────────────────────────────────────────────────
const RECIPIENT_META = {
    Department:    { label: 'القسم بأكمله',    icon: 'corporate_fare',  bg: 'bg-indigo-100 text-indigo-700' },
    AllSupervisors:{ label: 'جميع المشرفين',    icon: 'supervisor_account', bg: 'bg-amber-100 text-amber-700' },
    Team:          { label: 'فريق',             icon: 'groups',          bg: 'bg-emerald-100 text-emerald-700' },
    Supervisor:    { label: 'مشرف',             icon: 'person',          bg: 'bg-purple-100 text-purple-700' },
    Unknown:       { label: 'غير معروف',        icon: 'help',            bg: 'bg-slate-100 text-slate-600' },
};

const RecipientBadge = ({ type }) => {
    const meta = RECIPIENT_META[type] || RECIPIENT_META.Unknown;
    return (
        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${meta.bg}`}>
            <span className="material-symbols-outlined text-sm">{meta.icon}</span>
            {meta.label}
        </span>
    );
};

// ── Sent notification card ────────────────────────────────────────────────────
const SentNotificationCard = ({ notification }) => {
    const n = {
        notificationID: notification.notificationID ?? notification.NotificationID,
        message:        notification.message        ?? notification.Message        ?? '',
        recipientType:  notification.recipientType  ?? notification.RecipientType  ?? 'Unknown',
        recipientName:  notification.recipientName  ?? notification.RecipientName  ?? '—',
        createdAt:      notification.createdAt      ?? notification.CreatedAt      ?? null,
    };

    return (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all p-5 flex flex-col gap-3">
            {/* Top row */}
            <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2 text-slate-400 text-[10px] font-medium shrink-0">
                    <span className="material-symbols-outlined text-sm">schedule</span>
                    {n.createdAt ? formatDate(n.createdAt) : '—'}
                </div>
                <RecipientBadge type={n.recipientType} />
            </div>

            {/* Message */}
            <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 leading-relaxed">
                {n.message}
            </p>

            {/* Recipient name */}
            <div className="flex items-center gap-2 text-xs text-slate-500">
                <span className="material-symbols-outlined text-sm">near_me</span>
                <span>أُرسل إلى: <span className="font-bold text-slate-700 dark:text-slate-300">{n.recipientName}</span></span>
            </div>
        </div>
    );
};

// ── Main page ─────────────────────────────────────────────────────────────────
const HODNotificationsPage = () => {
    const queryClient = useQueryClient();
    const [isModalOpen, setIsModalOpen] = useState(false);

    const { data: rawData, isLoading, isError, refetch } = useQuery({
        queryKey: ['hod-sent-notifications'],
        queryFn:  notificationService.hodGetSentNotifications,
        staleTime: 30_000,
    });

    // Unwrap ApiResponse<List<SentNotificationDto>>
    const notifications = (() => {
        if (Array.isArray(rawData))            return rawData;
        if (Array.isArray(rawData?.data))      return rawData.data;
        if (Array.isArray(rawData?.data?.data)) return rawData.data.data;
        return [];
    })();

    const handleSuccess = useCallback(() => {
        queryClient.invalidateQueries({ queryKey: ['hod-sent-notifications'] });
    }, [queryClient]);

    return (
        <div className="flex flex-col gap-6 w-full" dir="rtl">

            {/* Breadcrumb */}
            <nav className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                <Link className="hover:text-primary" to="/hod/dashboard">الرئيسية</Link>
                <span className="material-symbols-outlined text-sm">chevron_right</span>
                <span className="text-slate-900 dark:text-white font-medium">الإشعارات</span>
            </nav>

            <div className="max-w-4xl mx-auto w-full flex flex-col gap-6">

                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex flex-col gap-1">
                        <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                            الإشعارات المُرسَلة
                        </h1>
                        <p className="text-slate-500 dark:text-slate-400 text-base">
                            إدارة وإرسال الإشعارات إلى أعضاء القسم.
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => refetch()}
                            className="p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-500 hover:text-primary transition-all shadow-sm"
                            title="تحديث"
                        >
                            <span className="material-symbols-outlined">refresh</span>
                        </button>
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-xl font-bold text-sm hover:bg-primary/90 transition-all shadow-lg shadow-primary/20"
                        >
                            <span className="material-symbols-outlined text-lg">add</span>
                            إنشاء إشعار
                        </button>
                    </div>
                </div>

                {/* Stats strip */}
                <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-4 flex items-center gap-6">
                    <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary text-xl">notifications_active</span>
                        <div>
                            <p className="text-2xl font-black text-slate-900 dark:text-white tabular-nums">{notifications.length}</p>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">إجمالي المُرسَلة</p>
                        </div>
                    </div>
                </div>

                {/* Loading */}
                {isLoading && (
                    <div className="flex flex-col items-center justify-center min-h-[300px] gap-4">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
                        <p className="text-slate-500 font-medium">جاري تحميل الإشعارات...</p>
                    </div>
                )}

                {/* Error */}
                {isError && (
                    <div className="bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 p-6 rounded-2xl flex items-start gap-4">
                        <span className="material-symbols-outlined text-rose-500 text-2xl">error</span>
                        <div className="text-right">
                            <p className="font-bold text-rose-700 dark:text-rose-400">فشل تحميل الإشعارات</p>
                            <button
                                onClick={() => refetch()}
                                className="mt-2 text-sm text-rose-600 hover:underline"
                            >
                                إعادة المحاولة
                            </button>
                        </div>
                    </div>
                )}

                {/* Empty state */}
                {!isLoading && !isError && notifications.length === 0 && (
                    <div className="bg-white dark:bg-slate-900 rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-800 p-20 text-center flex flex-col items-center gap-4">
                        <div className="size-20 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center">
                            <span className="material-symbols-outlined text-4xl text-slate-300 dark:text-slate-600">notifications_off</span>
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white">لا توجد إشعارات مُرسَلة</h3>
                            <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">ابدأ بإنشاء أول إشعار للقسم.</p>
                        </div>
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="flex items-center gap-2 px-6 py-2.5 bg-primary text-white rounded-xl font-bold text-sm hover:bg-primary/90 transition-all mt-2"
                        >
                            <span className="material-symbols-outlined text-lg">add</span>
                            إنشاء إشعار
                        </button>
                    </div>
                )}

                {/* Notifications list */}
                {!isLoading && !isError && notifications.length > 0 && (
                    <div className="flex flex-col gap-4">
                        {notifications.map((n) => (
                            <SentNotificationCard
                                key={n.notificationID ?? n.NotificationID}
                                notification={n}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* Create Notification Modal */}
            <HODCreateNotificationModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={handleSuccess}
            />
        </div>
    );
};

export default HODNotificationsPage;
