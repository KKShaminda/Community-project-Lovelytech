import Repair from "../models/Repair.js";
import asyncHandler from "../utils/asyncHandler.js";
import {
  createNotificationForEmail,
  createNotificationsForRole,
} from "./notificationController.js";

// Helper function to generate tracking ID (e.g. PR124596)
const generateTrackingId = () => {
  const randomDigits = Math.floor(100000 + Math.random() * 900000);
  return `PR${randomDigits}`;
};

// Helper function to generate default tracking steps
const getDefaultTrackingSteps = (status = 'pending') => {
  return [
    {
      label: "Request Submitted",
      detail: "Repair request received",
      status: "complete",
    },
    {
      label: "Diagnosing",
      detail: "Technician is checking the device",
      status: status === 'diagnosing' || status === 'repairing' || status === 'testing' || status === 'completed' ? "complete" : "pending",
    },
    {
      label: "Repairing",
      detail: "Repair in progress",
      status: status === 'repairing' || status === 'testing' || status === 'completed' ? "complete" : "pending",
    },
    {
      label: "Testing",
      detail: "Quality inspection",
      status: status === 'testing' || status === 'completed' ? "complete" : "pending",
    },
    {
      label: "Completed",
      detail: "Ready for collection",
      status: status === 'completed' ? "complete" : "pending",
    },
  ];
};

// @desc    Create a new repair request
// @route   POST /api/repairs
// @access  Public
export const createRepair = asyncHandler(async (req, res) => {
  const {
    deviceCategory,
    brand,
    model,
    imei,
    issue,
    name,
    customer,
    customerName: bodyCustomerName,
    phone,
    customerPhone,
    email,
    customerEmail,
    address,
    customerAddress,
    technician,
    amount,
    estimate,
    estimatedCost,
    status,
  } = req.body;

  const customerName = customer || name || bodyCustomerName;
  const effectivePhone = phone || customerPhone;
  const effectiveEmail = email || customerEmail;
  const effectiveAddress = address || customerAddress;
  const effectiveEstimate = Number(estimate || amount || estimatedCost || 0);
  const effectiveAmount = Number(amount || estimate || estimatedCost || 0);

  const brandName = brand || "";
  const modelName = model || "";
  const fullDeviceName = req.body.device || (brandName || modelName ? `${brandName} ${modelName}`.trim() : "Electronic Device");

  const trackingId = req.body.trackingId || generateTrackingId();
  const currentDate = new Date();
  const formattedSubmitted = currentDate.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  const estCompletionDate = new Date(currentDate);
  estCompletionDate.setDate(estCompletionDate.getDate() + 3);
  const formattedEta = estCompletionDate.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  const repairStatus = status || "pending";

  const newRepair = await Repair.create({
    trackingId,
    deviceCategory: deviceCategory || "smart-phone",
    device: fullDeviceName,
    brand: brandName,
    model: modelName,
    imei: imei || "",
    issue,
    customer: customerName,
    phone: effectivePhone,
    email: effectiveEmail,
    address: effectiveAddress || "",
    status: repairStatus,
    technician: technician || "Unassigned",
    amount: effectiveAmount,
    estimate: effectiveEstimate,
    submitted: formattedSubmitted,
    estimatedCompletion: formattedEta,
    trackingSteps: getDefaultTrackingSteps(repairStatus),
    updates: [
      {
        id: "1",
        title: "Request Created",
        description: "Your repair request was submitted successfully.",
        timeAgo: "Just now",
        date: formattedSubmitted,
        received: true,
      },
    ],
  });

  res.status(201).json({
    success: true,
    data: newRepair,
    trackingId: newRepair.trackingId,
    id: newRepair._id,
  });

  // Non-blocking notifications
  // 1. Notify Staff (Admin & Receptionist)
  createNotificationsForRole(["admin", "Receptionist"], {
    type: "repair",
    title: "New Repair Booking",
    message: `New repair ticket (${newRepair.trackingId}) received for ${newRepair.device} from ${newRepair.customer}.`,
    referenceId: newRepair.trackingId,
    referenceType: "Repair",
  });

  // 2. Notify Customer
  if (newRepair.email) {
    createNotificationForEmail(newRepair.email, {
      type: "repair",
      title: "Repair Request Received",
      message: `Your repair request for ${newRepair.device} (Tracking ID: ${newRepair.trackingId}) was submitted successfully.`,
      referenceId: newRepair.trackingId,
      referenceType: "Repair",
    });
  }
});

