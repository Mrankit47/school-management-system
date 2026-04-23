import axios from 'axios';

const api = axios.create({
    baseURL: (import.meta.env.VITE_API_URL || 'http://localhost:8000/api/').replace(/\/?$/, '/'),
    headers: {
        'Content-Type': 'application/json',
    },
});

// Interceptor to add JWT token to every request
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    // Global Sibling Switching: Automatically append student_id from localStorage
    const selectedStudentId = localStorage.getItem('selectedStudentId');
    if (selectedStudentId) {
        if (!config.params) config.params = {};
        // Only append if not already explicitly provided in the request
        if (config.params.student_id === undefined) {
            config.params.student_id = selectedStudentId;
        }
    }
    if (config.data instanceof FormData) {
        delete config.headers['Content-Type'];
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            // Do not trigger global logout redirect if the 401 came from the login endpoint itself
            if (!error.config.url.includes('auth/login')) {
                // Auto logout if token expires or is invalid
                localStorage.removeItem('access_token');
                localStorage.removeItem('refresh_token');
                // Only redirect if not already on login page
                if (window.location.pathname !== '/login') {
                    window.location.href = '/login';
                }
            }
        }
        return Promise.reject(error);
    }
);

export default api;
