import Repair from "../models/Repair.js";
import {
  createNotificationsForRole,
  createNotificationForEmail,
} from "./notificationController.js";

// ──────────────────────────────────────────────
// PUBLIC — POST /api/repairs
// Submit a new repair booking (no auth required)
// ──────────────────────────────────────────────
export const createRepair = async (req, res) => {
  try {
    const {
      deviceType,
      brand,
      model,
      imei,
      issue,
      customerName,
      customerPhone,
      customerEmail,
      customerAddress,
    } = req.body;

    if (!deviceType || !brand || !model || !issue || !customerName || !customerPhone || !customerEmail) {
      return res.status(400).json({
        success: false,
        message: "Device type, brand, model, issue, and customer contact details are required.",
      });
    }

    const repair = await Repair.create({
      deviceType,
      brand,
      model,
      imei: imei || "",
      issue,
      customerName,
      customerPhone,
      customerEmail,
      customerAddress: customerAddress || "",
      createdBy: req.user?._id || null,
    });

    res.status(201).json({
      success: true,
      message: "Repair request submitted successfully.",
      trackingId: repair.trackingId,
      repair,
    });

    // Fire notifications to staff after responding (non-blocking)
    const notifPayload = {
      type: "repair",
      title: "New Repair Request",
      message: `New repair request: ${repair.brand} ${repair.model} (${repair.trackingId}) is awaiting review.`,
      referenceId: repair._id.toString(),
      referenceType: "Repair",
    };
    createNotificationsForRole("admin", notifPayload);
    createNotificationsForRole("Receptionist", notifPayload);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to create repair request.",
      error: error.message,
    });
  }
};

// ──────────────────────────────────────────────
// PUBLIC — GET /api/repairs/track/:trackingId
// Look up a repair by tracking ID (no auth required)
// ──────────────────────────────────────────────
export const trackRepair = async (req, res) => {
  try {
    const { trackingId } = req.params;

    const repair = await Repair.findOne({ trackingId: trackingId.toUpperCase() })
      .select("-createdBy -notes");

    if (!repair) {
      return res.status(404).json({
        success: false,
        message: "No repair found with that tracking ID. Please check and try again.",
      });
    }

    res.status(200).json({
      success: true,
      repair,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch repair.",
      error: error.message,
    });
  }
};

// ──────────────────────────────────────────────
// ADMIN/RECEPTIONIST — GET /api/repairs
// Get all repairs with optional filters
// ──────────────────────────────────────────────
export const getRepairs = async (req, res) => {
  try {
    const { status, search } = req.query;

    const filter = {};
    if (status) filter.status = status;
    if (search) {
      const regex = new RegExp(search, "i");
      filter.$or = [
        { trackingId: regex },
        { customerName: regex },
        { brand: regex },
        { model: regex },
      ];
    }

    const repairs = await Repair.find(filter).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: repairs.length,
      repairs,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch repairs.",
      error: error.message,
    });
  }
};

// ──────────────────────────────────────────────
// ADMIN/RECEPTIONIST — GET /api/repairs/:id
// Get single repair by MongoDB _id
// ──────────────────────────────────────────────
export const getRepairById = async (req, res) => {
  try {
    const repair = await Repair.findById(req.params.id);

    if (!repair) {
      return res.status(404).json({
        success: false,
        message: "Repair not found.",
      });
    }

    res.status(200).json({
      success: true,
      repair,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch repair.",
      error: error.message,
    });
  }
};

