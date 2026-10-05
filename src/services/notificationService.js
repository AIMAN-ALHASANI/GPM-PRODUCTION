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
  },

  // ── HOD-specific calls ───────────────────────────────────────────────────────

  /** POST /Notifications/hod/send — HOD sends a notification */
  hodSendNotification: async (dto) => {
    const response = await apiClient.post('/Notifications/hod/send', dto);
    return response.data;
  },

  /** GET /Notifications/hod/sent — notifications sent by this HOD */
  hodGetSentNotifications: async () => {
    const response = await apiClient.get('/Notifications/hod/sent');
    return response.data;
  },

  /** GET /Notifications/hod/teams — HOD's department teams for dropdown */
  hodGetDepartmentTeams: async () => {
    const response = await apiClient.get('/Notifications/hod/teams');
    return response.data;
  },

  /** GET /Notifications/hod/supervisors — HOD's department supervisors for dropdown */
  hodGetDepartmentSupervisors: async () => {
    const response = await apiClient.get('/Notifications/hod/supervisors');
    return response.data;
  },
};

export default notificationService;

