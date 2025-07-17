export enum WasteRecordStatus {
    New = "new",
    Verified = "verified",
    Rejected = "rejected"
}

export const wasteRecordStatusLabels: Record<WasteRecordStatus, string> = {
    [WasteRecordStatus.New]: "New",
    [WasteRecordStatus.Verified]: "Verified",
    [WasteRecordStatus.Rejected]: "Rejected"
};
