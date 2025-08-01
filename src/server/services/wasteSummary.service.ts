import { DisposalMethod } from '@/lib/enum/disposalMethod';
import { prisma } from '@/lib/prisma/prisma';
import { CampusYearSummaryResponse, DisposalCategoryTotal, MonthlyDisposalWasteTypeData, MonthlyStatisticByYearResponse, MonthlyDisposalSummary, WasteTypeTotal } from '@/lib/types/wasteSummary';
import { Prisma } from '@prisma/client';

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

    const params: Prisma.Sql[] = [
        Prisma.sql`${startDate}`,
        Prisma.sql`${endDate}`,
    ];

    let whereClause = Prisma.sql`WHERE "date" >= ${params[0]}::timestamp AND "date" < ${params[1]}::timestamp`;

    if (uid) {
        params.push(Prisma.sql`${uid}`);
        whereClause = Prisma.sql`${whereClause} AND "createdById" = ${params[2]}`;
    }

    const query = Prisma.sql`
    SELECT 
      EXTRACT(MONTH FROM "date") AS month,
      "disposalMethod",
      "wasteType",
      SUM("wasteWeight") AS "totalWeight"
    FROM "WasteRecord"
    ${whereClause}
    GROUP BY month, "disposalMethod", "wasteType"
    ORDER BY month
  `;

    const rawRecords = await prisma.$queryRaw<MonthlyDisposalWasteTypeData[]>(query);
    return summarizeWasteStatistic(rawRecords, year);
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

export const GetCampusYearlySummary = async ({
    campus,
    year = new Date().getFullYear(),
}: {
    campus?: string;
    year?: number;
}) => {
    const startDate = `${year}-01-01`;
    const endDate = `${year + 1}-01-01`;

    const start = Prisma.sql`${startDate}`;
    const end = Prisma.sql`${endDate}`;
    let whereClause = Prisma.sql`WHERE "date" >= ${start}::timestamp AND "date" < ${end}::timestamp`;

    if (campus) {
        whereClause = Prisma.sql`${whereClause} AND "campus" = ${Prisma.sql`${campus}`}`;
    }

    const query = Prisma.sql`
    SELECT 
      EXTRACT(MONTH FROM "date") AS month,
      "disposalMethod",
      SUM("wasteWeight") AS "totalWeight"
    FROM "WasteRecord"
    ${whereClause}
    GROUP BY month, "disposalMethod"
    ORDER BY month
  `;

    const records = await prisma.$queryRaw<MonthlyDisposalSummary[]>(query);

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