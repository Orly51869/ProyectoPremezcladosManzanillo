"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getProductPrice = exports.createProductPrice = void 0;
const prisma_1 = __importDefault(require("../lib/prisma"));
// POST /api/products/:id/prices
const createProductPrice = async (req, res) => {
    const productId = req.params.id;
    const { date, currency, price } = req.body;
    const authUserId = req.auth?.payload.sub;
    const roles = req.auth?.payload['https://premezcladomanzanillo.com/roles'] || [];
    if (!authUserId) {
        return res.status(401).json({ error: 'Authenticated user ID not found.' });
    }
    if (!roles.some(r => ['Administrador', 'Contable'].includes(r))) {
        return res.status(403).json({ error: 'Forbidden: Only Administrador or Contable can publish prices.' });
    }
    if (!date || !currency || typeof price !== 'number') {
        return res.status(400).json({ error: 'Required fields: date, currency, price (number).' });
    }
    try {
        // Ensure product exists
        const product = await prisma_1.default.product.findUnique({ where: { id: productId } });
        if (!product)
            return res.status(404).json({ error: 'Product not found.' });
        const created = await prisma_1.default.productPrice.create({
            data: {
                product: { connect: { id: productId } },
                date: new Date(date),
                currency,
                price,
                createdById: authUserId,
                createdByRole: roles.join(',')
            }
        });
        res.status(201).json(created);
    }
    catch (error) {
        console.error('Error creating product price:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.createProductPrice = createProductPrice;
// GET /api/products/:id/prices?date=YYYY-MM-DD
const getProductPrice = async (req, res) => {
    const productId = req.params.id;
    const dateParam = req.query.date;
    try {
        // Ensure product exists
        const product = await prisma_1.default.product.findUnique({ where: { id: productId } });
        if (!product)
            return res.status(404).json({ error: 'Product not found.' });
        if (dateParam) {
            const date = new Date(dateParam);
            // Find latest price with date <= requested date
            const price = await prisma_1.default.productPrice.findFirst({
                where: { productId, date: { lte: date } },
                orderBy: { date: 'desc' }
            });
            return res.status(200).json(price || null);
        }
        // If no date provided, return latest price
        const latest = await prisma_1.default.productPrice.findFirst({
            where: { productId },
            orderBy: { date: 'desc' }
        });
        res.status(200).json(latest || null);
    }
    catch (error) {
        console.error('Error fetching product price:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.getProductPrice = getProductPrice;
exports.default = { createProductPrice: exports.createProductPrice, getProductPrice: exports.getProductPrice };
