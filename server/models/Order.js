import mongoose from "mongoose";

const orderProductSchema = new mongoose.Schema(
  {
    id: { type: String },
    product: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
    name: { type: String, required: true },
    qty: { type: Number, required: true, default: 1 },
    price: { type: Number, required: true },
    image: { type: String, default: "" },
    color: { type: String, default: "" },
    size: { type: String, default: "Standard" },
  },
  { _id: true }
);

const shippingAddressSchema = new mongoose.Schema(
  {
    fullName: { type: String, default: "" },
    phone: { type: String, default: "" },
    street: { type: String, default: "" },
    city: { type: String, default: "" },
    district: { type: String, default: "" },
    postalCode: { type: String, default: "" },
    country: { type: String, default: "Sri Lanka" },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    orderId: {
      type: String,
      unique: true,
      sparse: true,
      index: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      index: true,
    },
    placedAt: {
      type: String,
      default: "",
    },
    status: {
      type: String,
      enum: ["Placed", "Confirmed", "Proceeded", "Delivered", "Pending", "Processing", "Shipped", "Cancelled"],
      default: "Placed",
    },
    tags: [{ type: String }],
    shipping: { type: Number, default: 0 },
    products: [orderProductSchema],
    totalAmount: { type: Number, default: 0 },
    items: [{
      product: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
      name: { type: String, required: true },
      image: { type: String, default: "" },
      color: { type: String, default: "" },
      size: { type: String, default: "Standard" },
      qty: { type: Number, required: true, min: 1 },
      price: { type: Number, required: true, min: 0 },
    }],
    shippingAddress: { type: shippingAddressSchema },
    paymentMethod: {
      type: String,
      enum: ["Cash on Delivery", "Card", "Bank Transfer"],
      default: "Cash on Delivery",
    },
    paymentStatus: {
      type: String,
      enum: ["Pending", "Paid", "Failed"],
      default: "Pending",
    },
    subtotal: { type: Number, default: 0 },
    shippingFee: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    total: { type: Number, default: 0 },
    note: { type: String, default: "" },
  },
  { timestamps: true }
);

orderSchema.pre("save", function (next) {
  if (this.products && this.products.length > 0) {
    this.totalAmount = this.products.reduce((sum, item) => sum + Number(item.price || 0) * Number(item.qty || 1), 0) + Number(this.shipping || 0);
  }

  if (this.items && this.items.length > 0) {
    const itemTotal = this.items.reduce((sum, item) => sum + Number(item.price || 0) * Number(item.qty || 1), 0);
    this.subtotal = itemTotal;
    this.total = itemTotal + Number(this.shippingFee || 0) - Number(this.discount || 0);
  }

  next();
});

export default mongoose.model("Order", orderSchema);
