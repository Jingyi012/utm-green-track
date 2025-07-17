import { NextRequest, NextResponse } from 'next/server';
import { createWasteRecords, getAllWasteRecords } from '@/server/services/wasteRecord.service';
import { verifyToken } from '@/lib/firebase/verifyToken';
import { formatPaginatedResponse, formatResponse } from '@/lib/types/apiResponse';

export async function GET(req: NextRequest) {
    try {
        const { uid: tokenUID } = await verifyToken(req);
        const { searchParams } = new URL(req.url);

        const uid = searchParams.get('uid') || tokenUID;
        const params: {
            uid: string;
            pageNumber?: number;
            pageSize?: number;
            campus?: string;
            disposalMethod?: string;
            wasteType?: string;
            status?: string;
            fromDate?: string;
            toDate?: string;
        } = {
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
        const { uid } = await verifyToken(req);
        const body = await req.json();
        if (!Array.isArray(body)) {
            return NextResponse.json(
                formatResponse(null, false, 'Expected an array of records'),
                { status: 400 }
            );
        }

        const result = await createWasteRecords(body, uid);

        return NextResponse.json(
            formatResponse({ ids: result }, true, 'Waste records created successfully'),
            { status: 201 }
        );
    } catch (error: any) {
        return NextResponse.json(
            formatResponse(null, false, error.message),
            { status: 500 }
        );
    }
}