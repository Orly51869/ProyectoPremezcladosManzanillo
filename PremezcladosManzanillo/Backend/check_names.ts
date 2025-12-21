import { PrismaClient } from '@prisma/client';
import prisma from './src/lib/prisma';

async function main() {
  const budgets = await prisma.budget.findMany({
    where: { status: 'APPROVED' },
    include: { processedBy: true },
    orderBy: { processedAt: 'desc' },
    take: 5
  });
  
  console.log('Resultados de Auditoría (Presupuestos Procesados):');
  budgets.forEach(b => {
    console.log(`- Presupuesto: ${b.title}`);
    console.log(`  Procesado por ID: ${b.processedById}`);
    console.log(`  Nombre en processedBy: ${b.processedBy?.name}`);
    console.log(`  Email en processedBy: ${b.processedBy?.email}`);
    console.log(`  Estado: ${b.status}`);
    console.log('-------------------');
  });

  const users = await prisma.user.findMany({
    take: 10
  });
  console.log('\nUsuarios en DB:');
  users.forEach(u => {
    console.log(`- ${u.name} (${u.email}) [ID: ${u.id}]`);
  });
}

main().catch(console.error).finally(() => prisma.$disconnect());
