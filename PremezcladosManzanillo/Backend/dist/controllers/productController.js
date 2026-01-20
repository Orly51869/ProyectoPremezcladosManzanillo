"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteProduct = exports.updateProduct = exports.createProduct = exports.getProducts = void 0;
const auditLogger_1 = require("../utils/auditLogger");
const prisma_1 = __importDefault(require("../lib/prisma"));
// Obtener todos los productos
const getProducts = async (req, res) => {
    try {
        const products = await prisma_1.default.product.findMany({
            orderBy: {
                createdAt: "desc",
            },
            include: {
                category: true,
            },
        });
        res.json(products);
    }
    catch (error) {
        console.error("Error fetching products:", error);
        res.status(500).json({ error: "An error occurred while fetching products." });
    }
};
exports.getProducts = getProducts;
// Crear un nuevo producto
const createProduct = async (req, res) => {
    try {
        const { name, description, price, type, category } = req.body;
        const authUserId = req.auth?.payload.sub;
        const userName = req.dbUser?.name || req.auth?.payload?.name || 'Administrador';
        if (!name || !price || !type) {
            return res.status(400).json({ error: "Name, price, and type are required." });
        }
        const newProduct = await prisma_1.default.product.create({
            data: {
                name,
                description,
                price: parseFloat(price),
                type,
                category: category ? {
                    connectOrCreate: {
                        where: { name: category },
                        create: { name: category },
                    }
                } : undefined
            },
        });
        await (0, auditLogger_1.logActivity)({
            userId: authUserId,
            userName,
            action: 'CREATE',
            entity: 'PRODUCT',
            entityId: newProduct.id,
            details: `Producto creado: ${name} con precio ${price}`
        });
        res.status(201).json(newProduct);
    }
    catch (error) {
        // ...
    }
};
exports.createProduct = createProduct;
// Actualizar un producto
const updateProduct = async (req, res) => {
    const { id } = req.params;
    const authUserId = req.auth?.payload.sub;
    const userName = req.dbUser?.name || req.auth?.payload?.name || 'Administrador';
    try {
        const { name, description, price, type, category } = req.body;
        const updatedProduct = await prisma_1.default.product.update({
            where: { id },
            data: {
                name,
                description,
                price: price ? parseFloat(price) : undefined,
                type,
                category: category ? {
                    connectOrCreate: {
                        where: { name: category },
                        create: { name: category },
                    }
                } : undefined
            },
        });
        await (0, auditLogger_1.logActivity)({
            userId: authUserId,
            userName,
            action: 'UPDATE',
            entity: 'PRODUCT',
            entityId: id,
            details: `Producto actualizado: ${name || updatedProduct.name}`
        });
        res.json(updatedProduct);
    }
    catch (error) {
        // ...
    }
};
exports.updateProduct = updateProduct;
// Eliminar un producto
const deleteProduct = async (req, res) => {
    const { id } = req.params;
    const authUserId = req.auth?.payload.sub;
    const userName = req.dbUser?.name || req.auth?.payload?.name || 'Administrador';
    try {
        const productToDelete = await prisma_1.default.product.findUnique({ where: { id } });
        await prisma_1.default.product.delete({ where: { id } });
        await (0, auditLogger_1.logActivity)({
            userId: authUserId,
            userName,
            action: 'DELETE',
            entity: 'PRODUCT',
            entityId: id,
            details: `Producto eliminado: ${productToDelete?.name}`
        });
        res.status(204).send();
    }
    catch (error) {
        // ...
    }
};
exports.deleteProduct = deleteProduct;
