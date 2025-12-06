/*
  Warnings:

  - You are about to drop the column `productDescription` on the `BudgetProduct` table. All the data in the column will be lost.
  - You are about to drop the column `productName` on the `BudgetProduct` table. All the data in the column will be lost.
  - Added the required column `productId` to the `BudgetProduct` table without a default value. This is not possible if the table is not empty.

*/
-- CreateTable
CREATE TABLE "Product" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "price" REAL NOT NULL,
    "type" TEXT NOT NULL,
    "category" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_BudgetProduct" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "quantity" REAL NOT NULL,
    "unitPrice" REAL NOT NULL,
    "totalPrice" REAL NOT NULL,
    "budgetId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    CONSTRAINT "BudgetProduct_budgetId_fkey" FOREIGN KEY ("budgetId") REFERENCES "Budget" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "BudgetProduct_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_BudgetProduct" ("budgetId", "id", "quantity", "totalPrice", "unitPrice") SELECT "budgetId", "id", "quantity", "totalPrice", "unitPrice" FROM "BudgetProduct";
DROP TABLE "BudgetProduct";
ALTER TABLE "new_BudgetProduct" RENAME TO "BudgetProduct";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;

-- CreateIndex
CREATE UNIQUE INDEX "Product_name_key" ON "Product"("name");
