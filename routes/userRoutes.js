const express = require("express");
const router = express.Router();
const {
  loginUser,
  registerUser,
  getUserProfile,
  updateUserProfile,
  getUsers,
  deleteUser,
} = require("../controllers/userController");
const { protect, admin } = require("../middleware/authMiddleware");

router.post("/login", loginUser);
router.route("/profile").get(protect, getUserProfile).put(protect, updateUserProfile);
router.route("/").post(protect, admin, registerUser).get(protect, admin, getUsers);
router.route("/:id").delete(protect, admin, deleteUser);

module.exports = router;
