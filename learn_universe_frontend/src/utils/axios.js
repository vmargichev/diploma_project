import axios from "axios";
import { API_BASE_URL} from "./constants.js";
import Cookie from "js-cookie";
import {useNavigate} from "react-router-dom";

export const apiInstance = axios.create({
    baseURL: API_BASE_URL,
    timeout: 10000,
    headers: {
      Accept: "application/json",
    },
})

// apiInstance.interceptors.request.use(
//   config => {
//     const token = Cookie.get("access_token");
//     if (token) {
//       config.headers.Authorization = `Bearer ${token}`;
//     }
//     return config;
//   },
//   error => Promise.reject(error)
// );
//
// apiInstance.interceptors.response.use(
//   response => response,
//   async error => {
//     const originalRequest = error.config;
//
//
//     if (error.response?.status === 401 && !originalRequest._retry) {
//       originalRequest._retry = true;
//
//       try {
//         const refreshToken = Cookie.get("refresh_token");
//         const { data } = await axios.post(`${API_BASE_URL}/user/token/refresh/`, { refresh: refreshToken });
//
//         Cookie.set("access_token", data.access);
//         originalRequest.headers.Authorization = `Bearer ${data.access}`;
//         return apiInstance(originalRequest);
//       } catch (refreshError) {
//         Cookie.remove("access_token");
//         Cookie.remove("refresh_token");
//          navigate('/login');
//         return Promise.reject(refreshError);
//       }
//     }
//
//     if (error.response?.status >= 400) {
//       console.error('API Error:', error.response?.data);
//     }
//
//     return Promise.reject(error);
//   }
// );