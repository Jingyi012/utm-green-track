import { NextRequest, NextResponse } from 'next/server';
import { getWasteStatistic } from '@/server/services/wasteSummary.service';
import { formatResponse } from '@/lib/types/apiResponse';
import { getToken } from 'next-auth/jwt';

export async function GET(req: NextRequest) {
    try {
        const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

        if (!token || !token.id) {
            return NextResponse.json(formatResponse(null, false, 'Unauthorized'), { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const year = parseInt(searchParams.get('year') || `${new Date().getFullYear()}`);

        const summary = await getWasteStatistic({ uid: token.id, year });

        return NextResponse.json(formatResponse(summary));
    } catch (error: any) {
        return NextResponse.json(formatResponse(null, false, error.message), { status: 500 });
    }
}
