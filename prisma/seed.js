const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  // Create admin user
  const adminPassword = await bcrypt.hash("admin123", 10);
  const admin = await prisma.user.upsert({
    where: { email: "admin@laundry.com" },
    update: {},
    create: {
      name: "Admin User",
      email: "admin@laundry.com",
      password: adminPassword,
      role: "admin",
    },
  });

  // Create staff user
  const staffPassword = await bcrypt.hash("staff123", 10);
  const staff = await prisma.user.upsert({
    where: { email: "staff@laundry.com" },
    update: {},
    create: {
      name: "Staff User",
      email: "staff@laundry.com",
      password: staffPassword,
      role: "staff",
    },
  });

  // Create customers
  const customers = await Promise.all([
    prisma.customer.upsert({
      where: { id: "000000000000000000000001" },
      update: {},
      create: {
        id: "000000000000000000000001",
        name: "John Doe",
        email: "john@example.com",
        phone: "555-1234",
      },
    }),
    prisma.customer.upsert({
      where: { id: "000000000000000000000002" },
      update: {},
      create: {
        id: "000000000000000000000002",
        name: "Mary Smith",
        email: "mary@example.com",
        phone: "555-5678",
      },
    }),
    prisma.customer.upsert({
      where: { id: "000000000000000000000003" },
      update: {},
      create: {
        id: "000000000000000000000003",
        name: "Robert Johnson",
        email: "robert@example.com",
        phone: "555-9012",
      },
    }),
    prisma.customer.upsert({
      where: { id: "000000000000000000000004" },
      update: {},
      create: {
        id: "000000000000000000000004",
        name: "Sarah Williams",
        email: "sarah@example.com",
        phone: "555-3456",
      },
    }),
    prisma.customer.upsert({
      where: { id: "000000000000000000000005" },
      update: {},
      create: {
        id: "000000000000000000000005",
        name: "Michael Brown",
        email: "michael@example.com",
        phone: "555-7890",
      },
    }),
    prisma.customer.upsert({
      where: { id: "000000000000000000000006" },
      update: {},
      create: {
        id: "000000000000000000000006",
        name: "Emily Davis",
        email: "emily@example.com",
        phone: "555-2345",
      },
    }),
  ]);

  // Clear existing tasks to avoid errors with new schema
  await prisma.task.deleteMany({});

  // Get current date for due dates
  const today = new Date();

  // Create tasks
  const tasks = await Promise.all([
    // TODO tasks
    prisma.task.create({
      data: {
        title: "Regular Wash & Fold - John Doe",
        description: "Customer requested extra care with silk items.",
        status: "todo",
        priority: "high",
        dueDate: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 14, 0), // Today at 2:00 PM
        items: 5,
        weight: 4.5,
        hasBlankets: false,
        blanketCount: 0,
        isPaid: false,
        totalPrice: 112.5, // 100 + (0.5 * 25)
        serviceType: "Regular Wash & Fold",
        customerId: customers[0].id,
        assignedToId: staff.id,
      },
    }),
    prisma.task.create({
      data: {
        title: "Express Laundry Service",
        status: "todo",
        priority: "medium",
        dueDate: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 16, 0), // Today at 4:00 PM
        items: 3,
        weight: 3.2,
        hasBlankets: false,
        blanketCount: 0,
        isPaid: true,
        totalPrice: 100, // Minimum price
        customerId: customers[1].id,
        assignedToId: staff.id,
      },
    }),
    prisma.task.create({
      data: {
        title: "Delicate Items Wash",
        description: "Includes delicate items",
        status: "todo",
        priority: "low",
        dueDate: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1, 10, 0), // Tomorrow at 10:00 AM
        items: 8,
        weight: 5.8,
        hasBlankets: false,
        blanketCount: 0,
        isPaid: false,
        totalPrice: 145, // 100 + (1.8 * 25)
        customerId: customers[3].id,
      },
    }),

    // IN-PROGRESS tasks
    prisma.task.create({
      data: {
        title: "Standard Laundry",
        status: "in-progress",
        priority: "medium",
        dueDate: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 12, 0), // Today at 12:00 PM
        items: 4,
        weight: 4.0,
        hasBlankets: false,
        blanketCount: 0,
        isPaid: true,
        totalPrice: 100, // Minimum price
        customerId: customers[2].id,
        assignedToId: staff.id,
      },
    }),
    prisma.task.create({
      data: {
        title: "Express Dry Cleaning",
        description: "Customer needs this ASAP",
        status: "in-progress",
        priority: "high",
        dueDate: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 11, 0), // Today at 11:00 AM
        items: 2,
        weight: 2.5,
        hasBlankets: false,
        blanketCount: 0,
        isPaid: true,
        totalPrice: 100, // Minimum price
        customerId: customers[5].id,
        assignedToId: staff.id,
      },
    }),

    // DONE tasks
    prisma.task.create({
      data: {
        title: "Family Laundry Package",
        status: "done",
        priority: "medium",
        dueDate: new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1, 15, 0), // Yesterday at 3:00 PM
        items: 6,
        weight: 4.7,
        hasBlankets: false,
        blanketCount: 0,
        isPaid: true,
        totalPrice: 117.5, // 100 + (0.7 * 25)
        customerId: customers[1].id,
        assignedToId: staff.id,
      },
    }),
    prisma.task.create({
      data: {
        title: "Basic Wash Service",
        status: "done",
        priority: "low",
        dueDate: new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1, 16, 0), // Yesterday at 4:00 PM
        items: 3,
        weight: 3.5,
        hasBlankets: false,
        blanketCount: 0,
        isPaid: false,
        totalPrice: 100, // Minimum price
        customerId: customers[4].id,
        assignedToId: staff.id,
      },
    }),

    // DELIVERY tasks
    prisma.task.create({
      data: {
        title: "Weekly Laundry Subscription",
        description: "Customer will be available after 2 PM",
        status: "delivery",
        priority: "high",
        dueDate: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 14, 30), // Today at 2:30 PM
        items: 7,
        weight: 5.2,
        hasBlankets: false,
        blanketCount: 0,
        isPaid: true,
        totalPrice: 130, // 100 + (1.2 * 25)
        customerId: customers[2].id,
        assignedToId: staff.id,
      },
    }),
    prisma.task.create({
      data: {
        title: "Same-Day Service",
        status: "delivery",
        priority: "high",
        dueDate: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 10, 0), // Today at 10:00 AM
        items: 2,
        weight: 2.0,
        hasBlankets: false,
        blanketCount: 0,
        isPaid: true,
        totalPrice: 100, // Minimum price
        customerId: customers[5].id,
        assignedToId: staff.id,
      },
    }),

    // Add a task with blankets
    prisma.task.create({
      data: {
        title: "Bedding & Comforter Service",
        description: "Includes comforter and sheets",
        status: "todo",
        priority: "medium",
        dueDate: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 16, 0), // Today at 4:00 PM
        items: 3,
        weight: 6.2,
        hasBlankets: true,
        blanketCount: 2,
        isPaid: true,
        totalPrice: 255, // 100 + (2.2 * 25) + (2 * 50)
        customerId: customers[4].id,
        assignedToId: staff.id,
      },
    }),
  ]);

  // Create loyalty rewards
  console.log("Creating loyalty rewards...");
  const rewards = await Promise.all([
    prisma.loyaltyReward.create({
      data: {
        name: "10% Discount",
        description: "Get 10% off your next order",
        pointsCost: 100,
        type: "discount",
        expiryDays: 30,
      },
    }),
    prisma.loyaltyReward.create({
      data: {
        name: "Free Delivery",
        description: "Free delivery on your next order",
        pointsCost: 150,
        type: "freeService",
        expiryDays: 60,
      },
    }),
    prisma.loyaltyReward.create({
      data: {
        name: "Priority Processing",
        description: "Get your laundry done with priority",
        pointsCost: 200,
        type: "freeService",
        expiryDays: 30,
      },
    }),
    prisma.loyaltyReward.create({
      data: {
        name: "Free Blanket Cleaning",
        description: "Get one blanket cleaned for free",
        pointsCost: 300,
        type: "freeService",
        expiryDays: 90,
      },
    }),
    prisma.loyaltyReward.create({
      data: {
        name: "25% Discount",
        description: "Get 25% off your next order",
        pointsCost: 500,
        type: "discount",
        expiryDays: 45,
      },
    }),
    prisma.loyaltyReward.create({
      data: {
        name: "Free Laundry Bag",
        description: "Receive a free premium laundry bag",
        pointsCost: 400,
        type: "gift",
        expiryDays: 120,
      },
    }),
  ]);

  console.log(`Created ${rewards.length} loyalty rewards`);

  // Create some sample loyalty accounts for existing customers
  console.log("Creating sample loyalty accounts...");
  const loyaltyCustomers = await prisma.customer.findMany({ take: 5 });

  for (const customer of loyaltyCustomers) {
    const points = Math.floor(Math.random() * 1200);
    const lifetimePoints = points + Math.floor(Math.random() * 500);

    // Determine tier based on lifetime points
    let tier = "bronze";
    if (lifetimePoints >= 1000) tier = "platinum";
    else if (lifetimePoints >= 500) tier = "gold";
    else if (lifetimePoints >= 200) tier = "silver";

    await prisma.loyaltyAccount.create({
      data: {
        customerId: customer.id,
        points,
        lifetimePoints,
        tier,
        joinDate: new Date(Date.now() - Math.floor(Math.random() * 90 * 24 * 60 * 60 * 1000)), // Random date in the last 90 days
      },
    });
  }

  console.log(`Created loyalty accounts for ${loyaltyCustomers.length} customers`);

  console.log("Seed data created successfully!");
  console.log(`Created ${tasks.length} tasks`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
