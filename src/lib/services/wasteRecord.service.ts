import { db } from '@/lib/firebase/firebaseAdmin';
import { Timestamp } from 'firebase-admin/firestore'; // Import from admin
import { getStorage } from 'firebase-admin/storage';

import { WasteRecord } from '@/lib/types/wasteRecord';
import { formatPaginatedResponse } from '../utils/apiResponse';

import * as XLSX from 'xlsx';
import PDFDocument from 'pdfkit';

type WasteRecordInput = Omit<WasteRecord, 'createdAt' | 'updatedAt'>;

// Upload Attachment to Firebase Storage
export async function uploadAttachment(file: File): Promise<string> {
    const maxSizeMB = 5;
    if (file.size > maxSizeMB * 1024 * 1024) {
        throw new Error(`File size exceeds ${maxSizeMB}MB limit.`);
    }

    const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
        throw new Error(`Unsupported file type. Allowed types: JPG, PNG, PDF.`);
    }

    const fileName = `attachments/${Date.now()}_${file.name}`;
    const fileBuffer = Buffer.from(await file.arrayBuffer());

    // Upload the file
    const bucket = getStorage().bucket();
    await bucket.file(fileName).save(fileBuffer, {
        metadata: {
            contentType: file.type,
        },
    });

    // Get download URL
    const [url] = await bucket.file(fileName).getSignedUrl({
        action: 'read',
        expires: '03-09-2491' // Far future date
    });

    return url;
}

// Create Waste Record by batch
export async function createWasteRecords(
    dataList: { data: WasteRecordInput }[], userId: string
): Promise<string[]> {
    const batch = db.batch();
    const createdIds: string[] = [];
    const collectionRef = db.collection('wasteRecords');

    dataList.forEach(item => {
        const docRef = collectionRef.doc(); // Auto-generate ID
        const record = {
            ...item.data,
            status: 'New',
            createdAt: Timestamp.now(),
            createdBy: userId,
            updatedAt: Timestamp.now(),
        };
        batch.set(docRef, record);
        createdIds.push(docRef.id);
    });

    await batch.commit();
    return createdIds;
}

// Create Waste Record
export async function createWasteRecord(data: WasteRecordInput, userId: string): Promise<string> {
    const docRef = await db.collection('wasteRecords').add({
        ...data,
        status: 'New',
        createdAt: Timestamp.now(),
        createdBy: userId,
        updatedAt: Timestamp.now(),
    });
    return docRef.id;
}

// Read All Waste Records
export async function getAllWasteRecords({
    uid,
    pageSize,
    pageNumber,
    search
}: {
    uid?: string;
    pageSize?: number;
    pageNumber?: number;
    search?: string;
}) {
    let query = db.collection('wasteRecords').orderBy('createdAt', 'desc');

    if (uid) {
        query = query.where('createdBy', '==', uid);
    }

    const snapshot = await query.get();
    let allDocs = snapshot.docs;

    // In-memory search filtering
    if (search) {
        const lowerSearch = search.toLowerCase();
        allDocs = allDocs.filter(doc => {
            const data = doc.data() as WasteRecord;

            return [
                data.campusName,
                data.location,
                data.disposalMethod,
                data.wasteType,
                data.wasteWeight?.toString(),
            ]
                .filter(Boolean)
                .some(field =>
                    String(field).toLowerCase().includes(lowerSearch)
                );
        });
    }

    // Handle pagination only if pageSize and pageNumber are provided
    const shouldPaginate = typeof pageSize !== 'undefined' && typeof pageNumber !== 'undefined';
    let pagedDocs = allDocs;
    let totalRecords = allDocs.length;

    if (shouldPaginate) {
        const offset = (pageNumber! - 1) * pageSize!;
        pagedDocs = allDocs.slice(offset, offset + pageSize!);
    }

    const data: WasteRecord[] = pagedDocs.map((doc) => {
        const record = doc.data() as WasteRecord;
        return {
            ...record,
            id: doc.id,
            createdAt: record.createdAt instanceof Timestamp ? record.createdAt.toDate() : record.createdAt,
            updatedAt: record.updatedAt instanceof Timestamp ? record.updatedAt.toDate() : record.updatedAt,
        };
    });

    return shouldPaginate
        ? formatPaginatedResponse(data, pageNumber!, pageSize!, totalRecords)
        : { data, total: totalRecords };
}

// Read Single Waste Record
export async function getWasteRecordById(id: string): Promise<WasteRecord | null> {
    const docRef = db.collection('wasteRecords').doc(id);
    const snapshot = await docRef.get();
    return snapshot.exists ? (snapshot.data() as WasteRecord) : null;
}

// Update Waste Record
export async function updateWasteRecord(id: string, data: Partial<WasteRecord>) {
    const docRef = db.collection('wasteRecords').doc(id);
    await docRef.update({
        ...data,
        updatedAt: Timestamp.now(),
    });
}

// Delete Waste Record
export async function deleteWasteRecord(id: string) {
    const docRef = db.collection('wasteRecords').doc(id);
    const record = await getWasteRecordById(id);

    if (record?.attachmentUrl) {
        // Extract the file path from the URL
        const url = new URL(record.attachmentUrl);
        const filePath = decodeURIComponent(url.pathname.split('/o/')[1].split('?')[0]);
        const bucket = getStorage().bucket();
        await bucket.file(filePath).delete().catch(() => { });
    }

    await docRef.delete();
}

// Export excel
export async function exportExcelWasteRecord(params: any) {
    const records = await getAllWasteRecords(params);
    const headers = [
        ['No.', 'Date', 'Campus', 'Location', 'Disposal Method', 'Waste Type', 'Weight (KG)', 'Status'],
    ];

    const rows = records.data.map((r, i) => [
        i + 1,
        new Date(r.date).toLocaleDateString('en-GB'),
        r.campusName,
        r.location,
        r.disposalMethod,
        r.wasteType,
        r.wasteWeight,
        r.status,
    ]);

    const worksheet = XLSX.utils.aoa_to_sheet([...headers, ...rows]);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'WasteRecords');

    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    return buffer;
}

export async function exportPdfWasteRecord(params: any) {
    const records = await getAllWasteRecords(params);
    const doc = new PDFDocument({ size: 'A4', margin: 40 });
    const buffers: Buffer[] = [];
    doc.font('Helvetica');

    doc.fontSize(16).text('Waste Records Report', { align: 'center' });
    doc.moveDown();

    const tableHeaders = ['No.', 'Date', 'Campus', 'Location', 'Disposal Method', 'Waste Type', 'Weight (KG)', 'Status'];

    // Table header
    doc.fontSize(10).fillColor('green').text(tableHeaders.join(' | '));
    doc.fillColor('black').moveDown(0.5);

    // Table body
    records.data.forEach((record, i) => {
        doc.text(
            [
                i + 1,
                new Date(record.date).toLocaleDateString('en-GB'),
                record.campusName,
                record.location,
                record.disposalMethod,
                record.wasteType,
                record.wasteWeight,
                record.status,
            ].join(' | ')
        );
    });

    doc.end();
    const pdfBuffer: Buffer = await new Promise(resolve => {
        doc.on('end', () => {
            const finalBuffer = Buffer.concat(buffers);
            resolve(finalBuffer);
        });
    });
    return pdfBuffer;
}