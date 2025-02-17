const Order = require("../models/ordersModel");
const userController = require("./userController");
const CashfreeService = require("../services/cashfreeService");

exports.createOrder = async (req, res) => {
  try {
    const { orderId, orderAmount = 500, orderCurrency = "INR" } = req.body;

    const response = await CashfreeService.createOrder(orderId, orderAmount, orderCurrency, req.user);

    if (response.data) {
      await req.user.createOrder({
        orderId: response.data.order_id,
        paymentId: response.data.payment_session_id,
        status: "PENDING",
      });

      res.status(200).json({
        orderId: response.data.order_id,
        paymentId: response.data.payment_session_id,
      });
    } else {
      res.status(500).json({ error: "Failed to create order" });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

exports.getPaymentStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const orderStatus = await CashfreeService.getPaymentStatus(orderId);

    res.status(200).json({ orderStatus });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

exports.updateTransactionStatus = async (req, res) => {
  try {
    const { orderId, status } = req.body;
    const order = await Order.findOne({ where: { orderId } });

    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    await order.update({ status });
    await req.user.update({ isPremiumUser: true });

    return res.status(202).json({
      success: true,
      message: "Transaction Successful",
      token: userController.generateAccessToken(req.user.id, req.user.email),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};