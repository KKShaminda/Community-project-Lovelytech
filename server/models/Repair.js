import mongoose from "mongoose";
import { getNextSequenceNumber } from "../utils/sequenceGenerator.js";

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
        "in-progress",
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

repairSchema.pre("save", async function (next) {
    if (!this.trackingId || this.trackingId.startsWith("PR") || this.trackingId.startsWith("RPR") || this.trackingId.includes("-")) {
        const today = new Date();
        const yyyy = today.getFullYear();
        const mm = String(today.getMonth() + 1).padStart(2, '0');
        const dd = String(today.getDate()).padStart(2, '0');
        const dateStr = `${yyyy}${mm}${dd}`;
        const prefix = `LT${dateStr}`;

        const nextNum = await getNextSequenceNumber(prefix);
        this.trackingId = `${prefix}${String(nextNum).padStart(2, "0")}`;
    }
    next();
});

const Repair = mongoose.model("Repair", repairSchema);

export default Repair;
