
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkBudget() {
    const budget = await prisma.budget.findFirst({
        where: { title: { contains: 'casa luis' } },
        include: { payments: true }
    });

    if (budget) {
        console.log('Budget Title:', budget.title);
        console.log('Budget Total:', budget.total);
        console.log('Payments:');
        budget.payments.forEach(p => {
            console.log(` - Amount: ${p.amount}, Paid: ${p.paidAmount}, Pending: ${p.pending}, Currency: ${p.currency}, Rate: ${p.exchangeRate} status: ${p.status}`);
        });
    } else {
        console.log('Budget not found');
    }
}

checkBudget()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
