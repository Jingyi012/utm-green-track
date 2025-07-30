export async function fetcher<TResponse>(
    url: string,
    options?: RequestInit
): Promise<TResponse> {
    const isFormData = options?.body instanceof FormData;

    const res = await fetch(url, {
        ...options,
        headers: {
            ...(options?.headers || {}),
            ...(isFormData ? {} : { "Content-Type": "application/json" }),
        },
    });

    if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Fetch error ${res.status}: ${res.statusText}\n${errorText}`);
    }

    return res.json() as Promise<TResponse>;
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