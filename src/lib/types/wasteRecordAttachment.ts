export interface WasteRecordAttachment {
    id: number;
    wasteRecordId: number;
    filePath: string;
    fileName: string;
    createdAt: Date;
    updatedAt: Date;
}