import { Timestamp } from 'firebase-admin/firestore';
import { WasteRecord } from '../../lib/types/wasteRecord';
import { db } from '@/lib/firebase/firebaseAdmin';
import { DisposalMethod } from '@/lib/enum/disposalMethod';
import { MONTH_NAMES } from '@/lib/enum/monthName';

const monthNames = MONTH_NAMES;

type CategoryTotals = {
    landfilling: number;
    recycling: number;
    composting: number;
    energyRecovery: number;
    [key: string]: number;
};

type MonthlyWasteData = {
    month: string;
} & Record<DisposalMethod, Record<string, number>>;

export function groupWasteByMonthAndSummarize(records: WasteRecord[], year: number) {
    const monthlyData: MonthlyWasteData[] = [];

    const totals: Record<string, any> = {};
    const categoryTotals: CategoryTotals = {
        landfilling: 0,
        recycling: 0,
        composting: 0,
        energyRecovery: 0,
    };

    // Initialize array with empty month structures
    MONTH_NAMES.forEach(month => {
        monthlyData.push({
            month,
            landfilling: {},
            recycling: {},
            composting: {},
            energyRecovery: {},
        });
    });

    for (const record of records) {
        const monthIndex = new Date(record.createdAt).getMonth();
        const monthEntry = monthlyData[monthIndex];

        const disposalMethod = record.disposalMethod;
        const wasteType = record.wasteType;
        const weight = typeof record.wasteWeight === 'number' ? record.wasteWeight : 0;

        if (!disposalMethod || !wasteType) continue;

        const disposalObj = monthEntry[disposalMethod as DisposalMethod] || {};

        // Update monthly waste data
        disposalObj[wasteType] = (disposalObj[wasteType] || 0) + weight;
        monthEntry[disposalMethod as DisposalMethod] = disposalObj;

        // Update total per disposal method and type
        if (!totals[disposalMethod]) {
            totals[disposalMethod] = {};
        }
        totals[disposalMethod][wasteType] = (totals[disposalMethod][wasteType] || 0) + weight;

        // Update category totals
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
            query = query.where('campus', '==', request.campus);
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
            const method = record.disposalMethod as keyof typeof monthlySummary[string];

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
                monthlySummary: result,
                metadata: {
                    year,
                    generatedAt: new Date().toISOString(),
                    dataSource: 'UTM GreenTrack',
                },
            },
        };

    } catch (error) {

        return {
            success: false,
            error: error instanceof Error ? error.message : String(error)
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
            case DisposalMethod.Recycling:
                totalRecycled += weight;
                totalGHGReduction += weight * GHG_EMISSION_FACTORS.Recycling;
                totalLandfillSavings += weight * LANDFILL_COST_PER_KG;
                break;
            case DisposalMethod.Composting:
                totalGHGReduction += weight * GHG_EMISSION_FACTORS.Composting;
                totalLandfillSavings += weight * LANDFILL_COST_PER_KG;
                break;
            case DisposalMethod.EnergyRecovery:
                totalGHGReduction += weight * GHG_EMISSION_FACTORS.EnergyRecovery;
                totalLandfillSavings += weight * LANDFILL_COST_PER_KG;
                break;
            case DisposalMethod.Landfilling:
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