import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const budgets = await prisma.budget.findMany({
    where: { status: 'APPROVED' },
    include: { processedBy: true },
    orderBy: { processedAt: 'desc' },
    take: 5
  });
  
  console.log(JSON.stringify(budgets, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
