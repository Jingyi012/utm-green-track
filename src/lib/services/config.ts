import { GeneralResponse } from "../types/apiResponse";
import { Config } from "../types/typing";
import api from "../utils/axios";

const API_URL = '/api/config';

export async function getAllConfig(
    options?: { [key: string]: any }) {

    return api.get<GeneralResponse<Config[]>>(`${API_URL}`, {
        ...options,
    });
}

export async function getConfigByKey(key: string,
    options?: { [key: string]: any }) {

    return api.get<GeneralResponse<Config>>(`${API_URL}/${key}`, {
        ...options,
    });
}

export async function updateConfig(body: {
    key: string;
    value?: string;
},
    options?: { [key: string]: any }) {
    return api.put<GeneralResponse<string>>(`${API_URL}`, body, { ...options });
}
