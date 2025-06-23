import { fetchWithAuth } from "./common";

const API_URL = '/api/waste-record';

export async function createWasteRecord(data: any) {
    const res = await fetchWithAuth(`${API_URL}`, {
        method: 'POST',
        body: JSON.stringify(data),
    });

    if (!res.ok) throw new Error('Failed to create waste record');
    return res.json();
}

export async function getWasteRecordsPaginated(page: number, pageSize: number, search = '') {
    const params = new URLSearchParams({
        page: String(page),
        pageSize: String(pageSize),
        search,
    });

    const res = await fetchWithAuth(`/api/waste-record?${params}`);
    const json = await res.json();

    if (!res.ok) throw new Error(json.error || 'Failed to fetch paginated records');
    return json;
}

export async function getWasteRecords() {
    const res = await fetchWithAuth(`${API_URL}`);
    if (!res.ok) throw new Error('Failed to fetch records');
    return res.json();
}

export async function updateWasteRecord(id: string, data: any) {
    const res = await fetchWithAuth(`${API_URL}/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
    });

    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Update failed');
    return json;
}

export async function deleteWasteRecord(id: string) {
    const res = await fetchWithAuth(`${API_URL}/${id}`, {
        method: 'DELETE',
    });

    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Delete failed');
    return json;
}

export async function uploadAttachment(file: File): Promise<string> {
    const formData = new FormData();
    formData.append('file', file);

    const res = await fetchWithAuth('/api/waste-record/upload', {
        method: 'POST',
        body: formData,
    });

    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed to upload attachment');
    return json.url || json.fileUrl || '';
}

export async function getWasteStatisticByYear(year: number) {
    const res = await fetchWithAuth(`/api/waste-record/statistic?year=${year}`);
    if (!res.ok) throw new Error('Failed to fetch waste statistic');
    return res.json();
}

export async function getMonthlyCampusWasteChartByYear(campus: string, year: number) {
    const res = await fetchWithAuth(`/api/waste-record/monthly-summary?campus=${campus}&year=${year}`);
    if (!res.ok) throw new Error('Failed to fetch monthly campus waste chart');
    return res.json();
}