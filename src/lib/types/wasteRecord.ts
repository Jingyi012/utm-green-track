import { UploadFile } from "antd"

export type WasteRecord = {
    id?: number,
    campus: string,
    location: string,
    disposalMethod: string,
    wasteWeight: number,
    wasteType: string,
    status: string,
    date: Date,
    attachments?: Attachments,
    createdAt: Date,
    updatedAt: Date
}

export type Attachments = {
    id: number,
    url: string
}

export type WasteRecordInput = WasteRecord & {
    key: string,
    file: UploadFile[]
}

export type WasteRecordFilter = {
    uid: number;
    pageNumber?: number;
    pageSize?: number;
    campus?: string;
    disposalMethod?: string;
    wasteType?: string;
    status?: string;
    fromDate?: string;
    toDate?: string;
}