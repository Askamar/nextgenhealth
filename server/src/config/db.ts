import { PrismaClient } from '@prisma/client';
import process from 'process';

const prisma = new PrismaClient();

const connectDB = async () => {
  try {
    await prisma.$connect();
    console.log('MySQL Database Connected via Prisma Client');
  } catch (error: any) {
    console.error(`Error connecting to MySQL: ${error.message}`);
    process.exit(1);
  }
};

export { prisma };
export default connectDB;