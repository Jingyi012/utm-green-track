export interface MonthlyWasteSummary {
    month: number;
    wasteTypeTotals: WasteTypeTotal[];
}

export interface WasteTypeTotal {
    disposalMethod: string;
    wasteType: string;
    totalWeight: number;
}

export interface DisposalMethodTotal {
    disposalMethod: string;
    totalWeight: number;
}

export interface MonthlyStatisticByYearResponse {
    year: number;
    monthlyWasteSummary: MonthlyWasteSummary[];
    wasteTypeTotals: WasteTypeTotal[];
    disposalMethodTotals: DisposalMethodTotal[];
}

export interface TotalSummary {
    totalWasteGenerated: number;
    totalWasteRecycled: number;
    totalWasteToLandfill: number;
    totalGhgReduction: number;
    totalLandfillCostSavings: number;
}

export interface CampusYearlySummaryResponse {
    totalSummary: TotalSummary;
    monthlyWasteSummary: MonthlyWasteSummary[];
    wasteTypeTotals: WasteTypeTotal[];
}