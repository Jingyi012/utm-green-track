import { NextRequest, NextResponse } from 'next/server';
import { getUserByUID, updateUserProfile } from '@/server/services/user.service';
import { formatResponse } from '@/lib/types/apiResponse';
import { getToken } from 'next-auth/jwt';

export async function GET(req: NextRequest) {
    try {
        const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

        if (!token || !token.id) {
            return NextResponse.json(formatResponse(null, false, 'Unauthorized'), { status: 401 });
        }

        const user = await getUserByUID(token.id);
        return NextResponse.json(formatResponse(user));
    } catch (error: any) {
        return NextResponse.json(formatResponse(null, false, error.message), { status: 500 });
    }
}

export async function PUT(req: NextRequest) {
    try {
        const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

        if (!token || !token.id) {
            return NextResponse.json(formatResponse(null, false, 'Unauthorized'), { status: 401 });
        }

        const data = await req.json();
        await updateUserProfile(token.id, data);
        return NextResponse.json({ message: 'Profile updated' });
    } catch (error: any) {
        return NextResponse.json(formatResponse(null, false, error.message), { status: 500 });
    }
}
