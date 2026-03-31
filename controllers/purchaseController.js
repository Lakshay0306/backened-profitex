const Purchase = require("../models/Purchase");
const Product = require("../models/Product");

exports.createPurchase = async (req, res) => {
  try {

    const { supplier, items } = req.body;

    let totalCost = 0;

    for (let item of items) {

      const product = await Product.findOne({
        name: item.productName,
        user: req.user._id
      });

      if (product) {
        product.quantity += item.quantity;
        await product.save();
      }

      totalCost += item.quantity * item.cost;
    }

    const purchase = await Purchase.create({
      user: req.user._id,
      supplier,
      items,
      totalCost
    });

    res.json(purchase);

  } catch (error) {
    res.status(500).json({ message: "Purchase failed" });
  }
};

exports.getPurchases = async (req, res) => {
  try {
    const purchases = await Purchase.find({
      user: req.user._id
    }).sort({ createdAt: -1 });

    res.json(purchases);

  } catch (error) {
    res.status(500).json({ message: "Fetch failed" });
  }
};
