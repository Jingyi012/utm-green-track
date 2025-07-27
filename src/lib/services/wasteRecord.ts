import { buildQueryParams } from "./common";

const API_URL = '/api/waste-record';

export async function createWasteRecord(data: any) {
    const res = await fetch(`${API_URL}`, {
        method: 'POST',
        body: JSON.stringify(data),
    });

    if (!res.ok) throw new Error('Failed to create waste record');
    return res.json();
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

    const res = await fetch(`/api/waste-record?${query}`);
    const json = await res.json();

    if (!res.ok) throw new Error(json.error || 'Failed to fetch paginated records');
    return json;
}

export async function getWasteRecords(params: {
    campus?: string;
    wasteType?: string;
    disposalMethod?: string;
    year?: string;
}) {
    const query = buildQueryParams(params);

    const res = await fetch(`${API_URL}?${query}`);
    if (!res.ok) throw new Error('Failed to fetch records');
    return res.json();
}

export async function updateWasteRecord(id: string, data: any) {
    const res = await fetch(`${API_URL}/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
    });

    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Update failed');
    return json;
}

export async function deleteWasteRecord(id: string) {
    const res = await fetch(`${API_URL}/${id}`, {
        method: 'DELETE',
    });

    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Delete failed');
    return json;
}

export async function uploadAttachment(file: File, wasteRecordId: number) {
    const formData = new FormData();
    formData.append('wasteRecordId', `${wasteRecordId}`);
    formData.append('file', file);

    const res = await fetch(`${API_URL}/upload`, {
        method: 'POST',
        body: formData,
    });

    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed to upload attachment');
    return json;
}

export async function uploadAttachments(fileList: File[], wasteRecordId: number) {
    const formData = new FormData();
    formData.append('wasteRecordId', `${wasteRecordId}`);
    for (const file of fileList) {
        formData.append('file', file);
    }

    const res = await fetch(`${API_URL}/upload`, {
        method: 'POST',
        body: formData,
    });

    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed to upload attachment');
    return json;
}

export async function getWasteStatisticByYear(year: number) {
    const res = await fetch(`${API_URL}/statistic?year=${year}`);
    if (!res.ok) throw new Error('Failed to fetch waste statistic');
    return res.json();
}

export async function getCampusMonthlySummary(campus: string, year: number) {
    const res = await fetch(`${API_URL}/monthly-summary?campus=${campus}&year=${year}`);
    if (!res.ok) throw new Error('Failed to fetch monthly campus waste chart');
    return res.json();
}