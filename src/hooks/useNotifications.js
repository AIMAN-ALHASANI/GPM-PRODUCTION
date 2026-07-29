import { useState, useEffect, useCallback } from 'react';
import notificationService from '../services/notificationService';

/**
 * Fetches notifications from GET /Notifications.
 *
 * Real backend fields per item:
 *   { notificationID, message, type, createdAt }
 *
 * There is NO isRead field and NO mark-as-read endpoint on the backend.
 * The hook exposes the raw list so the UI can render it directly.
 */
const useNotifications = (options = { fetchAll: false }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchNotifications = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [data, countData] = await Promise.all([
        options.fetchAll 
          ? notificationService.getAllNotifications()
          : notificationService.getMyNotifications(),
        notificationService.getUnreadCount()
      ]);
      setNotifications(Array.isArray(data) ? data : []);
      setUnreadCount(countData?.count || 0);
    } catch (err) {
      console.error("Notification load error:", err);
      setError('Unable to load notifications');
      setNotifications([]);
      setUnreadCount(0);
    } finally {
      setIsLoading(false);
    }
  }, [options.fetchAll]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const markAsRead = async (id) => {
    try {
      await notificationService.markAsRead(id);
      setUnreadCount(prev => Math.max(prev - 1, 0));
      setNotifications(prev => 
        options.fetchAll 
          ? prev.map(n => (n.notificationID === id || n.NotificationID === id) ? { ...n, isRead: true } : n)
          : prev.filter(n => n.notificationID !== id && n.NotificationID !== id)
      );
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
    }
  };

  return {
    notifications,
    count: unreadCount,
    isLoading,
    error,
    refetch: fetchNotifications,
    markAsRead
  };
};

export default useNotifications;
