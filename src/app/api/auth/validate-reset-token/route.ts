import { NextResponse } from 'next/server';
import { validateResetToken } from '@/server/services/user.service';
import { formatResponse } from '@/lib/types/apiResponse';

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const token = searchParams.get('token');
        if (!token) {
            return NextResponse.json(
                formatResponse(null, false, 'Missing token parameter'),
                { status: 400 }
            );
        }
        await validateResetToken(token);
        return NextResponse.json(formatResponse(null, true, 'Valid reset token'), { status: 200 });
    } catch (error: any) {
        return NextResponse.json(formatResponse(null, false, error.message), { status: 500 });
    }
}
