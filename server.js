const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./config/db");

dotenv.config();
connectDB();

const app = express();

/* =========================
   MIDDLEWARE
========================= */

app.use(cors({
  origin: "http://localhost:3000",
  credentials: true
}));

app.use(express.json());

/* Static folder for logo uploads */
app.use("/uploads", express.static("uploads"));

/* =========================
   ROUTES
========================= */

app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/products", require("./routes/productRoutes"));
app.use("/api/invoices", require("./routes/invoiceRoutes"));
app.use("/api/expenses", require("./routes/expenseRoutes"));
app.use("/api/purchases", require("./routes/purchaseRoutes"));
app.use("/api/dashboard", require("./routes/dashboardRoutes"));
app.use("/api/company", require("./routes/companyRoutes"));

/* =========================
   ROOT ROUTE
========================= */

app.get("/", (req, res) => {
  res.send("Profitex API Running 🚀");
});

/* =========================
   GLOBAL ERROR HANDLER
========================= */

app.use((err, req, res, next) => {
  console.error("Server Error:", err);
  res.status(500).json({
    message: "Internal Server Error"
  });
});

/* =========================
   START SERVER
========================= */

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
