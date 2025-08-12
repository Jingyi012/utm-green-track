import { prisma } from '@/lib/prisma/prisma';
import { WasteRecordStatus } from '@/lib/enum/wasteRecordStatus';
import { WasteRecord, WasteRecordFilter } from '@/lib/types/wasteRecord';

const DOMAIN = process.env.NEXT_PUBLIC_DOMAIN_URL || 'http://localhost:3000';
type WasteRecordInput = Omit<WasteRecord, 'id' | 'createdAt' | 'updatedAt' | 'attachments'>;
type WasteRecordUpdatePayload = Omit<WasteRecord, 'id' | 'createdAt' | 'updatedAt' | 'attachments'>;

// Create a single Waste Record
export async function createWasteRecord(
    data: WasteRecordInput,
    userId: number
): Promise<number> {
    const created = await prisma.wasteRecord.create({
        data: {
            ...data,
            wasteWeight:
                typeof data.wasteWeight === 'string'
                    ? parseFloat(data.wasteWeight)
                    : data.wasteWeight,
            status: WasteRecordStatus.New,
            createdById: userId,
        },
    });

    return created.id;
}

// Create multiple Waste Records in batch
export async function createWasteRecords(
    dataList: WasteRecordInput[],
    userId: number
): Promise<number[]> {
    const records = dataList.map((data) => ({
        ...data,
        wasteWeight:
            typeof data.wasteWeight === 'string'
                ? parseFloat(data.wasteWeight)
                : data.wasteWeight,
        status: WasteRecordStatus.New,
        createdById: userId,
    }));

    const createdRecords = await Promise.all(
        records.map((record) => prisma.wasteRecord.create({ data: record }))
    );

    return createdRecords.map((record) => record.id);
}

// Get all Waste Records with optional user filter + pagination
export async function getAllWasteRecords({
    uid,
    pageNumber,
    pageSize,
    campus,
    disposalMethod,
    wasteType,
    status,
    fromDate,
    toDate,
}: WasteRecordFilter) {
    const where = {
        ...(uid && { createdById: uid }),
        ...(campus && { campus }),
        ...(disposalMethod && { disposalMethod }),
        ...(wasteType && { wasteType }),
        ...(status && { status }),
        ...(fromDate || toDate
            ? {
                date: {
                    ...(fromDate && { gte: new Date(fromDate) }),
                    ...(toDate && { lte: new Date(toDate) }),
                },
            }
            : {}),
    };

    const skip = pageSize && pageNumber ? (pageNumber - 1) * pageSize : undefined;
    const take = pageSize;

    const [data, totalRecords] = await Promise.all([
        prisma.wasteRecord.findMany({
            where,
            orderBy: { date: 'desc' },
            skip,
            take,
            include: {
                attachments: {
                    select: {
                        id: true,
                        fileName: true,
                        filePath: true,
                    }
                },
            },
        }),
        prisma.wasteRecord.count({ where }),
    ]);

    const dataWithFullURLs = data.map(record => ({
        ...record,
        attachments: record.attachments.map(att => ({
            id: att.id,
            url: `${DOMAIN}${att.filePath}`,
            fileName: att.fileName
        })),
    }));

    return {
        data: dataWithFullURLs,
        totalRecords,
        pageNumber,
        pageSize,
        paginated: !!(pageSize && pageNumber),
    };
}

// Get a single Waste Record by ID
export async function getWasteRecordById(id: number): Promise<WasteRecord | null> {
    return await prisma.wasteRecord.findUnique({
        where: { id },
    });
}

// Update a Waste Record
export async function updateWasteRecord(id: number, data: WasteRecordUpdatePayload) {
    const updateData = {
        ...data,
        updatedAt: new Date(),
    };

    await prisma.wasteRecord.update({
        where: { id },
        data: updateData,
    });
}

// Delete a Waste Record
export async function deleteWasteRecord(id: number) {
    // Optional: Handle deleting attachments here if needed

    await prisma.wasteRecord.delete({
        where: { id },
    });
}