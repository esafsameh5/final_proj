import axios from "axios";

// Centralized Axios API Client
// In production set VITE_API_URL in your Vercel environment variables.
// During local development the Vite proxy rewrites /api/* so baseURL can be empty.
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "",
  headers: {
    "Content-Type": "application/json",
  },
});

// ─── Session helpers ─────────────────────────────────────────────────────────
const SESSION_KEYS = [
  "accessToken",
  "refreshToken",
  "csrfToken",
  "activeUser",
  "userId",
  "facilityId",
];

export function clearSession() {
  SESSION_KEYS.forEach((k) => sessionStorage.removeItem(k));
}

export function storeTokens({ accessToken, refreshToken, csrfToken }) {
  if (accessToken) sessionStorage.setItem("accessToken", accessToken);
  if (refreshToken) sessionStorage.setItem("refreshToken", refreshToken);
  if (csrfToken) sessionStorage.setItem("csrfToken", csrfToken);
}

// ─── Request Interceptor: Inject JWT and CSRF tokens ────────────────────────
api.interceptors.request.use(
  (config) => {
    // 1. Retrieve the JWT accessToken from sessionStorage
    const accessToken = sessionStorage.getItem("accessToken");
    if (accessToken) {
      config.headers["Authorization"] = `Bearer ${accessToken}`;
    }

    // 2. For state-changing methods, retrieve and attach the X-CSRF-TOKEN
    const method = config.method ? config.method.toUpperCase() : "";
    if (["POST", "PUT", "PATCH", "DELETE"].includes(method)) {
      const csrfToken = sessionStorage.getItem("csrfToken");
      if (csrfToken) {
        config.headers["X-CSRF-TOKEN"] = csrfToken;
      }
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// ─── Response Interceptor: Auto-refresh on 401 ──────────────────────────────
let isRefreshing = false;
let failedQueue = [];

function processQueue(error, token = null) {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Only attempt refresh on 401, once, and not on auth routes themselves
    if (
      error.response &&
      error.response.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url?.includes("/api/v1/auth/")
    ) {
      const refreshToken = sessionStorage.getItem("refreshToken");
      const csrfToken = sessionStorage.getItem("csrfToken");

      if (!refreshToken || !csrfToken) {
        // No refresh token available — clear session and reject
        clearSession();
        return Promise.reject(error);
      }

      if (isRefreshing) {
        // Queue subsequent 401 requests until refresh completes
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers["Authorization"] = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshResponse = await axios.post(
          `${import.meta.env.VITE_API_URL || ""}/api/v1/auth/refresh`,
          { refreshToken, csrfToken },
          { headers: { "Content-Type": "application/json" } }
        );

        const resData = refreshResponse.data;
        if (resData && resData.success) {
          const { accessToken: newAccess, refreshToken: newRefresh, csrfToken: newCsrf } = resData.data;
          storeTokens({ accessToken: newAccess, refreshToken: newRefresh, csrfToken: newCsrf });

          api.defaults.headers["Authorization"] = `Bearer ${newAccess}`;
          originalRequest.headers["Authorization"] = `Bearer ${newAccess}`;

          // Update CSRF for the retried request if it's a state-changing method
          const method = originalRequest.method ? originalRequest.method.toUpperCase() : "";
          if (["POST", "PUT", "PATCH", "DELETE"].includes(method) && newCsrf) {
            originalRequest.headers["X-CSRF-TOKEN"] = newCsrf;
          }

          processQueue(null, newAccess);
          return api(originalRequest);
        } else {
          throw new Error("Refresh failed");
        }
      } catch (refreshError) {
        processQueue(refreshError, null);
        clearSession();
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;
