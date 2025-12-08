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
    CONSTRAINT "BudgetProduct_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_BudgetProduct" ("budgetId", "id", "productId", "quantity", "totalPrice", "unitPrice") SELECT "budgetId", "id", "productId", "quantity", "totalPrice", "unitPrice" FROM "BudgetProduct";
DROP TABLE "BudgetProduct";
ALTER TABLE "new_BudgetProduct" RENAME TO "BudgetProduct";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
