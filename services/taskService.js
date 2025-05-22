const { prisma } = require("../config/db");

/**
 * Get tasks with filtering options
 */
const getTasks = async (filters = {}) => {
  const { status, priority, customerId, assignedToId } = filters;

  let where = {};

  if (status) where.status = status;
  if (priority) where.priority = priority;
  if (customerId) where.customerId = customerId;
  if (assignedToId) where.assignedToId = assignedToId;

  return prisma.task.findMany({
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
};

/**
 * Get tasks grouped by status for Kanban board
 */
const getTasksForKanban = async () => {
  const tasks = await prisma.task.findMany({
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

  // Group tasks by status
  const groupedTasks = {
    todo: tasks.filter((task) => task.status === "todo"),
    "in-progress": tasks.filter((task) => task.status === "in-progress"),
    done: tasks.filter((task) => task.status === "done"),
    delivery: tasks.filter((task) => task.status === "delivery"),
  };

  return groupedTasks;
};

module.exports = {
  getTasks,
  getTasksForKanban,
};
