import mongoose from "mongoose";

export const getNextSequenceNumber = async (prefix) => {
  const db = mongoose.connection.db;
  if (!db) {
    return 1;
  }

  // Find latest sale document with matching orderId
  const salesCol = db.collection("sales");
  const lastSale = await salesCol.findOne(
    { orderId: new RegExp(`^${prefix}`) },
    { projection: { orderId: 1 }, sort: { createdAt: -1 } }
  );

  // Find latest repair document with matching trackingId
  const repairsCol = db.collection("repairs");
  const lastRepair = await repairsCol.findOne(
    { trackingId: new RegExp(`^${prefix}`) },
    { projection: { trackingId: 1 }, sort: { createdAt: -1 } }
  );

  // Find latest online order document with matching orderId
  const ordersCol = db.collection("orders");
  const lastOrder = await ordersCol.findOne(
    { orderId: new RegExp(`^${prefix}`) },
    { projection: { orderId: 1 }, sort: { createdAt: -1 } }
  );

  let lastSaleNum = 0;
  if (lastSale && lastSale.orderId) {
    const lastNumStr = lastSale.orderId.substring(prefix.length);
    const parsed = parseInt(lastNumStr, 10);
    if (!isNaN(parsed)) lastSaleNum = parsed;
  }

  let lastRepairNum = 0;
  if (lastRepair && lastRepair.trackingId) {
    const lastNumStr = lastRepair.trackingId.substring(prefix.length);
    const parsed = parseInt(lastNumStr, 10);
    if (!isNaN(parsed)) lastRepairNum = parsed;
  }

  let lastOrderNum = 0;
  if (lastOrder && lastOrder.orderId) {
    const lastNumStr = lastOrder.orderId.substring(prefix.length);
    const parsed = parseInt(lastNumStr, 10);
    if (!isNaN(parsed)) lastOrderNum = parsed;
  }

  return Math.max(lastSaleNum, lastRepairNum, lastOrderNum) + 1;
};
