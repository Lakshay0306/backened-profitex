const mongoose = require("mongoose");

const productSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    name: {
      type: String,
      required: true
    },
    category: String,
    quantity: {
      type: Number,
      default: 0
    },
    price: {
      type: Number,
      required: true
    },
    gst: {
      type: Number,
      default: 0
    },
    supplier: String
  },
  { timestamps: true }
);

module.exports = mongoose.model("Product", productSchema);