// ──────────────────────────────────────────────
// ADMIN/RECEPTIONIST — PUT /api/repairs/:id
// Update repair details (status, technician, cost, notes)
// ──────────────────────────────────────────────
export const updateRepair = async (req, res) => {
  try {
    const {
      status,
      technician,
      estimatedCost,
      notes,
      brand,
      model,
      imei,
      issue,
      deviceType,
      customerName,
      customerPhone,
      customerEmail,
      customerAddress,
    } = req.body;

    const allowedStatuses = ["pending", "in-progress", "ready", "completed", "cancelled"];
    if (status && !allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Allowed: ${allowedStatuses.join(", ")}`,
      });
    }

    const updateFields = {};
    if (status !== undefined) updateFields.status = status;
    if (technician !== undefined) updateFields.technician = technician;
    if (estimatedCost !== undefined) updateFields.estimatedCost = Number(estimatedCost);
    if (notes !== undefined) updateFields.notes = notes;
    if (brand !== undefined) updateFields.brand = brand;
    if (model !== undefined) updateFields.model = model;
    if (imei !== undefined) updateFields.imei = imei;
    if (issue !== undefined) updateFields.issue = issue;
    if (deviceType !== undefined) updateFields.deviceType = deviceType;
    if (customerName !== undefined) updateFields.customerName = customerName;
    if (customerPhone !== undefined) updateFields.customerPhone = customerPhone;
    if (customerEmail !== undefined) updateFields.customerEmail = customerEmail;
    if (customerAddress !== undefined) updateFields.customerAddress = customerAddress;

    // Fetch current repair to capture previous status before updating
    const existingRepair = await Repair.findById(req.params.id);
    if (!existingRepair) {
      return res.status(404).json({
        success: false,
        message: "Repair not found.",
      });
    }
    const previousStatus = existingRepair.status;

    const repair = await Repair.findByIdAndUpdate(
      req.params.id,
      updateFields,
      { new: true, runValidators: true }
    );

    if (!repair) {
      return res.status(404).json({
        success: false,
        message: "Repair not found.",
      });
    }

    res.status(200).json({
      success: true,
      message: "Repair updated successfully.",
      repair,
    });

    // Fire customer notification if status changed (non-blocking)
    if (status && status !== previousStatus) {
      const statusMessages = {
        "in-progress": `Your ${repair.brand} ${repair.model} repair (${repair.trackingId}) is now In Progress — our technician is working on it.`,
        ready: `Great news! Your ${repair.brand} ${repair.model} (${repair.trackingId}) is ready for pickup.`,
        completed: `Your ${repair.brand} ${repair.model} repair (${repair.trackingId}) has been marked as Completed.`,
        cancelled: `We're sorry — your ${repair.brand} ${repair.model} repair (${repair.trackingId}) has been cancelled.`,
        pending: `Your ${repair.brand} ${repair.model} repair (${repair.trackingId}) has been moved back to Pending Review.`,
      };
      const statusTitles = {
        "in-progress": "Repair In Progress",
        ready: "Device Ready for Pickup",
        completed: "Repair Completed",
        cancelled: "Repair Cancelled",
        pending: "Repair Status Updated",
      };
      const msg = statusMessages[status];
      if (msg) {
        createNotificationForEmail(repair.customerEmail, {
          type: "repair",
          title: statusTitles[status] || "Repair Status Updated",
          message: msg,
          referenceId: repair._id.toString(),
          referenceType: "Repair",
        });
      }
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update repair.",
      error: error.message,
    });
  }
};

// ──────────────────────────────────────────────
// ADMIN — DELETE /api/repairs/:id
// ──────────────────────────────────────────────
export const deleteRepair = async (req, res) => {
  try {
    const repair = await Repair.findById(req.params.id);

    if (!repair) {
      return res.status(404).json({
        success: false,
        message: "Repair not found.",
      });
    }

    await repair.deleteOne();

    res.status(200).json({
      success: true,
      message: "Repair deleted successfully.",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to delete repair.",
      error: error.message,
    });
  }
};

// ──────────────────────────────────────────────
// AUTHENTICATED USER — GET /api/repairs/my-repairs
// Get repairs matching user's own email address
// ──────────────────────────────────────────────
export const getMyRepairs = async (req, res) => {
  try {
    const email = req.user.email;
    const repairs = await Repair.find({ customerEmail: email.toLowerCase() }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: repairs.length,
      repairs,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch user repairs.",
      error: error.message,
    });
  }
};
