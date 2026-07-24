import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
    },
    description: {
      type: String,
      default: "",
    },
    category: {
      type: String,
      required: true,
      enum: [
        "Mobile Phones",
        "Laptops",
        "Desktops",
        "iPads & Tablets",
        "Speakers & Audios",
      ],
    },
    brand: {
      type: String,
      default: "",
    },
    color: {
      type: String,
      default: "",
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    images: {
      type: [
        {
          url: { type: String, required: true },
          filename: { type: String, required: true },
          path: { type: String, required: true },
        },
      ],
      default: [],
    },
    stock: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    sold: {
      type: Number,
      default: 0,
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    numReviews: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// Virtual: availability derived from stock (used by the "In Stock / Out of Stock" filter)
productSchema.virtual("inStock").get(function () {
  return this.stock > 0;
});

productSchema.set("toJSON", { virtuals: true });
productSchema.set("toObject", { virtuals: true });

// Text index for the search bar ("Search Products...")
productSchema.index({ name: "text", description: "text", brand: "text" });

export default mongoose.model("Product", productSchema);