import express from "express";
import {
  createRepair,
  trackRepair,
  getRepairs,
  getRepairById,
  updateRepair,
  deleteRepair,
  getMyRepairs,
} from "../controllers/repairController.js";
import { requiredSignIn, isAdmin, isAdminOrReceptionist } from "../middlewares/authMiddleware.js";

const router = express.Router();

// ── Public Routes ──────────────────────────────
// Anyone can submit a repair booking
router.post("/", createRepair);

// Anyone can track their repair by tracking ID
router.get("/track/:trackingId", trackRepair);

// ── Authenticated Customer Routes ──────────────
// User gets their own repair list based on email match
router.get("/my-repairs", requiredSignIn, getMyRepairs);

// ── Staff Routes (Admin or Receptionist) ───────
// List all repairs (with optional filters)
router.get("/", requiredSignIn, isAdminOrReceptionist, getRepairs);

// Get single repair by MongoDB ID
router.get("/:id", requiredSignIn, isAdminOrReceptionist, getRepairById);

// Update repair status, technician, cost, notes etc.
router.put("/:id", requiredSignIn, isAdminOrReceptionist, updateRepair);

// ── Admin Only ──────────────────────────────────
// Only admin can permanently delete a repair record
router.delete("/:id", requiredSignIn, isAdmin, deleteRepair);

export default router;
