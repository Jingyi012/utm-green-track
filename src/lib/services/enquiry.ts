import { GeneralResponse, PagedResponse } from "../types/apiResponse";
import { EnquiryDetails, Enquiry } from "../types/typing";
import api from "../utils/axios";

const API_URL = '/api/enquiries';

export async function getAllEnquiry(
    params: {
        pageNumber?: number;
        pageSize?: number;
        subject?: string;
        status?: number;
    },
    options?: { [key: string]: any }) {

    return api.get<PagedResponse<Enquiry[]>>(`${API_URL}`, {
        params,
        ...options,
    });
}

export async function getEnquiryById(id: string, options?: { [key: string]: any }) {
    return api.get<GeneralResponse<EnquiryDetails>>(`${API_URL}/${id}`, { ...options });
}

export async function createEnquiry(body: {
    subject: string;
    message: string;
},
    options?: { [key: string]: any }) {
    return api.post<GeneralResponse<string>>(`${API_URL}`, body, { ...options });
}

export async function replyEnquiry(body: {
    enquiryId: string;
    message: string;
},
    options?: { [key: string]: any }) {
    return api.post<GeneralResponse<string>>(`${API_URL}/reply`, body, { ...options });
}

export async function updateEnquiryStatus(body: {
    enquiryId: string;
    status?: number;
},
    options?: { [key: string]: any }) {
    return api.put<GeneralResponse<number>>(`${API_URL}/status`, body, { ...options });
}

export async function deleteEnquiry(id: string,
    options?: { [key: string]: any }) {
    return api.delete<GeneralResponse<string>>(`${API_URL}/${id}`, { ...options });
}