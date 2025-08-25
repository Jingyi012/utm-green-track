import { GeneralResponse } from "../types/apiResponse";
import { LoginResponse } from "../types/typing";
import api from "../utils/axios";

const API_URL = '/api/auth';

export async function apiLogin(body: {
    email: string;
    password: string;
}, options?: { [key: string]: any }) {
    return api.post<GeneralResponse<LoginResponse>>(`${API_URL}/login`, body, { ...options });
}

export async function registerUser(body: {
    name: string;
    departmentId: string;
    contactNumber: string;
    positionId: string;
    staffMatricNo: string;
    email: string;
    password: string;
    roles: string[]
}, options?: { [key: string]: any }
) {
    return api.post<GeneralResponse<string>>(`${API_URL}/register`, body, { ...options });
}

export async function forgotPassword(
    email: string,
    options?: { [key: string]: any }
) {
    return api.post<GeneralResponse<void>>(
        `${API_URL}/forgot-password`,
        { email },
        { ...options }
    );
}

export async function resetPassword(
    body: { email: string, token: string, password: string },
    options?: { [key: string]: any }
) {
    return api.post<GeneralResponse<string>>(`${API_URL}/reset-password`, body, { ...options });
}

export async function changePassword(body: {
    password: string;
    newPassword: string;
    confirmNewPassword: string;
},
    options?: { [key: string]: any }
) {
    return api.post<GeneralResponse<string>>(`${API_URL}/change-password`, body, { ...options });
}

export async function refreshToken(
    options?: { [key: string]: any }
) {
    return api.post<GeneralResponse<{ token: string }>>(`${API_URL}/refresh`, { ...options });
}
