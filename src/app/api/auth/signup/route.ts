import { NextResponse } from 'next/server';
import { registerUser } from '@/server/services/user.service';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        await registerUser(body);
        return NextResponse.json({ message: 'User registered successfully' }, { status: 201 });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 400 });
    }
}
