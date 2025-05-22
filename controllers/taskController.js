const asyncHandler = require("express-async-handler");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

// @desc    Get all tasks
// @route   GET /api/tasks
// @access  Private
const getTasks = asyncHandler(async (req, res) => {
  const status = req.query.status;
  const priority = req.query.priority;

  let where = {};

  if (status) {
    where.status = status;
  }

  if (priority) {
    where.priority = priority;
  }

  const tasks = await prisma.task.findMany({
    where,
    include: {
      customer: {
        select: {
          name: true,
          roomNumber: true,
        },
      },
      assignedTo: {
        select: {
          name: true,
        },
      },
    },
    orderBy: {
      dueDate: "asc",
    },
  });

  res.json(tasks);
});

// @desc    Get task by ID
// @route   GET /api/tasks/:id
// @access  Private
const getTaskById = asyncHandler(async (req, res) => {
  const task = await prisma.task.findUnique({
    where: { id: req.params.id },
    include: {
      customer: true,
      assignedTo: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });

  if (task) {
    res.json(task);
  } else {
    res.status(404);
    throw new Error("Task not found");
  }
});

// @desc    Create a new task
// @route   POST /api/tasks
// @access  Private
const createTask = async (req, res) => {
  try {
    const {
      title,
      description,
      status,
      priority,
      dueDate,
      items,
      customerId,
      assignedToId,
      weight,
      hasBlankets,
      blanketCount,
      isPaid,
      totalPrice,
    } = req.body;

    // Validate required fields
    if (!title || !dueDate || !customerId) {
      return res.status(400).json({ message: "Please provide title, due date, and customer" });
    }

    // Create task
    const task = await prisma.task.create({
      data: {
        title,
        description,
        status: status || "todo",
        priority: priority || "medium",
        dueDate: new Date(dueDate),
        items: items || 1,
        customerId,
        assignedToId,
        weight: weight || null,
        hasBlankets: hasBlankets || false,
        blanketCount: blanketCount || 0,
        isPaid: isPaid || false,
        totalPrice: totalPrice || null,
      },
      include: {
        customer: {
          select: {
            name: true,
            roomNumber: true,
          },
        },
        assignedTo: {
          select: {
            name: true,
          },
        },
      },
    });

    // Emit socket event if available
    try {
      const io = req.app.get("io");
      if (io) {
        io.emit("task-created", task);
      }
    } catch (socketError) {
      console.error("Socket error:", socketError);
    }

    res.status(201).json(task);
  } catch (error) {
    console.error("Error creating task:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Update a task
// @route   PUT /api/tasks/:id
// @access  Private
const updateTask = async (req, res) => {
  try {
    const {
      title,
      description,
      status,
      priority,
      dueDate,
      items,
      customerId,
      assignedToId,
      weight,
      hasBlankets,
      blanketCount,
      isPaid,
      totalPrice,
    } = req.body;

    // Check if task exists
    const taskExists = await prisma.task.findUnique({
      where: { id: req.params.id },
    });

    if (!taskExists) {
      return res.status(404).json({ message: "Task not found" });
    }

    // Update task
    const updatedTask = await prisma.task.update({
      where: { id: req.params.id },
      data: {
        title,
        description,
        status,
        priority,
        dueDate: dueDate ? new Date(dueDate) : undefined,
        items,
        customerId,
        assignedToId,
        weight: weight || null,
        hasBlankets,
        blanketCount,
        isPaid,
        totalPrice: totalPrice || null,
      },
      include: {
        customer: {
          select: {
            name: true,
            roomNumber: true,
          },
        },
        assignedTo: {
          select: {
            name: true,
          },
        },
      },
    });

    // Emit socket event if available
    try {
      const io = req.app.get("io");
      if (io) {
        io.emit("task-updated", updatedTask);
      }
    } catch (socketError) {
      console.error("Socket error:", socketError);
    }

    res.json(updatedTask);
  } catch (error) {
    console.error("Error updating task:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Delete a task
// @route   DELETE /api/tasks/:id
// @access  Private
const deleteTask = asyncHandler(async (req, res) => {
  const task = await prisma.task.findUnique({
    where: { id: req.params.id },
  });

  if (task) {
    await prisma.task.delete({
      where: { id: req.params.id },
    });

    res.json({ message: "Task removed" });
  } else {
    res.status(404);
    throw new Error("Task not found");
  }
});

// @desc    Update task status
// @route   PATCH /api/tasks/:id/status
// @access  Private
const updateTaskStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;

  if (!["todo", "in-progress", "done", "delivery"].includes(status)) {
    res.status(400);
    throw new Error("Invalid status value");
  }

  const task = await prisma.task.findUnique({
    where: { id: req.params.id },
  });

  if (task) {
    const updatedTask = await prisma.task.update({
      where: { id: req.params.id },
      data: { status },
      include: {
        customer: {
          select: {
            name: true,
            roomNumber: true,
          },
        },
      },
    });

    res.json(updatedTask);
  } else {
    res.status(404);
    throw new Error("Task not found");
  }
});

module.exports = {
  getTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
  updateTaskStatus,
};
