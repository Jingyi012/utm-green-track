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

export interface DisposalMethodWeightShare {
  disposalMethod: string;
  totalWeightTonnes: number;
  percentage: number;
}

export interface WasteTypeWeightShare {
  wasteType: string;
  totalWeightTonnes: number;
  percentage: number;
}

export interface WasteTypeBreakdownByDisposalMethodValue {
  disposalMethod: string;
  wasteType: string;
  totalWeightTonnes: number;
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

export interface MonthlySavingsTrend {
  month: number;
  totalWasteDivertedTonnes: number;
  estimatedSavingsRm: number;
}

export interface YearlySummarySection {
  totalWasteGenerationByCampus: CampusMethodValue[];
  totalWasteDiversionByCampus: CampusMethodValue[];
  totalWasteManagementCostByCampus: CampusCostValue[];
  totalEstimatedSavingsFromWasteDiversionByCampus: CampusCostValue[];
}

export interface WasteGenerationAnalysisSection {
  totalWasteGeneratedTonnes: number;
  totalWasteDivertedTonnes: number;
  totalWasteToLandfillTonnes: number;
  estimatedWastePerCapitaKgPerPersonPerDay: number;
  campusPopulation: number;
  wasteGenerationTrend: MonthlyMethodValue[];
  disposalMethodBreakdown: DisposalMethodWeightShare[];
  wasteTypeBreakdownByDisposalMethod: WasteTypeBreakdownByDisposalMethodValue[];
}

export interface WasteDiversionAnalysisSection {
  totalWasteDivertedTonnes: number;
  totalRecycledWasteTonnes: number;
  totalCompostingWasteTonnes: number;
  totalEnergyRecoveryWasteTonnes: number;
  wasteDiversionRatePercent: number;
  recyclingRatePercent: number;
  compostingRatePercent: number;
  energyRecoveryRatePercent: number;
  estimatedGhgReductionKgCo2e: number;
  topPerformingPtjs: RankedDiversionItem[];
  topPerformingProgrammes: RankedProgrammeDiversionItem[];
  diversionTrend: MonthlyMethodValue[];
  recycledWasteTypeComposition: WasteTypeWeightShare[];
  compostingWasteTypeComposition: WasteTypeWeightShare[];
  energyRecoveryWasteTypeComposition: WasteTypeWeightShare[];
}

export interface WasteManagementCostAnalysisSection {
  totalManagementCostYtdRm: number;
  estimatedSavingsFromWasteDiversionRm: number;
  landfillingCostPerTonneRm: number;
  monthlyExpenditureTrend: MonthlyCostTrend[];
  monthlyEstimatedSavingsFromWasteDiversionTrend: MonthlySavingsTrend[];
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
  totalEstimatedSavingsFromWasteDiversionByYear: YearlyCostValue[];
}
