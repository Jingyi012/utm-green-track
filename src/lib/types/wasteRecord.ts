import { UploadFile } from "antd"

export type WasteRecord = {
    id?: string,
    campusName: string,
    location: string,
    disposalMethod: string,
    wasteWeight: number,
    wasteType: string,
    attachmentUrl: string,
    status: string,
    date: Date,
    createdAt: Date,
    updatedAt: Date
}

export type WasteRecordInput = WasteRecord & {
    key: string,
    file: UploadFile[]
}