import { NextRequest, NextResponse } from 'next/server';
import { IncomingForm } from 'formidable';
import { uploadBytes, getDownloadURL, ref } from 'firebase/storage';
import { storage } from '@/lib/firebase/firebaseClient';
import fs from 'fs';

// Disable Next.js default body parser
export const config = {
    api: {
        bodyParser: false,
    },
};

export async function POST(req: NextRequest) {
    const form = new IncomingForm({
        keepExtensions: true,
        maxFileSize: 5 * 1024 * 1024, // 5MB
    });

    const parseForm = (): Promise<{ fields: any; files: any }> => {
        return new Promise((resolve, reject) => {
            form.parse(req as any, (err, fields, files) => {
                if (err) reject(err);
                else resolve({ fields, files });
            });
        });
    };

    try {
        const { files } = await parseForm();

        const file = files.file[0];

        const data = await fs.promises.readFile(file.filepath);
        const firebaseRef = ref(storage, `attachments/${Date.now()}_${file.originalFilename}`);
        const snapshot = await uploadBytes(firebaseRef, data);
        const downloadUrl = await getDownloadURL(snapshot.ref);

        return NextResponse.json({ url: downloadUrl });
    } catch (error) {
        console.error('Upload error:', error);
        return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
    }
}
