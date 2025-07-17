import { fetchWithAuth } from "./common";

const API_URL = '/api/profile';

export async function getProfile() {
    const res = await fetchWithAuth(API_URL, { method: 'GET' });
    const json = await res.json();

    if (!res.ok) {
        throw new Error(json.error || 'Failed to fetch profile');
    }

    return json;
}

export async function updateProfile(data: any) {
    const res = await fetchWithAuth(API_URL, {
        method: 'PUT',
        body: JSON.stringify(data),
    });

    const json = await res.json();

    if (!res.ok) {
        throw new Error(json.error || 'Failed to update profile');
    }

    return json;
}
