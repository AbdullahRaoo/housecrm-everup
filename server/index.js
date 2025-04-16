import bodyParser from "body-parser";
import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import fs from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import connectDB from "./config/db.js";
import apiRoutes from "./routes/api.js";
import uploadRoutes from "./routes/uploads.js";

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();

// Create uploads directory if it doesn't exist
const uploadsDir = join(__dirname, "../uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Middleware
app.use(cors());
app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));

// Serve static files from the React app
app.use(express.static(join(__dirname, "../dist")));

// Serve uploaded files
app.use("/uploads", express.static(join(__dirname, "../uploads")));

// API Routes
app.use("/api", apiRoutes);
app.use("/api/uploads", uploadRoutes);

// Catch-all handler for client-side routing
app.get("*", (req, res) => {
  res.sendFile(join(__dirname, "../dist/index.html"));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
