import apiClient from '../api/apiClient';

const normalizeArray = (response) => {
  if (Array.isArray(response)) return response;
  if (response?.data && Array.isArray(response.data)) return response.data;
  if (response?.data?.data && Array.isArray(response.data.data)) return response.data.data;
  return [];
};

export const dashboardService = {
  getDepartments: async () => {
    const response = await apiClient.get('/Departments');
    return normalizeArray(response);
  },
  getCollegeProjects: async () => {
    const response = await apiClient.get('/Projects/CollegeProjects');
    return normalizeArray(response);
  },
  getCollegeTeams: async () => {
    const response = await apiClient.get('/Team/CollegeTeams');
    return normalizeArray(response);
  },
  getCollegeArchivedProjects: async () => {
    const response = await apiClient.get('/ArchivedProjects/CollegeArchivedProjects');
    return normalizeArray(response);
  }
};
