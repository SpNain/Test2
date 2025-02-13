const Order = require("../models/ordersModel");
const userController = require("./userController");

const { Cashfree } = require("cashfree-pg");

Cashfree.XClientId = process.env.CASHFREE_APP_ID;
Cashfree.XClientSecret = process.env.CASHFREE_SECRET_KEY;
Cashfree.XEnvironment = Cashfree.Environment.SANDBOX;

exports.createOrder = async (req, res) => {
  try {
    const { orderId, orderAmount = 500, orderCurrency = "INR" } = req.body;

    const expiryDate = new Date(Date.now() + 60 * 60 * 1000);
    const formattedExpiryDate = expiryDate.toISOString();

    const request = {
      order_amount: orderAmount,
      order_currency: orderCurrency,
      order_id: orderId,
      customer_details: {
        customer_id: `${req.user.id}`,
        customer_phone: "9876543210",
        customer_email: req.user.email,
      },
      order_meta: {
        return_url: `http://localhost:3000/purchase/getPaymentStatus/${orderId}`,
        payment_methods: "cc, upi, nb",
      },
      order_expiry_time: formattedExpiryDate,
    };

    const response = await Cashfree.PGCreateOrder("2023-08-01", request);

    if (response.data) {
      req.user.createOrder({
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
    console.error("Error creating order:", err);
    res.status(500).json({ error: err });
  }
};

exports.getPaymentStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const response = await Cashfree.PGOrderFetchPayments("2023-08-01", orderId);

    let getOrderResponse = response.data;
    let orderStatus;
    if (
      getOrderResponse.filter(
        (transaction) => transaction.payment_status === "SUCCESS"
      ).length > 0
    ) {
      orderStatus = "SUCCESS";
    } else if (
      getOrderResponse.filter(
        (transaction) => transaction.payment_status === "PENDING"
      ).length > 0
    ) {
      orderStatus = "PENDING";
    } else {
      orderStatus = "FAILURE";
    }
    res.status(200).json({ orderStatus: orderStatus });
  } catch (err) {
    console.error("Error fetching order status:", err);
    res.status(500).json({ error: err });
  }
};

exports.updateTransactionStatus = async (req, res) => {
  try {
    const { orderId, status } = req.body;
    const order = await Order.findOne({ where: { orderId: orderId } });

    await order.update({
      status: status,
    });

    await req.user.update({ isPremiumUser: true });

    return res.status(202).json({
      success: true,
      message: "Transaction Successful",
      token: userController.generateAccessToken(req.user.id, req.user.email),
    });
  } catch (err) {
    console.error("Error updating order status:", err);
    res.status(500).json({ error: err });
  }
};
