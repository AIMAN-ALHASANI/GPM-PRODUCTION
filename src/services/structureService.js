import apiClient from '../api/apiClient';

const normalizeArray = (response) => {
  // 1. If response is already an array
  if (Array.isArray(response)) return response;
  
  // 2. If it's an Axios response { data: [...] }
  if (response?.data && Array.isArray(response.data)) return response.data;
  
  // 3. If it's a wrapped ApiResponse { data: { data: [...] } }
  if (response?.data?.data && Array.isArray(response.data.data)) return response.data.data;
  
  // 4. Default to empty array
  return [];
};

const structureService = {
  // Countries
  getCountries: async () => {
    const response = await apiClient.get('/countries');
    return normalizeArray(response);
  },
  createCountry: async (name) => {
    const response = await apiClient.post('/countries', { name });
    return response.data;
  },

  // Universities
  getUniversities: async () => {
    const response = await apiClient.get('/universities');
    return normalizeArray(response);
  },
  createUniversity: async (data) => {
    const response = await apiClient.post('/universities', data);
    return response.data;
  },
  updateUniversity: async (id, data) => {
    const response = await apiClient.put(`/universities/${id}`, data);
    return response.data;
  },
  deleteUniversity: async (id) => {
    await apiClient.delete(`/universities/${id}`);
  },

  // Colleges
  getColleges: async () => {
    const response = await apiClient.get('/colleges');
    return normalizeArray(response);
  },
  createCollege: async (data) => {
    const response = await apiClient.post('/colleges', data);
    return response.data;
  },
  updateCollege: async (id, data) => {
    const response = await apiClient.put(`/colleges/${id}`, data);
    return response.data;
  },
  deleteCollege: async (id) => {
    await apiClient.delete(`/colleges/${id}`);
  },

  // Departments
  getDepartments: async () => {
    const response = await apiClient.get('/Departments');
    return normalizeArray(response);
  },
  createDepartment: async (data) => {
    const response = await apiClient.post('/Departments', data);
    return response.data;
  },
  updateDepartment: async (id, data) => {
    const response = await apiClient.put(`/Departments/${id}`, data);
    return response.data;
  },
  deleteDepartment: async (id) => {
    await apiClient.delete(`/departments/${id}`);
  }
};

export default structureService;
