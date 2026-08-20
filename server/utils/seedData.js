import Repair from "../models/Repair.js";
import Order from "../models/Order.js";

const initialRepairs = [
  {
    trackingId: "PR124596",
    deviceCategory: "smart-phone",
    device: "Samsung Galaxy S23 Ultra",
    brand: "Samsung",
    model: "S23 Ultra",
    imei: "358941029384712",
    issue: "Cracked screen and touch issue",
    customer: "John Silva",
    phone: "0771234567",
    email: "john.silva@example.com",
    address: "123 Main Street, Colombo",
    status: "repairing",
    technician: "John Silva",
    amount: 185,
    estimate: 185,
    submitted: "July 5, 2026",
    estimatedCompletion: "July 8, 2026",
    trackingSteps: [
      { label: "Request Submitted", detail: "Repair request received", status: "complete" },
      { label: "Diagnosing", detail: "Technician is checking the device", status: "complete" },
      { label: "Repairing", detail: "Repair in progress", status: "pending" },
      { label: "Testing", detail: "Quality inspection", status: "pending" },
      { label: "Completed", detail: "Ready for collection", status: "pending" }
    ],
    updates: [
      { id: "1", title: "Repair Started", description: "Technician started working on your device.", timeAgo: "2 hours ago", date: "July 6, 2026" },
      { id: "2", title: "Diagnosis Completed", description: "Screen damage confirmed and replacement approved.", timeAgo: "6 hours ago", date: "July 6, 2026" },
      { id: "3", title: "Device Received", description: "Device received at LovelyTech Service Center.", timeAgo: "1 day ago", date: "July 5, 2026", received: true }
    ]
  },
  {
    trackingId: "PR124485",
    deviceCategory: "laptop",
    device: "ASUS Vivobook X157V",
    brand: "ASUS",
    model: "Vivobook X157V",
    imei: "982374102938411",
    issue: "Battery not charging",
    customer: "Nimal Perera",
    phone: "0719876543",
    email: "nimal.p@example.com",
    address: "45 Station Road, Kandy",
    status: "ready",
    technician: "Nimal Perera",
    amount: 95,
    estimate: 95,
    submitted: "January 23, 2026",
    estimatedCompletion: "January 27, 2026",
    trackingSteps: [
      { label: "Request Submitted", detail: "Repair request received", status: "complete" },
      { label: "Diagnosing", detail: "Technician is checking the device", status: "complete" },
      { label: "Repairing", detail: "Repair in progress", status: "complete" },
      { label: "Testing", detail: "Quality inspection", status: "complete" },
      { label: "Completed", detail: "Ready for collection", status: "pending" }
    ],
    updates: [
      { id: "1", title: "Repair Ready", description: "Device is ready for pickup.", timeAgo: "1 hour ago", date: "January 27, 2026" }
    ]
  },
  {
    trackingId: "RPR-10721",
    deviceCategory: "iphone",
    device: "iPhone 14 Pro",
    brand: "Apple",
    model: "14 Pro",
    imei: "359124059871234",
    issue: "Rear camera replacement",
    customer: "Kasun Fernando",
    phone: "0755551234",
    email: "kasun.f@example.com",
    address: "78 Galle Road, Galle",
    status: "completed",
    technician: "Kasun Fernando",
    amount: 240,
    estimate: 240,
    submitted: "June 18, 2026",
    estimatedCompletion: "June 22, 2026",
    trackingSteps: [
      { label: "Request Submitted", detail: "Repair request received", status: "complete" },
      { label: "Diagnosing", detail: "Technician is checking the device", status: "complete" },
      { label: "Repairing", detail: "Repair in progress", status: "complete" },
      { label: "Testing", detail: "Quality inspection", status: "complete" },
      { label: "Completed", detail: "Ready for collection", status: "complete" }
    ],
    updates: [
      { id: "1", title: "Completed", description: "Customer collected the device.", timeAgo: "3 days ago", date: "June 22, 2026" }
    ]
  }
];

const initialOrders = [
  {
    orderId: "ORD-15487956",
    placedAt: "@18:45 pm 10/12/2025",
    status: "Placed",
    tags: ["Headphone", "Keyboard", "Power Bank"],
    shipping: 0,
    products: [
      { id: "p1", name: "Premium Wireless Bluetooth Headphones", qty: 1, price: 12500, image: "/src/assets/headphone.png" },
      { id: "p2", name: "RGB Mechanical Gaming Keyboard", qty: 1, price: 8950, image: "/src/assets/keyboard.png" },
      { id: "p3", name: "20,000mAh Portable Power Bank - Fast Charger", qty: 1, price: 9005, image: "/src/assets/powerbank.png" }
    ]
  },
  {
    orderId: "ORD-16485923",
    placedAt: "@11:30 am 9/12/2025",
    status: "Confirmed",
    tags: ["Handfree"],
    shipping: 0,
    products: [
      { id: "p4", name: "Handsfree Earbuds with Charging Case", qty: 1, price: 1500, image: "/src/assets/headphone.png" }
    ]
  },
  {
    orderId: "ORD-12649532",
    placedAt: "@13:20 pm 5/12/2025",
    status: "Delivered",
    tags: ["Keyboard"],
    shipping: 0,
    products: [
      { id: "p5", name: "RGB Mechanical Gaming Keyboard", qty: 1, price: 6350, image: "/src/assets/keyboard.png" }
    ]
  },
  {
    orderId: "ORD-28597460",
    placedAt: "@09:58 am 01/08/2025",
    status: "Delivered",
    tags: ["Power Bank"],
    shipping: 0,
    products: [
      { id: "p6", name: "20,000mAh Portable Power Bank - Fast Charger", qty: 2, price: 5900, image: "/src/assets/powerbank.png" }
    ]
  },
  {
    orderId: "ORD-34976128",
    placedAt: "@21:14 pm 15/07/2025",
    status: "Delivered",
    tags: ["Smart Watch", "Mouse"],
    shipping: 0,
    products: [
      { id: "p7", name: "Smart Watch Series 6 AMOLED", qty: 1, price: 3950, image: "/src/assets/headphone.png" },
      { id: "p8", name: "Wireless Ergonomic Gaming Mouse", qty: 1, price: 1500, image: "/src/assets/keyboard.png" }
    ]
  }
];

export const seedInitialData = async () => {
  try {
    const repairCount = await Repair.countDocuments();
    if (repairCount === 0) {
      await Repair.insertMany(initialRepairs);
      console.log("Initial seed data inserted for Repairs.".bgGreen.black);
    }

    const orderCount = await Order.countDocuments();
    if (orderCount === 0) {
      await Order.insertMany(initialOrders);
      console.log("Initial seed data inserted for Orders.".bgGreen.black);
    }
  } catch (error) {
    console.error("Error seeding initial data:", error.message);
  }
};
