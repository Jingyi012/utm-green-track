import { NextResponse } from 'next/server';
import { resetPassword } from '@/server/services/user.service';
import { formatResponse } from '@/lib/types/apiResponse';

export async function POST(req: Request) {
    try {
        const { email } = await req.json();
        await resetPassword(email);
        return NextResponse.json(formatResponse(null, true, 'Reset email sent'), { status: 200 });
    } catch (error: any) {
        return NextResponse.json(formatResponse(null, false, error.message), { status: 400 });
    }
}
