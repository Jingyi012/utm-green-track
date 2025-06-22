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
