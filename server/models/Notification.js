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

    // Category — drives icon and filter tab
    type: {
      type: String,
      enum: ["repair", "sale", "inventory", "account"],
      required: true,
    },

    // Short header shown in the bell dropdown / list
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

    // MongoDB _id (string) of the related document so the frontend can deep-link
    referenceId: {
      type: String,
      default: null,
    },

    // Collection name the referenceId belongs to e.g. "Repair", "Sale", "Product", "User"
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

// Compound index for fast per-user queries sorted by recency
notificationSchema.index({ recipientId: 1, createdAt: -1 });
notificationSchema.index({ recipientId: 1, isRead: 1 });

export default mongoose.model("Notification", notificationSchema);
