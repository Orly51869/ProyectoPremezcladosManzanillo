
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function debugDashboard() {
    const adminRole = 'Administrador';
    const userId = 'user_id_placeholder'; // Not needed for admin check if logic is correct

    console.log('--- SIMULATING DASHBOARD CONTROLLER (ADMIN) ---');

    const budgetWhereClause = {};
    const paymentWhereClause = {};

    const approvedBudgets = await prisma.budget.count({
        where: {
            ...budgetWhereClause,
            status: 'APPROVED'
        }
    });

    const paidBudgets = await prisma.budget.count({
        where: {
            ...budgetWhereClause,
            status: 'PAID'
        }
    });

    const totalPayments = await prisma.payment.count({ where: paymentWhereClause });

    console.log('Approved Budgets (Status=APPROVED):', approvedBudgets);
    console.log('Paid Budgets (Status=PAID):', paidBudgets);
    console.log('Total Payments (No Filters):', totalPayments);

    // Check if payments are somehow hidden?
    const allPayments = await prisma.payment.findMany({ select: { id: true, status: true } });
    console.log('All Payments in DB:', allPayments);

}

debugDashboard()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
