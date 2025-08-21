export enum WasteRecordStatus {
    New = 0,
    Verified = 1,
    Rejected = 2
}

export const wasteRecordStatusLabels: Record<WasteRecordStatus, string> = {
    [WasteRecordStatus.New]: "New",
    [WasteRecordStatus.Verified]: "Verified",
    [WasteRecordStatus.Rejected]: "Rejected"
};

export enum UserStatus {
    Pending = 0,
    Approved = 1,
    Rejected = 2
}

export const userStatusLabels: Record<UserStatus, string> = {
    [UserStatus.Pending]: "Pending",
    [UserStatus.Approved]: "Approved",
    [UserStatus.Rejected]: "Rejected"
};