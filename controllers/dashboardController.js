const Invoice = require("../models/Invoice");
const Purchase = require("../models/Purchase");
const Expense = require("../models/Expense");

exports.getDashboardSummary = async (req, res) => {
  try {
    // ===== TOTAL SALES =====
    const invoices = await Invoice.find({ user: req.user._id });

    const sales = invoices.reduce((sum, inv) => {
      return sum + (inv.grandTotal || 0);
    }, 0);

    // ===== TOTAL PURCHASE =====
    const purchases = await Purchase.find({ user: req.user._id });

    const purchaseTotal = purchases.reduce((sum, p) => {
      return sum + (p.totalCost || 0);
    }, 0);

    // ===== TOTAL EXPENSE =====
    const expenses = await Expense.find({ user: req.user._id });

    const expenseTotal = expenses.reduce((sum, e) => {
      return sum + (e.amount || 0);
    }, 0);

    // ===== PROFIT =====
    const profit = sales - purchaseTotal - expenseTotal;

    res.json({
      sales,
      purchases: purchaseTotal,
      expenses: expenseTotal,
      profit,
    });

  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Dashboard error" });
  }
};