import { GeneralResponse } from "../types/apiResponse";
import { User } from "../types/user";
import { fetcher } from "./common";

const API_URL = '/api/profile';

export async function getProfile() {
    return fetcher<GeneralResponse<User>>(`${API_URL}`, {
        method: 'GET',
    });
}

export async function updateProfile(data: any) {
    return fetcher<any>(`${API_URL}`, {
        method: 'PUT',
        body: JSON.stringify(data),
    });
}
