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
    label: "In Repair",
    tone: "indigo",
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

export const repairs = [
  {
    id: "RPR-10842",
    device: "Samsung Galaxy S23 Ultra",
    brand: "Samsung",
    issue: "Cracked screen and touch issue",
    status: "repairing",
    createdAt: "2026-07-05",
    updatedAt: "2026-07-06",
    estimate: 185,
    technician: "John Silva",
    eta: "2026-07-08",
  },
  {
    id: "RPR-10790",
    device: "ASUS Vivobook X157V",
    brand: "ASUS",
    issue: "Battery not charging",
    status: "ready",
    createdAt: "2026-01-23",
    updatedAt: "2026-01-26",
    estimate: 95,
    technician: "Nimal Perera",
    eta: "2026-01-27",
  },
  {
    id: "RPR-10721",
    device: "iPhone 14 Pro",
    brand: "Apple",
    issue: "Rear camera replacement",
    status: "completed",
    createdAt: "2026-06-18",
    updatedAt: "2026-06-22",
    estimate: 240,
    technician: "Kasun Fernando",
    eta: "2026-06-22",
  },
];

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
    title: "Repair Started",
    description: "Technician started working on your device.",
    timeAgo: "2 hours ago",
    date: "July 6, 2026",
  },
  {
    id: "2",
    title: "Diagnosis Completed",
    description: "Screen damage confirmed and replacement approved.",
    timeAgo: "6 hours ago",
    date: "July 6, 2026",
  },
  {
    id: "3",
    title: "Device Received",
    description: "Device received at LovelyTech Service Center.",
    timeAgo: "1 day ago",
    date: "July 5, 2026",
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


export const REPAIR_HISTORY = [
  {
    id: "1",
    trackingId: "PR124596",
    deviceName: "Samsung S23 Ultra",
    brandModel: "Samsung S23 Ultra",
    submitted: "July 5, 2026",
    estimatedCompletion: "July 8, 2026",
    issue: "Cracked screen and touch issue",
    initials: "SS",
  },
  {
    id: "2",
    trackingId: "PR124485",
    deviceName: "ASUS Vivobook",
    brandModel: "ASUS Vivobook X157V",
    submitted: "January 23, 2026",
    estimatedCompletion: "January 27, 2026",
    issue: "Battery charging problem",
    initials: "AS",
  },
];