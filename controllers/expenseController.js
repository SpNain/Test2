const path = require("path");

const Expense = require("../models/expenseModel");
const User = require("../models/userModel");
const Download = require("../models/downloadModel");
const AwsService = require("../services/awsService");

exports.getHomePage = async (req, res, next) => {
  try {
    res.sendFile(
      path.join(__dirname, "../", "public", "views", "homePage.html")
    );
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err });
  }
};

exports.addExpense = async (req, res, next) => {
  try {
    const { date, category, description, amount } = req.body;

    const user = await User.findById(req.user._id);
    user.totalExpenses += Number(amount);
    await user.save();

    await Expense.create({
      date,
      category,
      description,
      amount,
      userId: req.user._id,
    });

    res.status(200).json({ message: "Expense added successfully." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err });
  }
};

exports.getAllExpenses = async (req, res, next) => {
  try {
    const expenses = await Expense.find({ userId: req.user._id });
    res.status(200).json(expenses);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err });
  }
};

exports.getAllExpensesForPage = async (req, res, next) => {
  try {
    const pageNo = parseInt(req.query.pageNo) || 1;
    const limit = parseInt(req.query.rowsPerPage) || 10;

    if (pageNo < 1 || limit < 1) {
      return res.status(400).json({ error: "Invalid pagination parameters" });
    }

    const offset = (pageNo - 1) * limit;
    const totalExpenses = await Expense.countDocuments({
      userId: req.user._id,
    });
    const totalPages = Math.ceil(totalExpenses / limit);
    const expenses = await Expense.find({ userId: req.user._id })
      .skip(offset)
      .limit(limit);
    res.json({ expenses: expenses, totalPages: totalPages });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err });
  }
};

exports.deleteExpense = async (req, res, next) => {
  const id = req.params.id;

  try {
    const expense = await Expense.findOne({ _id: id, userId: req.user._id });
    const user = await User.findById(req.user._id);
    user.totalExpenses -= expense.amount;
    await user.save();
    await Expense.deleteOne({ _id: id, userId: req.user._id });

    res.status(200).json({ message: "Expense deleted successfully." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err });
  }
};

exports.editExpense = async (req, res, next) => {
  try {
    const id = req.params.id;
    const { category, description, amount } = req.body;

    const expense = await Expense.findOne({ _id: id, userId: req.user._id });
    const user = await User.findById(req.user._id);

    user.totalExpenses = user.totalExpenses - expense.amount + Number(amount);
    await user.save();

    await Expense.updateOne(
      { _id: id, userId: req.user._id },
      {
        category: category,
        description: description,
        amount: amount,
      }
    );
    res.status(200).json({ message: "Expense updated successfully." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err });
  }
};

exports.downloadAllExpenses = async (req, res, next) => {
  try {
    const expenses = await Expense.find(
      { userId: req.user._id },
      "date category description amount -_id"
    );

    const filename = `AllExpenses/${
      req.user.name
    }_Expenses_${new Date().toISOString()}.csv`;

    let csv = "";

    if (expenses.length > 0) {
      const headers = Object.keys(expenses[0].toObject());
      csv += headers.join(",") + "\n";

      expenses.forEach((row) => {
        const rowObject = row.toObject();
        const values = headers.map((header) => `"${rowObject[header]}"`);
        csv += values.join(",") + "\n";
      });
    }

    const downloadURL = await AwsService.uploadToS3(csv, filename);

    await Download.create({
      downloadLink: downloadURL,
      userId: req.user._id,
    });

    res.status(200).json({ downloadURL, success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err, success: false });
  }
};
