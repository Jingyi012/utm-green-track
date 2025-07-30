export interface TotalSummary {
    totalWaste: number;
    totalRecycled: number;
    totalLandfilled: number;
    totalGHGReduction: number;
    totalLandfillSavings: number;
}

export interface MonthlyDisposalSummary {
    month: string | number;
    disposalMethod: string;
    totalWeight: number;
}

export interface MetaData {
    year: number;
    generatedAt: string;
    dataSource: string;
}

export interface CampusYearSummaryResponse {
    summary: TotalSummary;
    monthlySummary: MonthlyDisposalSummary[];
    metaData: MetaData;
}

// statistic
export interface MonthlyDisposalWasteTypeData extends MonthlyDisposalSummary {
    wasteType: string;
}

export interface WasteTypeTotal {
    disposalMethod: string;
    wasteType: string;
    totalWeight: number;
}

export interface DisposalCategoryTotal {
    disposalMethod: string;
    totalWeight: number;
}

export interface MonthlyStatisticByYearResponse {
    year: number;
    monthlyData: MonthlyDisposalWasteTypeData[];
    totals: WasteTypeTotal[];
    categoryTotals: DisposalCategoryTotal[];
    metaData: MetaData;
}