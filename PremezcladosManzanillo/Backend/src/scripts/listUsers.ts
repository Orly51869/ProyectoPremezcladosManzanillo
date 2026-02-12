
import prisma from '../lib/prisma';

async function main() {
    console.log('Fetching users and their data counts...');

    const users = await prisma.user.findMany({
        select: {
            id: true,
            email: true,
            name: true,
            role: true,
            _count: {
                select: {
                    createdBudgets: true,
                    clients: true,
                    processedBudgets: true,
                    validatedPayments: true,
                    notifications: true,
                },
            },
        },
        orderBy: { email: 'asc' }
    });

    if (users.length === 0) {
        console.log('No users found in database.');
        return;
    }

    console.log('\n--- LIST OF USERS ---');
    console.table(users.map(u => ({
        Email: u.email,
        ID_Snippet: u.id.slice(0, 15) + '...',
        Role: u.role,
        Budgets: u._count.createdBudgets,
        Clients: u._count.clients,
        Payments: u._count.validatedPayments,
    })));

    console.log('\n--- RECOMMENDATION ---');
    console.log('Identify the user with non-zero Budgets/Clients (Source) and the new user with 0 items (Target).');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
