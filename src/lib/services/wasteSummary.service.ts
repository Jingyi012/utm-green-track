import { Timestamp } from 'firebase-admin/firestore';
import { WasteRecord } from '../types/wasteRecord';
import { db } from '@/lib/firebase/firebaseAdmin';

const monthNames = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sept', 'oct', 'nov', 'dec'];

function toCamelCase(str: string): string {
    return str
        .replace(/\s(.)/g, ($1) => $1.toUpperCase())
        .replace(/\s/g, '')
        .replace(/^(.)/, ($1) => $1.toLowerCase())
        .replace(/-/g, '');
}
type CategoryTotals = {
    landfill: number;
    recycling: number;
    composting: number;
    energyRecovery: number;
    [key: string]: number;
};

export function groupWasteByMonthAndSummarize(records: WasteRecord[], year: number) {
    const monthlyData: Record<string, any> = {};
    const totals: Record<string, any> = {};
    const categoryTotals: CategoryTotals = {
        landfill: 0,
        recycling: 0,
        composting: 0,
        energyRecovery: 0,
    };

    // Initialize structure
    monthNames.forEach(month => {
        monthlyData[month] = {
            landfill: {},
            recycling: {},
            composting: {},
            energyRecovery: {}
        };
    });

    for (const record of records) {
        const month = monthNames[new Date(record.createdAt).getMonth()];
        const disposalMethod = toCamelCase(record.disposalMethod?.trim());
        const wasteType = toCamelCase(record.wasteType?.trim());
        const weight = typeof record.wasteWeight === 'number' ? record.wasteWeight : 0;

        if (!disposalMethod || !wasteType) continue;

        if (!monthlyData[month][disposalMethod]) {
            monthlyData[month][disposalMethod] = {};
        }
        if (!monthlyData[month][disposalMethod][wasteType]) {
            monthlyData[month][disposalMethod][wasteType] = 0;
        }
        monthlyData[month][disposalMethod][wasteType] += weight;

        if (!totals[disposalMethod]) {
            totals[disposalMethod] = {};
        }
        totals[disposalMethod][wasteType] = (totals[disposalMethod][wasteType] || 0) + weight;

        if (categoryTotals[disposalMethod] !== undefined) {
            categoryTotals[disposalMethod] += weight;
        } else {
            categoryTotals[disposalMethod] = weight;
        }
    }

    return {
        year,
        monthlyData,
        totals,
        categoryTotals,
        metadata: {
            generatedAt: new Date().toISOString(),
            dataSource: 'UTM GreenTrack',
        },
    };
}

export async function getWasteSummary({ uid, year }: { uid?: string; year: number }) {
    const collection = db.collection('wasteRecords');

    let query: FirebaseFirestore.Query = collection;

    // Apply filters
    if (uid) {
        query = query.where('createdBy', '==', uid);
    }

    const snapshot = await query.get();

    const records: WasteRecord[] = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
            ...data,
            id: doc.id,
            date: data.date instanceof Timestamp ? data.date.toDate() : data.date,
            createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : data.createdAt,
            updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toDate() : data.updatedAt,
            wasteWeight: data.wasteWeight || 0,
            wasteType: data.wasteType || 'Unknown',
            disposalMethod: data.disposalMethod || 'Unknown'
        } as WasteRecord;
    }).filter(rec => new Date(rec.createdAt).getFullYear() === year);

    return groupWasteByMonthAndSummarize(records, year);
}