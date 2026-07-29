import React from 'react';
import { formatDateTime } from '../../utils/formatNumber';

// Format relative time for dropdown
const relativeTime = (dateStr) => {
  if (!dateStr) return '';
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1)  return 'الآن';
  if (mins < 60) return `منذ ${mins} دقيقة`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24)  return `منذ ${hrs} ساعة`;
  const days = Math.floor(hrs / 24);
  return `منذ ${days} يوم`;
};

const getTypeStyles = (type) => {
  switch (type?.toLowerCase()) {
    case 'report':
      return {
        icon: 'summarize',
        bg: 'bg-blue-50 dark:bg-blue-900/20',
        text: 'text-blue-600 dark:text-blue-400',
        border: 'border-blue-100 dark:border-blue-800'
      };
    case 'project':
      return {
        icon: 'folder',
        bg: 'bg-emerald-50 dark:bg-emerald-900/20',
        text: 'text-emerald-600 dark:text-emerald-400',
        border: 'border-emerald-100 dark:border-emerald-800'
      };
    case 'meeting':
      return {
        icon: 'event',
        bg: 'bg-rose-50 dark:bg-rose-900/20',
        text: 'text-rose-600 dark:text-rose-400',
        border: 'border-rose-100 dark:border-rose-800'
      };
    case 'proposal':
      return {
        icon: 'lightbulb',
        bg: 'bg-indigo-50 dark:bg-indigo-900/20',
        text: 'text-indigo-600 dark:text-indigo-400',
        border: 'border-indigo-100 dark:border-indigo-800'
      };
    case 'team':
      return {
        icon: 'group',
        bg: 'bg-purple-50 dark:bg-purple-900/20',
        text: 'text-purple-600 dark:text-purple-400',
        border: 'border-purple-100 dark:border-purple-800'
      };
    case 'message':
    case 'messages':
      return {
        icon: 'mail',
        bg: 'bg-amber-50 dark:bg-amber-900/20',
        text: 'text-amber-600 dark:text-amber-400',
        border: 'border-amber-100 dark:border-amber-800'
      };
    default:
      return {
        icon: 'notifications',
        bg: 'bg-slate-50 dark:bg-slate-800',
        text: 'text-slate-600 dark:text-slate-400',
        border: 'border-slate-200 dark:border-slate-700'
      };
  }
};

const NotificationItem = ({ notification, variant = 'page', onClick }) => {
  const id = notification.notificationID ?? notification.NotificationID;
  const type = notification.type ?? notification.Type ?? '';
  const message = notification.message ?? notification.Message ?? '';
  const createdAt = notification.createdAt ?? notification.CreatedAt ?? null;
  const isRead = notification.isRead ?? notification.IsRead ?? false;

  const styles = getTypeStyles(type);

  if (variant === 'dropdown') {
    return (
      <div
        onClick={() => onClick && onClick(id)}
        className="w-full text-right px-4 py-3.5 flex items-start gap-3 transition-colors relative bg-primary/[0.02] dark:bg-primary/[0.05] hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
      >
        {!isRead && (
          <div className="absolute top-4 right-1 size-1.5 bg-primary rounded-full animate-pulse" />
        )}

        {/* Type icon */}
        <div className={`shrink-0 w-9 h-9 rounded-xl flex items-center justify-center mt-0.5 ${styles.bg} ${styles.text} shadow-sm`}>
          <span className="material-symbols-outlined text-[18px]">
            {styles.icon}
          </span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            {type && (
              <span className={`text-[9px] font-black uppercase tracking-widest ${styles.text}`}>
                {type}
              </span>
            )}
            <span className="text-[9px] text-slate-400 dark:text-slate-500 font-medium">
              {relativeTime(createdAt)}
            </span>
          </div>
          <p className="text-xs leading-relaxed mt-1 font-bold text-slate-900 dark:text-white">
            {message}
          </p>
        </div>
      </div>
    );
  }

  // Page layout
  return (
    <div 
      onClick={() => onClick && onClick(id, isRead)}
      className={`group flex items-start gap-6 p-6 rounded-3xl border transition-all duration-300 relative overflow-hidden ${
        isRead 
          ? 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 opacity-80 cursor-default' 
          : `bg-white dark:bg-slate-900 border-primary/20 shadow-md ${styles.border} ring-1 ring-primary/5 cursor-pointer`
      }`}
    >
      {/* Unread Indicator */}
      {!isRead && (
        <div className="absolute top-0 right-0 p-2">
          <div className="size-3 bg-primary rounded-full animate-pulse shadow-lg shadow-primary/50"></div>
        </div>
      )}

      <div className={`size-16 min-w-[64px] rounded-2xl ${styles.bg} ${styles.text} flex items-center justify-center shadow-inner transition-transform duration-500 ${!isRead ? 'scale-110' : 'group-hover:scale-105'}`}>
        <span className="material-symbols-outlined text-4xl">{styles.icon}</span>
      </div>

      <div className="flex-1 flex flex-col gap-2 min-w-0">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className={`text-[10px] uppercase font-black tracking-[0.15em] ${styles.text}`}>
              {type || 'إشعار نظام'}
            </span>
            {!isRead && (
              <span className="px-2 py-0.5 bg-primary text-white text-[9px] font-black rounded uppercase tracking-wider">جديد</span>
            )}
          </div>
          <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500 flex items-center gap-1.5 whitespace-nowrap">
            <span className="material-symbols-outlined text-sm">schedule</span>
            {createdAt ? formatDateTime(createdAt, {
              year: 'numeric', month: 'long', day: 'numeric',
              hour: '2-digit', minute: '2-digit'
            }) : 'تاريخ غير متوفر'}
          </span>
        </div>
        <h3 className={`text-xl leading-relaxed ${isRead ? 'font-semibold text-slate-600 dark:text-slate-300' : 'font-black text-slate-900 dark:text-white'}`}>
          {message}
        </h3>
        <div className="mt-3 pt-3 border-t border-slate-50 dark:border-slate-800/50 flex items-center justify-end">
          <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <span className="material-symbols-outlined text-slate-400 text-lg hover:text-primary">visibility</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationItem;
