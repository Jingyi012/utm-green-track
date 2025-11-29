import { GeneralResponse, PagedResponse } from "../types/apiResponse";
import { UserDetails } from "../types/typing";
import api from "../utils/axios";

const API_URL = '/api/users';

export async function getProfile(options?: { [key: string]: any }) {
    return api.get<GeneralResponse<UserDetails>>(`${API_URL}/profile`, { ...options });
}

export async function updateProfile(body: {
    name?: string;
    contactNumber?: string;
    staffMatricNo?: string;
    departmentId?: string;
    positionId?: string;
    roleIds?: string[]
},
    options?: { [key: string]: any }) {
    return api.put<GeneralResponse<UserDetails>>(`${API_URL}/profile`, body, { ...options });
}

export async function getAllUsers(params: {
    pageNumber?: number;        // default: 1
    pageSize?: number;          // default: 20
    positionId?: string;        // Guid
    departmentId?: string;      // Guid
    roleId?: string;            // Guid
    staffMatricNo?: string;
    name?: string;
    email?: string;
    contactNumber?: string;
    status?: number;
},
    options?: { [key: string]: any }) {

    return api.get<PagedResponse<UserDetails[]>>(`${API_URL}`, {
        params: { ...params },
        ...options,
    });
}

export async function updateUserApprovalStatus(body: {
    userIds: string[];
    status?: number;
    rejectedReason?: string;
},
    options?: { [key: string]: any }) {
    return api.post<GeneralResponse<number>>(`${API_URL}/approval`, body, { ...options });
}

export async function updateUser(body: {
    userId: string;
    name?: string;
    email?: string;
    contactNumber?: string;
    staffMatricNo?: string;
    departmentId?: string;
    positionId?: string;
    roleIds?: string[];
    status?: number;
},
    options?: { [key: string]: any }) {
    return api.put<GeneralResponse<UserDetails>>(`${API_URL}`, body, { ...options });
}

export async function deleteUser(
    userId: string,
    options?: { [key: string]: any }) {
    return api.delete<GeneralResponse<string>>(`${API_URL}/${userId}`, { ...options });
}

export async function exportExcelUsers(
    options?: { [key: string]: any },
) {
    return api.get(`${API_URL}/export/excel`, {
        responseType: "blob",
        ...options,
    });
}

export async function exportPdfUsers(
    options?: { [key: string]: any },
) {
    return api.get(`${API_URL}/export/pdf`, {
        responseType: "blob",
        ...options,
    });
}
