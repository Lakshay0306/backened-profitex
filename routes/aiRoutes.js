const express = require("express");
const router = express.Router();
const multer = require("multer");

const upload = multer({ storage: multer.memoryStorage() }); // use memory storage for direct AI processing

const { chatWithAi, scanReceipt, predictDemand, draftEmail, optimizePricing } = require("../controllers/aiController");
const { protect } = require("../middleware/authMiddleware");

router.post("/chat", protect, chatWithAi);
router.post("/scan-receipt", protect, upload.single("receipt"), scanReceipt);
router.get("/predict-demand", protect, predictDemand);
router.post("/draft-email", protect, draftEmail);
router.get("/optimize-pricing", protect, optimizePricing);

module.exports = router;
