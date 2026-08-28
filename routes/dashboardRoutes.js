const express = require("express");
const router = express.Router();

const { getDashboardSummary, getAiInsights } = require("../controllers/dashboardController");
const { protect } = require("../middleware/authMiddleware");

router.get("/", protect, getDashboardSummary);
router.get("/insights", protect, getAiInsights);

module.exports = router;