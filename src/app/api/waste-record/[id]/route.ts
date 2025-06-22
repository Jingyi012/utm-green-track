import { NextRequest, NextResponse } from 'next/server';
import {
    getWasteRecordById,
    updateWasteRecord,
    deleteWasteRecord,
} from '@/lib/services/wasteRecord.service';

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
    try {
        const record = await getWasteRecordById(params.id);
        if (!record) return NextResponse.json({ error: 'Not found' }, { status: 404 });
        return NextResponse.json(record);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        const body = await req.json();
        await updateWasteRecord(params.id, body);
        return NextResponse.json({ message: 'Updated successfully' });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
    try {
        await deleteWasteRecord(params.id);
        return NextResponse.json({ message: 'Deleted successfully' });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
