import jwt from "jsonwebtoken";
import User from "../models/User.js";
import bcrypt from "bcryptjs";

// Generate JWT Token
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
};

//register user
export const register = async (req, res) => {
  try {
    const { fullname, email, phone, password, role } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists with this email",
      });
    }

    /* Check if passwords match
    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Passwords do not match",
      });
    }*/

    // Create new user
    const user = await User.create({
      fullname,
      email,
      phone,
      password,
      //confirmPassword,
      role: role || "User", // Default to User if not specified
    });

    // Generate token
    const token = generateToken(user._id);

    // Remove password from response
    const userResponse = user.toObject();
    delete userResponse.password;

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      token,
      user: userResponse,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error registering user",
      error: error.message,
    });
  }
};

//login user
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    if (user.isSuspended) {
      return res.status(403).json({
        success: false,
        message: "Your account has been suspended. Contact support.",
      });
    }

    const isPasswordValid = await user.matchPassword(password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const token = generateToken(user._id);

    const userResponse = user.toObject();
    delete userResponse.password;

    res.cookie("access_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: userResponse,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error logging in",
      error: error.message,
    });
  }
};

//change password
export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword, confirmNewPassword } = req.body;

    if (!req.user || !req.user._id) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized access",
      });
    }

    if (newPassword !== confirmNewPassword) {
      return res.status(400).json({
        success: false,
        message: "New passwords do not match",
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters",
      });
    }

    if (newPassword === currentPassword) {
      return res.status(400).json({
        success: false,
        message: "New password cannot be same as current password",
      });
    }

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const isPasswordValid = await user.matchPassword(currentPassword);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Current password is incorrect",
      });
    }

    user.password = newPassword;
    await user.save();

    res.status(200).json({
      success: true,
      message: "Password changed successfully",
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error changing password",
      error: error.message,
    });
  }
};

//view profile
export const viewProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching profile",
      error: error.message,
    });
  }
};

//logout user
export const logout = async (req, res) => {
  try {
    res.clearCookie("access_token");

    res.status(200).json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error logging out",
      error: error.message,
    });
  }
};

//update phone only
export const updatePhone = async (req, res) => {
  try {
    const { phone } = req.body;

    // Validate phone
    if (!phone || !/^[0-9]{10}$/.test(phone)) {
      return res.status(400).json({
        success: false,
        message: "Phone number must be 10 digits",
      });
    }

    // Check if phone already exists
    const existingPhone = await User.findOne({
      phone,
      _id: { $ne: req.user._id }
    });
    if (existingPhone) {
      return res.status(400).json({
        success: false,
        message: "Phone number already in use",
      });
    }

    // Update only phone
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { phone },
      { new: true, runValidators: true }
    ).select("-password");

    res.status(200).json({
      success: true,
      message: "Phone number updated successfully",
      user,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error updating phone number",
      error: error.message,
    });
  }
};

// Update user profile (fullname, phone, profilePicture)
export const updateProfile = async (req, res) => {
  try {
    const { fullname, phone, profilePicture } = req.body;
    const updates = {};

    if (fullname !== undefined) updates.fullname = fullname.trim();
    if (profilePicture !== undefined) updates.profilePicture = profilePicture;

    if (phone !== undefined) {
      if (!/^[0-9]{10}$/.test(phone)) {
        return res.status(400).json({
          success: false,
          message: "Phone number must be 10 digits",
        });
      }

      const existingPhone = await User.findOne({
        phone,
        _id: { $ne: req.user._id },
      });
      if (existingPhone) {
        return res.status(400).json({
          success: false,
          message: "Phone number already in use",
        });
      }
      updates.phone = phone;
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      updates,
      { new: true, runValidators: true }
    ).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error updating profile",
      error: error.message,
    });
  }
};

//get all users (admin)
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");

    res.status(200).json({
      success: true,
      count: users.length,
      users,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching users",
      error: error.message,
    });
  }
};

//get users by role
export const getUsersByRole = async (req, res) => {
  try {
    const { role } = req.params;

    const users = await User.find({ role }).select("-password");

    res.status(200).json({
      success: true,
      count: users.length,
      users,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching users",
      error: error.message,
    });
  }
};

// Add address
export const addAddress = async (req, res) => {
  try {
    const { street, city, district, postalCode, country } = req.body;

    if (!street || !city || !district) {
      return res.status(400).json({
        success: false,
        message: "Street, city and district are required",
      });
    }

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    user.addresses.push({ street, city, district, postalCode, country });

    await user.save();

    res.status(200).json({
      success: true,
      message: "Address added successfully",
      addresses: user.addresses
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error adding address",
      error: error.message
    });
  }
};

//update address
export const updateAddress = async (req, res) => {
  try {
    const { addressId } = req.params;
    const updatedData = req.body;

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const address = user.addresses.id(addressId);

    if (!address) {
      return res.status(404).json({
        success: false,
        message: "Address not found",
      });
    }

    const allowedFields = ["street", "city", "district", "postalCode", "country"];

    allowedFields.forEach((field) => {
      if (updatedData[field] !== undefined) {
        address[field] = updatedData[field];
      }
    });

    await user.save();

    res.status(200).json({
      success: true,
      message: "Address updated",
      addresses: user.addresses
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error updating address",
      error: error.message
    });
  }
};

//delete address
export const deleteAddress = async (req, res) => {
  try {
    const { addressId } = req.params;

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    user.addresses = user.addresses.filter(
      (addr) => addr._id?.toString() !== addressId
    );

    await user.save();

    res.status(200).json({
      success: true,
      message: "Address deleted",
      addresses: user.addresses
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error deleting address",
      error: error.message
    });
  }
};

// Suspend user (admin)
export const suspendUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (user.isSuspended) {
      return res.status(400).json({
        success: false,
        message: "User already suspended",
      });
    }

    user.isSuspended = true;
    await user.save();

    res.status(200).json({
      success: true,
      message: "User suspended successfully",
      user,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error suspending user",
      error: error.message,
    });
  }
};

// Unsuspend user (admin)
export const unsuspendUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (!user.isSuspended) {
      return res.status(400).json({
        success: false,
        message: "User is not suspended",
      });
    }

    user.isSuspended = false;
    await user.save();

    res.status(200).json({
      success: true,
      message: "User unsuspended successfully",
      user,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error unsuspending user",
      error: error.message,
    });
  }
};

// Get all addresses of logged-in user
export const getAddresses = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("addresses");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const addresses = user.addresses || [];

    res.status(200).json({
      success: true,
      message: "Addresses fetched successfully",
      count: addresses.length,
      addresses,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching addresses",
      error: error.message,
    });
  }
};