import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    // Who receives this notification
    recipientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    // Category - drives icon and filter tab: order, repair, payment, inventory, account, review
    type: {
      type: String,
      enum: ["order", "repair", "payment", "inventory", "account", "review"],
      required: true,
    },

    // Short header shown in the bell badge / list
    title: {
      type: String,
      required: true,
      trim: true,
    },

    // Full notification body
    message: {
      type: String,
      required: true,
      trim: true,
    },

    // ID of the related document so the frontend can deep-link
    referenceId: {
      type: String,
      default: null,
    },

    // Collection / Resource type the referenceId belongs to e.g. "Order", "Repair", "Sale", "Payment", "Product", "User"
    referenceType: {
      type: String,
      default: null,
    },

    // Read / unread state
    isRead: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  { timestamps: true }
);

// Compound indexes for fast per-user queries sorted by recency and unread filter
notificationSchema.index({ recipientId: 1, createdAt: -1 });
notificationSchema.index({ recipientId: 1, isRead: 1 });
notificationSchema.index({ recipientId: 1, type: 1 });

export default mongoose.model("Notification", notificationSchema);
