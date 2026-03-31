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
