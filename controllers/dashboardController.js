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

    // ===== TOP SELLING PRODUCTS =====
    const productSales = {};
    invoices.forEach(inv => {
      inv.items.forEach(item => {
        productSales[item.productName] = (productSales[item.productName] || 0) + item.quantity;
      });
    });

    const topProducts = Object.entries(productSales)
      .map(([name, qty]) => ({ name, qty }))
      .sort((a, b) => b.qty - a.qty)
      .slice(0, 5);

    // ===== MONTHLY TRENDS (Last 6 Months) =====
    const monthlyData = {};
    const months = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const m = d.toLocaleString('default', { month: 'short' });
      months.push(m);
      monthlyData[m] = { sales: 0, expenses: 0 };
    }

    invoices.forEach(inv => {
      const m = new Date(inv.createdAt).toLocaleString('default', { month: 'short' });
      if (monthlyData[m]) monthlyData[m].sales += inv.grandTotal;
    });

    expenses.forEach(exp => {
      const m = new Date(exp.createdAt).toLocaleString('default', { month: 'short' });
      if (monthlyData[m]) monthlyData[m].expenses += exp.amount;
    });

    const trends = months.map(m => ({
      month: m,
      sales: monthlyData[m].sales,
      expenses: monthlyData[m].expenses
    }));

    res.json({
      sales,
      purchases: purchaseTotal,
      expenses: expenseTotal,
      profit,
      topProducts,
      trends
    });

  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Dashboard error" });
  }
};