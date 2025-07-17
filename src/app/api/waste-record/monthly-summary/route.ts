import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/firebase/verifyToken';
import { GetCampusMonthlySummary } from '@/server/services/wasteSummary.service';
import { formatResponse } from '@/lib/types/apiResponse';

export async function GET(req: NextRequest) {
    try {
        const { uid } = await verifyToken(req);
        const { searchParams } = new URL(req.url);
        const year = parseInt(searchParams.get('year') || `${new Date().getFullYear()}`);
        const campus = searchParams.get('campus') || undefined;
        const summary = await GetCampusMonthlySummary({ campus, year });

        const response = formatResponse(summary.data, summary.success, summary.error);
        if (summary.success) {
            return NextResponse.json(response);
        } else {
            return NextResponse.json(response, { status: 500 });
        }

    } catch (error: any) {
        return NextResponse.json(formatResponse(null, false, error.message), { status: 500 });
    }
}
