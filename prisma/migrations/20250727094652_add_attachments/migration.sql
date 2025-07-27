-- CreateTable
CREATE TABLE "WasteRecordAttachment" (
    "id" SERIAL NOT NULL,
    "filePath" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,
    "wasteRecordId" INTEGER NOT NULL,

    CONSTRAINT "WasteRecordAttachment_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "WasteRecordAttachment" ADD CONSTRAINT "WasteRecordAttachment_wasteRecordId_fkey" FOREIGN KEY ("wasteRecordId") REFERENCES "WasteRecord"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
