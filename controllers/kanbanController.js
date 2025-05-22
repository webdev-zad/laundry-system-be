const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// @desc    Get kanban data
// @route   GET /api/kanban
// @access  Private
const getKanbanData = async (req, res) => {
  try {
    // Get all tasks with customer and assignedTo
    const tasks = await prisma.task.findMany({
      include: {
        customer: {
          select: {
            id: true,
            name: true,
          },
        },
        assignedTo: {
          select: {
            name: true,
          },
        },
      },
    });

    // Group tasks by status
    const kanbanData = {
      todo: tasks.filter((task) => task.status === "todo"),
      "in-progress": tasks.filter((task) => task.status === "in-progress"),
      done: tasks.filter((task) => task.status === "done"),
      delivery: tasks.filter((task) => task.status === "delivery"),
    };

    res.json(kanbanData);
  } catch (error) {
    console.error("Error fetching kanban data:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Move task to different status
// @route   PATCH /api/kanban/move
// @access  Private
const moveTask = async (req, res) => {
  try {
    const { taskId, newStatus } = req.body;
    console.log("Move task request:", { taskId, newStatus });

    if (!taskId || !newStatus) {
      return res.status(400).json({ message: "Task ID and new status are required" });
    }

    // Validate the status
    const validStatuses = ["todo", "in-progress", "done", "delivery"];
    if (!validStatuses.includes(newStatus)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    // Update the task
    const updatedTask = await prisma.task.update({
      where: { id: taskId },
      data: { status: newStatus },
      include: {
        customer: {
          select: {
            name: true,
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
        io.emit("task-moved", {
          taskId: updatedTask.id,
          newStatus: updatedTask.status,
          task: updatedTask,
        });
      }
    } catch (socketError) {
      console.error("Socket error:", socketError);
    }

    return res.status(200).json(updatedTask);
  } catch (error) {
    console.error("Error moving task:", error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = {
  getKanbanData,
  moveTask,
};
