const { Cashfree } = require("cashfree-pg");

Cashfree.XClientId = process.env.CASHFREE_APP_ID;
Cashfree.XClientSecret = process.env.CASHFREE_SECRET_KEY;
Cashfree.XEnvironment = Cashfree.Environment.SANDBOX;

class CashfreeService {
  static async createOrder(orderId, orderAmount, orderCurrency, user) {
    try {
      const expiryDate = new Date(Date.now() + 60 * 60 * 1000);
      const formattedExpiryDate = expiryDate.toISOString();

      const request = {
        order_amount: orderAmount,
        order_currency: orderCurrency,
        order_id: orderId,
        customer_details: {
          customer_id: `${user.id}`,
          customer_phone: "9876543210",
          customer_email: user.email,
        },
        order_meta: {
          return_url: `http://localhost:3000/api/user/donate/getPaymentStatus/${orderId}`,
          payment_methods: "cc, upi, nb",
        },
        order_expiry_time: formattedExpiryDate,
      };

      return await Cashfree.PGCreateOrder("2023-08-01", request);
    } catch (error) {
      console.error("Error creating Cashfree order:", error);
      throw error;
    }
  }

  static async getPaymentStatus(orderId) {
    try {
      const response = await Cashfree.PGOrderFetchPayments("2023-08-01", orderId);

      if (!response.data || response.data.length === 0) {
        return "FAILURE"; // No transactions found
      }

      if (response.data.some(transaction => transaction.payment_status === "SUCCESS")) {
        return "SUCCESS";
      }

      if (response.data.some(transaction => transaction.payment_status === "PENDING")) {
        return "PENDING";
      }

      return "FAILURE";
    } catch (error) {
      console.error("Error fetching Cashfree payment status:", error);
      throw error;
    }
  }
}

module.exports = CashfreeService;
