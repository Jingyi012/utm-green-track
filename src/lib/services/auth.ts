import { GeneralResponse } from "../types/apiResponse";
import { UserIdResponse } from "../types/user";
import { fetcher } from "./common";

const API_URL = '/api/auth';

export async function registerUser(data: any) {
    return fetcher<GeneralResponse<UserIdResponse>>(`${API_URL}/signup`, {
        method: 'POST',
        body: JSON.stringify(data),
    });
}


export async function requestPasswordReset(email: string) {
    return fetcher<GeneralResponse<void>>(`${API_URL}/forgot-password`, {
        method: 'POST',
        body: JSON.stringify({ email }),
    });
}

export async function validateResetToken(token: string) {
    const params = new URLSearchParams({ token });
    return fetcher<GeneralResponse<void>>(`${API_URL}/validate-reset-token?${params.toString()}`);
}

export async function resetPassword(token: string, newPassword: string) {
    return fetcher<GeneralResponse<void>>(`${API_URL}/reset-password`, {
        method: 'POST',
        body: JSON.stringify({ token, newPassword }),
    });
}

export async function changePassword(data: {
    currentPassword: string;
    newPassword: string;
    confirmNewPassword: string;
}) {
    return fetcher(`${API_URL}/change-password`, {
        method: 'POST',
        body: JSON.stringify(data),
    });
}
