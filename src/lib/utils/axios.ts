import axios, { AxiosInstance, AxiosResponse } from "axios";
import { refreshToken } from "../services/auth";

let isRefreshing = false;
let failedQueue: any[] = [];

const api: AxiosInstance = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL,
    withCredentials: true, // important if refresh token is in httpOnly cookie
});

// helper to process failed requests after refresh
const processQueue = (error: any, token: string | null = null) => {
    failedQueue.forEach((prom) => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });
    failedQueue = [];
};

// attach access token to requests
api.interceptors.request.use(
    (config) => {
        config.headers = config.headers;
        const currentUser = localStorage.getItem('currentUser');
        if (currentUser) {
            const parseUser = JSON.parse(currentUser);
            const token = parseUser?.jwToken;
            if (token) {
                config.headers['Authorization'] = `Bearer ${token}`;
            }
        }
        return config;
    },
);

api.interceptors.response.use(
    (response: AxiosResponse<any>) => {
        if (response.config.responseType === 'blob') return response;
        return response.data;
    },
    async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
            if (isRefreshing) {
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                })
                    .then((token) => {
                        originalRequest.headers.Authorization = `Bearer ${token}`;
                        return api(originalRequest);
                    })
                    .catch((err) => Promise.reject(err));
            }

            originalRequest._retry = true;
            isRefreshing = true;

            try {
                const currentUser = localStorage.getItem("currentUser");
                if (!currentUser) throw new Error("No current user found");

                const parsedUser = JSON.parse(currentUser);

                // call backend to refresh token
                const res = await refreshToken();

                const newToken = res.data.token;

                const updatedUser = {
                    ...parsedUser,
                    jwToken: newToken,
                };
                localStorage.setItem("currentUser", JSON.stringify(updatedUser));

                api.defaults.headers.common.Authorization = `Bearer ${newToken}`;

                processQueue(null, newToken);

                return api(originalRequest);
            } catch (err) {
                processQueue(err, null);
                localStorage.removeItem("currentUser");
                window.location.href = "/login";
                return Promise.reject(err);
            } finally {
                isRefreshing = false;
            }
        }

        return Promise.reject(error);
    }
);

export default api;

declare module "axios" {
    export interface AxiosInstance {
        request<T = any>(config: AxiosRequestConfig): Promise<T>;
        get<T = any>(url: string, config?: AxiosRequestConfig): Promise<T>;
        delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<T>;
        head<T = any>(url: string, config?: AxiosRequestConfig): Promise<T>;
        options<T = any>(url: string, config?: AxiosRequestConfig): Promise<T>;
        post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T>;
        put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T>;
        patch<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T>;
    }
}
