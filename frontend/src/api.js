import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Required for refresh tokens in HttpOnly cookies if backend uses them
});

// Request Interceptor: Attach JWT Token if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    // Generate/Attach request track ID
    config.headers['X-Request-Id'] = crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2);

    // For FormData bodies (file uploads), the instance-level default
    // 'Content-Type: application/json' must be removed so the browser can
    // set 'multipart/form-data; boundary=...' itself. Axios does not do
    // this automatically when a Content-Type header is already present —
    // it instead JSON-stringifies the FormData (dropping the file).
    if (config.data instanceof FormData) {
      config.headers.delete('Content-Type');
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Handle Token Refreshing & Authentication Errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Handle token expiration (401)
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
          // Request token rotation from backend
          const res = await axios.post(`${api.defaults.baseURL}/auth/refresh`, {
            refreshToken,
          });
          // POST /auth/refresh responds with { accessToken, refreshToken }, not { token, ... }.
          const { accessToken: newAccessToken, refreshToken: newRefreshToken } = res.data.data;
          
          localStorage.setItem('token', newAccessToken);
          if (newRefreshToken) {
            localStorage.setItem('refreshToken', newRefreshToken);
          }

          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        // If refresh fails, log out user
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
