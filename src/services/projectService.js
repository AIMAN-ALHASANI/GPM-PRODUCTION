import apiClient from '../api/apiClient';

const projectService = {
  createProject: async (projectData) => {
    const response = await apiClient.post('/Projects', projectData);
    return response.data;
  },
  
  uploadProposal: async (projectId, proposalFile) => {
    const formData = new FormData();
    formData.append('file', proposalFile);
    const response = await apiClient.post(`/Projects/${projectId}/proposal`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
  
  chooseSupervisor: async (projectId, supervisorId) => {
    const response = await apiClient.put(`/Projects/${projectId}/choose-supervisor`, { supervisorId });
    return response.data;
  },
  
  getMyProjects: async () => {
    const response = await apiClient.get('/Projects/my-projects');
    return response.data;
  },
  
  getPendingProposals: async () => {
    const response = await apiClient.get('/Projects/pending-proposals');
    return response.data;
  },
  
  approveProject: async (id) => {
    const response = await apiClient.put(`/Projects/${id}/approve`);
    return response.data;
  },
  
  rejectProject: async (id) => {
    const response = await apiClient.put(`/Projects/${id}/reject`);
    return response.data;
  },

  getAllProjects: async (params) => {
    // Exact endpoint casing: GET /api/Projects
    const response = await apiClient.get('/Projects', { params });
    return response.data;
  },

  getCollegeProjects: async () => {
    const response = await apiClient.get('/Projects/CollegeProjects');
    return response.data;
  },

  updateStatus: async (id, status) => {
    // Exact endpoint casing: PUT /api/Projects/{id}/status
    // Backend expects UpdateProjectStatusDto { Status: ... }
    const response = await apiClient.put(`/Projects/${id}/status`, { Status: status });
    return response.data;
  },

  getProjectByTitle: async (title) => {
    // Exact endpoint casing: GET /api/Projects/by-title?title={title}
    const response = await apiClient.get('/Projects/by-title', { params: { title } });
    return response.data;
  },

  /**
   * PUT /Projects/{id}/details
   * DTO (UpdateProjectDto): { Objective, Abstract }
   */
  updateProjectDetails: async (id, details) => {
    // details: { Objective, Abstract }
    const response = await apiClient.put(`/Projects/${id}/details`, details);
    return response.data;
  },

  getMyProject: async () => {
    const response = await apiClient.get('/Projects/my-project');
    return response.data;
  },

  getMySupervisedProjects: async () => {
    const response = await apiClient.get('/Projects/my-supervised-projects');
    return response.data;
  },

  updateProjectStatusBySupervisor: async (id, status) => {
    const response = await apiClient.put(`/Projects/${id}/supervisor-status`, { Status: status });
    return response.data;
  },

  /**
   * PUT /Projects/{id}/objectives
   * Only the team leader can call this.
   * DTO: { Objective: string }
   */
  updateProjectObjectives: async (id, objective) => {
    const response = await apiClient.put(`/Projects/${id}/objectives`, { Objective: objective });
    return response.data;
  },
};

export default projectService;
