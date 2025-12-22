import { Request, Response } from "express";
import { logActivity } from "../utils/auditLogger";
import prisma from "../lib/prisma";

// Obtener todos los productos
export const getProducts = async (req: Request, res: Response) => {
  try {
    const products = await prisma.product.findMany({
      orderBy: {
        createdAt: "desc",
      },
      include: {
        category: true,
      },
    });
    res.json(products);
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ error: "An error occurred while fetching products." });
  }
};

// Crear un nuevo producto
export const createProduct = async (req: Request, res: Response) => {
  try {
    const { name, description, price, type, category } = req.body;
    const authUserId = req.auth?.payload.sub as string;
    const userName = (req as any).dbUser?.name || (req.auth?.payload as any)?.name || 'Administrador';

    if (!name || !price || !type) {
      return res.status(400).json({ error: "Name, price, and type are required." });
    }

    const newProduct = await prisma.product.create({
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

    await logActivity({
      userId: authUserId,
      userName,
      action: 'CREATE',
      entity: 'PRODUCT',
      entityId: newProduct.id,
      details: `Producto creado: ${name} con precio ${price}`
    });

    res.status(201).json(newProduct);
  } catch (error) {
    // ...
  }
};

// Actualizar un producto
export const updateProduct = async (req: Request, res: Response) => {
  const { id } = req.params;
  const authUserId = req.auth?.payload.sub as string;
  const userName = (req.auth?.payload as any)?.name || 'Administrador';
  try {
    const { name, description, price, type, category } = req.body;

    const updatedProduct = await prisma.product.update({
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

    await logActivity({
      userId: authUserId,
      userName,
      action: 'UPDATE',
      entity: 'PRODUCT',
      entityId: id,
      details: `Producto actualizado: ${name || updatedProduct.name}`
    });

    res.json(updatedProduct);
  } catch (error) {
    // ...
  }
};

// Eliminar un producto
export const deleteProduct = async (req: Request, res: Response) => {
  const { id } = req.params;
  const authUserId = req.auth?.payload.sub as string;
  const userName = (req.auth?.payload as any)?.name || 'Administrador';
  try {
    const productToDelete = await prisma.product.findUnique({ where: { id } });
    await prisma.product.delete({ where: { id } });

    await logActivity({
      userId: authUserId,
      userName,
      action: 'DELETE',
      entity: 'PRODUCT',
      entityId: id,
      details: `Producto eliminado: ${productToDelete?.name}`
    });

    res.status(204).send(); 
  } catch (error) {
    // ...
  }
};