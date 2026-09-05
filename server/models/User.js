import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
    {
        fullname: {
            type: String,
            required: true,
            trim: true,
            maxlength: 50
        },

        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
            match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, "Invalid email"],
        },

        phone: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            match: [/^[0-9]{10}$/, "Phone number must be 10 digits"]
        },

        password: {
            type: String,
            required: true,
            minlength: 6
        },

        role: {
            type: String,
            enum: ["User", "Receptionist", "admin"],
            default: "User"
        },

        profilePicture: {
            type: String,
            default: null
        },

        addresses: [
            {
                street: { type: String, required: true },
                city: { type: String, required: true },
                district: { type: String, required: true },
                postalCode: { type: String },
                country: { type: String, default: "Sri Lanka" },
                isDefault: { type: Boolean, default: false }
            }
        ],

        isSuspended: {
            type: Boolean,
            default: false
        },
    },
    { timestamps: true }
);

// Hash password before saving asynchronously (non-blocking)
userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Compare password asynchronously (non-blocking)
userSchema.methods.matchPassword = async function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

// Hide password
userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

export default mongoose.model("User", userSchema);