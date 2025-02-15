const path = require("path");
const Expense = require("../models/expenseModel");
const { Op } = require("sequelize");

exports.getReportsPage = (req, res, next) => {
  try {
    res.sendFile(
      path.join(__dirname, "../", "public", "views", "reports.html")
    );
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err });
  }
};

exports.dailyReports = async (req, res, next) => {
  try {
    const date = req.body.date;
    const expenses = await Expense.findAll({
      where: { date: date, userId: req.user.id },
    });
    res.status(200).json(expenses);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err });
  }
};

function getWeekRange(weekString) {
  const [year, week] = weekString.split("-W");

  return {
    startDate: getDateOfISOWeek(year, week, 1),
    endDate: getDateOfISOWeek(year, week, 7),
  };
}

function getDateOfISOWeek(year, week, day) {
  const simple = new Date(year, 0, 1 + (week - 1) * 7);
  const ISOWeekStart =
    simple.getDay() <= 4
      ? simple.setDate(simple.getDate() - simple.getDay() + day)
      : simple.setDate(simple.getDate() + 7 - simple.getDay() + day);
  return new Date(ISOWeekStart);
}

exports.weeklyReports = async (req, res, next) => {
  try {
    const week = req.body.week;
    weekObj = getWeekRange(week);
    const expenses = await Expense.findAll({
      where: {
        date: {
          [Op.gte]: weekObj.startDate,
          [Op.lte]: weekObj.endDate,
        },
        userId: req.user.id,
      },
      raw: true,
    });
    res.status(200).json(expenses);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err });
  }
};

exports.monthlyReports = async (req, res, next) => {
  try {
    const month = req.body.month;
    const expenses = await Expense.findAll({
      where: {
        date: {
          [Op.like]: `${month}-%`,
        },
        userId: req.user.id,
      },
      raw: true,
    });
    res.status(200).json(expenses);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err });
  }
};
