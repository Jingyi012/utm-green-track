import { prisma } from '@/lib/prisma/prisma';
import { WasteRecordStatus } from '@/lib/enum/wasteRecordStatus';
import { WasteRecord, WasteRecordFilter } from '@/lib/types/wasteRecord';

type WasteRecordInput = Omit<WasteRecord, 'id' | 'createdAt' | 'updatedAt'>;

// Create a single Waste Record
export async function createWasteRecord(
    data: WasteRecordInput,
    userId: number
): Promise<number> {
    const created = await prisma.wasteRecord.create({
        data: {
            ...data,
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

    // Use individual create if you need returned IDs
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
            orderBy: { createdAt: 'desc' },
            skip,
            take,
        }),
        prisma.wasteRecord.count({ where }),
    ]);

    return {
        data,
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
export async function updateWasteRecord(id: number, data: Partial<WasteRecord>) {
    const updateData = {
        ...data,
        updatedAt: new Date(), // Optional, if @updatedAt not used in schema
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