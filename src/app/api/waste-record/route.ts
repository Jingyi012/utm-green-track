import { NextRequest, NextResponse } from 'next/server';
import { createWasteRecords, getAllWasteRecords } from '@/lib/services/wasteRecord.service';
import { verifyToken } from '@/lib/firebase/verifyToken';

export async function GET(req: NextRequest) {
    try {
        const { uid: tokenUID } = await verifyToken(req);

        const { searchParams } = new URL(req.url);

        const uid = searchParams.get('uid') || tokenUID;
        const pageSize = parseInt(searchParams.get('pageSize') || '20', 10);
        const pageNumber = parseInt(searchParams.get('pageNumber') || '1', 10);
        const search = searchParams.get('search') || '';
        const records = await getAllWasteRecords({
            uid,
            pageSize,
            pageNumber,
            search
        });

        return NextResponse.json(records, { status: 200 });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const { uid } = await verifyToken(req);
        const body = await req.json();

        if (!Array.isArray(body)) {
            return NextResponse.json({ error: 'Expected an array of records' }, { status: 400 });
        }

        const result = await createWasteRecords(body, uid);
        return NextResponse.json({ ids: result }, { status: 201 });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
