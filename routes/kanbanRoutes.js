const express = require("express");
const router = express.Router();
const { getKanbanData, moveTask } = require("../controllers/kanbanController");
const { protect } = require("../middleware/authMiddleware");

router.get("/", protect, getKanbanData);
router.patch("/move", protect, moveTask);

module.exports = router;
