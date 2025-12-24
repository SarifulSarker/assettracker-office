import axios from "axios";
import { getCookie } from "../helpers/Cookie";
import store from "../store";
import { logout } from "../store/reducers/authReducer";

const accessToken = import.meta.env.VITE_ACCESS_TOKEN;

if (!accessToken) throw new Error("Access token not found in process env!");

const apiBaseUrl = "http://localhost:3000/api/v1";
if (!apiBaseUrl) throw new Error("API Base Url not found in process env!");

const axiosInstance = axios.create({
  baseURL: apiBaseUrl,
  timeout: 10000,
});

// Request interceptor
axiosInstance.interceptors.request.use(
  function (config) {
    const token = getCookie(accessToken);
    config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  function (error) {
    return Promise.reject(error);
  }
);

axiosInstance.interceptors.response.use(
  (respose) => {
    return respose;
  },
  async (error) => {
    if (error?.response?.status === 401) {
      store.dispatch(logout());
      console.log("Auth error", error?.response);
    }
    return Promise.reject(error);
  }
);

// Handle HTTP response
const responseBody = (response) => response.data;

// Handle HTTP error
const errorResponseBody = (error) => {
  // console.log({ error });
  // console.log({ error: error.response.data });

  return error.response.data;
  // if (error.response) {
  //   return error.response.data;
  // } else if (error.request) {
  //   throw new Error("Error: axios " + error.request);
  // } else {
  //   throw new Error("Error: axios " + error.message);
  // }
};

// HTTP request methods
const httpRequest = {
  get: (url = "", params = {}) =>
    axiosInstance
      .get(url, { params })
      .then(responseBody)
      .catch((e) => {
        return errorResponseBody(e);
      }),

  post: (url = "", body = {}, config = {}) =>
    axiosInstance
      .post(url, body, config)
      .then(responseBody)
      .catch((e) => {
        return errorResponseBody(e);
      }),

  put: (url = "", body = {}) =>
    axiosInstance
      .put(url, body, {})
      .then(responseBody)
      .catch((e) => {
        return errorResponseBody(e);
      }),

  delete: (url = "", params = {}, body = {}) =>
    axiosInstance
      .delete(url, { data: body, params })
      .then(responseBody)
      .catch((e) => {
        return errorResponseBody(e);
      }),
};

export default httpRequest;
