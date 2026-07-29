import React, { useState, useMemo } from 'react';
import useNotifications from '../hooks/useNotifications';
import NotificationItem from '../components/notifications/NotificationItem';

const NotificationsPage = () => {
    const { notifications, isLoading, error, refetch, markAsRead } = useNotifications({ fetchAll: true });
    const [activeFilter, setActiveFilter] = useState('all'); // 'all', 'read', 'unread'
    
    const unwrapArray = (response) => {
        if (Array.isArray(response)) return response;
        if (Array.isArray(response?.data)) return response.data;
        if (Array.isArray(response?.data?.data)) return response.data.data;
        return [];
    };

    const normalizeNotification = (item) => ({
        id: item.notificationID ?? item.NotificationID,
        notificationID: item.notificationID ?? item.NotificationID,
        message: item.message ?? item.Message ?? '',
        type: item.type ?? item.Type ?? '',
        createdAt: item.createdAt ?? item.CreatedAt ?? null,
        isRead: item.isRead ?? item.IsRead ?? false,
        raw: item,
    });

    const allNotifications = useMemo(() => 
        unwrapArray(notifications).map(normalizeNotification), 
    [notifications]);

    const filteredNotifications = useMemo(() => {
        if (activeFilter === 'read') return allNotifications.filter(n => n.isRead);
        if (activeFilter === 'unread') return allNotifications.filter(n => !n.isRead);
        return allNotifications;
    }, [allNotifications, activeFilter]);

    const handleNotificationClick = async (id, isRead) => {
        if (!id || isRead) return;
        await markAsRead(id);
    };

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                <p className="text-slate-500 font-medium animate-pulse">جاري تحميل الإشعارات...</p>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto w-full flex flex-col gap-8 pb-12">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="text-right">
                    <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">مركز الإشعارات</h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">ابقَ على اطلاع بأحدث التنبيهات والنشاطات في النظام.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button 
                        onClick={refetch}
                        className="p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-500 hover:text-primary transition-all shadow-sm"
                        title="تحديث"
                    >
                        <span className="material-symbols-outlined">refresh</span>
                    </button>
                </div>
            </div>

            {/* Filters/Tabs */}
            <div className="flex flex-wrap items-center gap-2 p-1.5 bg-slate-100 dark:bg-slate-800/50 rounded-2xl w-fit self-start">
                <button 
                    onClick={() => setActiveFilter('all')}
                    className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${
                        activeFilter === 'all' 
                        ? 'bg-white dark:bg-slate-900 text-primary shadow-sm' 
                        : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                    }`}
                >
                    <span>كل الإشعارات</span>
                    <span className={`px-2 py-0.5 rounded-md text-[10px] ${activeFilter === 'all' ? 'bg-primary/10 text-primary' : 'bg-slate-200 dark:bg-slate-700'}`}>
                        {allNotifications.length}
                    </span>
                </button>
                <button 
                    onClick={() => setActiveFilter('unread')}
                    className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${
                        activeFilter === 'unread' 
                        ? 'bg-white dark:bg-slate-900 text-primary shadow-sm' 
                        : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                    }`}
                >
                    <span>غير مقروءة</span>
                    <span className={`px-2 py-0.5 rounded-md text-[10px] ${activeFilter === 'unread' ? 'bg-primary/10 text-primary' : 'bg-slate-200 dark:bg-slate-700'}`}>
                        {allNotifications.filter(n => !n.isRead).length}
                    </span>
                </button>
                <button 
                    onClick={() => setActiveFilter('read')}
                    className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${
                        activeFilter === 'read' 
                        ? 'bg-white dark:bg-slate-900 text-primary shadow-sm' 
                        : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                    }`}
                >
                    <span>مقروءة</span>
                    <span className={`px-2 py-0.5 rounded-md text-[10px] ${activeFilter === 'read' ? 'bg-primary/10 text-primary' : 'bg-slate-200 dark:bg-slate-700'}`}>
                        {allNotifications.filter(n => n.isRead).length}
                    </span>
                </button>
            </div>

            {error && (
                <div className="bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 p-6 rounded-2xl flex items-start gap-4 animate-in slide-in-from-top duration-300">
                    <span className="material-symbols-outlined text-rose-500">error</span>
                    <div className="flex-1 text-right">
                        <p className="font-bold text-rose-700 dark:text-rose-400">فشل تحميل البيانات</p>
                        <p className="text-sm text-rose-600 dark:text-rose-500 mt-0.5">{error}</p>
                    </div>
                </div>
            )}

            {!error && filteredNotifications.length === 0 && (
                <div className="bg-white dark:bg-slate-900 rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-800 p-24 text-center flex flex-col items-center gap-4 animate-in fade-in zoom-in duration-500">
                    <div className="size-24 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center shadow-inner">
                        <span className="material-symbols-outlined text-5xl text-slate-300 dark:text-slate-600">
                            notifications_off
                        </span>
                    </div>
                    <div>
                        <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
                            لا توجد إشعارات
                        </h3>
                        <p className="text-slate-500 dark:text-slate-400 mt-1">
                            في هذا القسم
                        </p>
                    </div>
                </div>
            )}

            {/* List */}
            <div className="flex flex-col gap-4">
                {filteredNotifications.map((notification) => (
                    <NotificationItem 
                        key={notification.id} 
                        notification={notification}
                        variant="page"
                        onClick={handleNotificationClick}
                    />
                ))}
            </div>
        </div>
    );
};

export default NotificationsPage;
