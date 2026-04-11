CREATE TYPE "Currency" AS ENUM ('JPY');

CREATE TABLE IF NOT EXISTS "Book" (
    "bookId" TEXT PRIMARY KEY,
    "title" TEXT NOT NULL,
    "author" TEXT NOT NULL,
    "priceAmount" DECIMAL(10, 2) NOT NULL,
    "priceCurrency" "Currency" NOT NULL default 'JPY'
);

CREATE TABLE IF NOT EXISTS "Review" (
    "reviewId" TEXT PRIMARY KEY,
    "bookId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "rating" INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    "comment" TEXT,
    CONSTRAINT fk_book
    FOREIGN KEY ("bookId") REFERENCES "Book" ("bookId") ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS "Review_bookId_idx" ON "Review" ("bookId");