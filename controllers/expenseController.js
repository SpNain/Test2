const path = require("path");

const Expense = require("../models/expenseModel");
const User = require("../models/userModel");
const sequelize = require("../util/database");
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
  const t = await sequelize.transaction();
  try {
    const { date, category, description, amount } = req.body;

    await User.update(
      {
        totalExpenses: req.user.totalExpenses + Number(amount),
      },
      {
        where: { id: req.user.id },
        transaction: t,
      }
    );

    await Expense.create(
      {
        date,
        category,
        description,
        amount,
        userId: req.user.id,
      },
      { transaction: t }
    );

    await t.commit();
    res.status(200).json({ message: "Expense added successfully." });
  } catch (err) {
    await t.rollback();
    console.error(err);
    res.status(500).json({ error: err });
  }
};

exports.getAllExpenses = async (req, res, next) => {
  try {
    const expenses = await Expense.findAll({ where: { userId: req.user.id } });
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
    const totalExpenses = await Expense.count({
      where: { userId: req.user.id },
    });
    const totalPages = Math.ceil(totalExpenses / limit);
    const expenses = await Expense.findAll({
      where: { userId: req.user.id },
      offset: offset,
      limit: limit,
    });
    res.json({ expenses: expenses, totalPages: totalPages });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err });
  }
};

exports.deleteExpense = async (req, res, next) => {
  const t = await sequelize.transaction();
  const id = req.params.id;

  try {
    const expense = await Expense.findByPk(id, { transaction: t });

    await User.update(
      {
        totalExpenses: req.user.totalExpenses - expense.amount,
      },
      {
        where: { id: req.user.id },
        transaction: t,
      }
    );

    await Expense.destroy({
      where: { id: id, userId: req.user.id },
      transaction: t,
    });

    await t.commit();
    res.status(200).json({ message: "Expense deleted successfully." });
  } catch (err) {
    await t.rollback();
    console.error(err);
    res.status(500).json({ error: err });
  }
};

exports.editExpense = async (req, res, next) => {
  const t = await sequelize.transaction();
  try {
    const id = req.params.id;
    const { category, description, amount } = req.body;

    const expense = await Expense.findByPk(id, { transaction: t });

    await User.update(
      {
        totalExpenses: req.user.totalExpenses - expense.amount + Number(amount),
      },
      {
        where: { id: req.user.id },
        transaction: t,
      }
    );

    await Expense.update(
      {
        category,
        description,
        amount,
      },
      {
        where: { id: id, userId: req.user.id },
        transaction: t,
      }
    );

    await t.commit();
    res.status(200).json({ message: "Expense updated successfully." });
  } catch (err) {
    await t.rollback();
    console.error(err);
    res.status(500).json({ error: err });
  }
};

exports.downloadAllExpenses = async (req, res, next) => {
  try {

    const expenses = await req.user.getExpenses({
      attributes: ["date", "category", "description", "amount"],
    });

    const filename = `AllExpenses/${
      req.user.name
    }_Expenses_${new Date().toISOString()}.csv`;

    let csv = "";

    if (expenses.length > 0) {
      
      const headers = Object.keys(expenses[0].dataValues);
      csv += headers.join(",") + "\n";

      expenses.forEach((row) => {
        const values = headers.map((header) => `"${row.dataValues[header]}"`);
        csv += values.join(",") + "\n";
      });
    }

    const downloadURL = await AwsService.uploadToS3(csv, filename);
    res.status(200).json({downloadURL, success:true});

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err , success:false});
  }
};
