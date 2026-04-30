const Expense = require("../models/Expense");

exports.addExpense = async (req, res) => {
  try {
    const { title, amount, category } = req.body;

    const expense = await Expense.create({
      user: req.user._id,
      title,
      amount,
      category
    });

    res.json(expense);

  } catch (error) {
    res.status(500).json({ message: "Expense save failed" });
  }
};

exports.getExpenses = async (req, res) => {
  try {
    const expenses = await Expense.find({
      user: req.user._id
    }).sort({ createdAt: -1 });

    res.json(expenses);

  } catch (error) {
    res.status(500).json({ message: "Fetch failed" });
  }
};

exports.updateExpense = async (req, res) => {
  try {
    const { title, amount, category } = req.body;
    const expense = await Expense.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { title, amount, category },
      { new: true }
    );
    if (!expense) return res.status(404).json({ message: "Expense not found" });
    res.json(expense);
  } catch (error) {
    res.status(500).json({ message: "Update failed" });
  }
};

exports.deleteExpense = async (req, res) => {
  try {
    const expense = await Expense.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!expense) return res.status(404).json({ message: "Expense not found" });
    res.json({ message: "Expense deleted" });
  } catch (error) {
    res.status(500).json({ message: "Delete failed" });
  }
};

exports.getExpenseSummary = async (req, res) => {
  try {
    const expenses = await Expense.find({ user: req.user._id });

    // Group by Category
    const byCategory = expenses.reduce((acc, exp) => {
      acc[exp.category] = (acc[exp.category] || 0) + exp.amount;
      return acc;
    }, {});

    // Group by Month
    const byMonth = expenses.reduce((acc, exp) => {
      const month = new Date(exp.createdAt).toLocaleString('default', { month: 'short', year: 'numeric' });
      acc[month] = (acc[month] || 0) + exp.amount;
      return acc;
    }, {});

    res.json({ byCategory, byMonth });
  } catch (error) {
    res.status(500).json({ message: "Summary failed" });
  }
};
