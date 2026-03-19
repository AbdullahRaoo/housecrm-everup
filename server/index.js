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
import http from "http";
import https from "https";

// Load SSL certificates
const sslOptions = {
  key: fs.readFileSync("/etc/letsencrypt/live/housecrm.everup.net/privkey.pem"),
  cert: fs.readFileSync("/etc/letsencrypt/live/housecrm.everup.net/fullchain.pem"),
};

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const HTTPS_PORT = process.env.PORT || 5432;
const HTTP_PORT = 5431;  // Using non-standard HTTP port
const HOST = process.env.HOST || 'localhost';
const API_BASE_URL = `https://${HOST}:${HTTPS_PORT}`;

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
  : [`https://${HOST}`, `http://${HOST}`];

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

// Create both HTTP and HTTPS servers
const httpServer = http.createServer(app);
const httpsServer = https.createServer(sslOptions, app);

// Add HTTP to HTTPS redirect
app.use((req, res, next) => {
  if (!req.secure && process.env.NODE_ENV === 'production') {
    return res.redirect(['https://', req.get('Host'), req.url].join(''));
  }
  next();
});

// Listen on different ports for HTTP and HTTPS
httpServer.listen(HTTP_PORT, "0.0.0.0", () => {
  console.log(`HTTP server running on port ${HTTP_PORT}`);
});

httpsServer.listen(HTTPS_PORT, "0.0.0.0", () => {
  console.log(`HTTPS server running on port ${HTTPS_PORT}`);
});

