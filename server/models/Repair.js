<<<<<<< HEAD
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
=======
import mongoose from "mongoose";

const trackingStepSchema = new mongoose.Schema({
  label: { type: String, required: true },
  detail: { type: String, required: true },
  status: { type: String, enum: ['complete', 'pending'], default: 'pending' },
});

const repairUpdateSchema = new mongoose.Schema({
  id: { type: String },
  title: { type: String, required: true },
  description: { type: String, required: true },
  timeAgo: { type: String, default: 'Just now' },
  date: { type: String },
  received: { type: Boolean, default: false }
});

const repairSchema = new mongoose.Schema(
  {
    trackingId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    deviceCategory: {
      type: String,
      default: "smart-phone",
    },
    device: {
      type: String,
      required: true,
    },
    brand: {
      type: String,
      default: "",
    },
    model: {
      type: String,
      default: "",
    },
    imei: {
      type: String,
      default: "",
    },
    issue: {
      type: String,
      required: true,
    },
    customer: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    address: {
      type: String,
      default: "",
    },
    status: {
      type: String,
      enum: [
        "received",
        "diagnosing",
        "awaiting-approval",
        "repairing",
        "ready",
        "completed",
        "cancelled",
        "pending",
      ],
      default: "received",
    },
    technician: {
      type: String,
      default: "Unassigned",
    },
    amount: {
      type: Number,
      default: 0,
    },
    estimate: {
      type: Number,
      default: 0,
    },
    submitted: {
      type: String,
    },
    estimatedCompletion: {
      type: String,
    },
    trackingSteps: [trackingStepSchema],
    updates: [repairUpdateSchema],
  },
  {
    timestamps: true,
  }
);

const Repair = mongoose.model("Repair", repairSchema);

export default Repair;
>>>>>>> 20501282b1f059e730b954eec24bf8e68882c0d0
