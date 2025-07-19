const API_URL = '/api/auth';

export async function registerUser(data: any) {
    const res = await fetch(`${API_URL}/signup`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    });

    if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Registration failed');
    }

    return res.json();
}

export async function requestPasswordReset(email: string) {
    const res = await fetch(`${API_URL}/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
    });

    if (!res.ok) {
        const { error } = await res.json();
        throw new Error(error || 'Failed to send reset email');
    }

    return res.json();
}

export async function changePassword(data: { currentPassword: string, newPassword: string, confirmNewPassword: string }): Promise<void> {
    const res = await fetch(`${API_URL}/change-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });

    const json = await res.json();

    if (!res.ok) {
        throw new Error(json.error || 'Failed to update profile');
    }

    return json;
}