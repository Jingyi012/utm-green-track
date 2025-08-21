import { UploadFile } from "antd"
export interface WasteRecord {
    id: string,
    campusId: string,
    campus: string,
    disposalMethodId: string,
    disposalMethod: string,
    wasteTypeId: string,
    wasteType: string,
    location?: string,
    activity?: string,
    wasteWeight: number,
    status: string,
    date: Date,
    attachments?: Attachment[],
    userId: string,
    user: string,
}

export interface DisposalMethod {
    id: string;
    name: string;
}

export interface Attachment {
    id: number,
    fileName: string,
    filePath: string,
}

export interface WasteRecordInput {
    key: string,
    campus: string,
    location?: string,
    activity?: string,
    disposalMethod: string,
    wasteWeight: number,
    wasteType: string,
    status: string,
    date: string,
    file: UploadFile[]
}

export interface WasteRecordFilter {
    pageNumber: number;
    pageSize: number;
    campus?: string;
    wasteType?: string;
    disposalMethod?: string;
    fromDate?: string;
    toDate?: string;
    status?: number;
}