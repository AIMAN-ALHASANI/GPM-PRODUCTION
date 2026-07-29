import apiClient from '../api/apiClient';

const reportService = {
  /**
   * POST /Reports
   * DTO (SubmitReportDto): { ProjectID, Title, Description, FilePath, ReportType }
   */
  submitReport: async (dto) => {
    const response = await apiClient.post('/Reports', dto);
    return response.data;
  },

  /**
   * GET /Reports/my-reports
   */
  getMyReports: async () => {
    const response = await apiClient.get('/Reports/my-reports');
    return response.data?.data || response.data;
  },

  /**
   * GET /api/Reports/team/{teamId}
   * Supervisor only.
   */
  getTeamReports: async (teamId) => {
    if (!teamId || Number(teamId) <= 0) {
      console.error('Invalid teamId provided to getTeamReports:', teamId);
      return [];
    }
    const response = await apiClient.get(`/Reports/team/${teamId}`);
    return response.data;
  },

  /**
   * PUT /api/Reports/{id}/feedback
   * Supervisor adds feedback.
   * DTO (AddFeedbackDto): { Feedback, Status }
   */
  provideFeedback: async (reportId, { Feedback, Status }) => {
    const response = await apiClient.put(`/Reports/${reportId}/feedback`, { Feedback, Status });
    return response.data;
  }
};

export default reportService;
