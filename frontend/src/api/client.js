import axios from 'axios';
import toast from 'react-hot-toast';

const api = axios.create({
    baseURL: '/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor to add token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor for error handling
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
            toast.error('Session expired. Please login again.');
        }
        return Promise.reject(error);
    }
);

// Auth APIs
export const authApi = {
    login: (data) => api.post('/auth/login', data),
    register: (data) => api.post('/auth/register', data),
    getProfile: () => api.get('/users/profile'),
    updateProfile: (data) => api.put('/users/profile', data),
    changePassword: (data) => api.put('/users/profile/change-password', data),
};

// Product APIs
export const productApi = {
    getAll: (params) => api.get('/products', { params }),
    getById: (id) => api.get(`/products/${id}`),
    create: (data) => api.post('/products', data),
    update: (id, data) => api.put(`/products/${id}`, data),
    delete: (id) => api.delete(`/products/${id}`),
    getLowStock: () => api.get('/products/low-stock'),
    getOutOfStock: () => api.get('/products/out-of-stock'),
    getExpiring: (days) => api.get(`/products/expiring?days=${days}`),
    search: (keyword) => api.get(`/products/search?keyword=${keyword}`),
};

// Category APIs
export const categoryApi = {
    getAll: () => api.get('/categories'),
    getById: (id) => api.get(`/categories/${id}`),
    create: (data) => api.post('/categories', data),
    update: (id, data) => api.put(`/categories/${id}`, data),
    delete: (id) => api.delete(`/categories/${id}`),
};

// Supplier APIs
export const supplierApi = {
    getAll: () => api.get('/suppliers'),
    getById: (id) => api.get(`/suppliers/${id}`),
    create: (data) => api.post('/suppliers', data),
    update: (id, data) => api.put(`/suppliers/${id}`, data),
    delete: (id) => api.delete(`/suppliers/${id}`),
};

// Sale APIs
export const saleApi = {
    getAll: (params) => api.get('/sales', { params }),
    getById: (id) => api.get(`/sales/${id}`),
    create: (data) => api.post('/sales', data),
    cancel: (id) => api.put(`/sales/${id}/cancel`),
    getByDateRange: (startDate, endDate) => api.get(`/sales/date-range?startDate=${startDate}&endDate=${endDate}`),
};

// Inventory APIs
export const inventoryApi = {
    createMovement: (data) => api.post('/inventory/movement', data),
    getByProduct: (productId) => api.get(`/inventory/movements/product/${productId}`),
    getByType: (type) => api.get(`/inventory/movements/type/${type}`),
};

// Dashboard APIs
export const dashboardApi = {
    getDashboard: () => api.get('/dashboard'),
};

// Notification APIs
export const notificationApi = {
    getAll: () => api.get('/notifications'),
    getUnread: () => api.get('/notifications/unread'),
    getUnreadCount: () => api.get('/notifications/unread-count'),
    markAllRead: () => api.put('/notifications/mark-all-read'),
    markRead: (id) => api.put(`/notifications/${id}/read`),
};

// AI APIs
export const aiApi = {
    getForecast: (productId) => api.get(`/ai/forecast/${productId}`),
    getRecommendations: () => api.get('/ai/recommendations'),
    getMovementAnalysis: () => api.get('/ai/movement-analysis'),
    getSeasonalPrediction: () => api.get('/ai/seasonal-prediction'),
    getPurchaseSuggestions: () => api.get('/ai/purchase-suggestions'),
    chat: (message) => api.post('/ai/chat', { message }),
};

// Report APIs
export const reportApi = {
    exportProducts: () => api.get('/reports/products/export', { responseType: 'blob' }),
    exportSales: (startDate, endDate) => api.get(`/reports/sales/export?startDate=${startDate}&endDate=${endDate}`, { responseType: 'blob' }),
    exportLowStock: () => api.get('/reports/low-stock/export', { responseType: 'blob' }),
};

export default api;