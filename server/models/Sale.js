import mongoose from "mongoose";
import { getNextSequenceNumber } from "../utils/sequenceGenerator.js";

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
        orderId: {
            type: String,
            unique: true,
        },
    },
    { timestamps: true }
);

saleSchema.pre("save", async function (next) {
    if (!this.orderId) {
        const today = new Date();
        const yyyy = today.getFullYear();
        const mm = String(today.getMonth() + 1).padStart(2, '0');
        const dd = String(today.getDate()).padStart(2, '0');
        const dateStr = `${yyyy}${mm}${dd}`;
        const prefix = `LT${dateStr}`;

        const nextNum = await getNextSequenceNumber(prefix);
        this.orderId = `${prefix}${String(nextNum).padStart(2, "0")}`;
    }
    next();
});

saleSchema.set("toJSON", { virtuals: true });
saleSchema.set("toObject", { virtuals: true });

export default mongoose.model("Sale", saleSchema);