const express = require("express");
const router = express.Router();
const {
  getTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
  updateTaskStatus,
} = require("../controllers/taskController");
const { protect } = require("../middleware/authMiddleware");

router.route("/").get(protect, getTasks).post(protect, createTask);

router.route("/:id").get(protect, getTaskById).put(protect, updateTask).delete(protect, deleteTask);

router.route("/:id/status").patch(protect, updateTaskStatus);

module.exports = router;
