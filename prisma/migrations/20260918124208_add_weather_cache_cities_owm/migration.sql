-- CreateTable
CREATE TABLE "WeatherCache" (
    "key" TEXT NOT NULL PRIMARY KEY,
    "data" TEXT NOT NULL,
    "fetchedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" DATETIME NOT NULL,
    "lastModified" TEXT
);

-- CreateTable
CREATE TABLE "City" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "asciiName" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "countryName" TEXT NOT NULL,
    "lat" REAL NOT NULL,
    "lon" REAL NOT NULL,
    "population" INTEGER NOT NULL,
    "timezone" TEXT NOT NULL,
    "admin1" TEXT,
    "slug" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "OWMDailyCounter" (
    "date" TEXT NOT NULL PRIMARY KEY,
    "count" INTEGER NOT NULL DEFAULT 0
);

-- CreateIndex
CREATE INDEX "WeatherCache_expiresAt_idx" ON "WeatherCache"("expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "City_slug_key" ON "City"("slug");

-- CreateIndex
CREATE INDEX "City_asciiName_idx" ON "City"("asciiName");

-- CreateIndex
CREATE INDEX "City_country_idx" ON "City"("country");

-- CreateIndex
CREATE INDEX "City_slug_idx" ON "City"("slug");
