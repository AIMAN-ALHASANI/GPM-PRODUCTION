import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import useNotifications from '../../hooks/useNotifications';
import NotificationBadge from './NotificationBadge';
import NotificationList from './NotificationList';

const NotificationDropdown = () => {
  const location = useLocation();
  const basePath = '/' + location.pathname.split('/')[1];
  const notificationsPath = `${basePath}/notifications`;

  const { notifications, count, isLoading, markAsRead } = useNotifications({ fetchAll: false });
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const unreadCount = count;
  const preview = notifications.slice(0, 5);

  const handleNotificationClick = async (id) => {
    await markAsRead(id);
  };

  return (
    <div className="relative" ref={containerRef}>
      {/* Bell Button */}
      <button
        onClick={() => setOpen(prev => !prev)}
        className={`p-2 rounded-lg transition-colors relative block ${
          open
            ? 'bg-primary/10 text-primary'
            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
        }`}
        aria-label="الإشعارات"
      >
        <span className="material-symbols-outlined text-xl">notifications</span>
        <NotificationBadge count={unreadCount} />
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute left-0 mt-2 w-80 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-slate-800">
            <p className="text-sm font-bold text-slate-900 dark:text-white">
              الإشعارات
              {unreadCount > 0 && (
                <span className="mr-2 inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-primary/10 text-primary">
                  {unreadCount} جديدة
                </span>
              )}
            </p>
          </div>

          {/* Body List */}
          <div className="max-h-80 overflow-y-auto">
            <NotificationList
              notifications={preview}
              isLoading={isLoading}
              onItemClick={handleNotificationClick}
            />
          </div>

          {/* Footer */}
          <div className="px-4 py-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50">
            <Link
              to={notificationsPath}
              onClick={() => setOpen(false)}
              className="text-xs font-black text-primary hover:text-primary/80 transition-colors flex items-center justify-center gap-1"
            >
              عرض جميع الإشعارات
              <span className="material-symbols-outlined text-[14px]">arrow_back</span>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;
