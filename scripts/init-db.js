const { PrismaClient } = require("@prisma/client");
const dotenv = require("dotenv");

// Load environment variables
dotenv.config();

const prisma = new PrismaClient();

async function main() {
  try {
    // Test database connection
    await prisma.$connect();
    console.log("Successfully connected to MongoDB via Prisma");

    // Check if database is properly set up
    const userCount = await prisma.user.count();
    const customerCount = await prisma.customer.count();
    const taskCount = await prisma.task.count();

    console.log(`Database contains:
    - ${userCount} users
    - ${customerCount} customers
    - ${taskCount} tasks
    `);

    console.log("Database is ready. If you want to seed initial data, run 'npm run seed'");
  } catch (error) {
    console.error("Database connection error:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
