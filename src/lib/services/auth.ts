export async function registerUser(data: any) {
    const res = await fetch('/api/auth/signup', {
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

export async function loginUser(data: { email: string; password: string }) {
    const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });

    if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Login failed');
    }

    return res.json(); // Returns { token, user }
}

export async function requestPasswordReset(email: string) {
    const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
    });

    if (!res.ok) {
        const { error } = await res.json();
        throw new Error(error || 'Failed to send reset email');
    }

    return res.json(); // { message: 'Reset email sent' }
}
