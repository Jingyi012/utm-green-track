export enum WasteType {
    GeneralWaste = "generalWaste",
    BulkWaste = "bulkWaste",
    LandscapeWaste = "landscapeWaste",
    RecyclableItem = "recyclableItem",

    Paper = "paper",
    Plastic = "plastic",
    Metal = "metal",
    Rubber = "rubber",
    Ewaste = "eWaste",
    Textile = "textile",
    UsedCookingOil = "usedCookingOil",

    FoodKitchenWaste = "foodKitchenWaste",
    AnimalManure = "animalManure",

    WoodWaste = "woodWaste",
    FoodWaste = "foodWaste",
}

export const WasteTypeLabels: Record<WasteType, string> = {
    [WasteType.GeneralWaste]: "General waste",
    [WasteType.BulkWaste]: "Bulk waste",
    [WasteType.LandscapeWaste]: "Landscape waste",
    [WasteType.RecyclableItem]: "Recyclable item",
    [WasteType.Paper]: "Paper",
    [WasteType.Plastic]: "Plastic",
    [WasteType.Metal]: "Metal",
    [WasteType.Rubber]: "Rubber",
    [WasteType.Ewaste]: "E-waste",
    [WasteType.Textile]: "Textile",
    [WasteType.UsedCookingOil]: "Used cooking oil",
    [WasteType.FoodKitchenWaste]: "Food/Kitchen waste",
    [WasteType.AnimalManure]: "Animal manure",
    [WasteType.WoodWaste]: "Wood waste",
    [WasteType.FoodWaste]: "Food waste",
};
