const express = require("express");
const router = express.Router();
const expenseController = require("../controllers/expenseController");
const userAuthentication = require("../middleware/auth");

router.get("/", expenseController.getHomePage);
router.get(
  "/getAllExpenses",
  userAuthentication,
  expenseController.getAllExpenses
);
router.get(
  "/deleteExpense/:id",
  userAuthentication,
  expenseController.deleteExpense
);

router.post("/addExpense", userAuthentication, expenseController.addExpense);
router.post(
  "/editExpense/:id",
  userAuthentication,
  expenseController.editExpense
);

router.get(
  "/getAllExpensesForPage",
  userAuthentication,
  expenseController.getAllExpensesForPage
);

router.get(
  "/downloadAllExpenses",
  userAuthentication,
  expenseController.downloadAllExpenses
);



module.exports = router;