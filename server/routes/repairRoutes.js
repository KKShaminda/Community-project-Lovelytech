import express from "express";
import {
  createRepair,
  getRepairs,
  getRepairByTrackingId,
  updateRepair,
  deleteRepair,
} from "../controllers/repairController.js";
import { validateRepairInput } from "../middleware/validationMiddleware.js";
import { optionalSignIn } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Repair routes
router
  .route("/")
  .get(optionalSignIn, getRepairs)
  .post(optionalSignIn, validateRepairInput, createRepair);

router
  .route("/book")
  .post(optionalSignIn, validateRepairInput, createRepair);

router
  .route("/track/:trackingId")
  .get(getRepairByTrackingId);

router
  .route("/:id")
  .get(getRepairByTrackingId)
  .put(updateRepair)
  .delete(deleteRepair);

export default router;
