const express = require("express");

const purchaseMembershipController = require("../controllers/purchaseMembershipController");

const authenticatemiddleware = require("../middleware/auth");

const router = express.Router();

router.post(
  "/createOrder",
  authenticatemiddleware,
  purchaseMembershipController.createOrder
);

router.get(
  "/getPaymentStatus/:orderId",
  purchaseMembershipController.getPaymentStatus
);

router.post(
  "/updateTransactionStatus",
  authenticatemiddleware,
  purchaseMembershipController.updateTransactionStatus
);

module.exports = router;