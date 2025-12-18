import { Request, Response } from 'express';
import prisma from '../lib/prisma';

// POST /api/products/:id/prices
export const createProductPrice = async (req: Request, res: Response) => {
  const productId = req.params.id;
  const { date, currency, price } = req.body;
  const authUserId = req.auth?.payload.sub;
  const roles = req.auth?.payload['https://premezcladomanzanillo.com/roles'] as string[] || [];

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
    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) return res.status(404).json({ error: 'Product not found.' });

    const created = await (prisma as any).productPrice.create({
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
  } catch (error) {
    console.error('Error creating product price:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// GET /api/products/:id/prices?date=YYYY-MM-DD
export const getProductPrice = async (req: Request, res: Response) => {
  const productId = req.params.id;
  const dateParam = req.query.date as string | undefined;

  try {
    // Ensure product exists
    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) return res.status(404).json({ error: 'Product not found.' });

    if (dateParam) {
      const date = new Date(dateParam);
      // Find latest price with date <= requested date
      const price = await (prisma as any).productPrice.findFirst({
        where: { productId, date: { lte: date } },
        orderBy: { date: 'desc' }
      });
      return res.status(200).json(price || null);
    }

    // If no date provided, return latest price
    const latest = await (prisma as any).productPrice.findFirst({
      where: { productId },
      orderBy: { date: 'desc' }
    });
    res.status(200).json(latest || null);
  } catch (error) {
    console.error('Error fetching product price:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export default { createProductPrice, getProductPrice };
