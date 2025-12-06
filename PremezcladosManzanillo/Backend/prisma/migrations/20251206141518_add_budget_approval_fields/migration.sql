-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Budget" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "address" TEXT,
    "deliveryDate" DATETIME,
    "workType" TEXT,
    "resistance" TEXT,
    "concreteType" TEXT,
    "element" TEXT,
    "observations" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "total" REAL NOT NULL,
    "volume" REAL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "creatorId" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "paymentReceiptUrl" TEXT,
    "proFormaInvoice" TEXT,
    "deliveryOrder" TEXT,
    "processedById" TEXT,
    "processedAt" DATETIME,
    "rejectionReason" TEXT,
    CONSTRAINT "Budget_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Budget_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Budget_processedById_fkey" FOREIGN KEY ("processedById") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Budget" ("address", "clientId", "concreteType", "createdAt", "creatorId", "deliveryDate", "deliveryOrder", "element", "id", "observations", "paymentReceiptUrl", "proFormaInvoice", "resistance", "status", "title", "total", "updatedAt", "volume", "workType") SELECT "address", "clientId", "concreteType", "createdAt", "creatorId", "deliveryDate", "deliveryOrder", "element", "id", "observations", "paymentReceiptUrl", "proFormaInvoice", "resistance", "status", "title", "total", "updatedAt", "volume", "workType" FROM "Budget";
DROP TABLE "Budget";
ALTER TABLE "new_Budget" RENAME TO "Budget";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
