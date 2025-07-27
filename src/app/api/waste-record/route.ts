import { NextRequest, NextResponse } from 'next/server';
import { createWasteRecord, createWasteRecords, getAllWasteRecords } from '@/server/services/wasteRecord.service';
import { formatPaginatedResponse, formatResponse } from '@/lib/types/apiResponse';
import { WasteRecordFilter } from '@/lib/types/wasteRecord';
import { getToken } from 'next-auth/jwt';

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

        if (!token || !token.id) {
            return NextResponse.json(formatResponse(null, false, 'Unauthorized'), { status: 401 });
        }

        const uidParam = searchParams.get('uid');
        const uid = uidParam ? parseInt(uidParam, 10) : token.id;

        const params: WasteRecordFilter = {
            uid,
            pageNumber: searchParams.get('pageNumber') ? parseInt(searchParams.get('pageNumber')!) : undefined,
            pageSize: searchParams.get('pageSize') ? parseInt(searchParams.get('pageSize')!) : undefined,
            campus: searchParams.get('campus') || undefined,
            disposalMethod: searchParams.get('disposalMethod') || undefined,
            wasteType: searchParams.get('wasteType') || undefined,
            status: searchParams.get('status') || undefined,
            fromDate: searchParams.get('fromDate') || undefined,
            toDate: searchParams.get('toDate') || undefined,
        };

        const {
            data,
            totalRecords,
            paginated,
            pageSize,
            pageNumber,
        } = await getAllWasteRecords(params);

        const response = paginated
            ? formatPaginatedResponse(data, pageNumber!, pageSize!, totalRecords)
            : formatResponse(data);

        return NextResponse.json(response, { status: 200 });

    } catch (error: any) {
        return NextResponse.json(
            formatResponse(null, false, error.message),
            { status: 500 }
        );
    }
}

export async function POST(req: NextRequest) {
    try {
        const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

        if (!token || !token.id) {
            return NextResponse.json(formatResponse(null, false, 'Unauthorized'), { status: 401 });
        }
        const uid = token.id;

        const body = await req.json();

        const result = await createWasteRecord(body, uid);

        return NextResponse.json(
            formatResponse({ id: result }, true, 'Waste record created successfully'),
            { status: 201 }
        );
    } catch (error: any) {
        return NextResponse.json(
            formatResponse(null, false, error.message),
            { status: 500 }
        );
    }
}