"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteProduct = exports.updateProduct = exports.createProduct = exports.getProducts = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
// Get all products
const getProducts = async (req, res) => {
    try {
        const products = await prisma.product.findMany({
            orderBy: {
                createdAt: "desc",
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
// Create a new product
const createProduct = async (req, res) => {
    try {
        const { name, description, price, type, category } = req.body;
        if (!name || !price || !type) {
            return res.status(400).json({ error: "Name, price, and type are required." });
        }
        const newProduct = await prisma.product.create({
            data: {
                name,
                description,
                price: parseFloat(price),
                type,
                category,
            },
        });
        res.status(201).json(newProduct);
    }
    catch (error) {
        console.error("Error creating product:", error);
        res.status(500).json({ error: "An error occurred while creating the product." });
    }
};
exports.createProduct = createProduct;
// Update a product
const updateProduct = async (req, res) => {
    const { id } = req.params;
    try {
        const { name, description, price, type, category } = req.body;
        const updatedProduct = await prisma.product.update({
            where: { id },
            data: {
                name,
                description,
                price: price ? parseFloat(price) : undefined,
                type,
                category,
            },
        });
        res.json(updatedProduct);
    }
    catch (error) {
        console.error(`Error updating product ${id}:`, error);
        res.status(500).json({ error: `An error occurred while updating product ${id}.` });
    }
};
exports.updateProduct = updateProduct;
// Delete a product
const deleteProduct = async (req, res) => {
    const { id } = req.params;
    try {
        await prisma.product.delete({
            where: { id },
        });
        res.status(204).send(); // No content
    }
    catch (error) {
        console.error(`Error deleting product ${id}:`, error);
        res.status(500).json({ error: `An error occurred while deleting product ${id}.` });
    }
};
exports.deleteProduct = deleteProduct;
