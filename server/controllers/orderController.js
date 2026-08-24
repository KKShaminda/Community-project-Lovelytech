import Order from "../models/Order.js";
import Product from "../models/Product.js";
import asyncHandler from "../utils/asyncHandler.js";

const generateOrderId = () => {
  const randomDigits = Math.floor(10000000 + Math.random() * 90000000);
  return `ORD-${randomDigits}`;
};

const formatPlacedAt = () => {
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, "0");
  const mins = String(now.getMinutes()).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const year = now.getFullYear();
  return `@${hours}:${mins} ${hours >= 12 ? "pm" : "am"} ${day}/${month}/${year}`;
};

const buildOrderItemForProduct = (product, item) => ({
  product: product._id,
  name: product.name,
  image: product.images?.[0]?.url || "",
  color: item.color || product.color || "",
  size: item.size || "Standard",
  qty: Number(item.qty),
  price: Number(item.price ?? product.price),
});

export const createOrder = asyncHandler(async (req, res) => {
  const { products, tags, shipping, status, placedAt, orderId, items, shippingAddress, paymentMethod, paymentStatus, shippingFee, discount, note } = req.body;

  const userId = req.user?._id || req.body.user || null;

  if (Array.isArray(items) && items.length > 0) {
    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized access" });
    }

    if (!shippingAddress || !shippingAddress.fullName || !shippingAddress.street || !shippingAddress.city || !shippingAddress.district || !shippingAddress.phone) {
      return res.status(400).json({ success: false, message: "Complete shipping address is required" });
    }

    const preparedItems = [];
    let subtotal = 0;

    for (const item of items) {
      if (!item.product || !item.qty || Number(item.qty) < 1) {
        return res.status(400).json({ success: false, message: "Each item must include a valid product and quantity" });
      }

      const product = await Product.findById(item.product);
      if (!product) {
        return res.status(404).json({ success: false, message: `Product not found: ${item.product}` });
      }

      const qty = Number(item.qty);
      const unitPrice = Number(item.price ?? product.price);

      if (product.stock < qty) {
        return res.status(400).json({ success: false, message: `Only ${product.stock} units available for ${product.name}` });
      }

      subtotal += unitPrice * qty;
      preparedItems.push(buildOrderItemForProduct(product, { ...item, qty, price: unitPrice }));
    }

    const finalShippingFee = Number(shippingFee || 0);
    const finalDiscount = Number(discount || 0);
    const total = Math.max(subtotal + finalShippingFee - finalDiscount, 0);

    const newOrder = await Order.create({
      user: userId,
      orderId: orderId || generateOrderId(),
      placedAt: placedAt || formatPlacedAt(),
      status: status || "Placed",
      tags: tags || preparedItems.map((item) => item.name),
      shipping: finalShippingFee,
      products: preparedItems.map((item) => ({
        id: item.product?.toString() || `p_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        product: item.product,
        name: item.name,
        qty: item.qty,
        price: item.price,
        image: item.image || "",
        color: item.color,
        size: item.size,
      })),
      items: preparedItems,
      shippingAddress,
      paymentMethod: paymentMethod || "Cash on Delivery",
      paymentStatus: paymentStatus || "Pending",
      shippingFee: finalShippingFee,
      discount: finalDiscount,
      subtotal,
      total,
      note: note || "",
    });

    await Promise.all(
      preparedItems.map(async (item) => {
        const product = await Product.findById(item.product);
        if (!product) return;
        product.stock -= item.qty;
        product.sold = (product.sold || 0) + item.qty;
        await product.save();
      })
    );

    return res.status(201).json({
      success: true,
      data: newOrder,
      orderId: newOrder.orderId,
      id: newOrder._id,
      message: "Order placed successfully",
    });
  }

  if (!Array.isArray(products) || products.length === 0) {
    return res.status(400).json({ success: false, message: "Order must contain at least one product" });
  }

  const newOrderId = orderId || generateOrderId();
  const datePlaced = placedAt || formatPlacedAt();

  let orderTags = tags;
  if (!orderTags || !Array.isArray(orderTags) || orderTags.length === 0) {
    orderTags = products.map((p) => {
      const parts = String(p.name || "").split(" ");
      return parts.length > 1 ? parts[parts.length - 1] : p.name;
    });
  }

  const normalizedProducts = products.map((p) => ({
    id: p.id || `p_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    name: p.name,
    qty: Number(p.qty || 1),
    price: Number(p.price),
    image: p.image || "",
  }));

  const shippingFeeValue = Number(shipping || 0);
  const totalAmount = normalizedProducts.reduce((sum, item) => sum + item.price * item.qty, 0) + shippingFeeValue;

  const newOrder = await Order.create({
    user: userId,
    orderId: newOrderId,
    placedAt: datePlaced,
    status: status || "Placed",
    tags: orderTags,
    shipping: shippingFeeValue,
    products: normalizedProducts,
    totalAmount,
  });

  return res.status(201).json({
    success: true,
    data: newOrder,
    orderId: newOrder.orderId,
    id: newOrder._id,
  });
});

export const getOrders = asyncHandler(async (req, res) => {
  const { status, query } = req.query;

  let filterObj = {};
  if (status && status !== "All") {
    filterObj.status = status;
  }

  let orders = await Order.find(filterObj).sort({ createdAt: -1 });

  if (query && query.trim()) {
    const q = query.trim().toLowerCase();
    orders = orders.filter((order) => {
      const orderId = order.orderId || "";
      const tags = order.tags || [];
      const products = order.products || [];

      return (
        orderId.toLowerCase().includes(q) ||
        tags.some((t) => String(t).toLowerCase().includes(q)) ||
        products.some((p) => String(p.name || "").toLowerCase().includes(q))
      );
    });
  }

  res.status(200).json({ success: true, count: orders.length, data: orders });
});

export const getMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
  res.status(200).json({ success: true, count: orders.length, orders });
});

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

  if (req.user && req.user._id && req.user.role !== "admin" && req.user.role !== "Receptionist" && order.user && order.user.toString() !== req.user._id.toString()) {
    return res.status(403).json({ success: false, message: "Access denied" });
  }

  res.status(200).json({ success: true, data: order, order });
});

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

  const { status, shipping, products, tags, shippingAddress, paymentMethod, paymentStatus, shippingFee, discount, note } = req.body;

  if (status !== undefined) order.status = status;
  if (shipping !== undefined) order.shipping = Number(shipping);
  if (tags !== undefined) order.tags = tags;
  if (products !== undefined) order.products = products;
  if (shippingAddress !== undefined) order.shippingAddress = shippingAddress;
  if (paymentMethod !== undefined) order.paymentMethod = paymentMethod;
  if (paymentStatus !== undefined) order.paymentStatus = paymentStatus;
  if (shippingFee !== undefined) order.shippingFee = Number(shippingFee);
  if (discount !== undefined) order.discount = Number(discount);
  if (note !== undefined) order.note = note;

  const updatedOrder = await order.save();
  res.status(200).json({ success: true, data: updatedOrder });
});

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
  res.status(200).json({ success: true, message: "Order deleted successfully", id });
});

export const getAllOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find().sort({ createdAt: -1 }).populate("user", "fullname email phone");
  res.status(200).json({ success: true, count: orders.length, orders });
});

export const updateOrderStatus = asyncHandler(async (req, res) => {
  const { status, paymentStatus } = req.body;
  const order = await Order.findById(req.params.id);

  if (!order) {
    res.status(404);
    throw new Error("Order not found");
  }

  if (status) order.status = status;
  if (paymentStatus) order.paymentStatus = paymentStatus;

  const updatedOrder = await order.save();
  res.status(200).json({ success: true, message: "Order updated successfully", order: updatedOrder });
});

