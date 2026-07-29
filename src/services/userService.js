import apiClient from '../api/apiClient';

const userService = {
  getUsers: async (params) => {
    const response = await apiClient.get('/users', { params });
    return response.data; // Note: returns { data: PaginatedResult, message: string }
  },

  getUserById: async (id) => {
    const response = await apiClient.get(`/users/${id}`);
    return response.data;
  },

  createStudent: async (userData) => {
    const response = await apiClient.post('/users/students', userData);
    return response.data;
  },

  createSupervisor: async (userData) => {
    const response = await apiClient.post('/users/supervisors', userData);
    return response.data;
  },

  createHeadOfDepartment: async (userData) => {
    const response = await apiClient.post('/users/head-of-departments', userData);
    return response.data;
  },

  updateUser: async (id, userData) => {
    const response = await apiClient.put(`/users/update/${id}`, userData);
    return response.data;
  },

  activateUser: async (id) => {
    const response = await apiClient.patch(`/users/${id}/activate`);
    return response.data;
  },

  deactivateUser: async (id) => {
    const response = await apiClient.patch(`/users/${id}/deactivate`);
    return response.data;
  },

  changePassword: async (data) => {
    const response = await apiClient.put('/users/change-password', data);
    return response.data;
  },

  updateUserStatus: async (id, isActive) => {
    const response = await apiClient.put(`/users/${id}/status`, { isActive });
    return response.data;
  },

  getCollegeStudents: async () => {
    const response = await apiClient.get('/users/college/students');
    return response.data;
  },

  getCollegeSupervisors: async () => {
    const response = await apiClient.get('/users/college/supervisors');
    return response.data;
  },

  getCollegeHODs: async () => {
    const response = await apiClient.get('/users/college/hods');
    return response.data;
  },

  getAvailableStudentsForTeam: async () => {
    const response = await apiClient.get('/students/available-for-team');
    return response.data?.data || response.data;
  }
};

export default userService;

