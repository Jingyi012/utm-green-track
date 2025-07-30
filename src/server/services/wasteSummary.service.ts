import { prisma } from '@/lib/prisma/prisma';
import { CampusYearSummaryResponse, DisposalCategoryTotal, MonthlyDisposalWasteTypeData, MonthlyStatisticByYearResponse, MonthlyDisposalSummary, WasteTypeTotal } from '@/lib/types/wasteSummary';

const GHG_EMISSION_FACTORS = {
    Landfilling: 0.5,
    Recycling: -0.3,
    Composting: -0.2,
    EnergyRecovery: -0.4
};

const LANDFILL_COST_PER_KG = 0.10;

export async function getWasteStatistic({ uid, year }: { uid?: number; year: number }) {
    const startDate = `${year}-01-01`;
    const endDate = `${year + 1}-01-01`;

    const params: any[] = [startDate, endDate];
    let whereClause = `WHERE "createdAt" >= $1::timestamp AND "createdAt" < $2::timestamp`;

    if (uid) {
        params.push(Number(uid));
        whereClause += ` AND "createdById" = $${params.length}`;
    }

    const query = `
        SELECT 
            EXTRACT(MONTH FROM "createdAt") AS month,
            "disposalMethod",
            "wasteType",
            SUM("wasteWeight") AS "totalWeight"
        FROM "WasteRecord"
        ${whereClause}
        GROUP BY month, "disposalMethod", "wasteType"
        ORDER BY month
    `;

    const rawRecords = await prisma.$queryRawUnsafe(query, ...params);

    const records = rawRecords as Array<MonthlyDisposalWasteTypeData>;
    return summarizeWasteStatistic(records, year);
}

export function summarizeWasteStatistic(records: MonthlyDisposalWasteTypeData[], year: number) {
    const totalsMap = new Map<string, number>();
    const categoryTotalsMap = new Map<string, number>();

    for (const record of records) {
        const disposalMethod = record.disposalMethod;
        const wasteType = record.wasteType;
        const weight = record.totalWeight;

        if (!disposalMethod || !wasteType) continue;

        // Key format: "method|type"
        const totalKey = `${disposalMethod}|||${wasteType}`;
        totalsMap.set(totalKey, (totalsMap.get(totalKey) || 0) + weight);

        // Category key by method
        categoryTotalsMap.set(
            disposalMethod,
            (categoryTotalsMap.get(disposalMethod) || 0) + weight
        );
    }

    // Convert to array formats
    const totals: Array<WasteTypeTotal> = [];
    const categoryTotals: Array<DisposalCategoryTotal> = [];

    for (const [key, weight] of totalsMap.entries()) {
        const [disposalMethod, wasteType] = key.split('|||');
        totals.push({ disposalMethod, wasteType, totalWeight: weight });
    }

    for (const [disposalMethod, weight] of categoryTotalsMap.entries()) {
        categoryTotals.push({ disposalMethod, totalWeight: weight });
    }

    return {
        year,
        monthlyData: records,
        totals,
        categoryTotals,
        metaData: {
            generatedAt: new Date().toISOString(),
            dataSource: 'UTM GreenTrack',
        },
    } as MonthlyStatisticByYearResponse;
}

export const GetCampusMonthlySummary = async ({
    campus,
    year = new Date().getFullYear(),
}: {
    campus?: string;
    year?: number;
}) => {
    const startDate = `${year}-01-01`;
    const endDate = `${year + 1}-01-01`;

    const params: any[] = [startDate, endDate];
    let whereClause = `WHERE "createdAt" >= $1::timestamp AND "createdAt" < $2::timestamp`;

    if (campus) {
        params.push(campus);
        whereClause += ` AND "campus" = $${params.length}`;
    }

    const records = await prisma.$queryRawUnsafe(`
    SELECT 
        EXTRACT(MONTH FROM "createdAt") AS month,
        "disposalMethod",
        SUM("wasteWeight") AS "totalWeight"
    FROM "WasteRecord"
    ${whereClause}
    GROUP BY month, "disposalMethod"
    ORDER BY month
  `, ...params) as MonthlyDisposalSummary[];

    let totalWaste = 0;
    let totalRecycled = 0;
    let totalLandfilled = 0;
    let totalGHGReduction = 0;
    let totalLandfillSavings = 0;

    for (const row of records) {
        const method = row.disposalMethod.toLowerCase();
        const weight = Number(row.totalWeight);

        totalWaste += weight;

        switch (method) {
            case 'recycling':
                totalRecycled += weight;
                totalGHGReduction += weight * GHG_EMISSION_FACTORS.Recycling;
                totalLandfillSavings += weight * LANDFILL_COST_PER_KG;
                break;
            case 'composting':
                totalGHGReduction += weight * GHG_EMISSION_FACTORS.Composting;
                totalLandfillSavings += weight * LANDFILL_COST_PER_KG;
                break;
            case 'energyrecovery':
                totalGHGReduction += weight * GHG_EMISSION_FACTORS.EnergyRecovery;
                totalLandfillSavings += weight * LANDFILL_COST_PER_KG;
                break;
            case 'landfilling':
                totalLandfilled += weight;
                totalGHGReduction += weight * GHG_EMISSION_FACTORS.Landfilling;
                break;
        }
    }

    return {
        summary: {
            totalWaste,
            totalRecycled,
            totalLandfilled,
            totalGHGReduction,
            totalLandfillSavings,
        },
        monthlySummary: records,
        metaData: {
            year,
            generatedAt: new Date().toISOString(),
            dataSource: "UTM GreenTrack",
        },
    } as CampusYearSummaryResponse;
};