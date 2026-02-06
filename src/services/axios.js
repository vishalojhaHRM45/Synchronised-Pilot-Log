import { store } from "@/app/store";
import axios from "axios";
import toast from "react-hot-toast";

let isInitialAuthCheck = true;

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "https://test-egca-api.airindiaexpress.com/",
  timeout: 300000,
  withCredentials: true,
  headers: {
    "Accept": "application/json",
    "Content-Type": "application/json",
  }
});

export const markAuthCheckComplete = () => {
  isInitialAuthCheck = false;
};

apiClient.interceptors.response.use(
  (response) => {
    return response;
  },

  (error) => {
    let errorMessage;
    const data = error.response?.data;

    if (typeof data === 'string') {
      errorMessage = data;
    } else if (data && typeof data === 'object' && 'message' in data && typeof data.message === 'string') {
      errorMessage = data.message || data.error || data.msg || errorMessage;
    } else {
      errorMessage = error.message || errorMessage;
    }

    const status = error?.response?.status;

    if (status === 401) {
      console.error('API Error:', errorMessage);

      const currentPath = window.location.pathname;
      const isLoginPage = currentPath === '/';
      const wasAuthenticated = store.getState().auth.isAuthenticated;

      if (!isInitialAuthCheck && wasAuthenticated && !isLoginPage) {
        toast.error("Session expired. Please login again.");
      }

      // store.dispatch(
      //   setAuth({
      //     name: null,
      //     role: null,
      //     email: null,
      //     EgcaId: null,
      //     isAuthenticated: false,
      //   })
      // );
      store.dispatch(logout());

      if (!isLoginPage) {
        window.location.href = '/';
      }

    } else {
      toast.error(errorMessage);
    }

    return Promise.reject({
      data: data || null,
      status: status || 500,
      message: errorMessage,
      statusText: error.response?.statusText || 'Error',
    });
  }
);

export default apiClient;