// @desc    Get all repair requests
// @route   GET /api/repairs
// @access  Public
export const getRepairs = asyncHandler(async (req, res) => {
  const repairs = await Repair.find({}).sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: repairs.length,
    data: repairs,
  });
});

// @desc    Get single repair by trackingId or Mongo ID
// @route   GET /api/repairs/:trackingId
// @access  Public
export const getRepairByTrackingId = asyncHandler(async (req, res) => {
  const { trackingId } = req.params;

  // Search by trackingId or _id
  let repair = await Repair.findOne({
    $or: [
      { trackingId: { $regex: new RegExp(`^${trackingId.trim()}$`, "i") } },
      ...(trackingId.match(/^[0-9a-fA-F]{24}$/) ? [{ _id: trackingId }] : []),
    ],
  });

  if (!repair) {
    res.status(404);
    throw new Error(`Repair with ID or Tracking ID '${trackingId}' not found`);
  }

  res.status(200).json({
    success: true,
    data: repair,
  });
});

// @desc    Update repair request status or details
// @route   PUT /api/repairs/:id
// @access  Public
export const updateRepair = asyncHandler(async (req, res) => {
  const { id } = req.params;

  let repair = await Repair.findOne({
    $or: [
      { trackingId: id },
      ...(id.match(/^[0-9a-fA-F]{24}$/) ? [{ _id: id }] : []),
    ],
  });

  if (!repair) {
    res.status(404);
    throw new Error("Repair request not found");
  }

  const {
    status,
    technician,
    amount,
    estimate,
    estimatedCost,
    customer,
    device,
    issue,
    brand,
    model,
    phone,
    email,
    address,
    notes,
  } = req.body;

  const prevStatus = repair.status;
  const statusChanged = status && status !== prevStatus;

  if (statusChanged) {
    repair.status = status;
    repair.trackingSteps = getDefaultTrackingSteps(status);
    
    // Add update log entry
    repair.updates.unshift({
      id: String(Date.now()),
      title: `Status Updated to ${status}`,
      description: `Repair status changed to ${status}.`,
      timeAgo: "Just now",
      date: new Date().toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      }),
    });
  }

  if (technician !== undefined) repair.technician = technician;
  if (amount !== undefined) repair.amount = Number(amount);
  else if (estimatedCost !== undefined) repair.amount = Number(estimatedCost);
  if (estimate !== undefined) repair.estimate = Number(estimate);
  else if (estimatedCost !== undefined) repair.estimate = Number(estimatedCost);
  if (customer !== undefined) repair.customer = customer;
  if (device !== undefined) repair.device = device;
  if (issue !== undefined) repair.issue = issue;
  if (brand !== undefined) repair.brand = brand;
  if (model !== undefined) repair.model = model;
  if (phone !== undefined) repair.phone = phone;
  if (email !== undefined) repair.email = email;
  if (address !== undefined) repair.address = address;
  if (notes !== undefined) repair.notes = notes;

  const updatedRepair = await repair.save();

  res.status(200).json({
    success: true,
    data: updatedRepair,
  });

  // Notify customer if status changed
  if (statusChanged && updatedRepair.email) {
    const statusTextMap = {
      pending: "is currently pending diagnostic check",
      diagnosing: "is currently being diagnosed by our technicians",
      "awaiting-approval": "is awaiting your approval for repair estimates",
      repairing: "is now actively under repair",
      testing: "is undergoing final quality testing",
      ready: "is ready for collection / pickup",
      completed: "has been marked as completed. Thank you!",
      cancelled: "has been cancelled",
    };

    const statusDetail = statusTextMap[status] || `status has been updated to '${status}'`;

    createNotificationForEmail(updatedRepair.email, {
      type: "repair",
      title: `Repair Status: ${status}`,
      message: `Your device ${updatedRepair.device} (${updatedRepair.trackingId}) ${statusDetail}.`,
      referenceId: updatedRepair.trackingId,
      referenceType: "Repair",
    });
  }
});

// @desc    Delete repair request
// @route   DELETE /api/repairs/:id
// @access  Public
export const deleteRepair = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const repair = await Repair.findOne({
    $or: [
      { trackingId: id },
      ...(id.match(/^[0-9a-fA-F]{24}$/) ? [{ _id: id }] : []),
    ],
  });

  if (!repair) {
    res.status(404);
    throw new Error("Repair request not found");
  }

  await repair.deleteOne();

  res.status(200).json({
    success: true,
    message: "Repair request deleted successfully",
    id,
  });
});
