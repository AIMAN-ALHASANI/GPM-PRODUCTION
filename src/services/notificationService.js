import apiClient from '../api/apiClient';

const notificationService = {
  /**
   * GET /notifications
   * Returns: NotificationResponseDto[]
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

  // ── Supervisor-specific calls ────────────────────────────────────────────────

  /** POST /Notifications/supervisor/send — Supervisor sends notification to a supervised team */
  supervisorSendNotification: async (dto) => {
    const response = await apiClient.post('/Notifications/supervisor/send', dto);
    return response.data;
  },

  /** GET /Notifications/supervisor/teams — Teams supervised by this supervisor */
  supervisorGetTeams: async () => {
    const response = await apiClient.get('/Notifications/supervisor/teams');
    return response.data;
  },

  /** GET /Notifications/supervisor/sent — Notifications sent by this supervisor */
  supervisorGetSentNotifications: async () => {
    const response = await apiClient.get('/Notifications/supervisor/sent');
    return response.data;
  },

  // ── College Admin-specific calls ─────────────────────────────────────────────

  /** POST /Notifications/admin/send — College Admin sends notification across college targets */
  adminSendNotification: async (dto) => {
    const response = await apiClient.post('/Notifications/admin/send', dto);
    return response.data;
  },

  /** GET /Notifications/admin/dropdowns — Recipients dropdown data for college */
  adminGetDropdowns: async () => {
    const response = await apiClient.get('/Notifications/admin/dropdowns');
    return response.data;
  },

  /** GET /Notifications/admin/sent — Notifications sent by this college admin */
  adminGetSentNotifications: async () => {
    const response = await apiClient.get('/Notifications/admin/sent');
    return response.data;
  },
};

export default notificationService;
