import axios from "axios";
import { domainUrl } from "./constants";
import toast from "react-hot-toast";

// This file sets up global axios interceptors:
// - attaches Authorization header from localStorage on every request
// - on 401 responses, attempts to refresh the access token using the refresh token
// - retries the original request after successful refresh
// - if refresh fails, clears storage and redirects to /login

let isRefreshing = false;
let refreshSubscribers: Array<(token: string | null) => void> = [];

function subscribeTokenRefresh(cb: (token: string | null) => void) {
  refreshSubscribers.push(cb);
}

function onRrefreshed(token: string | null) {
  refreshSubscribers.forEach((cb) => cb(token));
  refreshSubscribers = [];
}

// Request interceptor: attach access token if present
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("access_token");
    if (token) {
      // keep existing headers object and set Authorization to satisfy Axios types
      (config.headers as any) = config.headers || {};
      (config.headers as any)["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: try refresh when we get 401
axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If no response or the error is not 401, just forward
    if (!error.response || error.response.status !== 401) {
      return Promise.reject(error);
    }

    // Prevent infinite loop
    if (originalRequest._retry) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    const refreshToken = localStorage.getItem("refresh_token");
    if (!refreshToken) {
      // No refresh token -> force logout and notify the user
      localStorage.clear();
      toast.error("Session expired. Please log in again.", { position: "top-right" });
      window.location.href = "/login";
      return Promise.reject(error);
    }

    if (isRefreshing) {
      // If a refresh is already in progress, queue the request
      return new Promise((resolve, reject) => {
        subscribeTokenRefresh((token) => {
          if (token) {
            (originalRequest.headers as any)["Authorization"] = `Bearer ${token}`;
            resolve(axios(originalRequest));
          } else {
            reject(error);
          }
        });
      });
    }

    isRefreshing = true;

    try {
      const resp = await axios.post(`${domainUrl}users/token/refresh/`, {
        refresh: refreshToken,
      });
      const newAccess = resp.data?.access;
      const newRefresh = resp.data?.refresh;
      if (newAccess) {
        localStorage.setItem("access_token", newAccess);
      }
      if (newRefresh) {
        localStorage.setItem("refresh_token", newRefresh);
      }

      onRrefreshed(newAccess || null);

      if (newAccess) {
        (originalRequest.headers as any)["Authorization"] = `Bearer ${newAccess}`;
      }

      return axios(originalRequest);
    } catch (err) {
      onRrefreshed(null);
      localStorage.clear();
      toast.error("Session expired. Please log in again.", { position: "top-right" });
      window.location.href = "/login";
      return Promise.reject(err);
    } finally {
      isRefreshing = false;
    }
  }
);

// No exports; simply importing this module initializes the interceptors
