import jwt from "jsonwebtoken";
import User from "../models/User.js";

// Middleware to check JWT and attach user
export const requiredSignIn = async (req, res, next) => {
  try {
    // Get token from cookie OR Authorization header
    const token =
      req.cookies?.access_token ||
      req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        message: "No token provided",
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Find user
    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return res.status(401).json({
        message: "User not found",
      });
    }

    // NEW: Block suspended users
    if (user.isSuspended) {
      return res.status(403).json({
        message: "Your account is suspended",
      });
    }

    // Attach user to request
    req.user = user;

    next();
  } catch (error) {
    return res.status(401).json({
      message: "Not authorized, token failed",
    });
  }
};

// Optional sign-in middleware: attaches req.user if token is present and valid, otherwise proceeds
export const optionalSignIn = async (req, res, next) => {
  try {
    const token =
      req.cookies?.access_token ||
      req.headers.authorization?.split(" ")[1];

    if (!token) {
      return next();
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select("-password");

    if (user && !user.isSuspended) {
      req.user = user;
    }
  } catch {
    // If token verification fails or expired, proceed unauthenticated without crashing
  }
  next();
};

// Admin check
export const isAdmin = (req, res, next) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({
      message: "Access denied: Admins only",
    });
  }
  next();
};

// User check
export const isUser = (req, res, next) => {
  if (req.user.role !== "User") {
    return res.status(403).json({
      message: "Access denied: Users only",
    });
  }
  next();
};

// Receptionist check
export const isReceptionist = (req, res, next) => {
  if (req.user.role !== "Receptionist") {
    return res.status(403).json({
      message: "Access denied: Receptionists only",
    });
  }
  next();
};

// Admin OR Receptionist check
export const isAdminOrReceptionist = (req, res, next) => {
  if (req.user.role !== "admin" && req.user.role !== "Receptionist") {
    return res.status(403).json({
      message: "Access denied: Admin or Receptionist only",
    });
  }
  next();
};

// Admin OR User check
export const isAdminOrUser = (req, res, next) => {
  if (req.user.role !== "admin" && req.user.role !== "User") {
    return res.status(403).json({
      message: "Access denied: Admin or User only",
    });
  }
  next();
};