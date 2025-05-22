const express = require("express");
const router = express.Router();
const {
  getCustomerLoyalty,
  addLoyaltyPoints,
  redeemReward,
  getRewards,
} = require("../controllers/loyaltyController");
const { protect } = require("../middleware/authMiddleware");

router.get("/:customerId", protect, getCustomerLoyalty);
router.post("/:customerId/add-points", protect, addLoyaltyPoints);
router.post("/:customerId/redeem", protect, redeemReward);
router.get("/rewards", protect, getRewards);

module.exports = router;
