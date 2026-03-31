const express = require("express");
const router = express.Router();

const Product = require("../models/Product");
const { protect } = require("../middleware/authMiddleware");

/* =========================
   CREATE PRODUCT
========================= */
router.post("/", protect, async (req, res) => {
  try {

    const { name, category, quantity, price, gst, supplier } = req.body;

    const product = await Product.create({
      user: req.user._id,
      name,
      category,
      quantity,
      price,
      gst,
      supplier
    });

    res.status(201).json(product);

  } catch (error) {
    res.status(500).json({ message: "Product creation failed" });
  }
});

/* =========================
   GET ALL PRODUCTS
========================= */
router.get("/", protect, async (req, res) => {
  try {

    const products = await Product.find({
      user: req.user._id
    }).sort({ createdAt: -1 });

    res.json(products);

  } catch (error) {
    res.status(500).json({ message: "Fetch failed" });
  }
});

/* =========================
   GET SINGLE PRODUCT
========================= */
router.get("/:id", protect, async (req, res) => {
  try {

    const product = await Product.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json(product);

  } catch (error) {
    res.status(500).json({ message: "Error fetching product" });
  }
});

/* =========================
   UPDATE PRODUCT
========================= */
router.put("/:id", protect, async (req, res) => {
  try {

    const product = await Product.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    product.name = req.body.name || product.name;
    product.category = req.body.category || product.category;
    product.quantity = req.body.quantity ?? product.quantity;
    product.price = req.body.price ?? product.price;
    product.gst = req.body.gst ?? product.gst;
    product.supplier = req.body.supplier || product.supplier;

    const updatedProduct = await product.save();

    res.json(updatedProduct);

  } catch (error) {
    res.status(500).json({ message: "Update failed" });
  }
});

/* =========================
   DELETE PRODUCT
========================= */
router.delete("/:id", protect, async (req, res) => {
  try {

    const product = await Product.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    await product.deleteOne();

    res.json({ message: "Product deleted successfully" });

  } catch (error) {
    res.status(500).json({ message: "Delete failed" });
  }
});

/* =========================
   SEARCH PRODUCT
========================= */
router.get("/search/:keyword", protect, async (req, res) => {
  try {

    const keyword = req.params.keyword;

    const products = await Product.find({
      user: req.user._id,
      name: { $regex: keyword, $options: "i" }
    });

    res.json(products);

  } catch (error) {
    res.status(500).json({ message: "Search failed" });
  }
});

module.exports = router;
