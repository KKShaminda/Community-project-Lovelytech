import mongoose from "mongoose";
import Sale from "../models/Sale.js";
import Product from "../models/Product.js";

const parseMaybeJson = (value) => {
  if (value === undefined || value === null) return value;
  if (Array.isArray(value)) return value;
  if (typeof value !== "string") return value;

  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
};

const normalizeItems = async (items = []) => {
  if (!Array.isArray(items) || items.length === 0) {
    throw new Error("At least one sale item is required");
  }

  const normalized = [];

  for (const item of items) {
    const productId = item.productId || item.product;
    const quantity = Number(item.quantity);

    if (!Number.isInteger(quantity) || quantity <= 0) {
      throw new Error("Each sale item quantity must be at least 1");
    }

    if (!productId || !mongoose.isValidObjectId(productId)) {
      // It is a service item or manual billing part cost input
      normalized.push({
        product: null,
        quantity,
        buyPrice: 0,
        sellPrice: Number(item.price) || 0,
        productName: item.name || "Service Item",
      });
    } else {
      // Physical product
      const product = await Product.findById(productId);
      if (!product) {
        throw new Error(`Product not found for sale item: ${productId}`);
      }

      normalized.push({
        product: product._id,
        quantity,
        buyPrice: Number(product.buyPrice) || 0,
        sellPrice: Number(item.price || product.sellPrice) || 0,
        productName: product.name,
      });
    }
  }

  return normalized;
};

const sumSaleTotal = (items) =>
  items.reduce((sum, item) => sum + Number(item.sellPrice || 0) * Number(item.quantity || 0), 0);

const applyStockDelta = async (items, direction, session) => {
  for (const item of items) {
    if (!item.product) continue; // Skip stock level adjustments for service items with no catalog product
    const delta = direction * Number(item.quantity);
    const result = await Product.updateOne(
      {
        _id: item.product,
        ...(direction > 0 ? { stock: { $gte: item.quantity } } : {}),
      },
      { $inc: { stock: -delta, sold: direction > 0 ? Number(item.quantity) : -Number(item.quantity) } },
      { session }
    );

    if (direction > 0 && result.modifiedCount === 0) {
      throw new Error(`Insufficient stock for ${item.productName}`);
    }
  }
};

export const getSales = async (req, res) => {
  try {
    const sales = await Sale.find().sort({ createdAt: -1 });
    res.json({ sales });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch sales", error: error.message });
  }
};

export const createSale = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const customerName = String(req.body.customerName || req.body.customer || "").trim();
    const status = String(req.body.status || "complete");
    const paymentMethod = req.body.paymentMethod || "Cash";
    const items = await normalizeItems(parseMaybeJson(req.body.items) || []);
    const subtotal = sumSaleTotal(items);
    const total = Number(req.body.total ?? subtotal);

    if (!customerName) {
      throw new Error("Customer name is required");
    }

    const sale = await Sale.create([
      {
        customerName,
        items,
        paymentMethod,
        status,
        subtotal,
        total,
        createdBy: req.user?._id || null,
        stockAdjusted: false,
      },
    ], { session });

    const saleDoc = sale[0];

    if (status === "complete") {
      await applyStockDelta(items, 1, session);
      saleDoc.stockAdjusted = true;
      saleDoc.stockAdjustmentAppliedAt = new Date();
      await saleDoc.save({ session });
    }

    await session.commitTransaction();
    res.status(201).json(saleDoc);
  } catch (error) {
    await session.abortTransaction();
    res.status(400).json({ message: "Failed to create sale", error: error.message });
  } finally {
    session.endSession();
  }
};

export const updateSale = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const sale = await Sale.findById(req.params.id).session(session);
    if (!sale) {
      throw new Error("Sale not found");
    }

    const previousItems = sale.items;

    const customerName = String(req.body.customerName || req.body.customer || sale.customerName).trim();
    const status = String(req.body.status || sale.status);
    const itemsPayload = parseMaybeJson(req.body.items);
    const nextItems = itemsPayload ? await normalizeItems(itemsPayload) : previousItems;
    const subtotal = sumSaleTotal(nextItems);
    const total = Number(req.body.total ?? subtotal);

    if (sale.stockAdjusted) {
      await applyStockDelta(previousItems, -1, session);
      sale.stockAdjusted = false;
      sale.stockAdjustmentAppliedAt = null;
    }

    sale.customerName = customerName;
    sale.items = nextItems;
    sale.status = status;
    sale.subtotal = subtotal;
    sale.total = total;
    sale.paymentMethod = "Cash";

    if (status === "complete") {
      await applyStockDelta(nextItems, 1, session);
      sale.stockAdjusted = true;
      sale.stockAdjustmentAppliedAt = new Date();
    }

    await sale.save({ session });
    await session.commitTransaction();
    res.json(sale);
  } catch (error) {
    await session.abortTransaction();
    res.status(400).json({ message: "Failed to update sale", error: error.message });
  } finally {
    session.endSession();
  }
};

export const deleteSale = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const sale = await Sale.findById(req.params.id).session(session);
    if (!sale) {
      throw new Error("Sale not found");
    }

    if (sale.stockAdjusted) {
      await applyStockDelta(sale.items, -1, session);
    }

    await sale.deleteOne({ session });
    await session.commitTransaction();
    res.json({ message: "Sale deleted" });
  } catch (error) {
    await session.abortTransaction();
    res.status(400).json({ message: "Failed to delete sale", error: error.message });
  } finally {
    session.endSession();
  }
};
