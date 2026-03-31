const mongoose = require("mongoose");

const companySchema = mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    name: { type: String, required: true },
    gstNumber: { type: String },
    address: { type: String },
    logo: { type: String } // store file path
  },
  { timestamps: true }
);

module.exports = mongoose.model("Company", companySchema);
