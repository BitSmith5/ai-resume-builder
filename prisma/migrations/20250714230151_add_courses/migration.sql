-- CreateTable
CREATE TABLE "Course" (
    "id" SERIAL NOT NULL,
    "resumeId" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "provider" TEXT NOT NULL,

    CONSTRAINT "Course_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Course" ADD CONSTRAINT "Course_resumeId_fkey" FOREIGN KEY ("resumeId") REFERENCES "Resume"("id") ON DELETE CASCADE ON UPDATE CASCADE;
