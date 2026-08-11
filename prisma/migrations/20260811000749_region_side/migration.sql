-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Region" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "district" TEXT NOT NULL,
    "side" TEXT NOT NULL DEFAULT 'ANADOLU',
    "description" TEXT NOT NULL,
    "expertNote" TEXT NOT NULL DEFAULT '',
    "coverUrl" TEXT,
    "avgPricePerSqm" INTEGER,
    "avgRent" INTEGER,
    "highlights" TEXT NOT NULL DEFAULT '[]',
    "lat" REAL,
    "lng" REAL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "published" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Region" ("avgPricePerSqm", "avgRent", "city", "coverUrl", "createdAt", "description", "district", "expertNote", "highlights", "id", "lat", "lng", "name", "published", "slug", "sortOrder", "updatedAt") SELECT "avgPricePerSqm", "avgRent", "city", "coverUrl", "createdAt", "description", "district", "expertNote", "highlights", "id", "lat", "lng", "name", "published", "slug", "sortOrder", "updatedAt" FROM "Region";
DROP TABLE "Region";
ALTER TABLE "new_Region" RENAME TO "Region";
CREATE UNIQUE INDEX "Region_slug_key" ON "Region"("slug");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
