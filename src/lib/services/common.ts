export async function fetchWithAuth(
    url: string,
    options: RequestInit = {}
): Promise<Response> {
    const token = localStorage.getItem('token');

    const headers = {
        ...(options.headers || {}),
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
    };

    return fetch(url, {
        ...options,
        headers,
    });
}

export function buildQueryParams(params: Record<string, any>): string {
    const query = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== '') {
            query.append(key, String(value));
        }
    });

    return query.toString();
}