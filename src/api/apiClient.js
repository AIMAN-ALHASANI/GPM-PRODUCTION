import axios from 'axios';
import toast from 'react-hot-toast';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for adding JWT token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);
// Response interceptor for global error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const message = error.response?.data?.message || error.message || 'حدث خطأ ما';

    if (status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('userProfile');
      sessionStorage.clear();

      if (window.location.pathname.includes('/login')) {
        toast.error('البريد الإلكتروني أو كلمة المرور غير صحيحة');
      } else {
        window.location.href = '/';
      }
    } else if (status === 403) {
      toast.error('ليس لديك صلاحية للقيام بهذا الإجراء');
    } else if (status === 404) {
      // 404 is intentionally silent at the global level.
      // "No team", "no project", "no supervisor" are all valid expected states,
      // NOT errors. Individual service methods return null/[] for these cases.
      // Only user-triggered actions (delete, lookup by ID) should show 404 toasts,
      // and those are handled locally in the calling component.
    } else {
      // 400 validation errors, 500 server errors, network errors, etc.
      toast.error(message);
    }

    return Promise.reject(error);
  }
);

export default apiClient;
