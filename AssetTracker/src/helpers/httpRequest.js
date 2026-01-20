import axios from "axios";
import { getCookie } from "../helpers/Cookie";
import store from "../store";
import { logout } from "../store/reducers/authReducer";

// Read env values once
const accessToken = import.meta.env.VITE_ACCESS_TOKEN;
if (!accessToken) throw new Error("Access token not found in process env!");

const apiBaseUrl = import.meta.env.VITE_APP_BACKEND_BASE_URL;
if (!apiBaseUrl) throw new Error("API Base Url not found in process env!");

// ✅ Create single axios instance
const axiosInstance = axios.create({
  baseURL: apiBaseUrl,
  timeout: 10000,
});

// Request interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    const token = getCookie(accessToken);
    config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error),
);

// Response interceptor
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error?.response?.status === 401) {
      store.dispatch(logout());
      console.log("Auth error", error?.response);
    }
    return Promise.reject(error);
  },
);

const responseBody = (response) => response.data;
const errorResponseBody = (error) => error.response?.data;

// HTTP request methods
const httpRequest = {
  get: (url = "", params = {}) =>
    axiosInstance
      .get(url, { params })
      .then(responseBody)
      .catch(errorResponseBody),
  post: (url = "", body = {}, config = {}) =>
    axiosInstance
      .post(url, body, config)
      .then(responseBody)
      .catch(errorResponseBody),
  put: (url = "", body = {}) =>
    axiosInstance.put(url, body).then(responseBody).catch(errorResponseBody),
  delete: (url = "", params = {}, body = {}) =>
    axiosInstance
      .delete(url, { data: body, params })
      .then(responseBody)
      .catch(errorResponseBody),
};

// ✅ default export
export default httpRequest;
