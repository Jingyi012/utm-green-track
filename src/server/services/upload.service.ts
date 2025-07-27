import { prisma } from '@/lib/prisma/prisma';
import fs from 'fs';
import path from 'path';
import { pipeline, Readable } from 'stream';
import { promisify } from 'util';

const streamPipeline = promisify(pipeline);

function normalizeFileName(name: string) {
    return name.toLowerCase().replace(/[^a-z0-9.]+/g, '-');
}

export async function uploadToLocal(file: File) {
    const uploadDir = path.join(process.cwd(), 'public/wasteRecords');
    fs.mkdirSync(uploadDir, { recursive: true });

    const normalized = normalizeFileName(file.name);
    const fileName = `${Date.now()}-${normalized}`;
    const filePath = path.join(uploadDir, fileName);
    const fileStream = fs.createWriteStream(filePath);
    const nodeReadable = Readable.fromWeb(file.stream() as any);

    await streamPipeline(nodeReadable, fileStream);

    return `/wasteRecords/${fileName}`;
}

export async function uploadWasteRecordAttachment(wasteRecordId: number, file: File) {
    // check waste record exist
    const wasteRecord = await prisma.wasteRecord.findFirst({ where: { id: wasteRecordId } })

    if (!wasteRecord) throw new Error("Waste Record not found");

    const filePath = await uploadToLocal(file);

    return await prisma.wasteRecordAttachment.create({
        data: {
            filePath,
            fileName: file.name,
            wasteRecordId,
        },
    });
}