import axios, { AxiosResponse, AxiosError } from 'axios';
import { toast } from 'react-hot-toast';
import TokenManager from './TokenManager';

//let API_URL = 'http://localhost:8000';
let API_URL = 'https://cloud-merchant-gp1.ew.r.appspot.com';

let instance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

instance.interceptors.request.use(
  (config) => {
    let tokens = TokenManager.getTokens();
    if (tokens && config.headers) {
      config.headers.Authorization = `Bearer ${tokens.access}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

instance.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  async (error: AxiosError) => {
    let originalRequest = error.config;

    if (error.response?.status === 401 && !((originalRequest as any)._retry)) {
      (originalRequest as any)._retry = true;
      try {

        let tokens = TokenManager.getTokens();
        let refreshResponse = await axios.post(`${API_URL}/auth/refresh-token`, {
          refreshToken: tokens.refresh,
        });
        if (refreshResponse.status === 200) {
          let newTokens = refreshResponse.data.tokens;
          TokenManager.setTokens(newTokens);

          (originalRequest as any).headers.Authorization = `Bearer ${newTokens.access}`;
          return instance(originalRequest as any);
        }
      } catch (refreshError) {
        // toast.error('Failed to refresh token. Please log in again.');
        console.error("Refresh Token Error:", refreshError);
        // Redirect to login or handle logout 
      }
    } else {
      // toast.error('Something went wrong. Please try again later.');
      console.error(error);
    }
    return Promise.reject(error);
  }
);

export default instance;
