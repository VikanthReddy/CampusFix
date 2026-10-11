import axios from "axios";

const configuredBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim();

export const API_BASE_URL =
    configuredBaseUrl ||
    (import.meta.env.DEV ? "http://localhost:4040/api" : "");

if (!API_BASE_URL) {
    throw new Error(
        "VITE_API_BASE_URL must be configured for production builds."
    );
}

export const API_ORIGIN = API_BASE_URL.replace(/\/api\/?$/, "");

export const getApiResourceUrl = (resourcePath) =>
    `${API_ORIGIN}${resourcePath}`;

const api = axios.create({
    baseURL: API_BASE_URL,

    timeout: 30000
});

// =====================================================
// ADD JWT TOKEN
// =====================================================

api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("token");

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
    },
    (error) => Promise.reject(error)
);

// =====================================================
// HANDLE AUTHENTICATION ERRORS
// =====================================================

api.interceptors.response.use(
    (response) => response,

    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem("token");
            localStorage.removeItem("user");

            // Redirect only if the request was unauthorized.
            if (window.location.pathname !== "/") {
                window.location.href = "/";
            }
        }

        return Promise.reject(error);
    }
);

export default api;