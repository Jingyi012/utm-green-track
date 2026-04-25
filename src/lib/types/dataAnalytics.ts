export interface CampusMethodValue {
  campusName: string;
  disposalMethod: string;
  totalWeightTonnes: number;
}

export interface CampusCostValue {
  campusName: string;
  totalCostRm: number;
}

export interface MonthlyMethodValue {
  month: number;
  disposalMethod: string;
  totalWeightTonnes: number;
}

export interface CategoryWeightValue {
  name: string;
  totalWeightTonnes: number;
  percentage: number;
}

export interface RankedDiversionItem {
  rank: number;
  name: string;
  diversionKg: number;
}

export interface RankedProgrammeDiversionItem {
  rank: number;
  programmeName: string;
  programmeDate?: string | null;
  departmentOrPtj: string;
  diversionKg: number;
}

export interface MonthlyCostTrend {
  month: number;
  landfillWeightTonnes: number;
  managementCostRm: number;
}

export interface YearlySummarySection {
  totalWasteGenerationByCampus: CampusMethodValue[];
  totalWasteDiversionByCampus: CampusMethodValue[];
  totalWasteManagementCostByCampus: CampusCostValue[];
}

export interface WasteGenerationAnalysisSection {
  totalWasteGeneratedTonnes: number;
  totalWasteDivertedTonnes: number;
  totalWasteToLandfillTonnes: number;
  estimatedWastePerCapitaKgPerPersonPerDay: number;
  campusPopulation: number;
  wasteGenerationTrend: MonthlyMethodValue[];
  disposalMethodBreakdown: CategoryWeightValue[];
}

export interface WasteDiversionAnalysisSection {
  wasteDiversionRatePercent: number;
  recyclingRatePercent: number;
  compostingRatePercent: number;
  energyRecoveryRatePercent: number;
  estimatedGhgReductionKgCo2e: number;
  topPerformingPtjs: RankedDiversionItem[];
  topPerformingProgrammes: RankedProgrammeDiversionItem[];
  diversionTrend: MonthlyMethodValue[];
  recycledWasteComposition: CategoryWeightValue[];
  compostingWasteComposition: CategoryWeightValue[];
  energyRecoveryWasteComposition: CategoryWeightValue[];
}

export interface WasteManagementCostAnalysisSection {
  totalManagementCostYtdRm: number;
  estimatedSavingsFromWasteDiversionRm: number;
  landfillingCostPerTonneRm: number;
  monthlyExpenditureTrend: MonthlyCostTrend[];
}

export interface YearlyDataAnalyticsResponse {
  year: number;
  campusId: string;
  campusName: string;
  summary: YearlySummarySection;
  wasteGeneration: WasteGenerationAnalysisSection;
  wasteDiversion: WasteDiversionAnalysisSection;
  wasteManagementCost: WasteManagementCostAnalysisSection;
}

export interface YearlyMethodValue {
  year: number;
  disposalMethod: string;
  totalWeightTonnes: number;
}

export interface YearlyCostValue {
  year: number;
  totalCostRm: number;
}

export interface LifetimeDataAnalyticsResponse {
  campusId: string;
  campusName: string;
  totalWasteGenerationByYear: YearlyMethodValue[];
  totalWasteDiversionByYear: YearlyMethodValue[];
  totalWasteManagementCostByYear: YearlyCostValue[];
}
