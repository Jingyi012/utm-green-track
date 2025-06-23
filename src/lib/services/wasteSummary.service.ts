import { Timestamp } from 'firebase-admin/firestore';
import { WasteRecord } from '../types/wasteRecord';
import { db } from '@/lib/firebase/firebaseAdmin';

const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec'];

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

export async function getWasteStatistic({ uid, year }: { uid?: string; year: number }) {
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

export const GetCampusMonthlySummary = async (request: { campus?: string, year?: number }) => {
    try {
        const year = request.year || new Date().getFullYear();
        let query = db.collection('wasteRecords')
            .where('createdAt', '>=', new Date(`${year}-01-01`))
            .where('createdAt', '<', new Date(`${year + 1}-01-01`))

        if (request.campus) {
            query = query.where('campusName', '==', request.campus);
        }

        const records = await query.get();

        // Process Firestore records
        const processedRecords: WasteRecord[] = records.docs.map(doc => {
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
        });

        const summaryTotals = calculateSummaryTotal(processedRecords);

        // Initialize monthly structure with all months
        const monthlySummary: Record<string, {
            landfilling: number;
            recycling: number;
            composting: number;
            energyRecovery: number;
            total: number;
        }> = {};

        monthNames.forEach(month => {
            monthlySummary[`${month}`] = {
                landfilling: 0,
                recycling: 0,
                composting: 0,
                energyRecovery: 0,
                total: 0
            };
        });

        // Aggregate data by month and disposal method
        processedRecords.forEach(record => {
            const month = monthNames[new Date(record.createdAt).getMonth()];
            const monthKey = `${month}`;
            const method = toCamelCase(record.disposalMethod) as keyof typeof monthlySummary[string];

            if (monthlySummary[monthKey] && method in monthlySummary[monthKey]) {
                monthlySummary[monthKey][method] += record.wasteWeight;
                monthlySummary[monthKey].total += record.wasteWeight;
            }
        });

        // Convert to array format for frontend
        const result = Object.entries(monthlySummary).map(([month, data]) => ({
            month,
            ...data
        }));

        return {
            success: true,
            data: {
                summary: summaryTotals,
                monthlySummary: result
            },
            year,
            generatedAt: new Date().toISOString()
        };

    } catch (error) {

        return {
            success: false,
            error: 'Failed to generate monthly summary',
            details: error instanceof Error ? error.message : String(error)
        };
    }
};

const GHG_EMISSION_FACTORS = {
    Landfilling: 0.5,
    Recycling: -0.3,
    Composting: -0.2,
    EnergyRecovery: -0.4
};

const LANDFILL_COST_PER_KG = 0.10;

const calculateSummaryTotal = (records: WasteRecord[]) => {
    let totalWaste = 0;
    let totalRecycled = 0;
    let totalLandfilled = 0;
    let totalGHGReduction = 0;
    let totalLandfillSavings = 0;

    records.forEach(record => {
        const weight = record.wasteWeight || 0;
        totalWaste += weight;

        switch (record.disposalMethod) {
            case 'Recycling':
                totalRecycled += weight;
                totalGHGReduction += weight * GHG_EMISSION_FACTORS.Recycling;
                totalLandfillSavings += weight * LANDFILL_COST_PER_KG;
                break;
            case 'Composting':
                totalGHGReduction += weight * GHG_EMISSION_FACTORS.Composting;
                totalLandfillSavings += weight * LANDFILL_COST_PER_KG;
                break;
            case 'Energy Recovery':
                totalGHGReduction += weight * GHG_EMISSION_FACTORS.EnergyRecovery;
                totalLandfillSavings += weight * LANDFILL_COST_PER_KG;
                break;
            case 'Landfilling':
                totalLandfilled += weight;
                totalGHGReduction += weight * GHG_EMISSION_FACTORS.Landfilling;
                break;
        }
    });

    return {
        totalWaste,
        totalRecycled,
        totalLandfilled,
        totalGHGReduction,
        totalLandfillSavings
    };
}