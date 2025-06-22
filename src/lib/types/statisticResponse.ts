interface MonthlyWasteData {
    generalWaste: number;
    bulkWaste: number;
    landscapeWaste: number;
    recyclableItem: number;
    paper: number;
    plastic: number;
    metal: number;
    rubber: number;
    ewaste: number;
    textile: number;
    usedCookingOil: number;
    compostLandscape: number;
    foodWaste: number;
    animalManure: number;
    woodWaste: number;
    energyFoodWaste: number;
}

interface MonthlyWasteData {
    generalWaste: number;
    bulkWaste: number;
    landscapeWaste: number;
    recyclableItem: number;
    paper: number;
    plastic: number;
    metal: number;
    rubber: number;
    ewaste: number;
    textile: number;
    usedCookingOil: number;
    compostLandscape: number;
    foodWaste: number;
    animalManure: number;
    woodWaste: number;
    energyFoodWaste: number;
}

interface WasteDataResponse {
    year: number;
    monthlyData: Record<string, MonthlyWasteData>; // Keys are month abbreviations
    totals: MonthlyWasteData;
    categoryTotals: {
        landfill: number;
        recycling: number;
        composting: number;
        energyRecovery: number;
    };
    metadata?: {
        generatedAt: string;
        dataSource?: string;
    };
}