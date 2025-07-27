import { NextRequest, NextResponse } from 'next/server';
import { formatResponse } from '@/lib/types/apiResponse';
import { uploadWasteRecordAttachment } from '@/server/services/upload.service';

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const wasteRecordId = parseInt(formData.get('wasteRecordId') as string);

        if (isNaN(wasteRecordId)) {
            return NextResponse.json(formatResponse(null, false, 'Missing or invalid wasteRecordId'), { status: 400 });
        }

        const files: File[] = [];
        for (const [key, value] of formData.entries()) {
            if (key === 'file' && value instanceof File) {
                files.push(value);
            }
        }

        if (files.length === 0) {
            return NextResponse.json(formatResponse(null, false, 'No files provided'), { status: 400 });
        }

        const results = await Promise.all(
            files.map(file => uploadWasteRecordAttachment(wasteRecordId, file))
        );

        return NextResponse.json(formatResponse(results));
    } catch (error) {
        console.error(error);
        return NextResponse.json(formatResponse(null, false, 'Upload failed'), { status: 500 });
    }
}
