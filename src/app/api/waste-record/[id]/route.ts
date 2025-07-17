import { NextRequest, NextResponse } from 'next/server';
import {
    getWasteRecordById,
    updateWasteRecord,
    deleteWasteRecord,
} from '@/server/services/wasteRecord.service';
import { formatResponse } from '@/lib/types/apiResponse';

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const id = (await params).id;
        const record = await getWasteRecordById(id);
        if (!record) return NextResponse.json(formatResponse(null, false, 'Not found'), { status: 404 });
        return NextResponse.json(record);
    } catch (error: any) {
        return NextResponse.json(formatResponse(null, false, error.message), { status: 500 });
    }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const id = (await params).id;
        const body = await req.json();
        await updateWasteRecord(id, body);
        return NextResponse.json(formatResponse(null, true, 'Updated successfully'));
    } catch (error: any) {
        return NextResponse.json(formatResponse(null, false, error.message), { status: 500 });
    }
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const id = (await params).id;
        await deleteWasteRecord(id);
        return NextResponse.json(formatResponse(null, true, 'Deleted successfully'));
    } catch (error: any) {
        return NextResponse.json(formatResponse(null, false, error.message), { status: 500 });
    }
}
