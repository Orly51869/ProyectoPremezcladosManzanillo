import prisma from './src/lib/prisma';

async function check() {
  const users = await prisma.user.findMany();
  console.log('--- USUARIOS EN DB ---');
  users.forEach(u => {
    console.log(`ID: ${u.id}`);
    console.log(`Name: "${u.name}"`);
    console.log(`Email: ${u.email}`);
    console.log(`Role: ${u.role}`);
    console.log('--------------------');
  });

  const logs = await prisma.auditLog.findMany({
    orderBy: { createdAt: 'desc' },
    take: 5
  });
  console.log('\n--- ÚLTIMOS LOGS ---');
  logs.forEach(l => {
    console.log(`[${l.createdAt.toISOString()}] ${l.userName} -> ${l.action} ${l.entity}: ${l.details}`);
  });
}

check().catch(console.error).finally(() => prisma.$disconnect());
