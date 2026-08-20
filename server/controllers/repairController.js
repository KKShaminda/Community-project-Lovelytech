import Repair from "../models/Repair.js";
import asyncHandler from "../utils/asyncHandler.js";

// Helper function to generate tracking ID (e.g. PR124596)
const generateTrackingId = () => {
  const randomDigits = Math.floor(100000 + Math.random() * 900000);
  return `PR${randomDigits}`;
};

// Helper function to generate default tracking steps
const getDefaultTrackingSteps = (status = 'received') => {
  return [
    {
      label: "Request Submitted",
      detail: "Repair request received",
      status: "complete",
    },
    {
      label: "Diagnosing",
      detail: "Technician is checking the device",
      status: status === 'diagnosing' || status === 'repairing' || status === 'ready' || status === 'completed' ? "complete" : "pending",
    },
    {
      label: "Repairing",
      detail: "Repair in progress",
      status: status === 'repairing' || status === 'ready' || status === 'completed' ? "complete" : "pending",
    },
    {
      label: "Testing",
      detail: "Quality inspection",
      status: status === 'ready' || status === 'completed' ? "complete" : "pending",
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
    phone,
    email,
    address,
    technician,
    amount,
    estimate,
    status,
  } = req.body;

  const customerName = customer || name;
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

  const repairStatus = status || "received";

  const newRepair = await Repair.create({
    trackingId,
    deviceCategory: deviceCategory || "smart-phone",
    device: fullDeviceName,
    brand: brandName,
    model: modelName,
    imei: imei || "",
    issue,
    customer: customerName,
    phone,
    email,
    address: address || "",
    status: repairStatus,
    technician: technician || "Unassigned",
    amount: Number(amount || estimate || 0),
    estimate: Number(estimate || amount || 0),
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
    customer,
    device,
    issue,
    brand,
    model,
    phone,
    email,
    address,
  } = req.body;

  if (status && status !== repair.status) {
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
  if (estimate !== undefined) repair.estimate = Number(estimate);
  if (customer !== undefined) repair.customer = customer;
  if (device !== undefined) repair.device = device;
  if (issue !== undefined) repair.issue = issue;
  if (brand !== undefined) repair.brand = brand;
  if (model !== undefined) repair.model = model;
  if (phone !== undefined) repair.phone = phone;
  if (email !== undefined) repair.email = email;
  if (address !== undefined) repair.address = address;

  const updatedRepair = await repair.save();

  res.status(200).json({
    success: true,
    data: updatedRepair,
  });
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

// @desc    Get logged in user's repairs
// @route   GET /api/repairs/my-repairs
// @access  Private
export const getMyRepairs = asyncHandler(async (req, res) => {
  const repairs = await Repair.find({ email: req.user.email }).sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: repairs.length,
    data: repairs,
  });
});

// @desc    Track repair request by trackingId
// @route   GET /api/repairs/track/:trackingId
// @access  Public
export const trackRepair = getRepairByTrackingId;

// @desc    Get single repair by Mongo ID or tracking ID
// @route   GET /api/repairs/:id
// @access  Private
export const getRepairById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const repair = await Repair.findOne({
    $or: [
      { trackingId: id },
      ...(id.match(/^[0-9a-fA-F]{24}$/) ? [{ _id: id }] : []),
    ],
  });

  if (!repair) {
    res.status(404);
    throw new Error(`Repair request with ID '${id}' not found`);
  }

  res.status(200).json({
    success: true,
    data: repair,
  });
});
