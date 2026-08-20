<<<<<<< HEAD
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
=======
import express from "express";
import {
  createRepair,
  getRepairs,
  getRepairByTrackingId,
  updateRepair,
  deleteRepair,
} from "../controllers/repairController.js";
import { validateRepairInput } from "../middleware/validationMiddleware.js";

const router = express.Router();

// Repair routes
router
  .route("/")
  .get(getRepairs)
  .post(validateRepairInput, createRepair);

router
  .route("/book")
  .post(validateRepairInput, createRepair);

router
  .route("/track/:trackingId")
  .get(getRepairByTrackingId);

router
  .route("/:id")
  .get(getRepairByTrackingId)
  .put(updateRepair)
  .delete(deleteRepair);

export default router;
>>>>>>> 20501282b1f059e730b954eec24bf8e68882c0d0
