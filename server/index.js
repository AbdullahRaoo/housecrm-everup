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
const PORT = process.env.PORT || 5001;

// Connect to MongoDB
connectDB();

// Create required directories
const uploadsDir = join(__dirname, "../uploads");
const imagesDir = join(__dirname, "../uploads/images");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
if (!fs.existsSync(imagesDir)) {
  fs.mkdirSync(imagesDir, { recursive: true });
}

// Get allowed origins from environment variable or use default development origins
const allowedOrigins = process.env.CORS_ORIGINS
  ? process.env.CORS_ORIGINS.split(",")
  : [
      "http://localhost:5173",
      "http://127.0.0.1:5173",
      "http://localhost:5174",
      "http://127.0.0.1:5174",
      "http://localhost:3000",
      "http://127.0.0.1:3000",
    ];

// CORS configuration with environment variable support
app.use(
  cors({
    origin: allowedOrigins,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

// Middleware
app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));

// Serve static files from the React app
app.use(express.static(join(__dirname, "../dist")));

// Serve uploaded files
app.use("/uploads", express.static(join(__dirname, "../uploads")));
app.use(
  "/uploads/images",
  express.static(join(__dirname, "../uploads/images"))
);

// API Routes
app.use("/api", apiRoutes);
app.use("/api/uploads", uploadRoutes);

// Catch-all handler for client-side routing
app.get("*", (req, res) => {
  res.sendFile(join(__dirname, "../dist/index.html"));
});

// Listen on all network interfaces (0.0.0.0)
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});
