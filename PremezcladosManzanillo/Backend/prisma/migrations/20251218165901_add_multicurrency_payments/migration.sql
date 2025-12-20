-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "userName" TEXT,
    "action" TEXT NOT NULL,
    "entity" TEXT NOT NULL,
    "entityId" TEXT,
    "details" TEXT,
    "ipAddress" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Setting" (
    "key" TEXT NOT NULL PRIMARY KEY,
    "value" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'text',
    "updatedAt" DATETIME NOT NULL
);

-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Payment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "budgetId" TEXT NOT NULL,
    "amount" REAL NOT NULL,
    "paidAmount" REAL NOT NULL,
    "pending" REAL NOT NULL,
    "date" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "method" TEXT NOT NULL,
    "reference" TEXT,
    "bankFrom" TEXT,
    "bankTo" TEXT,
    "receiptUrl" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "observations" TEXT,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "exchangeRate" REAL,
    "amountInCurrency" REAL,
    "validatorId" TEXT,
    "validatedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Payment_budgetId_fkey" FOREIGN KEY ("budgetId") REFERENCES "Budget" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Payment_validatorId_fkey" FOREIGN KEY ("validatorId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Payment" ("amount", "bankFrom", "bankTo", "budgetId", "createdAt", "date", "id", "method", "observations", "paidAmount", "pending", "receiptUrl", "reference", "status", "updatedAt", "validatedAt", "validatorId") SELECT "amount", "bankFrom", "bankTo", "budgetId", "createdAt", "date", "id", "method", "observations", "paidAmount", "pending", "receiptUrl", "reference", "status", "updatedAt", "validatedAt", "validatorId" FROM "Payment";
DROP TABLE "Payment";
ALTER TABLE "new_Payment" RENAME TO "Payment";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;

-- CreateIndex
CREATE INDEX "AuditLog_userId_idx" ON "AuditLog"("userId");

-- CreateIndex
CREATE INDEX "AuditLog_createdAt_idx" ON "AuditLog"("createdAt");
