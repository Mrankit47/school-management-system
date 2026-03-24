import api from './api';

const authService = {
    login: async (username, password) => {
        const response = await api.post('auth/login/', { username, password });
        if (response.data.access) {
            localStorage.setItem('access_token', response.data.access);
            localStorage.setItem('refresh_token', response.data.refresh);
            
            // Use user data from login response directly
            const userData = response.data.user;
            localStorage.setItem('user_role', userData.role);
            localStorage.setItem('user_name', userData.name);
            
            return userData;
        }
        return null;
    },

    logout: () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user_role');
        localStorage.removeItem('user_name');
    },

    getCurrentUser: () => {
        return {
            role: localStorage.getItem('user_role'),
            name: localStorage.getItem('user_name')
        };
    }
};

export default authService;
