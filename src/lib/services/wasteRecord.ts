import { UploadFile } from "antd";
import { GeneralResponse, PagedResponse } from "../types/apiResponse";
import { WasteRecord, WasteRecordFilter } from "../types/wasteRecord";
import { CampusYearlySummaryResponse, MonthlyStatisticByYearResponse } from "../types/wasteSummary";
import api from "../utils/axios";

const API_URL = '/api/waste-records';

export async function createWasteRecords(
    body: {
        wasteRecords: {
            campus: string;
            disposalMethodId: string;
            wasteTypeId: string;
            wasteWeight: number;
            location?: string;
            activity?: string;
            date: string;
            attachments?: File[];
        }[];
    },
    options?: { [key: string]: any }
) {
    const formData = new FormData();

    // Build each record
    body.wasteRecords.forEach((record, i) => {
        formData.append(`WasteRecords[${i}].Campus`, record.campus);
        formData.append(`WasteRecords[${i}].DisposalMethodId`, record.disposalMethodId);
        formData.append(`WasteRecords[${i}].WasteTypeId`, record.wasteTypeId);
        formData.append(`WasteRecords[${i}].WasteWeight`, record.wasteWeight.toString());
        formData.append(`WasteRecords[${i}].Date`, record.date);

        if (record.location) {
            formData.append(`WasteRecords[${i}].Location`, record.location);
        }

        if (record.activity) {
            formData.append(`WasteRecords[${i}].Activity`, record.activity);
        }

        // Append attachments for this record
        if (record.attachments && record.attachments.length > 0) {
            record.attachments.forEach((file) => {
                formData.append(`WasteRecords[${i}].Attachments`, file);
            });
        }
    });

    return api.post<GeneralResponse<string[]>>(`${API_URL}`, formData, {
        headers: {
            "Content-Type": "multipart/form-data",
        },
        ...options,
    });
}

export async function getWasteRecordsPaginated(params: WasteRecordFilter,
    options?: { [key: string]: any }) {
    return api.get<PagedResponse<WasteRecord[]>>(`${API_URL}`, { params: { ...params }, ...options });
}

export async function updateWasteRecordApprovalStatus(body: {
    wasteRecordIds: string[];
    status?: number;
},
    options?: { [key: string]: any }) {
    return api.post<GeneralResponse<number>>(`${API_URL}/approval`, body, { ...options });
}

export async function updateWasteRecord(id: string, body: {
    id: string;
    campus?: string;
    disposalMethodId?: string;
    wasteTypeId?: string;
    wasteWeight?: number;
    location?: string;
    activity?: string;
    status?: number;
    date?: string;
},
    options?: { [key: string]: any }) {
    return api.put<GeneralResponse<string>>(`${API_URL}/${id}`, body, { ...options });
}

export async function deleteWasteRecord(id: string, options?: { [key: string]: any }) {
    return api.delete<GeneralResponse<string>>(`${API_URL}/${id}`, {
        ...options
    });
}

export async function uploadAttachments(
    fileList: UploadFile[],
    wasteRecordId: string,
    options?: { [key: string]: any },) {
    const formData = new FormData();
    formData.append('WasteRecordId', `${wasteRecordId}`);
    for (const file of fileList) {
        formData.append('Files', file.originFileObj!);
    }

    return api.post<GeneralResponse<string[]>>(`${API_URL}/attachments/upload`, formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
        ...options,
    });
}

export async function deleteAttachment(id: string, options?: { [key: string]: any },) {
    return api.delete<GeneralResponse<string>>(`${API_URL}/attachments/${id}`, {
        ...options,
    });
}

export async function getWasteStatisticByYear(year: number,
    options?: { [key: string]: any },
) {
    return api.get<GeneralResponse<MonthlyStatisticByYearResponse>>(`${API_URL}/statistic`, {
        params: { year },
        ...options,
    });
}

export async function getCampusYearlySummary(campus: string, year: number,
    options?: { [key: string]: any },
): Promise<GeneralResponse<CampusYearlySummaryResponse>> {
    return api.get<GeneralResponse<CampusYearlySummaryResponse>>(`${API_URL}/yearly-summary`, {
        params: { campus, year },
        ...options,
    });
}

export async function exportExcelWasteRecords(params: {
    year: number,
    month?: number
},
    options?: { [key: string]: any },
) {
    return api.get(`${API_URL}/export/excel`, {
        params,
        responseType: "blob",
        ...options,
    });
}

export async function exportPdfWasteRecords(params: {
    year: number,
    month?: number
},
    options?: { [key: string]: any },
) {
    return api.get(`${API_URL}/export/pdf`, {
        params,
        responseType: "blob",
        ...options,
    });
}

export async function exportExcelWasteStatistics(params: {
    year: number,
},
    options?: { [key: string]: any },
) {
    return api.get(`${API_URL}/statistic/export/excel`, {
        params,
        responseType: "blob",
        ...options,
    });
}

export async function exportPdfWasteStatistics(params: {
    year: number,
},
    options?: { [key: string]: any },
) {
    return api.get(`${API_URL}/statistic/export/pdf`, {
        params,
        responseType: "blob",
        ...options,
    });
}