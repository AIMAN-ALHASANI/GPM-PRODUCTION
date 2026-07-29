import apiClient from '../api/apiClient';

const superAdminService = {
  getDashboardStats: async () => {
    const response = await apiClient.get('/superadmin/dashboard');
    return response.data;
  },

  getAnalytics: async () => {
    const response = await apiClient.get('/superadmin/analytics');
    return response.data;
  },

  getTopProjects: async (count = 5) => {
    const response = await apiClient.get(`/superadmin/top-projects?count=${count}`);
    return response.data;
  },

  getActivityFeed: async (count = 20) => {
    const response = await apiClient.get(`/superadmin/activity?count=${count}`);
    return response.data;
  },

  getRecentArchivedProjects: async (count = 10) => {
    const response = await apiClient.get(`/superadmin/recent-archived?count=${count}`);
    return response.data;
  },

  getCollegeStats: async () => {
    const response = await apiClient.get('/superadmin/colleges');
    return response.data;
  },

  getDepartmentStats: async () => {
    const response = await apiClient.get('/superadmin/departments');
    return response.data;
  },

  getAdmins: async () => {
    const response = await apiClient.get('/superadmin/admins');
    return response.data;
  },

  createAdmin: async (adminData) => {
    const response = await apiClient.post('/superadmin/admins', adminData);
    return response.data;
  },

  updateAdmin: async (id, adminData) => {
    const response = await apiClient.put(`/superadmin/admins/${id}`, adminData);
    return response.data;
  },

  toggleAdminStatus: async (id, isActive) => {
    const endpoint = isActive 
      ? `/superadmin/admins/${id}/activate`
      : `/superadmin/admins/${id}/deactivate`;
    const response = await apiClient.patch(endpoint);
    return response.data;
  },

  getGlobalUsers: async (params = {}) => {
    const response = await apiClient.get('/superadmin/users', { params });
    return response.data;
  },

  getPendingActions: async () => {
    const response = await apiClient.get('/superadmin/pending-actions');
    return response.data;
  },

  getSystemHealth: async () => {
    const response = await apiClient.get('/superadmin/system-health');
    return response.data;
  }
};

export default superAdminService;
