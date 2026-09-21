import axios from 'axios';

export const API_BASE_URL =
  'https://bishalcare-001-site1.ctempurl.com/api';

const client = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
  timeout: 20000,
});

// =====================================================
// ADD JWT TOKEN TO REQUESTS
// =====================================================
client.interceptors.request.use(
  (config) => {
    const adminToken = localStorage.getItem('admin_token');
    const userToken = localStorage.getItem('token');

    const token = adminToken || userToken;

    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// =====================================================
// HANDLE API RESPONSES
// =====================================================
client.interceptors.response.use(
  (response) => response,

  (error) => {
    // No response means network/server connection problem
    if (!error.response) {
      console.error('API Network Error:', error.message);

      return Promise.reject(
        new Error(
          'Unable to connect to BishalCare server. Please check your internet connection or try again.'
        )
      );
    }

    const status = error.response.status;

    // =================================================
    // DO NOT REDIRECT LOGIN REQUESTS
    // =================================================
    const requestUrl = error.config?.url || '';

    const isLoginRequest =
      requestUrl.includes('/Users/Login');

    if (
      (status === 401 || status === 403) &&
      !isLoginRequest
    ) {
      localStorage.removeItem('token');
      localStorage.removeItem('admin_token');
      localStorage.removeItem('admin_name');
      localStorage.removeItem('admin_email');
      localStorage.removeItem('user');

      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

export default client;