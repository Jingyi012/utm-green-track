import { NextResponse } from 'next/server';
import { loginUser } from '@/lib/services/user.service';

export async function POST(req: Request) {
    try {
        const { email, password } = await req.json();
        const user = await loginUser(email, password);
        return NextResponse.json(user, { status: 200 });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 401 });
    }
}
