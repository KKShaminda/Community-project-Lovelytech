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
            type: String, // Store Cloudinary URL
            default: null
        },

        addresses: [
            {
                street: { type: String, required: true },
                city: { type: String, required: true },
                district: { type: String, required: true },
                postalCode: { type: String },
                country: { type: String, default: "Sri Lanka" }
            }
        ],

        isSuspended: {
            type: Boolean,
            default: false
        },
    },
    { timestamps: true }
);

// Hash password before saving
userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  const salt = bcrypt.genSaltSync(10);
  this.password = bcrypt.hashSync(this.password, salt);
  //this.confirmPassword = undefined; // Remove confirmPassword field
});

// Compare password
userSchema.methods.matchPassword = async function (enteredPassword) {
  return bcrypt.compareSync(enteredPassword, this.password);
};

// Hide password
userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  //delete obj.confirmPassword;
  return obj;
};

export default mongoose.model("User", userSchema);