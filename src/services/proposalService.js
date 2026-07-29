import apiClient from '../api/apiClient';

const proposalService = {
  /**
   * POST /Proposals
   * DTO (SubmitProposalDto): { ProjectID, Title, Description, FilePath }
   */
  submitProposal: async (proposalData) => {
    const response = await apiClient.post('/Proposals', proposalData);
    return response.data;
  },

  getAllProposals: async () => {
    // Exact endpoint casing: GET /api/Proposals
    const response = await apiClient.get('/Proposals');
    return response.data;
  },

  getProposalById: async (id) => {
    // Exact endpoint casing: GET /api/Proposals/{id}
    const response = await apiClient.get(`/Proposals/${id}`);
    return response.data;
  },

  /**
   * GET /Proposals/my-proposals
   */
  getMyProposals: async () => {
    const response = await apiClient.get('/Proposals/my-proposals');
    return response.data?.data || response.data;
  },

  evaluateProposal: async (id, evaluationData) => {
    // Exact endpoint path: PUT /api/Proposals/proposals/{id}/evaluate
    // evaluationData: { Decision: "Approved" | "Rejected", Feedback: string }
    const response = await apiClient.put(`/Proposals/proposals/${id}/evaluate`, evaluationData);
    return response.data;
  }
};

export default proposalService;
