const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const { createInvoice, getInvoices, downloadInvoice } = require("../controllers/invoiceController");

router.post("/", protect, createInvoice);
router.get("/", protect, getInvoices);
router.get("/download/:id", protect, downloadInvoice);

module.exports = router;
