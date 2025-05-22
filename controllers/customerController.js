const asyncHandler = require("express-async-handler");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

// @desc    Get all customers
// @route   GET /api/customers
// @access  Private
const getCustomers = asyncHandler(async (req, res) => {
  const customers = await prisma.customer.findMany({
    include: {
      _count: {
        select: { tasks: true },
      },
    },
  });
  res.json(customers);
});

// @desc    Get customer by ID
// @route   GET /api/customers/:id
// @access  Private
const getCustomerById = asyncHandler(async (req, res) => {
  const customer = await prisma.customer.findUnique({
    where: { id: req.params.id },
    include: {
      tasks: {
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (customer) {
    res.json(customer);
  } else {
    res.status(404);
    throw new Error("Customer not found");
  }
});

// @desc    Create a customer
// @route   POST /api/customers
// @access  Private
const createCustomer = asyncHandler(async (req, res) => {
  const { name, email, phone, roomNumber } = req.body;

  const customer = await prisma.customer.create({
    data: {
      name,
      email,
      phone,
      roomNumber,
    },
  });

  res.status(201).json(customer);
});

// @desc    Update a customer
// @route   PUT /api/customers/:id
// @access  Private
const updateCustomer = asyncHandler(async (req, res) => {
  const { name, email, phone, roomNumber } = req.body;

  const customer = await prisma.customer.findUnique({
    where: { id: req.params.id },
  });

  if (customer) {
    const updatedCustomer = await prisma.customer.update({
      where: { id: req.params.id },
      data: {
        name: name || customer.name,
        email: email || customer.email,
        phone: phone || customer.phone,
        roomNumber: roomNumber || customer.roomNumber,
      },
    });

    res.json(updatedCustomer);
  } else {
    res.status(404);
    throw new Error("Customer not found");
  }
});

// @desc    Delete a customer
// @route   DELETE /api/customers/:id
// @access  Private/Admin
const deleteCustomer = asyncHandler(async (req, res) => {
  const customer = await prisma.customer.findUnique({
    where: { id: req.params.id },
    include: {
      _count: {
        select: { tasks: true },
      },
    },
  });

  if (customer) {
    // Check if customer has tasks
    if (customer._count.tasks > 0) {
      res.status(400);
      throw new Error("Cannot delete customer with existing tasks");
    }

    await prisma.customer.delete({
      where: { id: req.params.id },
    });

    res.json({ message: "Customer removed" });
  } else {
    res.status(404);
    throw new Error("Customer not found");
  }
});

module.exports = {
  getCustomers,
  getCustomerById,
  createCustomer,
  updateCustomer,
  deleteCustomer,
};
