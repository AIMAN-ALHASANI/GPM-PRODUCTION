import apiClient from '../api/apiClient';

const meetingService = {
  /**
   * POST /api/Meetings
   * Supervisor creates a meeting.
   * DTO (CreateMeetingDto): { TeamID, MeetingDate, Mode, Notes }
   */
  scheduleMeeting: async (meetingData) => {
    const response = await apiClient.post('/Meetings', meetingData);
    return response.data;
  },
  
  /**
   * GET /api/Meetings/team/{teamId}
   * Supervisor gets meetings for a specific team.
   */
  getTeamMeetings: async (teamId) => {
    if (!teamId || Number(teamId) <= 0) {
      console.error('Invalid teamId provided to getTeamMeetings:', teamId);
      return [];
    }
    const response = await apiClient.get(`/Meetings/team/${teamId}`);
    return response.data;
  },

  /**
   * GET /Meetings/my-meetings
   */
  getMyMeetings: async () => {
    const response = await apiClient.get('/Meetings/my-meetings');
    return response.data?.data || response.data || [];
  }
};

export default meetingService;
