import React, { useState, useMemo, useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import useNotifications from '../../hooks/useNotifications';
import NotificationItem from '../../components/notifications/NotificationItem';
import { formatDate } from '../../utils/formatNumber';
import notificationService from '../../services/notificationService';
import AdminCreateNotificationModal from '../../components/admin/AdminCreateNotificationModal';

// ── Recipient type badges for Admin sent list ─────────────────────────────────
const ADMIN_RECIPIENT_META = {
    EntireCollege: { label: 'الكلية بأكملها',        icon: 'account_balance', bg: 'bg-blue-100 text-blue-700' },
    Department:    { label: 'قسم محدد',             icon: 'corporate_fare',  bg: 'bg-indigo-100 text-indigo-700' },
    AllSupervisors:{ label: 'جميع المشرفين',        icon: 'supervisor_account', bg: 'bg-amber-100 text-amber-700' },
    Supervisor:    { label: 'مشرف محدد',            icon: 'person',          bg: 'bg-purple-100 text-purple-700' },
    AllTeams:      { label: 'جميع الفرق',           icon: 'groups',          bg: 'bg-emerald-100 text-emerald-700' },
    Team:          { label: 'فريق محدد',            icon: 'group',           bg: 'bg-teal-100 text-teal-700' },
    AllHods:       { label: 'جميع رؤساء الأقسام',  icon: 'badge',           bg: 'bg-rose-100 text-rose-700' },
    HOD:           { label: 'رئيس قسم محدد',        icon: 'shield_person',   bg: 'bg-pink-100 text-pink-700' },
    Unknown:       { label: 'مستلم عام',            icon: 'help',            bg: 'bg-slate-100 text-slate-600' },
};

const RecipientBadge = ({ type }) => {
    const meta = ADMIN_RECIPIENT_META[type] || ADMIN_RECIPIENT_META.Unknown;
    return (
        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${meta.bg}`}>
            <span className="material-symbols-outlined text-sm">{meta.icon}</span>
            {meta.label}
        </span>
    );
};

const SentNotificationCard = ({ notification }) => {
    const n = {
        notificationID: notification?.notificationID ?? notification?.NotificationID,
        message:        notification?.message        ?? notification?.Message        ?? '',
        recipientType:  notification?.recipientType  ?? notification?.RecipientType  ?? 'Unknown',
        recipientName:  notification?.recipientName  ?? notification?.RecipientName  ?? '—',
        createdAt:      notification?.createdAt      ?? notification?.CreatedAt      ?? null,
    };

    return (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all p-5 flex flex-col gap-3">
            <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2 text-slate-400 text-[10px] font-medium shrink-0">
                    <span className="material-symbols-outlined text-sm">schedule</span>
                    {n.createdAt ? formatDate(n.createdAt) : '—'}
                </div>
                <RecipientBadge type={n.recipientType} />
            </div>

            <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 leading-relaxed">
                {n.message}
            </p>

            <div className="flex items-center gap-2 text-xs text-slate-500">
                <span className="material-symbols-outlined text-sm">near_me</span>
                <span>المستهدف: <span className="font-bold text-slate-700 dark:text-slate-300">{n.recipientName}</span></span>
            </div>
        </div>
    );
};

const AdminNotificationsPage = () => {
    const queryClient = useQueryClient();
    const [mainTab, setMainTab] = useState('sent'); // 'sent' | 'received'
    const [receivedFilter, setReceivedFilter] = useState('all'); // 'all' | 'unread' | 'read'
    const [isModalOpen, setIsModalOpen] = useState(false);

    // ── Sent Notifications (Admin sent across college) ───────────────────────
    const {
        data: rawSent,
        isLoading: sentLoading,
        isError: sentError,
        refetch: refetchSent
    } = useQuery({
        queryKey: ['admin-sent-notifications'],
        queryFn: notificationService.adminGetSentNotifications,
        staleTime: 30_000,
    });

    const unwrapArray = (response) => {
        if (!response) return [];
        if (Array.isArray(response)) return response;
        if (Array.isArray(response?.data)) return response.data;
        if (Array.isArray(response?.data?.data)) return response.data.data;
        return [];
    };

    const sentNotifications = useMemo(() => {
        try {
            return unwrapArray(rawSent).filter(Boolean);
        } catch {
            return [];
        }
    }, [rawSent]);

    // ── Received notifications (system alerts for admin) ─────────────────────
    const {
        notifications: rawReceived,
        isLoading: receivedLoading,
        error: receivedError,
        refetch: refetchReceived,
        markAsRead
    } = useNotifications({ fetchAll: true });

    const normalizeNotification = (item) => {
        if (!item) return null;
        return {
            id: item.notificationID ?? item.NotificationID ?? Math.random(),
            notificationID: item.notificationID ?? item.NotificationID,
            message: item.message ?? item.Message ?? '',
            type: item.type ?? item.Type ?? '',
            createdAt: item.createdAt ?? item.CreatedAt ?? null,
            isRead: item.isRead ?? item.IsRead ?? false,
            raw: item,
        };
    };

    const receivedNotifications = useMemo(() => {
        try {
            return unwrapArray(rawReceived).map(normalizeNotification).filter(Boolean);
        } catch {
            return [];
        }
    }, [rawReceived]);

    const filteredReceived = useMemo(() => {
        if (receivedFilter === 'read') return receivedNotifications.filter(n => n.isRead);
        if (receivedFilter === 'unread') return receivedNotifications.filter(n => !n.isRead);
        return receivedNotifications;
    }, [receivedNotifications, receivedFilter]);

    const handleCreateSuccess = useCallback(() => {
        queryClient.invalidateQueries({ queryKey: ['admin-sent-notifications'] });
        setMainTab('sent');
    }, [queryClient]);

    return (
        <div className="flex flex-col gap-6 w-full max-w-5xl mx-auto pb-12" dir="rtl">
            {/* Breadcrumb */}
            <nav className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                <Link className="hover:text-primary" to="/admin/dashboard">الرئيسية</Link>
                <span className="material-symbols-outlined text-sm">chevron_right</span>
                <span className="text-slate-900 dark:text-white font-medium">إدارة الإشعارات</span>
            </nav>

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex flex-col gap-1">
                    <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                        إدارة إشعارات الكلية
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 text-sm">
                        إرسال الإعلانات والتوجيهات الرسمية على مستوى أقسام ومشرفي وفرق الكلية.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => {
                            if (mainTab === 'sent') refetchSent();
                            else refetchReceived();
                        }}
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
                        إنشاء إشعار للكلية
                    </button>
                </div>
            </div>

            {/* Main Tabs (Sent vs Received) */}
            <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
                <button
                    onClick={() => setMainTab('sent')}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${
                        mainTab === 'sent'
                            ? 'bg-primary text-white shadow-md shadow-primary/20'
                            : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                >
                    <span className="material-symbols-outlined text-lg">outbox</span>
                    <span>الإشعارات المُرسَلة من الكلية</span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-black ${
                        mainTab === 'sent' ? 'bg-white/20 text-white' : 'bg-slate-200 dark:bg-slate-700'
                    }`}>
                        {sentNotifications.length}
                    </span>
                </button>

                <button
                    onClick={() => setMainTab('received')}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${
                        mainTab === 'received'
                            ? 'bg-primary text-white shadow-md shadow-primary/20'
                            : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                >
                    <span className="material-symbols-outlined text-lg">inbox</span>
                    <span>الإشعارات الواردة</span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-black ${
                        mainTab === 'received' ? 'bg-white/20 text-white' : 'bg-slate-200 dark:bg-slate-700'
                    }`}>
                        {receivedNotifications.length}
                    </span>
                </button>
            </div>

            {/* Tab 1: Sent Notifications */}
            {mainTab === 'sent' && (
                <div className="flex flex-col gap-4">
                    {sentLoading && (
                        <div className="flex flex-col items-center justify-center min-h-[250px] gap-4">
                            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary" />
                            <p className="text-slate-500 font-medium">جاري تحميل إشعارات الكلية المُرسَلة...</p>
                        </div>
                    )}

                    {sentError && (
                        <div className="bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 p-6 rounded-2xl flex items-start gap-4">
                            <span className="material-symbols-outlined text-rose-500 text-2xl">error</span>
                            <div>
                                <p className="font-bold text-rose-700 dark:text-rose-400">فشل تحميل الإشعارات المُرسَلة</p>
                                <button onClick={() => refetchSent()} className="mt-2 text-sm text-rose-600 hover:underline">
                                    إعادة المحاولة
                                </button>
                            </div>
                        </div>
                    )}

                    {!sentLoading && !sentError && sentNotifications.length === 0 && (
                        <div className="bg-white dark:bg-slate-900 rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-800 p-16 text-center flex flex-col items-center gap-4">
                            <span className="material-symbols-outlined text-5xl text-slate-300 dark:text-slate-600">campaign</span>
                            <div>
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white">لم تقم بإرسال أي إشعار للكلية بعد</h3>
                                <p className="text-slate-400 text-sm mt-1">يمكنك إرسال إشعار لكافة أقسام الكلية أو تحديد مستهدفين معينين.</p>
                            </div>
                            <button
                                onClick={() => setIsModalOpen(true)}
                                className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-xl font-bold text-sm hover:bg-primary/90 transition-all mt-2"
                            >
                                <span className="material-symbols-outlined text-lg">add</span>
                                إنشاء إشعار للكلية
                            </button>
                        </div>
                    )}

                    {!sentLoading && !sentError && sentNotifications.length > 0 && (
                        <div className="flex flex-col gap-4">
                            {sentNotifications.map(n => (
                                <SentNotificationCard
                                    key={n.notificationID ?? n.NotificationID}
                                    notification={n}
                                />
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Tab 2: Received Notifications */}
            {mainTab === 'received' && (
                <div className="flex flex-col gap-6">
                    {/* Sub-filters */}
                    <div className="flex flex-wrap items-center gap-2 p-1.5 bg-slate-100 dark:bg-slate-800/50 rounded-2xl w-fit">
                        <button
                            onClick={() => setReceivedFilter('all')}
                            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                                receivedFilter === 'all'
                                    ? 'bg-white dark:bg-slate-900 text-primary shadow-sm'
                                    : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                            }`}
                        >
                            <span>الكل</span>
                            <span className="px-1.5 py-0.5 rounded-md text-[10px] bg-slate-200 dark:bg-slate-700">
                                {receivedNotifications.length}
                            </span>
                        </button>
                        <button
                            onClick={() => setReceivedFilter('unread')}
                            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                                receivedFilter === 'unread'
                                    ? 'bg-white dark:bg-slate-900 text-primary shadow-sm'
                                    : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                            }`}
                        >
                            <span>غير مقروءة</span>
                            <span className="px-1.5 py-0.5 rounded-md text-[10px] bg-slate-200 dark:bg-slate-700">
                                {receivedNotifications.filter(n => !n.isRead).length}
                            </span>
                        </button>
                        <button
                            onClick={() => setReceivedFilter('read')}
                            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                                receivedFilter === 'read'
                                    ? 'bg-white dark:bg-slate-900 text-primary shadow-sm'
                                    : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                            }`}
                        >
                            <span>مقروءة</span>
                            <span className="px-1.5 py-0.5 rounded-md text-[10px] bg-slate-200 dark:bg-slate-700">
                                {receivedNotifications.filter(n => n.isRead).length}
                            </span>
                        </button>
                    </div>

                    {receivedLoading && (
                        <div className="flex flex-col items-center justify-center min-h-[250px] gap-4">
                            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary" />
                            <p className="text-slate-500 font-medium">جاري تحميل الإشعارات الواردة...</p>
                        </div>
                    )}

                    {receivedError && (
                        <div className="bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 p-6 rounded-2xl flex items-start gap-4">
                            <span className="material-symbols-outlined text-rose-500 text-2xl">error</span>
                            <div>
                                <p className="font-bold text-rose-700 dark:text-rose-400">فشل تحميل الإشعارات الواردة</p>
                                <button onClick={() => refetchReceived()} className="mt-2 text-sm text-rose-600 hover:underline">
                                    إعادة المحاولة
                                </button>
                            </div>
                        </div>
                    )}

                    {!receivedLoading && !receivedError && filteredReceived.length === 0 && (
                        <div className="bg-white dark:bg-slate-900 rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-800 p-16 text-center flex flex-col items-center gap-4">
                            <span className="material-symbols-outlined text-5xl text-slate-300 dark:text-slate-600">notifications_none</span>
                            <div>
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white">لا توجد إشعارات واردة</h3>
                                <p className="text-slate-400 text-sm mt-1">ليس لديك تنبيهات واردة حالياً.</p>
                            </div>
                        </div>
                    )}

                    {!receivedLoading && !receivedError && filteredReceived.length > 0 && (
                        <div className="flex flex-col gap-3">
                            {filteredReceived.map(item => (
                                <NotificationItem
                                    key={item.id}
                                    notification={item}
                                    variant="page"
                                    onClick={(id) => {
                                        if (id && !item.isRead) markAsRead(id);
                                    }}
                                />
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Create Notification Modal */}
            <AdminCreateNotificationModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={handleCreateSuccess}
            />
        </div>
    );
};

export default AdminNotificationsPage;
