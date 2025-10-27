
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";

dotenv.config();

// If MONGO_URI not loaded, try loading parent .env (project root)
if (!process.env.MONGO_URI) {
  const parentEnv = path.resolve(process.cwd(), "../.env");
  dotenv.config({ path: parentEnv, override: false });
}

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  console.error("MONGO_URI is not defined. Make sure [.env](.env) is present or set the environment variable.");
  process.exit(1);
}

// MongoDB connection
mongoose.connect(MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.log(err));

app.get("/", (req, res) => {
  res.send("Server is running...");
});

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
