import axios from 'axios';

// Use direct backend URL instead of proxy
const api = axios.create({
  baseURL: 'http://localhost:8000/api',
  withCredentials: true,
  // Add this to handle self-signed certificates
  httpsAgent: process.env.NODE_ENV === 'development' ? null : undefined,
});

// Add request interceptor to include JWT token in Authorization header
api.interceptors.request.use(
  (config) => {
    // Remove Authorization header logic - rely on cookies instead
    // const token = localStorage.getItem('jwt_token');
    // if (token) {
    //   config.headers.Authorization = `Bearer ${token}`;
    // }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add response interceptor to handle JWT errors gracefully
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear any authentication state and redirect to login
      // Note: JWT token is stored in HTTP-only cookies, not localStorage
      console.log('401 Unauthorized - clearing authentication state');
      // Only redirect if not already on login page
      if (!window.location.pathname.includes('/start') && !window.location.pathname.includes('/login')) {
        window.location.href = '/start';
      }
    }
    return Promise.reject(error);
  }
);

export default api;

export const fetchTripPlaces = id =>
  api.get(`/trips/${id}/places`);

export const saveTripPlaces = (id, waypoints) =>
  api.post(`/trips/${id}/places`, { waypoints });

export const fetchTripRoute = id =>
  api.get(`/trips/${id}/route`);

export const saveTripRoute = (id, routeData, distance) =>
  api.post(`/trips/${id}/route`, { routeData, distance });
