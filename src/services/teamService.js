import apiClient from '../api/apiClient';

const teamService = {
  /**
   * POST /Team
   * Student creates a team.
   * DTO (CreateTeamDto): { TeamName }
   */
  createTeam: async ({ TeamName }) => {
    const response = await apiClient.post('/Team', { TeamName });
    return response.data;
  },

  /**
   * GET /Team/my-team
   * Returns current Student team.
   */
  getMyTeam: async () => {
    try {
      const response = await apiClient.get('/Team/my-team');
      
      // If backend returns the standardized success response with null data, it means no team
      if (response.data && response.data.success === true && response.data.data === null) {
        return null;
      }

      const payload = response.data?.data || response.data;
      if (!payload) return null;

      const teamID = payload.teamID || payload.TeamID || payload.id || payload.teamId;
      if (!teamID) return null;

      // Normalize fields
      return {
        TeamID: teamID,
        TeamName: payload.teamName || payload.TeamName,
        LeaderName: payload.leaderName || payload.LeaderName,
        LeaderUserID: payload.leaderUserID || payload.LeaderUserID,
        SupervisorName: payload.supervisorName || payload.SupervisorName,
        MemberCount: payload.memberCount || payload.MemberCount,
        Status: payload.status || payload.Status,
        CreatedAt: payload.createdAt || payload.CreatedAt,
        Members: payload.members || payload.Members || [],
        ProjectTitle: payload.projectTitle || payload.ProjectTitle,
        ProjectID: payload.projectID || payload.ProjectID
      };
    } catch (error) {
      if (error.response?.status === 404) {
        return null; // Graceful 404
      }
      throw error;
    }
  },

  getAllTeams: async (params) => {
    const response = await apiClient.get('/team', { params });
    return response.data;
  },

  getCollegeTeams: async () => {
    const response = await apiClient.get('/Team/CollegeTeams');
    return response.data;
  },

  deleteTeam: async (id) => {
    await apiClient.delete(`/Team/${id}`);
  },

  /**
   * PATCH /Team/{teamId}/name
   * DTO (UpdateTeamNameDto): { TeamName }
   */
  updateTeamName: async (teamId, teamName) => {
    const response = await apiClient.patch(`/Team/${teamId}/name`, { TeamName: teamName });
    return response.data;
  },

  /**
   * GET /Team/{teamId}/members
   */
  getTeamMembers: async (teamId) => {
    const response = await apiClient.get(`/Team/${teamId}/members`);
    return response.data?.data || response.data;
  },

  addMember: async (teamId, userId) => {
    const response = await apiClient.post(`/Team/${teamId}/members`, {
      UserID: userId,
    });
    return response.data?.data || response.data;
  },

  removeMember: async (teamId, userId) => {
    await apiClient.delete(`/teams/${teamId}/members/${userId}`);
  },

  updateStatus: async (teamId, statusData) => {
    const response = await apiClient.patch(`/team/${teamId}/status`, statusData);
    return response.data;
  },

  getTeamById: async (id) => {
    const response = await apiClient.get(`/Team/${id}`);
    return response.data?.data || response.data;
  },

  assignTeamLeader: async (teamId, userId) => {
    const response = await apiClient.patch(`/teams/${teamId}/leader`, { UserID: userId });
    return response.data;
  },

  /**
   * GET /api/Team/my-teams
   * Supervisor only. Returns empty array when supervisor has no assigned teams.
   */
  getSupervisorTeams: async () => {
    try {
      const response = await apiClient.get('/Team/my-teams');
      // Backend now wraps in ApiResponse: { success, data: [...] }
      const data = response.data?.data ?? response.data;
      return Array.isArray(data) ? data : [];
    } catch (error) {
      if (error.response?.status === 404) {
        // No teams assigned yet — valid expected state, not an error
        return [];
      }
      throw error;
    }
  },

  // NOTE: POST /team/join does NOT exist in the backend.
  // Keep stub so existing imports don't break; it will produce a 404.
  joinByCode: async (inviteCode) => {
    const response = await apiClient.post('/team/join', { inviteCode });
    return response.data;
  },

  leaveTeam: async (teamId) => {
    const response = await apiClient.post(`/Team/${teamId}/leave`);
    return response.data;
  },

  // ============================
  // SUPERVISOR ASSIGNMENT
  // ============================
  getPendingSupervisorTeams: async () => {
    const response = await apiClient.get('/Team/pending-supervisor');
    return response.data?.data || response.data;
  },

  getAvailableSupervisorsForTeam: async (teamId) => {
    const response = await apiClient.get(`/Team/${teamId}/available-supervisors`);
    return response.data?.data || response.data;
  },

  assignSupervisor: async (teamId, supervisorUserId) => {
    const response = await apiClient.put(`/Team/${teamId}/assign-supervisor`, {
      SupervisorUserID: supervisorUserId,
    });
    return response.data?.data || response.data;
  },
};

export default teamService;
