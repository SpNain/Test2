const express = require("express");
const router = express.Router();

const purchaseMembershipController = require("../controllers/purchaseMembershipController");
const authenticatemiddleware = require("../middleware/auth");


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