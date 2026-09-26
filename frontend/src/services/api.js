import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to attach token and active persona ID
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('resource_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  const simulatedUserId = localStorage.getItem('resource_user_id');
  if (simulatedUserId) {
    config.headers['x-user-id'] = simulatedUserId;
  }
  return config;
});

// Auth API
export const authApi = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  getMe: () => api.get('/auth/me'),
  switchPersona: (role) => api.get(`/auth/switch-persona/${role}`),
  getPersonas: () => api.get('/auth/personas'),
};

// Resources API
export const resourceApi = {
  getResources: (params) => api.get('/resources', { params }),
  getResourceById: (id) => api.get(`/resources/${id}`),
  createResource: (data) => api.post('/resources', data),
};

// Discovery API
export const discoveryApi = {
  submitAndMatch: (data) => api.post('/discovery/match', data),
  getOpportunities: () => api.get('/discovery/opportunities'),
  getOpportunityById: (id) => api.get(`/discovery/opportunities/${id}`),
};

// Deals API
export const dealApi = {
  initiateDeal: (data) => api.post('/deals/initiate', data),
  getDeals: () => api.get('/deals'),
  getDealById: (id) => api.get(`/deals/${id}`),
  advanceDealStatus: (id, nextStatus) =>
    api.patch(`/deals/${id}/advance-status`, { nextStatus }),
};

// Price Requests API (Structured Slider Negotiation)
export const priceRequestApi = {
  submitPriceRequest: (data) => api.post('/price-requests', data),
  getPriceRequests: () => api.get('/price-requests'),
  acceptPriceRequest: (id) => api.post(`/price-requests/${id}/accept`),
  counterPriceRequest: (id, data) => api.post(`/price-requests/${id}/counter`, data),
  buyerAcceptCounter: (id) => api.post(`/price-requests/${id}/buyer-accept`),
  rejectPriceRequest: (id, data) => api.post(`/price-requests/${id}/reject`, data),
};

// Assessment API
export const assessmentApi = {
  getAssessment: (id) => api.get(`/assessments/${id}`),
  updateBlocker: (id, blockerIndex, data) =>
    api.patch(`/assessments/${id}/blockers/${blockerIndex}`, data),
  updateSampleStatus: (id, data) =>
    api.patch(`/assessments/${id}/sample-status`, data),
};

// Payment API
export const paymentApi = {
  getDealPaymentSummary: (dealId) => api.get(`/payments/deal-summary/${dealId}`),
  processPayment: (data) => api.post('/payments/process', data),
  getPayments: () => api.get('/payments'),
};

// Exchange API
export const exchangeApi = {
  getExchangeByDealId: (dealId) => api.get(`/exchanges/${dealId}`),
  markDispatched: (dealId, data) => api.post(`/exchanges/${dealId}/dispatch`, data),
  confirmDelivery: (dealId, data) => api.post(`/exchanges/${dealId}/delivery`, data),
  confirmQuality: (dealId, data) => api.post(`/exchanges/${dealId}/quality`, data),
};

// Notification API
export const notificationApi = {
  getNotifications: () => api.get('/notifications'),
  markAsRead: (id) => api.patch(`/notifications/${id}/read`),
  markAllAsRead: () => api.post('/notifications/mark-all-read'),
};

// Admin API
export const adminApi = {
  getAdminOverview: () => api.get('/admin/overview'),
  getNegotiationsAudit: () => api.get('/admin/negotiations'),
  updateCommissionConfig: (data) => api.put('/admin/commission-config', data),
  verifyCompany: (id, data) => api.patch(`/admin/companies/${id}/verify`, data),
};

// Impact API
export const impactApi = {
  getImpactMetrics: () => api.get('/impact'),
};

export default api;
