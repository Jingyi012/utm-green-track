import { GeneralResponse } from "../types/apiResponse";
import { DisposalMethodWithWasteType } from "../types/typing";
import api from "../utils/axios";

const API_URL = '/api/disposal-methods';

export async function getAllDisposalMethod(
    options?: { [key: string]: any }) {

    return api.get<GeneralResponse<DisposalMethodWithWasteType>>(`${API_URL}`, {
        ...options,
    });
}

export async function createDisposalMethod(body: {
    name: string;
},
    options?: { [key: string]: any }) {
    return api.post<GeneralResponse<string>>(`${API_URL}`, body, { ...options });
}

export async function updateDisposalMethod(id: string, body: {
    id: string;
    name?: string;
},
    options?: { [key: string]: any }) {
    return api.put<GeneralResponse<string>>(`${API_URL}/${id}`, body, { ...options });
}

export async function deleteDisposalMethod(id: string,
    options?: { [key: string]: any }) {
    return api.delete<GeneralResponse<string>>(`${API_URL}/${id}`, { ...options });
}