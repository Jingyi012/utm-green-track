import { GeneralResponse } from "../types/apiResponse";
import { Department } from "../types/typing";
import api from "../utils/axios";

const API_URL = '/api/departments';

export async function getAllDepartment(
    options?: { [key: string]: any }) {

    return api.get<GeneralResponse<Department[]>>(`${API_URL}`, {
        ...options,
    });
}

export async function createDepartment(body: {
    name: string;
},
    options?: { [key: string]: any }) {
    return api.post<GeneralResponse<string>>(`${API_URL}`, body, { ...options });
}

export async function updateDepartment(id: string, body: {
    id: string;
    name?: string;
},
    options?: { [key: string]: any }) {
    return api.put<GeneralResponse<string>>(`${API_URL}/${id}`, body, { ...options });
}

export async function deleteDepartment(id: string,
    options?: { [key: string]: any }) {
    return api.delete<GeneralResponse<string>>(`${API_URL}/${id}`, { ...options });
}