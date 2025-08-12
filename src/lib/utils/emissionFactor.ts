import { DisposalMethod } from "../enum/disposalMethod";
import { WasteType } from "../enum/wasteType";

const emissionFactors: Record<DisposalMethod, Partial<Record<WasteType, number>>> = {
    [DisposalMethod.Landfilling]: {
        [WasteType.GeneralWaste]: 1000,
        [WasteType.FoodWaste]: 1680,
        [WasteType.BulkWaste]: 1200,
        [WasteType.LandscapeWaste]: 1400,
    },
    [DisposalMethod.Recycling]: {
        [WasteType.Paper]: -700,
        [WasteType.Plastic]: -1500,
        [WasteType.Metal]: -2000,
        [WasteType.Rubber]: -1300,
        [WasteType.Ewaste]: -500,
        [WasteType.Textile]: -800,
        [WasteType.UsedCookingOil]: -1200,
        [WasteType.RecyclableItem]: -1000,
    },
    [DisposalMethod.Composting]: {
        [WasteType.LandscapeWaste]: 300,
        [WasteType.FoodKitchenWaste]: 400,
        [WasteType.AnimalManure]: 250,
    },
    [DisposalMethod.EnergyRecovery]: {
        [WasteType.WoodWaste]: 800,
        [WasteType.FoodWaste]: 950,
    },
};

export const getEmissionFactor = (
    method?: DisposalMethod,
    type?: WasteType
): number => {
    if (!method || !type) {
        return 0;
    }
    const methodData = emissionFactors[method];
    if (methodData && type in methodData) {
        return methodData[type] ?? 0;
    }
    return 0;
}