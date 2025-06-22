import { verifyToken } from '@/lib/firebase/verifyToken';
import { exportExcelWasteRecord } from '@/lib/services/wasteRecord.service';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
    const { uid } = await verifyToken(req);
    const buffer = await exportExcelWasteRecord({ uid });

    return new NextResponse(buffer, {
        headers: {
            'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'Content-Disposition': 'attachment; filename="WasteRecords.xlsx"',
        },
    });
}
