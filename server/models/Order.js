import mongoose from "mongoose";

const orderProductSchema = new mongoose.Schema({
  id: { type: String },
  name: { type: String, required: true },
  qty: { type: Number, required: true, default: 1 },
  price: { type: Number, required: true },
  image: { type: String, default: "" },
});

const orderSchema = new mongoose.Schema(
  {
    orderId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    placedAt: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["Placed", "Confirmed", "Proceeded", "Delivered"],
      default: "Placed",
    },
    tags: [
      {
        type: String,
      },
    ],
    shipping: {
      type: Number,
      default: 0,
    },
    products: [orderProductSchema],
    totalAmount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Virtual or pre-save hook to calculate totalAmount if not provided
orderSchema.pre("save", function (next) {
  if (this.products && this.products.length > 0) {
    this.totalAmount = this.products.reduce(
      (sum, item) => sum + item.price * item.qty,
      0
    ) + (this.shipping || 0);
  }
  next();
});

const Order = mongoose.model("Order", orderSchema);

export default Order;
