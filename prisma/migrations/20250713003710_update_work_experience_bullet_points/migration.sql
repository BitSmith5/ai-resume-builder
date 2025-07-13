/*
  Warnings:

  - You are about to drop the column `description` on the `WorkExperience` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "WorkExperience" DROP COLUMN "description",
ADD COLUMN     "bulletPoints" JSONB NOT NULL DEFAULT '[]';
