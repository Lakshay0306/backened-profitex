const Product = require("../models/Product");

exports.createProduct = async (req, res) => {
  const { name, quantity, price } = req.body;

  const product = await Product.create({
    user: req.user._id,
    name,
    quantity,
    price,
  });

  res.json(product);
};

exports.getProducts = async (req, res) => {
  const products = await Product.find({ user: req.user._id });
  res.json(products);
};
