import mongoose from "mongoose";

const repairSchema = new mongoose.Schema(
  {
    // Auto-generated readable tracking ID e.g. LT-2026-001234
    trackingId: {
      type: String,
      unique: true,
    },

    // Device info
    deviceType: {
      type: String,
      required: [true, "Device type is required"],
      enum: ["smart-phone", "tablet", "android", "laptop", "iphone"],
    },
    brand: {
      type: String,
      required: [true, "Brand is required"],
      trim: true,
    },
    model: {
      type: String,
      required: [true, "Model is required"],
      trim: true,
    },
    imei: {
      type: String,
      default: "",
      trim: true,
    },
    issue: {
      type: String,
      required: [true, "Issue description is required"],
      trim: true,
    },

    // Customer contact info (not linked to user account — public form)
    customerName: {
      type: String,
      required: [true, "Customer name is required"],
      trim: true,
    },
    customerPhone: {
      type: String,
      required: [true, "Customer phone is required"],
      trim: true,
    },
    customerEmail: {
      type: String,
      required: [true, "Customer email is required"],
      trim: true,
      lowercase: true,
    },
    customerAddress: {
      type: String,
      default: "",
      trim: true,
    },

    // Repair management (updated by staff)
    status: {
      type: String,
      enum: ["pending", "in-progress", "ready", "completed", "cancelled"],
      default: "pending",
    },
    technician: {
      type: String,
      default: "Unassigned",
      trim: true,
    },
    estimatedCost: {
      type: Number,
      default: 0,
      min: 0,
    },
    notes: {
      type: String,
      default: "",
    },

    // Who created/updated in admin
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  { timestamps: true }
);

// Auto-generate trackingId before saving new document
repairSchema.pre("save", async function (next) {
  if (!this.trackingId) {
    const year = new Date().getFullYear();
    const randomPart = Math.floor(100000 + Math.random() * 900000);
    this.trackingId = `LT-${year}-${randomPart}`;
  }
  next();
});

repairSchema.set("toJSON", { virtuals: true });
repairSchema.set("toObject", { virtuals: true });

export default mongoose.model("Repair", repairSchema);
