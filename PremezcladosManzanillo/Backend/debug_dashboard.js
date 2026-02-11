
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkData() {
    console.log('--- CHECKING BUDGETS ---');
    const approvedBudgetsCount = await prisma.budget.count({
        where: { status: 'APPROVED' }
    });
    console.log('Approved Budgets Count:', approvedBudgetsCount);

    console.log('\n--- CHECKING PAYMENTS ---');
    const allPayments = await prisma.payment.findMany({
        select: {
            id: true,
            pending: true,
            amount: true,
            paidAmount: true,
            status: true,
            createdAt: true
        }
    });

    console.log('Total Payments:', allPayments.length);

    const pendingGtZeroCount = allPayments.filter(p => p.pending > 0).length;
    console.log("Payments with pending > 0 (Current Backend Logic):", pendingGtZeroCount);

    if (pendingGtZeroCount > 0) {
        console.log("Details of payments with pending > 0:");
        allPayments.filter(p => p.pending > 0).forEach(p => {
            console.log(JSON.stringify(p, null, 2));
        });
    }

}

checkData()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
