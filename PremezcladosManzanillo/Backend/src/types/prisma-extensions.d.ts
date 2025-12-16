import { PrismaClient } from '@prisma/client';

declare module '@prisma/client' {
  // Temporary extension to inform TypeScript that prisma.productPrice exists.
  // This file is only a short-term shim until you run `npx prisma generate`.
  interface PrismaClient {
    productPrice: any;
  }
}
