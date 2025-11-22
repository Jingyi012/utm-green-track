export enum WasteRecordStatus {
    New = 0,
    Verified = 1,
    Rejected = 2,
    RevisionRequired = 3
}

export const wasteRecordStatusLabels: Record<WasteRecordStatus, string> = {
    [WasteRecordStatus.New]: "New",
    [WasteRecordStatus.Verified]: "Verified",
    [WasteRecordStatus.Rejected]: "Rejected",
    [WasteRecordStatus.RevisionRequired]: "Revision Required",
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

export enum RequestStatus {
    Pending = 0,
    Approved = 1,
    Rejected = 2
}

export const requestStatusLabels: Record<RequestStatus, string> = {
    [RequestStatus.Pending]: "Pending",
    [RequestStatus.Approved]: "Approved",
    [RequestStatus.Rejected]: "Rejected"
};

export enum EnquiryStatus {
    Open = 0,
    Closed = 1,
}

export const enquiryStatusLabels: Record<EnquiryStatus, string> = {
    [EnquiryStatus.Open]: "Open",
    [EnquiryStatus.Closed]: "Closed",
};