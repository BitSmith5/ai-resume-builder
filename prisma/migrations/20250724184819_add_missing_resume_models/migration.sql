-- CreateTable
CREATE TABLE "Project" (
    "id" SERIAL NOT NULL,
    "resumeId" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "current" BOOLEAN NOT NULL DEFAULT false,
    "technologies" JSONB NOT NULL DEFAULT '[]',
    "link" TEXT,
    "bulletPoints" JSONB NOT NULL DEFAULT '[]',

    CONSTRAINT "Project_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Language" (
    "id" SERIAL NOT NULL,
    "resumeId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "proficiency" TEXT NOT NULL,

    CONSTRAINT "Language_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Publication" (
    "id" SERIAL NOT NULL,
    "resumeId" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "authors" TEXT NOT NULL,
    "journal" TEXT NOT NULL,
    "year" TEXT NOT NULL,
    "doi" TEXT,
    "link" TEXT,

    CONSTRAINT "Publication_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Award" (
    "id" SERIAL NOT NULL,
    "resumeId" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "organization" TEXT NOT NULL,
    "year" TEXT NOT NULL,
    "bulletPoints" JSONB NOT NULL DEFAULT '[]',

    CONSTRAINT "Award_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VolunteerExperience" (
    "id" SERIAL NOT NULL,
    "resumeId" INTEGER NOT NULL,
    "organization" TEXT NOT NULL,
    "position" TEXT NOT NULL,
    "location" TEXT,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "current" BOOLEAN NOT NULL DEFAULT false,
    "hoursPerWeek" TEXT,
    "bulletPoints" JSONB NOT NULL DEFAULT '[]',

    CONSTRAINT "VolunteerExperience_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Reference" (
    "id" SERIAL NOT NULL,
    "resumeId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "company" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "relationship" TEXT NOT NULL,

    CONSTRAINT "Reference_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_resumeId_fkey" FOREIGN KEY ("resumeId") REFERENCES "Resume"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Language" ADD CONSTRAINT "Language_resumeId_fkey" FOREIGN KEY ("resumeId") REFERENCES "Resume"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Publication" ADD CONSTRAINT "Publication_resumeId_fkey" FOREIGN KEY ("resumeId") REFERENCES "Resume"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Award" ADD CONSTRAINT "Award_resumeId_fkey" FOREIGN KEY ("resumeId") REFERENCES "Resume"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VolunteerExperience" ADD CONSTRAINT "VolunteerExperience_resumeId_fkey" FOREIGN KEY ("resumeId") REFERENCES "Resume"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reference" ADD CONSTRAINT "Reference_resumeId_fkey" FOREIGN KEY ("resumeId") REFERENCES "Resume"("id") ON DELETE CASCADE ON UPDATE CASCADE;
