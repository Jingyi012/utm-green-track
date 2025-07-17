export enum DisposalMethod {
    Landfilling = "landfilling",
    Recycling = "recycling",
    Composting = "composting",
    EnergyRecovery = "energyRecovery",
}

export const DisposalMethodLabels: Record<DisposalMethod, string> = {
    [DisposalMethod.Landfilling]: "Landfilling",
    [DisposalMethod.Recycling]: "Recycling",
    [DisposalMethod.Composting]: "Composting",
    [DisposalMethod.EnergyRecovery]: "Energy Recovery",
};
