const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// @desc    Get customer loyalty data
// @route   GET /api/loyalty/:customerId
// @access  Private
const getCustomerLoyalty = async (req, res) => {
  try {
    const { customerId } = req.params;

    // Get customer loyalty data
    const customer = await prisma.customer.findUnique({
      where: { id: customerId },
      include: {
        loyaltyAccount: {
          include: {
            redeemedRewards: {
              include: {
                reward: true,
              },
              orderBy: {
                redeemedAt: "desc",
              },
            },
          },
        },
      },
    });

    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }

    // If customer doesn't have a loyalty account yet, create one
    if (!customer.loyaltyAccount) {
      const loyaltyAccount = await prisma.loyaltyAccount.create({
        data: {
          customerId: customer.id,
          points: 0,
          lifetimePoints: 0,
          tier: "bronze",
          joinDate: new Date(),
        },
      });

      return res.json({
        points: 0,
        lifetimePoints: 0,
        tier: "bronze",
        joinDate: loyaltyAccount.joinDate,
        redeemedRewards: [],
      });
    }

    // Return loyalty data
    return res.json({
      points: customer.loyaltyAccount.points,
      lifetimePoints: customer.loyaltyAccount.lifetimePoints,
      tier: customer.loyaltyAccount.tier,
      joinDate: customer.loyaltyAccount.joinDate,
      redeemedRewards: customer.loyaltyAccount.redeemedRewards,
    });
  } catch (error) {
    console.error("Error fetching loyalty data:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Add loyalty points to customer
// @route   POST /api/loyalty/:customerId/add-points
// @access  Private
const addLoyaltyPoints = async (req, res) => {
  try {
    const { customerId } = req.params;
    const { points } = req.body;

    if (!points || points <= 0) {
      return res.status(400).json({ message: "Valid points amount is required" });
    }

    // Get customer loyalty account
    let loyaltyAccount = await prisma.loyaltyAccount.findUnique({
      where: { customerId },
    });

    // If no loyalty account exists, create one
    if (!loyaltyAccount) {
      loyaltyAccount = await prisma.loyaltyAccount.create({
        data: {
          customerId,
          points: 0,
          lifetimePoints: 0,
          tier: "bronze",
          joinDate: new Date(),
        },
      });
    }

    // Add points
    const newPoints = loyaltyAccount.points + points;
    const newLifetimePoints = loyaltyAccount.lifetimePoints + points;

    // Determine tier based on lifetime points
    let tier = "bronze";
    if (newLifetimePoints >= 1000) tier = "platinum";
    else if (newLifetimePoints >= 500) tier = "gold";
    else if (newLifetimePoints >= 200) tier = "silver";

    // Update loyalty account
    const updatedLoyaltyAccount = await prisma.loyaltyAccount.update({
      where: { id: loyaltyAccount.id },
      data: {
        points: newPoints,
        lifetimePoints: newLifetimePoints,
        tier,
      },
    });

    // Create points history entry
    await prisma.loyaltyPointsHistory.create({
      data: {
        loyaltyAccountId: loyaltyAccount.id,
        points,
        type: "earned",
        description: "Points added manually",
      },
    });

    res.json({
      points: updatedLoyaltyAccount.points,
      lifetimePoints: updatedLoyaltyAccount.lifetimePoints,
      tier: updatedLoyaltyAccount.tier,
    });
  } catch (error) {
    console.error("Error adding loyalty points:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Redeem a reward
// @route   POST /api/loyalty/:customerId/redeem
// @access  Private
const redeemReward = async (req, res) => {
  try {
    const { customerId } = req.params;
    const { rewardId, pointsCost } = req.body;

    if (!rewardId) {
      return res.status(400).json({ message: "Reward ID is required" });
    }

    // Get customer loyalty account
    const loyaltyAccount = await prisma.loyaltyAccount.findUnique({
      where: { customerId },
    });

    if (!loyaltyAccount) {
      return res.status(404).json({ message: "Loyalty account not found" });
    }

    // Get reward
    const reward = await prisma.loyaltyReward.findUnique({
      where: { id: rewardId },
    });

    if (!reward) {
      return res.status(404).json({ message: "Reward not found" });
    }

    // Check if customer has enough points
    if (loyaltyAccount.points < reward.pointsCost) {
      return res.status(400).json({ message: "Not enough points to redeem this reward" });
    }

    // Create redeemed reward record
    const redeemedReward = await prisma.redeemedReward.create({
      data: {
        loyaltyAccountId: loyaltyAccount.id,
        rewardId: reward.id,
        pointsCost: reward.pointsCost,
        redeemedAt: new Date(),
        expiresAt: new Date(Date.now() + reward.expiryDays * 24 * 60 * 60 * 1000),
      },
      include: {
        reward: true,
      },
    });

    // Deduct points from account
    await prisma.loyaltyAccount.update({
      where: { id: loyaltyAccount.id },
      data: {
        points: loyaltyAccount.points - reward.pointsCost,
      },
    });

    // Create points history entry
    await prisma.loyaltyPointsHistory.create({
      data: {
        loyaltyAccountId: loyaltyAccount.id,
        points: -reward.pointsCost,
        type: "redeemed",
        description: `Redeemed for ${reward.name}`,
      },
    });

    res.json(redeemedReward);
  } catch (error) {
    console.error("Error redeeming reward:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Get available rewards
// @route   GET /api/loyalty/rewards
// @access  Private
const getRewards = async (req, res) => {
  try {
    const rewards = await prisma.loyaltyReward.findMany({
      where: {
        isActive: true,
      },
      orderBy: {
        pointsCost: "asc",
      },
    });

    res.json(rewards);
  } catch (error) {
    console.error("Error fetching rewards:", error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  getCustomerLoyalty,
  addLoyaltyPoints,
  redeemReward,
  getRewards,
};
