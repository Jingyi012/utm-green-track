import { DisposalMethod } from '@/lib/enum/disposalMethod';
import { WasteType } from '@/lib/enum/wasteType';
import { prisma } from '@/lib/prisma/prisma';
import { CampusYearSummaryResponse, DisposalCategoryTotal, MonthlyDisposalWasteTypeData, MonthlyStatisticByYearResponse, MonthlyDisposalSummary, WasteTypeTotal } from '@/lib/types/wasteSummary';
import { getEmissionFactor } from '@/lib/utils/emissionFactor';
import { Prisma } from '@prisma/client';

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
      "wasteType",
      SUM("wasteWeight") AS "totalWeight"
    FROM "WasteRecord"
    ${whereClause}
    GROUP BY month, "disposalMethod", "wasteType"
    ORDER BY month
  `;

    const records = await prisma.$queryRaw<MonthlyDisposalSummary[]>(query);

    let totalWasteGenerated = 0;
    let totalWasteRecycled = 0;
    let totalWasteToLandfill = 0;
    let totalGHGReduction = 0;
    let totalLandfillCostSavings = 0;

    for (const row of records) {
        const method = row.disposalMethod;
        const weightInTon = row.totalWeight / 1000;
        totalWasteGenerated += weightInTon;

        switch (method) {
            case DisposalMethod.Recycling:
                totalWasteRecycled += weightInTon;
                break;
            case DisposalMethod.Composting:
                totalWasteRecycled += weightInTon;
                break;
            case DisposalMethod.EnergyRecovery:
                totalWasteRecycled += weightInTon;
                break;
            case DisposalMethod.Landfilling:
                break;
        }

        totalGHGReduction = weightInTon * getEmissionFactor(method as DisposalMethod, row.wasteType as WasteType);

        row.totalWeight = weightInTon;
    }

    totalWasteToLandfill = totalWasteGenerated - totalWasteRecycled;
    totalLandfillCostSavings = totalWasteRecycled * 146;

    return {
        summary: {
            totalWasteGenerated,
            totalWasteRecycled,
            totalWasteToLandfill,
            totalGHGReduction,
            totalLandfillCostSavings,
        },
        monthlySummary: records,
        metaData: {
            year,
            generatedAt: new Date().toISOString(),
            dataSource: "UTM GreenTrack",
        },
    } as CampusYearSummaryResponse;
};