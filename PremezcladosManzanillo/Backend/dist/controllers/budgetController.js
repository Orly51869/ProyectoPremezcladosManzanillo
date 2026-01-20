"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteBudget = exports.updateBudget = exports.createBudget = exports.getBudgetById = exports.rejectBudget = exports.approveBudget = exports.getBudgets = exports.initBudget = void 0;
const auditLogger_1 = require("../utils/auditLogger");
const prisma_1 = __importDefault(require("../lib/prisma"));
// Inicializar un presupuesto (esqueleto)
const initBudget = async (req, res) => {
    const { title, clientId, address } = req.body;
    const creatorId = req.auth?.payload.sub;
    const userName = req.dbUser?.name || req.auth?.payload?.name || 'Usuario';
    if (!creatorId) {
        return res.status(401).json({ error: 'Authenticated user ID not found.' });
    }
    if (!clientId) {
        return res.status(400).json({ error: 'Client ID is required.' });
    }
    if (!title) {
        return res.status(400).json({ error: 'Title is required.' });
    }
    try {
        const newBudget = await prisma_1.default.budget.create({
            data: {
                title,
                address,
                total: 0,
                status: 'PENDING',
                creator: { connect: { id: creatorId } },
                client: { connect: { id: clientId } },
            },
            include: {
                client: true,
            },
        });
        await (0, auditLogger_1.logActivity)({
            userId: creatorId,
            userName,
            action: 'INIT',
            entity: 'BUDGET',
            entityId: newBudget.id,
            details: `Presupuesto inicializado: ${title}`
        });
        res.status(201).json(newBudget);
    }
    catch (error) {
        console.error('Error initializing budget:', error);
        res.status(500).json({ error: error.message || 'Internal server error' });
    }
};
exports.initBudget = initBudget;
// Obtener todos los presupuestos, filtrados por rol de usuario
const getBudgets = async (req, res) => {
    try {
        const auth = req.auth;
        const roles = auth?.payload['https://premezcladomanzanillo.com/roles'];
        const userId = auth?.payload.sub;
        const includeProducts = {
            products: {
                include: {
                    product: true,
                },
            },
            client: true,
            processedBy: true,
        };
        let budgets;
        if (roles && roles.includes('Usuario')) {
            budgets = await prisma_1.default.budget.findMany({
                where: { creatorId: userId },
                include: includeProducts,
                orderBy: { createdAt: 'desc' },
            });
        }
        else {
            budgets = await prisma_1.default.budget.findMany({
                include: includeProducts,
                orderBy: { createdAt: 'desc' },
            });
        }
        res.status(200).json(budgets);
    }
    catch (error) {
        console.error('Error fetching budgets:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.getBudgets = getBudgets;
// Aprobar un presupuesto
const approveBudget = async (req, res) => {
    const { id } = req.params;
    const authUserId = req.auth?.payload.sub;
    const userName = req.dbUser?.name || req.auth?.payload?.name || 'Administrador';
    const roles = req.auth?.payload['https://premezcladomanzanillo.com/roles'] || [];
    console.log('ApproveBudget: User roles:', roles, 'User ID:', authUserId);
    if (!authUserId) {
        return res.status(401).json({ error: 'Authenticated user ID not found.' });
    }
    if (!roles.some(role => ['Administrador', 'Contable', 'Comercial'].includes(role))) {
        return res.status(403).json({ error: 'Forbidden: Only administrators, accountants, or commercial agents can approve budgets.' });
    }
    try {
        const existingBudget = await prisma_1.default.budget.findUnique({ where: { id } });
        if (!existingBudget)
            return res.status(404).json({ error: 'Budget not found.' });
        if (existingBudget.status !== 'PENDING')
            return res.status(400).json({ error: 'Budget is not in PENDING status.' });
        const approvedBudget = await prisma_1.default.budget.update({
            where: { id },
            data: {
                status: 'APPROVED',
                processedById: authUserId,
                processedAt: new Date(),
                rejectionReason: null,
            },
            include: {
                products: { include: { product: true } },
                client: true,
                processedBy: true,
                creator: true,
            },
        });
        await prisma_1.default.notification.create({
            data: {
                userId: approvedBudget.creatorId,
                message: `Tu presupuesto "${approvedBudget.title}" ha sido APROBADO.`,
            },
        });
        await (0, auditLogger_1.logActivity)({
            userId: authUserId,
            userName,
            action: 'APPROVE',
            entity: 'BUDGET',
            entityId: id,
            details: `Presupuesto aprobado: ${approvedBudget.title}`
        });
        res.json(approvedBudget);
    }
    catch (error) {
        console.error(`Error approving budget ${id}:`, error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.approveBudget = approveBudget;
// Rechazar un presupuesto
const rejectBudget = async (req, res) => {
    const { id } = req.params;
    const { rejectionReason } = req.body;
    const authUserId = req.auth?.payload.sub;
    const userName = req.dbUser?.name || req.auth?.payload?.name || 'Administrador';
    const roles = req.auth?.payload['https://premezcladomanzanillo.com/roles'] || [];
    if (!authUserId)
        return res.status(401).json({ error: 'Authenticated user ID not found.' });
    if (!roles.some(r => ['Administrador', 'Contable', 'Comercial'].includes(r)))
        return res.status(403).json({ error: 'Forbidden: Only privileged users can reject budgets.' });
    if (!rejectionReason || rejectionReason.trim().length === 0)
        return res.status(400).json({ error: 'Rejection reason is required.' });
    try {
        const existingBudget = await prisma_1.default.budget.findUnique({ where: { id } });
        if (!existingBudget)
            return res.status(404).json({ error: 'Budget not found.' });
        if (existingBudget.status !== 'PENDING')
            return res.status(400).json({ error: 'Budget is not in PENDING status.' });
        const rejectedBudget = await prisma_1.default.budget.update({
            where: { id },
            data: {
                status: 'REJECTED',
                rejectionReason: rejectionReason.trim(),
                processedById: authUserId,
                processedAt: new Date(),
            },
            include: {
                products: { include: { product: true } },
                client: true,
                processedBy: true,
                creator: true,
            },
        });
        await prisma_1.default.notification.create({
            data: {
                userId: rejectedBudget.creatorId,
                message: `Tu presupuesto "${rejectedBudget.title}" ha sido RECHAZADO. Motivo: ${rejectionReason.trim()}`,
            },
        });
        await (0, auditLogger_1.logActivity)({
            userId: authUserId,
            userName,
            action: 'REJECT',
            entity: 'BUDGET',
            entityId: id,
            details: `Presupuesto rechazado: ${rejectedBudget.title}. Razón: ${rejectionReason}`
        });
        res.json(rejectedBudget);
    }
    catch (error) {
        console.error(`Error rejecting budget ${id}:`, error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.rejectBudget = rejectBudget;
// Obtener un presupuesto por su ID
const getBudgetById = async (req, res) => {
    const { id } = req.params;
    try {
        const budget = await prisma_1.default.budget.findUnique({
            where: { id },
            include: {
                products: { include: { product: true } },
                client: true,
                processedBy: true,
            },
        });
        if (budget)
            res.status(200).json(budget);
        else
            res.status(404).json({ error: 'Budget not found' });
    }
    catch (error) {
        console.error(`Error fetching budget ${id}:`, error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.getBudgetById = getBudgetById;
// Función auxiliar para validar la deliveryDate
const validateDeliveryDate = (deliveryDate) => {
    if (deliveryDate) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const delivery = new Date(deliveryDate);
        delivery.setHours(0, 0, 0, 0);
        if (delivery <= today) {
            throw new Error('Delivery date must be at least one day after the current date.');
        }
    }
};
// Crear un nuevo presupuesto
const createBudget = async (req, res) => {
    const { title, clientId, status, products, address, deliveryDate, workType, resistance, concreteType, element, observations, volume } = req.body;
    const creatorId = req.auth?.payload.sub;
    const userName = req.dbUser?.name || req.auth?.payload?.name || 'Usuario';
    const roles = req.auth?.payload['https://premezcladomanzanillo.com/roles'] || [];
    if (!creatorId)
        return res.status(401).json({ error: 'Authenticated user ID not found.' });
    if (!clientId)
        return res.status(400).json({ error: 'Client ID is required.' });
    if (!Array.isArray(products) || products.length === 0)
        return res.status(400).json({ error: 'At least one product is required.' });
    if (!observations || observations.trim() === '')
        return res.status(400).json({ error: 'Observations are required.' });
    try {
        validateDeliveryDate(deliveryDate);
        const isPrivileged = roles.some(r => ['Administrador', 'Contable', 'Comercial'].includes(r));
        const total = await calculateTotal(products, isPrivileged, deliveryDate);
        const newBudget = await prisma_1.default.budget.create({
            data: {
                title, address, deliveryDate: deliveryDate ? new Date(deliveryDate) : undefined,
                workType, resistance, concreteType, element, observations,
                volume: volume ? parseFloat(volume) : undefined,
                total, status: status || 'PENDING',
                creator: { connect: { id: creatorId } },
                client: { connect: { id: clientId } },
                products: {
                    create: await Promise.all(products.map(async (p) => {
                        const resolvedPrice = await (async () => {
                            if (isPrivileged && p.unitPrice != null)
                                return Number(p.unitPrice);
                            const priceRecord = await prisma_1.default.productPrice.findFirst({
                                where: { productId: p.productId, date: { lte: deliveryDate ? new Date(deliveryDate) : new Date() } },
                                orderBy: { date: 'desc' }
                            });
                            if (priceRecord)
                                return priceRecord.price;
                            const product = await prisma_1.default.product.findUnique({ where: { id: p.productId } });
                            if (!product)
                                throw new Error(`Product ${p.productId} not found.`);
                            return product.price;
                        })();
                        return { quantity: p.quantity, unitPrice: resolvedPrice, totalPrice: p.quantity * resolvedPrice, product: { connect: { id: p.productId } } };
                    })),
                },
            },
            include: { products: { include: { product: true } }, client: true },
        });
        await (0, auditLogger_1.logActivity)({
            userId: creatorId,
            userName,
            action: 'CREATE',
            entity: 'BUDGET',
            entityId: newBudget.id,
            details: `Presupuesto creado: ${newBudget.title}`
        });
        res.status(201).json(newBudget);
    }
    catch (error) {
        console.error('Error creating budget:', error);
        res.status(500).json({ error: error.message || 'Internal server error' });
    }
};
exports.createBudget = createBudget;
// Actualizar un presupuesto existente
const updateBudget = async (req, res) => {
    const { id } = req.params;
    const { title, clientId, status, products, address, deliveryDate, workType, resistance, concreteType, element, observations, volume } = req.body;
    const authUserId = req.auth?.payload.sub;
    const userName = req.dbUser?.name || req.auth?.payload?.name || 'Usuario';
    const roles = req.auth?.payload['https://premezcladomanzanillo.com/roles'] || [];
    if (!Array.isArray(products) || products.length === 0)
        return res.status(400).json({ error: 'At least one product is required.' });
    try {
        const isPrivileged = roles.some(r => ['Administrador', 'Contable', 'Comercial'].includes(r));
        validateDeliveryDate(deliveryDate);
        const total = await calculateTotal(products, isPrivileged, deliveryDate);
        const updatedBudget = await prisma_1.default.$transaction(async (tx) => {
            await tx.budgetProduct.deleteMany({ where: { budgetId: id } });
            return await tx.budget.update({
                where: { id },
                data: {
                    title, address, deliveryDate: deliveryDate ? new Date(deliveryDate) : undefined,
                    workType, resistance, concreteType, element, observations,
                    volume: volume ? parseFloat(volume) : undefined,
                    total, status,
                    client: clientId ? { connect: { id: clientId } } : undefined,
                    products: {
                        create: await Promise.all(products.map(async (p) => {
                            const resolvedPrice = await (async () => {
                                if (isPrivileged && p.unitPrice != null)
                                    return Number(p.unitPrice);
                                const pr = await tx.productPrice.findFirst({
                                    where: { productId: p.productId, date: { lte: deliveryDate ? new Date(deliveryDate) : new Date() } },
                                    orderBy: { date: 'desc' }
                                });
                                if (pr)
                                    return pr.price;
                                const prod = await tx.product.findUnique({ where: { id: p.productId } });
                                if (!prod)
                                    throw new Error(`Product ${p.productId} not found.`);
                                return prod.price;
                            })();
                            return { quantity: p.quantity, unitPrice: resolvedPrice, totalPrice: p.quantity * resolvedPrice, product: { connect: { id: p.productId } } };
                        })),
                    },
                },
                include: { products: { include: { product: true } }, client: true },
            });
        });
        await (0, auditLogger_1.logActivity)({
            userId: authUserId,
            userName,
            action: 'UPDATE',
            entity: 'BUDGET',
            entityId: id,
            details: `Presupuesto actualizado: ${updatedBudget.title}`
        });
        res.status(200).json(updatedBudget);
    }
    catch (error) {
        console.error(`Error updating budget ${id}:`, error);
        res.status(500).json({ error: error.message || 'Internal server error' });
    }
};
exports.updateBudget = updateBudget;
// Eliminar un presupuesto
const deleteBudget = async (req, res) => {
    const { id } = req.params;
    const authUserId = req.auth?.payload.sub;
    const userName = req.dbUser?.name || req.auth?.payload?.name || 'Usuario';
    try {
        const budgetToDelete = await prisma_1.default.budget.findUnique({ where: { id } });
        if (!budgetToDelete)
            return res.status(404).json({ error: 'Budget not found' });
        await prisma_1.default.$transaction(async (tx) => {
            await tx.budgetProduct.deleteMany({ where: { budgetId: id } });
            await tx.budget.delete({ where: { id } });
        });
        await (0, auditLogger_1.logActivity)({
            userId: authUserId,
            userName,
            action: 'DELETE',
            entity: 'BUDGET',
            entityId: id,
            details: `Presupuesto eliminado: ${budgetToDelete.title}`
        });
        res.status(204).send();
    }
    catch (error) {
        console.error(`Error deleting budget ${id}:`, error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.deleteBudget = deleteBudget;
// Auxiliar para calcular el precio total
const calculateTotal = async (products, isPrivileged, deliveryDate) => {
    let total = 0;
    for (const p of products) {
        if (isPrivileged && p.unitPrice != null) {
            total += p.quantity * Number(p.unitPrice);
            continue;
        }
        const pr = await prisma_1.default.productPrice.findFirst({
            where: { productId: p.productId, date: { lte: deliveryDate ? new Date(deliveryDate) : new Date() } },
            orderBy: { date: 'desc' }
        });
        if (pr) {
            total += p.quantity * pr.price;
            continue;
        }
        const prod = await prisma_1.default.product.findUnique({ where: { id: p.productId } });
        if (!prod)
            throw new Error(`Product ${p.productId} not found.`);
        total += p.quantity * prod.price;
    }
    return total;
};
