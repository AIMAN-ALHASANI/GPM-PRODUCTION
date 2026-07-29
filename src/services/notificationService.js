import apiClient from '../api/apiClient';

const notificationService = {
  /**
   * GET /notifications
   * Returns: NotificationResponseDto[]
   * Actual fields: { NotificationID, Message, Type, CreatedAt }
   *
   * NOTE: isRead, title, id DO NOT EXIST in the backend response.
   * NOTE: mark-as-read endpoints (PATCH /notifications/:id/read,
   *       PATCH /notifications/read-all) DO NOT EXIST in the backend.
   */
  getMyNotifications: async () => {
    const response = await apiClient.get('/Notifications');
    return response.data;
  },

  getAllNotifications: async () => {
    const response = await apiClient.get('/Notifications/all');
    return response.data;
  },

  markAsRead: async (id) => {
    const response = await apiClient.put(`/Notifications/${id}/read`);
    return response.data;
  },

  getUnreadCount: async () => {
    const response = await apiClient.get('/Notifications/unread-count');
    return response.data;
  }
};

export default notificationService;

