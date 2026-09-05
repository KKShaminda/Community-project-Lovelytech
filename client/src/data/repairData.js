// ======================
// Device Categories
// ======================

export const DEVICE_CATEGORIES = [
  {
    id: "smart-phone",
    name: "Smart Phone",
    description: "Cracked screens, battery issues, water damage and more.",
    image: "/src/assets/phone.png",
  },
  {
    id: "tablet",
    name: "Tablet",
    description: "Fast and reliable tablet repair solutions.",
    image: "/src/assets/tablet.png",
  },
  {
    id: "android",
    name: "Android",
    description: "Motherboard, charging and software repairs.",
    image: "/src/assets/android.png",
  },
  {
    id: "laptop",
    name: "Laptop",
    description: "Hardware and software repair solutions.",
    image: "/src/assets/laptop.png",
  },
  {
    id: "iphone",
    name: "iPhone",
    description: "Screen, battery and software issues.",
    image: "/src/assets/iphone.png",
  },
];

// ======================
// Repair Status
// ======================

export const statusMeta = {
  pending: {
    label: "Pending",
    tone: "slate",
  },
  received: {
    label: "Received",
    tone: "slate",
  },
  diagnosing: {
    label: "Diagnosing",
    tone: "blue",
  },
  "awaiting-approval": {
    label: "Awaiting Approval",
    tone: "amber",
  },
  repairing: {
    label: "Repairing",
    tone: "indigo",
  },
  testing: {
    label: "Testing",
    tone: "purple",
  },
  ready: {
    label: "Ready for Pickup",
    tone: "green",
  },
  completed: {
    label: "Completed",
    tone: "green",
  },
  cancelled: {
    label: "Cancelled",
    tone: "red",
  },
};

// ======================
// Repairs
// ======================

export const repairs = [];

// ======================
// Timeline
// ======================

export const TRACKING_STEPS = [
  {
    label: "Request Submitted",
    detail: "Repair request received",
    status: "complete",
  },
  {
    label: "Diagnosing",
    detail: "Technician is checking the device",
    status: "complete",
  },
  {
    label: "Repairing",
    detail: "Repair in progress",
    status: "pending",
  },
  {
    label: "Testing",
    detail: "Quality inspection",
    status: "pending",
  },
  {
    label: "Completed",
    detail: "Ready for collection",
    status: "pending",
  },
];

// ======================
// Repair Updates
// ======================

export const REPAIR_UPDATES = [
  {
    id: "1",
    title: "Request Created",
    description: "Your repair request was submitted successfully.",
    timeAgo: "Just now",
    date: "Recently",
    received: true,
  },
];

// ======================
// Currency
// ======================

export function currency(value) {
  return value.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
  });
}


export const REPAIR_HISTORY = [];
