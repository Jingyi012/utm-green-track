/*
  Warnings:

  - Added the required column `fileName` to the `WasteRecordAttachment` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "WasteRecordAttachment" ADD COLUMN     "fileName" TEXT NOT NULL;
