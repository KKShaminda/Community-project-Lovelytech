# LovelyTech Backend API Documentation

Production-ready backend API for LovelyTech built with Node.js, Express.js, and MongoDB (Mongoose).

---

## Folder Structure

```
server/
├── config/             # Database & server configuration
│   └── db.js           # Mongoose MongoDB connection
├── controllers/        # Request handlers & logic
│   ├── repairController.js
│   ├── orderController.js
│   ├── userController.js
│   └── productController.js
├── middleware/         # Custom Express middlewares
│   ├── errorMiddleware.js
│   ├── validationMiddleware.js
│   └── authMiddleware.js
├── models/             # Mongoose schemas
│   ├── Repair.js
│   ├── Order.js
│   ├── User.js
│   └── Product.js
├── routes/             # Express API routes
│   ├── repairRoutes.js
│   ├── orderRoutes.js
│   ├── userRoute.js
│   └── productRoutes.js
├── utils/              # Helper utilities
│   ├── asyncHandler.js
│   └── seedData.js
├── .env                # Environment variables
├── .env.example        # Environment variables template
├── server.js           # Server application setup
└── index.js            # Server entry point
```

---

## Setup & Running

### Prerequisites
- Node.js (v16+)
- MongoDB running locally on `mongodb://127.0.0.1:27017/lovelytech` or a MongoDB Atlas URI.

### Environment Setup
Create a `.env` file inside the `server/` directory:
```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://127.0.0.1:27017/lovelytech
CLIENT_URL=http://localhost:5173
```

### Start Server
```bash
cd server
npm start
```
Or for development with live reload:
```bash
npm run dev
```

---

## API Endpoints

### 1. Repair Module (`/api/repairs`)

| Method | Endpoint | Description | Request Body Example |
| :--- | :--- | :--- | :--- |
| **POST** | `/api/repairs` | Create a new repair request | `{ "deviceCategory": "smart-phone", "brand": "Samsung", "model": "S23", "imei": "12345", "issue": "Broken screen", "name": "John Doe", "phone": "0771234567", "email": "john@example.com", "address": "Colombo" }` |
| **GET** | `/api/repairs` | Get all repair requests | None |
| **GET** | `/api/repairs/track/:trackingId` | Track repair by ID | None |
| **GET** | `/api/repairs/:id` | View single repair details | None |
| **PUT** | `/api/repairs/:id` | Update repair status or info | `{ "status": "repairing", "technician": "Nimal", "amount": 150 }` |
| **DELETE**| `/api/repairs/:id` | Delete repair request | None |

---

### 2. Order Module (`/api/orders`)

| Method | Endpoint | Description | Request Body Example |
| :--- | :--- | :--- | :--- |
| **POST** | `/api/orders` | Create a new order | `{ "products": [{ "name": "Headphones", "qty": 1, "price": 12500, "image": "/src/assets/headphone.png" }], "shipping": 0 }` |
| **GET** | `/api/orders` | Get all orders (supports `?status=Placed` & `?query=ORD`) | None |
| **GET** | `/api/orders/:id` | View single order details | None |
| **PUT** | `/api/orders/:id` | Update order status / details | `{ "status": "Confirmed" }` |
| **DELETE**| `/api/orders/:id` | Delete order | None |
