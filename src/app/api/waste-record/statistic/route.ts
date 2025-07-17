import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/firebase/verifyToken';
import { getWasteStatistic } from '@/server/services/wasteSummary.service';
import { formatResponse } from '@/lib/types/apiResponse';

export async function GET(req: NextRequest) {
    try {
        const { uid } = await verifyToken(req);
        const { searchParams } = new URL(req.url);
        const year = parseInt(searchParams.get('year') || `${new Date().getFullYear()}`);

        const summary = await getWasteStatistic({ uid, year });

        return NextResponse.json(formatResponse(summary));
    } catch (error: any) {
        return NextResponse.json(formatResponse(null, false, error.message), { status: 500 });
    }
}
