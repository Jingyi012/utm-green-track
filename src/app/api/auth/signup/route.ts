import { NextResponse } from 'next/server';
import { registerUser } from '@/server/services/user.service';
import { formatResponse } from '@/lib/types/apiResponse';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const response = await registerUser(body);
        return NextResponse.json(formatResponse({ id: response }, true, 'User registered successfully'), { status: 201 });
    } catch (error: any) {
        return NextResponse.json(formatResponse(null, false, error.message), { status: 400 });
    }
}
