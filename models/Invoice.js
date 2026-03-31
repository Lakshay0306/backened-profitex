const mongoose = require("mongoose");

const invoiceSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    invoiceNumber: {
      type: String,
      required: true
    },
    customerName: {
      type: String,
      required: true
    },
    items: [
      {
        productName: String,
        quantity: Number,
        price: Number,
        gst: Number,
        total: Number
      }
    ],
    subtotal: Number,
    gstTotal: Number,
    grandTotal: Number
  },
  { timestamps: true }
);

module.exports = mongoose.model("Invoice", invoiceSchema);
