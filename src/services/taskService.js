import apiClient from '../api/apiClient';

/**
 * Task Service
 * All task-related API calls for the Student Dashboard.
 */
const taskService = {

  /**
   * GET /api/tasks/my-team
   * Leader → all team tasks
   * Member → only their assigned tasks
   */
  getMyTeamTasks: async () => {
    const response = await apiClient.get('/tasks/my-team');
    return response.data;
  },

  /**
   * POST /api/tasks
   * Create a new task. TeamID is auto-resolved from JWT on the backend.
   * Only team leader can call this.
   * @param {{ title: string, description: string, assignedToUserID: number, dueDate: string }} dto
   */
  createTask: async (dto) => {
    const response = await apiClient.post('/tasks', dto);
    return response.data;
  },

  /**
   * PUT /api/tasks/{id}
   * Update task fields. Leader only.
   * @param {number} id
   * @param {{ title: string, description: string, assignedToUserID: number, dueDate: string }} dto
   */
  updateTask: async (id, dto) => {
    const response = await apiClient.put(`/tasks/${id}`, dto);
    return response.data;
  },

  /**
   * PUT /api/tasks/{id}/status
   * Update task status.
   * Leader: any task. Member: only their own.
   * @param {number} id
   * @param {'Pending'|'InProgress'|'Completed'} status
   */
  updateTaskStatus: async (id, status) => {
    const response = await apiClient.put(`/tasks/${id}/status`, { status });
    return response.data;
  },

  /**
   * DELETE /api/tasks/{id}
   * Delete a task. Leader only.
   * @param {number} id
   */
  deleteTask: async (id) => {
    await apiClient.delete(`/tasks/${id}`);
  },
};

export default taskService;
