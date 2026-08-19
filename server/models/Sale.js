import mongoose from "mongoose";

const saleItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: false,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
    buyPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    sellPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    productName: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { _id: false }
);

const saleSchema = new mongoose.Schema(
  {
    customerName: {
      type: String,
      required: true,
      trim: true,
    },
    items: {
      type: [saleItemSchema],
      validate: [(items) => items.length > 0, "At least one sale item is required"],
    },
    paymentMethod: {
      type: String,
      default: "Cash",
      enum: ["Cash", "Bank Transfer"],
    },
    status: {
      type: String,
      enum: ["complete", "processing", "refunded"],
      default: "complete",
    },
    subtotal: {
      type: Number,
      required: true,
      min: 0,
    },
    total: {
      type: Number,
      required: true,
      min: 0,
    },
    stockAdjusted: {
      type: Boolean,
      default: false,
    },
    stockAdjustmentAppliedAt: {
      type: Date,
      default: null,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  { timestamps: true }
);

saleSchema.set("toJSON", { virtuals: true });
saleSchema.set("toObject", { virtuals: true });

export default mongoose.model("Sale", saleSchema);