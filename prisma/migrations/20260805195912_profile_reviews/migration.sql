-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Profile" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT 'singleton',
    "fullName" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "officeName" TEXT NOT NULL,
    "tagline" TEXT NOT NULL,
    "shortBio" TEXT NOT NULL,
    "bio" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "whatsapp" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "officePhone" TEXT,
    "instagramUrl" TEXT,
    "linkedinUrl" TEXT,
    "youtubeUrl" TEXT,
    "facebookUrl" TEXT,
    "tiktokUrl" TEXT,
    "remaxUrl" TEXT,
    "portraitUrl" TEXT,
    "coverUrl" TEXT,
    "heroVideoUrl" TEXT,
    "heroPosterUrl" TEXT,
    "licenseNo" TEXT,
    "yearsExperience" INTEGER NOT NULL DEFAULT 0,
    "soldCount" INTEGER NOT NULL DEFAULT 0,
    "rentedCount" INTEGER NOT NULL DEFAULT 0,
    "happyClients" INTEGER NOT NULL DEFAULT 0,
    "reviewCount" INTEGER NOT NULL DEFAULT 0,
    "rating" REAL,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Profile" ("address", "bio", "coverUrl", "email", "facebookUrl", "fullName", "happyClients", "heroPosterUrl", "heroVideoUrl", "id", "instagramUrl", "licenseNo", "linkedinUrl", "officeName", "phone", "portraitUrl", "remaxUrl", "rentedCount", "shortBio", "soldCount", "tagline", "tiktokUrl", "title", "updatedAt", "whatsapp", "yearsExperience", "youtubeUrl") SELECT "address", "bio", "coverUrl", "email", "facebookUrl", "fullName", "happyClients", "heroPosterUrl", "heroVideoUrl", "id", "instagramUrl", "licenseNo", "linkedinUrl", "officeName", "phone", "portraitUrl", "remaxUrl", "rentedCount", "shortBio", "soldCount", "tagline", "tiktokUrl", "title", "updatedAt", "whatsapp", "yearsExperience", "youtubeUrl" FROM "Profile";
DROP TABLE "Profile";
ALTER TABLE "new_Profile" RENAME TO "Profile";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
