import { GeneralResponse, PaginatedResponse } from "../types/apiResponse";
import { WasteRecord, WasteRecordIdResponse } from "../types/wasteRecord";
import { WasteRecordAttachment } from "../types/wasteRecordAttachment";
import { CampusYearSummaryResponse, MonthlyStatisticByYearResponse } from "../types/wasteSummary";
import { buildQueryParams, fetcher } from "./common";

const API_URL = '/api/waste-record';

export async function createWasteRecord(data: any) {
    return fetcher<GeneralResponse<WasteRecordIdResponse>>(`${API_URL}`, {
        method: 'POST',
        body: JSON.stringify(data),
    });
}

export async function getWasteRecordsPaginated(params: {
    pageNumber: number;
    pageSize: number;
    campus?: string;
    wasteType?: string;
    disposalMethod?: string;
    year?: string;
    status?: string;
}) {
    const query = buildQueryParams(params);
    return fetcher<PaginatedResponse<WasteRecord>>(`${API_URL}?${query}`);
}

export async function getWasteRecords(params: {
    campus?: string;
    wasteType?: string;
    disposalMethod?: string;
    year?: string;
}) {
    const query = buildQueryParams(params);

    const res = await fetch(`${API_URL}?${query}`);
    return fetcher<GeneralResponse<WasteRecord[]>>(`${API_URL}?${query}`);
}

export async function updateWasteRecord(id: string, data: any) {
    return fetcher<GeneralResponse<WasteRecord>>(`${API_URL}/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
    });
}

export async function deleteWasteRecord(id: string) {
    return fetcher<GeneralResponse<WasteRecord>>(`${API_URL}/${id}`, {
        method: 'DELETE',
    });
}

export async function uploadAttachments(fileList: File[], wasteRecordId: number) {
    const formData = new FormData();
    formData.append('wasteRecordId', `${wasteRecordId}`);
    for (const file of fileList) {
        formData.append('file', file);
    }

    return fetcher<GeneralResponse<WasteRecordAttachment>>(`${API_URL}/upload`, {
        method: 'POST',
        body: formData,
    });
}

export async function getWasteStatisticByYear(year: number) {
    return fetcher<GeneralResponse<MonthlyStatisticByYearResponse>>(`${API_URL}/statistic?year=${year}`);
}

export async function getCampusMonthlySummary(campus: string, year: number): Promise<GeneralResponse<CampusYearSummaryResponse>> {
    return fetcher<GeneralResponse<CampusYearSummaryResponse>>(`${API_URL}/monthly-summary?campus=${campus}&year=${year}`);
}