import apiClient from '../api/apiClient';

const requestService = {
  getAllRequests: async () => {
    const response = await apiClient.get('/Requests');
    return response.data;
  },

  reviewRequest: async (id, reviewData) => {
    // reviewData: { decision: "Approve" | "Reject", rejectionReason: string }
    const response = await apiClient.put(`/Requests/${id}/review`, reviewData);
    return response.data;
  },

  /**
   * POST /Requests/change-supervisor
   * DTO (ChangeSupervisorDto): { NewSupervisorID, Reason }
   */
  changeSupervisor: async (dto) => {
    const response = await apiClient.post('/Requests/change-supervisor', dto);
    return response.data;
  },

  /**
   * POST /Requests/change-project
   * DTO (ChangeProjectDto): { NewProjectTitle, NewProjectDescription, Reason }
   */
  changeProject: async (dto) => {
    const response = await apiClient.post('/Requests/change-project', dto);
    return response.data;
  }
};

export default requestService;
