import React from 'react';
import NotificationItem from './NotificationItem';

const NotificationList = ({ notifications, isLoading, onItemClick }) => {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-10">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
      </div>
    );
  }

  if (!notifications || notifications.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-3">
        <div className="size-12 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-300">
          <span className="material-symbols-outlined text-3xl">notifications_off</span>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400">لا توجد إشعارات</p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-slate-50 dark:divide-slate-800">
      {notifications.map((item) => (
        <NotificationItem
          key={item.notificationID ?? item.NotificationID}
          notification={item}
          variant="dropdown"
          onClick={onItemClick}
        />
      ))}
    </div>
  );
};

export default NotificationList;
