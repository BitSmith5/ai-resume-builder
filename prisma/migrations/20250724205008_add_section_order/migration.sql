-- AlterTable
ALTER TABLE "Resume" ADD COLUMN     "deletedSections" JSONB DEFAULT '[]',
ADD COLUMN     "sectionOrder" JSONB DEFAULT '[]';
