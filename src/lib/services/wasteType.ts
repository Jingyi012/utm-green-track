import { GeneralResponse } from "../types/apiResponse";
import { WasteTypeWithDisposalMethod } from "../types/typing";
import api from "../utils/axios";

const API_URL = '/api/waste-types';

export async function getAllWasteType(
    options?: { [key: string]: any }) {

    return api.get<GeneralResponse<WasteTypeWithDisposalMethod>>(`${API_URL}`, {
        ...options,
    });
}

export async function createWasteType(body: {
    name: string;
    disposalMethodId: string;
    emissionFactor: number;
},
    options?: { [key: string]: any }) {
    return api.post<GeneralResponse<string>>(`${API_URL}`, body, { ...options });
}

export async function updateWasteType(id: string, body: {
    id: string;
    name?: string;
    emissionFactor?: number;
},
    options?: { [key: string]: any }) {
    return api.put<GeneralResponse<string>>(`${API_URL}/${id}`, body, { ...options });
}

export async function deleteWasteType(id: string,
    options?: { [key: string]: any }) {
    return api.delete<GeneralResponse<string>>(`${API_URL}/${id}`, { ...options });
}