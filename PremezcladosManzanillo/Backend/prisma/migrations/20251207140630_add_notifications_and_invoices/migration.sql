/*
  Warnings:

  - You are about to drop the column `deliveryOrderUrl` on the `Payment` table. All the data in the column will be lost.
  - You are about to drop the column `fiscalInvoiceUrl` on the `Payment` table. All the data in the column will be lost.
  - You are about to drop the column `proFormaInvoiceUrl` on the `Payment` table. All the data in the column will be lost.
  - You are about to drop the column `deliveryOrder` on the `Budget` table. All the data in the column will be lost.
  - You are about to drop the column `paymentReceiptUrl` on the `Budget` table. All the data in the column will be lost.
  - You are about to drop the column `proFormaInvoice` on the `Budget` table. All the data in the column will be lost.

*/
-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "message" TEXT NOT NULL,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,
    CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Invoice" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "invoiceNumber" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "proformaGeneratedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fiscalInvoiceUrl" TEXT,
    "deliveryOrderUrl" TEXT,
    "paymentId" TEXT NOT NULL,
    CONSTRAINT "Invoice_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES "Payment" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
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
    "processedById" TEXT,
    "processedAt" DATETIME,
    "rejectionReason" TEXT,
    CONSTRAINT "Budget_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Budget_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Budget_processedById_fkey" FOREIGN KEY ("processedById") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Budget" ("address", "clientId", "concreteType", "createdAt", "creatorId", "deliveryDate", "element", "id", "observations", "processedAt", "processedById", "rejectionReason", "resistance", "status", "title", "total", "updatedAt", "volume", "workType") SELECT "address", "clientId", "concreteType", "createdAt", "creatorId", "deliveryDate", "element", "id", "observations", "processedAt", "processedById", "rejectionReason", "resistance", "status", "title", "total", "updatedAt", "volume", "workType" FROM "Budget";
DROP TABLE "Budget";
ALTER TABLE "new_Budget" RENAME TO "Budget";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;

-- CreateIndex
CREATE UNIQUE INDEX "Invoice_invoiceNumber_key" ON "Invoice"("invoiceNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Invoice_paymentId_key" ON "Invoice"("paymentId");
