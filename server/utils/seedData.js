import Repair from "../models/Repair.js";
import Order from "../models/Order.js";
import Product from "../models/Product.js";
import User from "../models/User.js";

const initialProducts = [
  {
    name: "Premium Wireless Bluetooth Headphones",
    price: 2400,
    rating: 4.8,
    sold: 142,
    category: "Speakers & Audios",
    brand: "Sony",
    color: "Silver",
    stock: 19,
    numReviews: 2478,
    isActive: true,
    description: "Elevate your audio with our next-generation wireless headphones. Experience breathtaking high-fidelity sound paired with industry-leading active noise cancellation. Designed for all-day comfort with ultra-soft ear cushions and a 40-hour battery life.",
    images: [
      {
        url: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=900&q=80",
        filename: "headphone-1.jpg",
        path: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=900&q=80",
      },
    ],
  },
  {
    name: "Apple iPhone 15 Pro Max (256 GB) - Titanium",
    price: 420000,
    rating: 5.0,
    sold: 92,
    category: "Mobile Phones",
    brand: "Apple",
    color: "Natural Titanium",
    stock: 12,
    numReviews: 184,
    isActive: true,
    description: "Forged in aerospace-grade titanium, iPhone 15 Pro Max features the groundbreaking A17 Pro chip, customizable Action button, and the most powerful iPhone camera system ever with 5x optical zoom.",
    images: [
      {
        url: "https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=900&q=80",
        filename: "iphone15-1.jpg",
        path: "https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=900&q=80",
      },
    ],
  },
  {
    name: "20,000mAh Portable Power Bank - Fast Charge",
    price: 12400,
    rating: 5.0,
    sold: 203,
    category: "iPads & Tablets",
    brand: "Anker",
    color: "Black",
    stock: 25,
    numReviews: 203,
    isActive: true,
    description: "High-capacity 20,000mAh power bank featuring ultra-fast charging technology, dual USB-C ports, and intelligent power management to keep all your essential devices powered up on the go.",
    images: [
      {
        url: "https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?auto=format&fit=crop&w=900&q=80",
        filename: "powerbank-1.jpg",
        path: "https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?auto=format&fit=crop&w=900&q=80",
      },
    ],
  },
  {
    name: "Apple MacBook Air M2 - 13.6\" Liquid Retina",
    price: 345000,
    rating: 5.0,
    sold: 64,
    category: "Laptops",
    brand: "Apple",
    color: "Midnight",
    stock: 8,
    numReviews: 142,
    isActive: true,
    description: "Redesigned around the next-generation M2 chip, MacBook Air combines blazing speed and incredible battery life up to 18 hours inside an impossibly thin aluminum enclosure.",
    images: [
      {
        url: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=900&q=80",
        filename: "macbook-1.jpg",
        path: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=900&q=80",
      },
    ],
  },
  {
    name: "RGB Mechanical Gaming Keyboard",
    price: 6650,
    rating: 4.7,
    sold: 445,
    category: "Laptops",
    brand: "Redragon",
    color: "Black",
    stock: 18,
    numReviews: 445,
    isActive: true,
    description: "Responsive mechanical keyboard with hot-swappable switches, dynamic per-key RGB backlighting, anti-ghosting keys, and durable aircraft-grade aluminum alloy top plate.",
    images: [
      {
        url: "https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=900&q=80",
        filename: "keyboard-1.jpg",
        path: "https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=900&q=80",
      },
    ],
  },
  {
    name: "Water Proof Bluetooth Speaker - 360° Sounds",
    price: 4300,
    rating: 4.9,
    sold: 312,
    category: "Speakers & Audios",
    brand: "JBL",
    color: "Teal",
    stock: 30,
    numReviews: 312,
    isActive: true,
    description: "Rugged IPX7 waterproof portable Bluetooth speaker delivering booming 360-degree omnidirectional sound, deep bass, and up to 24 hours of continuous playtime.",
    images: [
      {
        url: "https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=900&q=80",
        filename: "speaker-1.jpg",
        path: "https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=900&q=80",
      },
    ],
  },
  {
    name: "Apple iPad Pro 11\" M2 Chip (128 GB)",
    price: 285000,
    rating: 4.9,
    sold: 41,
    category: "iPads & Tablets",
    brand: "Apple",
    color: "Space Gray",
    stock: 10,
    numReviews: 89,
    isActive: true,
    description: "iPad Pro with the breakthrough Apple M2 chip. Features Liquid Retina display with ProMotion and True Tone, Pro cameras, and Apple Pencil hover experience.",
    images: [
      {
        url: "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&w=900&q=80",
        filename: "ipadpro-1.jpg",
        path: "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&w=900&q=80",
      },
    ],
  },
  {
    name: "7-in-1 USB-C Hub Multi-Port Adapter",
    price: 3400,
    rating: 4.5,
    sold: 102,
    category: "Speakers & Audios",
    brand: "Baseus",
    color: "Space Gray",
    stock: 40,
    numReviews: 102,
    isActive: true,
    description: "All-in-one USB-C hub with 4K HDMI, 3 USB 3.0 ports, SD/TF card reader, and 100W Power Delivery pass-through charging. Perfect for MacBooks, laptops, and tablets.",
    images: [
      {
        url: "https://images.unsplash.com/photo-1583394838336-acd977736f90?auto=format&fit=crop&w=900&q=80",
        filename: "hub-1.jpg",
        path: "https://images.unsplash.com/photo-1583394838336-acd977736f90?auto=format&fit=crop&w=900&q=80",
      },
    ],
  },
  {
    name: "Samsung Galaxy S23 Ultra (256 GB)",
    price: 295000,
    rating: 4.9,
    sold: 53,
    category: "Mobile Phones",
    brand: "Samsung",
    color: "Phantom Black",
    stock: 7,
    numReviews: 167,
    isActive: true,
    description: "Galaxy S23 Ultra with built-in S Pen, Nightography 200MP camera, Snapdragon 8 Gen 2 Mobile Platform for Galaxy, and an expansive 6.8\" Dynamic AMOLED 2X display.",
    images: [
      {
        url: "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?auto=format&fit=crop&w=900&q=80",
        filename: "s23ultra-1.jpg",
        path: "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?auto=format&fit=crop&w=900&q=80",
      },
    ],
  },
  {
    name: "Custom Intel Core i9 Liquid Cooled Gaming Desktop",
    price: 485000,
    rating: 5.0,
    sold: 19,
    category: "Desktops",
    brand: "LovelyTech Custom",
    color: "Tempered Glass / RGB",
    stock: 5,
    numReviews: 38,
    isActive: true,
    description: "Ultimate enthusiast workstation powered by Intel Core i9, RTX 4080 16GB GPU, 64GB DDR5 RAM, 2TB Gen4 NVMe SSD, and 360mm AIO Liquid Cooling in a panoramic tempered glass case.",
    images: [
      {
        url: "https://images.unsplash.com/photo-1587202372775-e229f172b9d7?auto=format&fit=crop&w=900&q=80",
        filename: "desktop-1.jpg",
        path: "https://images.unsplash.com/photo-1587202372775-e229f172b9d7?auto=format&fit=crop&w=900&q=80",
      },
    ],
  },
  {
    name: "Smart Fitness Watch - Health Tracker",
    price: 3200,
    rating: 4.8,
    sold: 89,
    category: "Laptops",
    brand: "Xiaomi",
    color: "Black",
    stock: 14,
    numReviews: 89,
    isActive: true,
    description: "Comprehensive health and fitness companion with heart rate monitoring, SpO2 tracking, sleep analysis, 30+ sport modes, and vibrant AMOLED always-on touch display.",
    images: [
      {
        url: "https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&w=900&q=80",
        filename: "watch-1.jpg",
        path: "https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&w=900&q=80",
      },
    ],
  },
  {
    name: "Ergonomic Wireless Mouse - Rechargeable",
    price: 2800,
    rating: 4.6,
    sold: 178,
    category: "Mobile Phones",
    brand: "Logitech",
    color: "Graphite",
    stock: 22,
    numReviews: 178,
    isActive: true,
    description: "Sculpted ergonomic vertical mouse engineered to reduce forearm tension and wrist pressure. Features adjustable DPI settings, silent click switches, and rechargeable battery.",
    images: [
      {
        url: "https://images.unsplash.com/photo-1527814050087-3793815479db?auto=format&fit=crop&w=900&q=80",
        filename: "mouse-1.jpg",
        path: "https://images.unsplash.com/photo-1527814050087-3793815479db?auto=format&fit=crop&w=900&q=80",
      },
    ],
  },
  {
    name: "Google Pixel 7 Pro (128 GB) - Used Mobile",
    price: 78400,
    rating: 4.9,
    sold: 8,
    category: "Mobile Phones",
    brand: "Google",
    color: "Obsidian",
    stock: 5,
    numReviews: 48,
    isActive: true,
    description: "Certified pre-owned Google Pixel 7 Pro with Google Tensor G2 processor, pro-level triple camera system with 5x telephoto, and stunning 6.7-inch QHD+ 120Hz Smooth Display.",
    images: [
      {
        url: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=900&q=80",
        filename: "pixel7-1.jpg",
        path: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=900&q=80",
      },
    ],
  },
  {
    name: "Sony WH-1000XM5 Wireless ANC Headphones",
    price: 98500,
    rating: 5.0,
    sold: 86,
    category: "Speakers & Audios",
    brand: "Sony",
    color: "Black",
    stock: 15,
    numReviews: 390,
    isActive: true,
    description: "Flagship active noise canceling headphones featuring two processors and 8 microphones for unrivaled silence, crystal clear hands-free calling, and exquisite audio precision.",
    images: [
      {
        url: "https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=900&q=80",
        filename: "sonyxm5-1.jpg",
        path: "https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=900&q=80",
      },
    ],
  },
  {
    name: "Dell UltraSharp 27\" 4K USB-C Hub Monitor Setup",
    price: 145000,
    rating: 4.8,
    sold: 37,
    category: "Desktops",
    brand: "Dell",
    color: "Platinum Silver",
    stock: 9,
    numReviews: 54,
    isActive: true,
    description: "Brilliant 4K UHD 27-inch IPS Black technology monitor with 98% DCI-P3 color coverage, HDR 400, built-in RJ45 Ethernet, and 90W USB-C single-cable power delivery.",
    images: [
      {
        url: "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=900&q=80",
        filename: "monitor-1.jpg",
        path: "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=900&q=80",
      },
    ],
  },
  {
    name: "ASUS ROG Zephyrus G16 OLED Gaming Laptop",
    price: 520000,
    rating: 4.9,
    sold: 28,
    category: "Laptops",
    brand: "ASUS ROG",
    color: "Eclipse Gray",
    stock: 6,
    numReviews: 71,
    isActive: true,
    description: "Precision CNC-milled aluminum chassis featuring Intel Core Ultra 9 processor, NVIDIA GeForce RTX 4080, and a stunning 2.5K 240Hz OLED ROG Nebula display.",
    images: [
      {
        url: "https://images.unsplash.com/photo-1603302576837-37561b2e2302?auto=format&fit=crop&w=900&q=80",
        filename: "zephyrus-1.jpg",
        path: "https://images.unsplash.com/photo-1603302576837-37561b2e2302?auto=format&fit=crop&w=900&q=80",
      },
    ],
  },
];

