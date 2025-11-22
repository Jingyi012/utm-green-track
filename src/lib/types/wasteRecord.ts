import { UploadFile } from "antd"
export interface WasteRecord {
    id: string,
    campusId: string,
    campus: string,
    departmentId: string,
    department: string,
    disposalMethodId: string,
    disposalMethod: string,
    wasteTypeId: string,
    wasteType: string,
    location?: string,
    unit?: string,
    program?: string,
    programDate?: string,
    wasteWeight: number,
    status: number,
    date: string,
    attachments?: Attachment[],
    userId: string,
    user: string,
    uploadedAttachments?: UploadFile[],
    comment?: string,
}

export interface DisposalMethod {
    id: string;
    name: string;
}

export interface Attachment {
    id: string,
    fileName: string,
    filePath: string,
}

export interface WasteRecordInput {
    key: string,
    campusId: string,
    departmentId: string,
    location?: string,
    unit?: string,
    program?: string,
    programDate?: string,
    disposalMethodId: string,
    wasteWeight: number,
    wasteTypeId: string,
    status: string,
    date: string,
    attachments: File[]
}

export interface WasteRecordFilter {
    pageNumber: number;
    pageSize: number;
    campusId?: string;
    departmentId?: string;
    unit?: string;
    program?: string;
    location?: string;
    wasteTypeId?: string;
    disposalMethodId?: string;
    fromDate?: string;
    toDate?: string;
    status?: number;
    isAdmin?: boolean;
}