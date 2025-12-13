import axios from 'axios';

const axiosInstance = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Request interceptor to add auth token
axiosInstance.interceptors.request.use(
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

// Response interceptor for error handling
axiosInstance.interceptors.response.use(
    (response) => response.data, // Return only the data portion
    (error) => {
        const message = error.response?.data?.error || 'Something went wrong';

        // If 401, clear token and redirect to login
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
        }

        return Promise.reject(new Error(message));
    }
);

// Cast to any to bypass TypeScript's inference that this returns AxiosResponse
// The interceptor unwraps the response.data, so the type is the data, not AxiosResponse
const api = axiosInstance as any;

export default api;
