-- CreateTable
CREATE TABLE "Trek" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "region" TEXT NOT NULL,
    "lat" REAL NOT NULL,
    "lon" REAL NOT NULL,
    "trailheadElevation" INTEGER NOT NULL,
    "summitElevation" INTEGER NOT NULL,
    "difficulty" TEXT NOT NULL,
    "durationDays" INTEGER NOT NULL,
    "description" TEXT NOT NULL,
    "popular" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "TrekVerdict" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "trekId" TEXT NOT NULL,
    "verdict" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" DATETIME NOT NULL,
    CONSTRAINT "TrekVerdict_trekId_fkey" FOREIGN KEY ("trekId") REFERENCES "Trek" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Trek_slug_key" ON "Trek"("slug");

-- CreateIndex
CREATE INDEX "Trek_country_idx" ON "Trek"("country");

-- CreateIndex
CREATE INDEX "Trek_popular_idx" ON "Trek"("popular");

-- CreateIndex
CREATE INDEX "Trek_slug_idx" ON "Trek"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "TrekVerdict_trekId_key" ON "TrekVerdict"("trekId");

-- CreateIndex
CREATE INDEX "TrekVerdict_trekId_idx" ON "TrekVerdict"("trekId");

-- CreateIndex
CREATE INDEX "TrekVerdict_expiresAt_idx" ON "TrekVerdict"("expiresAt");
