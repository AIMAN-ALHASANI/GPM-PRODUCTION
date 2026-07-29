import apiClient from '../api/apiClient';

const settingsService = {
  getDepartmentTeamLimits: async () => {
    const response = await apiClient.get('/Settings/department-team-limits');
    return response.data?.data || response.data;
  },

  updateDepartmentTeamLimits: async (departmentId, payload) => {
    // payload: { MinTeamMembers: number, MaxTeamMembers: number }
    const response = await apiClient.put(`/Settings/departments/${departmentId}/team-limits`, payload);
    return response.data?.data || response.data;
  }
};

export default settingsService;
