const mongoose = require("mongoose");

const purchaseSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    supplier: {
      type: String,
      required: true
    },
    items: [
      {
        productName: String,
        quantity: Number,
        cost: Number
      }
    ],
    totalCost: Number
  },
  { timestamps: true }
);

module.exports = mongoose.model("Purchase", purchaseSchema);
