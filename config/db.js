const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient({
  log: ["query", "info", "warn", "error"],
});

const connectDB = async () => {
  try {
    await prisma.$connect();
    console.log("MongoDB connected via Prisma");

    // Test the connection
    const testQuery = await prisma.task.findMany({
      take: 1,
    });
    console.log("Database connection test successful");

    return prisma;
  } catch (error) {
    console.error(`Error connecting to database: ${error.message}`);
    process.exit(1);
  }
};

module.exports = { prisma, connectDB };
