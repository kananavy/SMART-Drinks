import axios from 'axios';

const api = axios.create({
    baseURL: '/api',
});

// Add auth token + correct Content-Type to all requests
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('bar_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    // For FormData (file uploads), let the browser set the multipart boundary automatically.
    // For everything else, use JSON.
    if (config.data instanceof FormData) {
        delete config.headers['Content-Type'];
    } else {
        config.headers['Content-Type'] = 'application/json';
    }
    return config;
});

// Handle auth errors globally
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('bar_token');
            localStorage.removeItem('bar_user');
            localStorage.removeItem('bar_session');
            window.location.href = '/';
        }
        return Promise.reject(error);
    }
);

export default api;
