import { prisma } from './config/db';

async function run() {
    await prisma.$connect();
    const appts = await prisma.appointment.findMany({});
    console.log("APPOINTMENTS:", JSON.stringify(appts, null, 2));
    const users = await prisma.user.findMany({});
    console.log("USERS:", JSON.stringify(users.map(u => ({ id: u.id, name: u.name, role: u.role })), null, 2));
    process.exit(0);
}

run().catch(console.error);
