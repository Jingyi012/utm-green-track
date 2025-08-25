import { GeneralResponse, PagedResponse } from "../types/apiResponse";
import { ChangeRequest } from "../types/typing";
import api from "../utils/axios";

const API_URL = '/api/requests';

export async function getAllRequest(
    params: {
        pageNumber?: number;
        pageSize?: number;
        matricNo?: string;
        status?: number;
    },
    options?: { [key: string]: any }) {

    return api.get<PagedResponse<ChangeRequest[]>>(`${API_URL}`, {
        params,
        ...options,
    });
}

export async function createRequest(body: {
    wasteRecordId?: string;
    message: string;
},
    options?: { [key: string]: any }) {
    return api.post<GeneralResponse<string>>(`${API_URL}`, body, { ...options });
}

export async function updateRequestResolveStatus(body: {
    requestIds: string[];
    status?: number;
},
    options?: { [key: string]: any }) {
    return api.put<GeneralResponse<number>>(`${API_URL}`, body, { ...options });
}

export async function deleteRequest(id: string,
    options?: { [key: string]: any }) {
    return api.delete<GeneralResponse<string>>(`${API_URL}/${id}`, { ...options });
}