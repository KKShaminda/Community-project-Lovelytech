import Order from "../models/Order.js";
import asyncHandler from "../utils/asyncHandler.js";
import {
  createNotificationForUser,
  createNotificationForEmail,
  createNotificationsForRole,
} from "./notificationController.js";
import { uploadImage } from "../middlewares/imageUploader.js";

// Helper function to generate Order ID (e.g. ORD-15487956)
const generateOrderId = () => {
  const randomDigits = Math.floor(10000000 + Math.random() * 90000000);
  return `ORD-${randomDigits}`;
};

// Helper function to format current date/time
const formatPlacedAt = () => {
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, '0');
  const mins = String(now.getMinutes()).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const year = now.getFullYear();
  return `@${hours}:${mins} ${hours >= 12 ? 'pm' : 'am'} ${day}/${month}/${year}`;
};

// @desc    Create a new order
// @route   POST /api/orders
// @access  Public
export const createOrder = asyncHandler(async (req, res) => {
  const { products, tags, shipping, status, placedAt, orderId, deliveryAddress, paymentMethod, cardNumberLastFour } = req.body;

  const newOrderId = orderId || generateOrderId();
  const datePlaced = placedAt || formatPlacedAt();
  
  // Extract tags from product names if not provided
  let orderTags = tags;
  if (!orderTags || !Array.isArray(orderTags) || orderTags.length === 0) {
    orderTags = products?.map(p => {
      const parts = p.name.split(' ');
      return parts.length > 1 ? parts[parts.length - 1] : p.name;
    }) || [];
  }

  const effectiveUserId = req.user?._id || userId || null;
  let slipUrl = "";
  let slipName = "";
  if (req.file) {
    const slipRecord = uploadImage(req.file, req, "slips");
    slipUrl = slipRecord.url;
    slipName = slipRecord.filename;
  }

  const newOrder = await Order.create({
    orderId: newOrderId,
    placedAt: datePlaced,
    status: status || "Placed",
    tags: orderTags,
    shipping: Number(shipping || 0),
    userId: effectiveUserId,
    customerName: customerName || req.user?.fullname || "",
    customerEmail: customerEmail || req.user?.email || "",
    customerPhone: customerPhone || req.user?.phone || "",
    address: address || "",
    products: (products || []).map(p => ({
      id: p.id || `p_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      name: p.name,
      qty: Number(p.qty || 1),
      price: Number(p.price),
      image: p.image || "",
    })),
    deliveryAddress,
    paymentMethod,
    cardNumberLastFour,
    paymentSlipUrl: slipUrl,
    paymentSlipName: slipName,
    paymentSlipStatus: slipUrl ? "Pending" : undefined,
  });

  res.status(201).json({
    success: true,
    data: newOrder,
    orderId: newOrder.orderId,
    id: newOrder._id,
  });

  // Non-blocking notification triggers
  const totalDisplay = Number(newOrder.totalAmount || 0).toLocaleString();
  
  // 1. Notify Staff (Admin & Receptionist)
  createNotificationsForRole(["admin", "Receptionist"], {
    type: "order",
    title: "New Order Received",
    message: `New order ${newOrder.orderId} placed for LKR ${totalDisplay}.`,
    referenceId: newOrder.orderId,
    referenceType: "Order",
  });

  // 2. Notify Customer
  const customerNotif = {
    type: "order",
    title: "Order Placed Successfully",
    message: `Your order ${newOrder.orderId} has been received and is awaiting confirmation.`,
    referenceId: newOrder.orderId,
    referenceType: "Order",
  };

  if (effectiveUserId) {
    createNotificationForUser(effectiveUserId, customerNotif);
  } else if (newOrder.customerEmail) {
    createNotificationForEmail(newOrder.customerEmail, customerNotif);
  }
});

// @desc    Get all orders
// @route   GET /api/orders
// @access  Public
export const getOrders = asyncHandler(async (req, res) => {
  const { status, query } = req.query;

  let filterObj = {};

  if (status && status !== 'All') {
    filterObj.status = status;
  }

  let orders = await Order.find(filterObj).sort({ createdAt: -1 });

  if (query && query.trim()) {
    const q = query.trim().toLowerCase();
    orders = orders.filter(
      (order) =>
        order.orderId.toLowerCase().includes(q) ||
        order.tags.some((t) => t.toLowerCase().includes(q)) ||
        order.products.some((p) => p.name.toLowerCase().includes(q))
    );
  }

  res.status(200).json({
    success: true,
    count: orders.length,
    data: orders,
  });
});

// @desc    Get single order details by orderId or Mongo ID
// @route   GET /api/orders/:id
// @access  Public
export const getOrderById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const order = await Order.findOne({
    $or: [
      { orderId: id },
      ...(id.match(/^[0-9a-fA-F]{24}$/) ? [{ _id: id }] : []),
    ],
  });

  if (!order) {
    res.status(404);
    throw new Error(`Order with ID '${id}' not found`);
  }

  res.status(200).json({
    success: true,
    data: order,
  });
});

// @desc    Update order status or order details
// @route   PUT /api/orders/:id
// @access  Public
export const updateOrder = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const order = await Order.findOne({
    $or: [
      { orderId: id },
      ...(id.match(/^[0-9a-fA-F]{24}$/) ? [{ _id: id }] : []),
    ],
  });

  if (!order) {
    res.status(404);
    throw new Error("Order not found");
  }

  const prevStatus = order.status;
  const { status, shipping, products, tags, paymentSlipStatus } = req.body;

  if (status !== undefined) order.status = status;
  if (shipping !== undefined) order.shipping = Number(shipping);
  if (tags !== undefined) order.tags = tags;
  if (products !== undefined) order.products = products;
  if (paymentSlipStatus !== undefined) order.paymentSlipStatus = paymentSlipStatus;

  const updatedOrder = await order.save();

  res.status(200).json({
    success: true,
    data: updatedOrder,
  });

  // Notify customer if status changed
  if (status && status !== prevStatus) {
    const statusMessages = {
      Confirmed: `Your order ${order.orderId} has been confirmed and is being processed.`,
      Proceeded: `Your order ${order.orderId} has been dispatched and handed over to courier.`,
      Delivered: `Your order ${order.orderId} has been successfully delivered!`,
    };

    const notif = {
      type: "order",
      title: `Order Status: ${status}`,
      message: statusMessages[status] || `Your order ${order.orderId} status has been updated to '${status}'.`,
      referenceId: order.orderId,
      referenceType: "Order",
    };

    if (order.userId) {
      createNotificationForUser(order.userId, notif);
    } else if (order.customerEmail) {
      createNotificationForEmail(order.customerEmail, notif);
    }
  }
});

// @desc    Delete order
// @route   DELETE /api/orders/:id
// @access  Public
export const deleteOrder = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const order = await Order.findOne({
    $or: [
      { orderId: id },
      ...(id.match(/^[0-9a-fA-F]{24}$/) ? [{ _id: id }] : []),
    ],
  });

  if (!order) {
    res.status(404);
    throw new Error("Order not found");
  }

  await order.deleteOne();

  res.status(200).json({
    success: true,
    message: "Order deleted successfully",
    id,
  });
});
