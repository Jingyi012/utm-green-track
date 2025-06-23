import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/firebase/verifyToken';
import { getWasteStatistic } from '@/lib/services/wasteSummary.service';

export async function GET(req: NextRequest) {
    try {
        const { uid } = await verifyToken(req);
        const { searchParams } = new URL(req.url);
        const year = parseInt(searchParams.get('year') || `${new Date().getFullYear()}`);

        const summary = await getWasteStatistic({ uid, year });

        return NextResponse.json(summary);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
