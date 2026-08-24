import Payment from "../models/Payment.js";
import Order from "../models/Order.js";

const generateTransactionId = () => {
  const random = Math.floor(1000000000 + Math.random() * 9000000000);
  return `TXN-${random}`;
};

export const createPayment = async (req, res) => {
  try {
    const { orderId, amount, method, cardLast4, billingAddress, note, status } = req.body;

    if (!req.user || !req.user._id) {
      return res.status(401).json({ success: false, message: "Unauthorized access" });
    }

    if (!orderId || !amount || !method) {
      return res.status(400).json({
        success: false,
        message: "orderId, amount and method are required",
      });
    }

    const order = await Order.findById(orderId).catch(() => null);

    if (!order) {
      const fallbackOrder = await Order.findOne({ orderId });
      if (!fallbackOrder) {
        return res.status(404).json({ success: false, message: "Order not found" });
      }
    }

    const payment = await Payment.create({
      user: req.user._id,
      orderId,
      amount: Number(amount),
      method,
      cardLast4: cardLast4 || "",
      billingAddress: billingAddress || {},
      note: note || "",
      status: status || "Paid",
      transactionId: generateTransactionId(),
    });

    if (order && order._id) {
      order.paymentStatus = "Paid";
      order.status = order.status || "Placed";
      await order.save();
    }

    res.status(201).json({
      success: true,
      message: "Payment processed successfully",
      payment,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to process payment",
      error: error.message,
    });
  }
};

export const getMyPayments = async (req, res) => {
  try {
    const payments = await Payment.find({ user: req.user._id }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: payments.length,
      payments,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch payments",
      error: error.message,
    });
  }
};

export const getPaymentById = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id);

    if (!payment) {
      return res.status(404).json({ success: false, message: "Payment not found" });
    }

    if (payment.user.toString() !== req.user._id.toString() && req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    res.status(200).json({ success: true, payment });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch payment",
      error: error.message,
    });
  }
};

export const getAllPayments = async (req, res) => {
  try {
    const payments = await Payment.find().sort({ createdAt: -1 }).populate("user", "fullname email phone");

    res.status(200).json({
      success: true,
      count: payments.length,
      payments,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch all payments",
      error: error.message,
    });
  }
};