export const seedInitialData = async () => {
  try {
    const admin = await User.findOne({ role: "admin" });
    if (admin && (admin.fullname !== "lovelytech" || admin.email !== "lovelytech@gmail.com")) {
      admin.fullname = "lovelytech";
      admin.email = "lovelytech@gmail.com";
      await admin.save();
      console.log("Admin account updated to lovelytech.".bgGreen.black);
    }

    const productCount = await Product.countDocuments();
    if (productCount === 0) {
      await Product.insertMany(initialProducts);
      console.log("Initial seed data inserted for Products.".bgGreen.black);
    }

    // Clean up any mock/sample repairs from the database
    await Repair.deleteMany({
      $or: [
        { trackingId: { $in: ["PR124596", "PR124485", "RPR-10721", "RPR-10842", "RPR-10790"] } },
        { email: { $in: ["john.silva@example.com", "nimal.p@example.com", "kasun.f@example.com"] } },
      ]
    });
    console.log("Mock/sample repairs cleaned up from database.".bgYellow.black);

    // Clean up any mock/sample orders from the database
    await Order.deleteMany({
      $or: [
        { orderId: { $in: ["ORD-15487956", "ORD-16485923", "ORD-12649532", "ORD-28597460", "ORD-34976128"] } },
        { customerEmail: { $in: ["john.silva@example.com", "nimal.p@example.com", "kasun.f@example.com"] } },
        { deliveryAddress: { $exists: false } },
        { deliveryAddress: null }
      ]
    });
    console.log("Mock/sample orders cleaned up from database.".bgYellow.black);
  } catch (error) {
    console.error("Error seeding initial data:", error.message);
  }
};
