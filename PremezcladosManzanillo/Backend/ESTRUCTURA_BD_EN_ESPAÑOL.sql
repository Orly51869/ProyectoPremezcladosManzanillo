-- REPORTE DE ESTRUCTURA DE BASE DE DATOS
-- Generado para verificar nombres de tablas en español
-- Fecha: 26/1/2026, 13:20:07

CREATE TABLE "usuarios" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "role" TEXT
);

CREATE TABLE "clientes" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "rif" TEXT,
    "phone" TEXT,
    "address" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "ownerId" TEXT NOT NULL,
    CONSTRAINT "clientes_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "usuarios" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE TABLE "presupuestos" (
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
    "validUntil" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "creatorId" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "processedById" TEXT,
    "processedAt" DATETIME,
    "rejectionReason" TEXT,
    CONSTRAINT "presupuestos_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "usuarios" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "presupuestos_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "clientes" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "presupuestos_processedById_fkey" FOREIGN KEY ("processedById") REFERENCES "usuarios" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE TABLE "pagos" (
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
    "igtfAmount" REAL DEFAULT 0,
    "validatorId" TEXT,
    "validatedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "pagos_budgetId_fkey" FOREIGN KEY ("budgetId") REFERENCES "presupuestos" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "pagos_validatorId_fkey" FOREIGN KEY ("validatorId") REFERENCES "usuarios" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE TABLE "items_presupuesto" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "quantity" REAL NOT NULL,
    "unitPrice" REAL NOT NULL,
    "totalPrice" REAL NOT NULL,
    "budgetId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    CONSTRAINT "items_presupuesto_budgetId_fkey" FOREIGN KEY ("budgetId") REFERENCES "presupuestos" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "items_presupuesto_productId_fkey" FOREIGN KEY ("productId") REFERENCES "productos" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE "productos" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "price" REAL NOT NULL,
    "type" TEXT NOT NULL,
    "categoryId" TEXT,
    "subcategoryId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "productos_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "categorias" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "productos_subcategoryId_fkey" FOREIGN KEY ("subcategoryId") REFERENCES "subcategorias" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE TABLE "categorias" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

CREATE TABLE "subcategorias" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "categoryId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "subcategorias_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "categorias" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE TABLE "historial_precios" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "productId" TEXT NOT NULL,
    "date" DATETIME NOT NULL,
    "currency" TEXT NOT NULL,
    "price" REAL NOT NULL,
    "createdById" TEXT,
    "createdByRole" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "historial_precios_productId_fkey" FOREIGN KEY ("productId") REFERENCES "productos" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE TABLE "notificaciones" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "message" TEXT NOT NULL,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,
    CONSTRAINT "notificaciones_userId_fkey" FOREIGN KEY ("userId") REFERENCES "usuarios" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE TABLE "facturas" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "invoiceNumber" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "proformaGeneratedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fiscalInvoiceUrl" TEXT,
    "deliveryOrderUrl" TEXT,
    "paymentId" TEXT NOT NULL,
    CONSTRAINT "facturas_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES "pagos" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE TABLE "auditoria" (
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

CREATE TABLE "configuraciones" (
    "key" TEXT NOT NULL PRIMARY KEY,
    "value" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'text',
    "updatedAt" DATETIME NOT NULL
);

CREATE TABLE "portafolio_proyectos" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "imageUrl" TEXT,
    "location" TEXT,
    "date" TEXT,
    "category" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

