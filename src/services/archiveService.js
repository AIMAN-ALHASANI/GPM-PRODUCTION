import apiClient from '../api/apiClient';

const archiveService = {
    getAll: async () => {
        const response = await apiClient.get('/ArchivedProjects');
        return response.data;
    },
    
    getCollegeArchivedProjects: async () => {
        const response = await apiClient.get('/ArchivedProjects/CollegeArchivedProjects');
        return response.data;
    },

    getById: async (id) => {
        const response = await apiClient.get(`/ArchivedProjects/${id}`);
        return response.data;
    },

    create: async (data) => {
        const response = await apiClient.post('/ArchivedProjects', data);
        return response.data;
    },

    getCompletedForArchive: async () => {
        const response = await apiClient.get('/Projects/completed-for-archive');
        return response.data;
    },

    // Now sends multipart/form-data to support optional project image upload and project file upload
    archiveWithScore: async ({ projectId, evaluationScore, projectImage, projectFile }) => {
        const formData = new FormData();
        formData.append('evaluationScore', evaluationScore);
        if (projectImage) {
            formData.append('projectImage', projectImage);
        }
        if (projectFile) {
            formData.append('projectFile', projectFile);
        }
        const response = await apiClient.post(
            `/Projects/${projectId}/archive`,
            formData,
            { headers: { 'Content-Type': 'multipart/form-data' } }
        );
        return response.data;
    },

    update: async (id, data) => {
        const formData = new FormData();
        formData.append('year', data.year);
        formData.append('summary', data.summary);
        formData.append('evaluationScore', data.evaluationScore);
        if (data.projectImage) {
            formData.append('projectImage', data.projectImage);
        }
        if (data.projectFile) {
            formData.append('projectFile', data.projectFile);
        }
        const response = await apiClient.put(
            `/ArchivedProjects/${id}`,
            formData,
            { headers: { 'Content-Type': 'multipart/form-data' } }
        );
        return response.data;
    },

    delete: async (id) => {
        const response = await apiClient.delete(`/ArchivedProjects/${id}`);
        return response.data;
    },

    // Public endpoints
    getPublicStatistics: async () => {
        const response = await apiClient.get('/public/home-statistics');
        return response.data;
    },

    getPublicFeaturedProjects: async () => {
        const response = await apiClient.get('/public/featured-projects');
        return response.data;
    },

    getPublicArchiveProjects: async (params = {}) => {
        const response = await apiClient.get('/public/archive-projects', { params });
        return response.data;
    },

    getPublicArchiveProjectDetails: async (id) => {
        const response = await apiClient.get(`/public/archive-projects/${id}`);
        return response.data;
    },

    getPublicDepartments: async () => {
        const response = await apiClient.get('/public/departments');
        return response.data;
    },

    getPublicYears: async () => {
        const response = await apiClient.get('/public/years');
        return response.data;
    }
};

export default archiveService;


