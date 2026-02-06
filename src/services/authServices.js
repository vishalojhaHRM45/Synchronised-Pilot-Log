import apiClient from './axios';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "https://test-egca-api.airindiaexpress.com/";

export const authService = {
  getLoginUrl: () => { return `${BASE_URL}/login`; },

  getLogOutUrl: () => { return `${BASE_URL}/logout`; },

  verifyUser: async () => {
    const response = await apiClient.get(`auth/me`);
    return response;
  },
};