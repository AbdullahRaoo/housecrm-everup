import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import seedDatabase from "../data/seed/index.js";

// Load environment variables
dotenv.config();

// Ensure we're in the server directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const serverDir = path.join(__dirname, "..");

// Display startup message
console.log("========================================");
console.log("  Real Estate CRM Database Seeder");
console.log("========================================");
console.log("");
console.log("This script will populate your database with sample data.");
console.log(
  "Make sure your MongoDB server is running and properly configured."
);
console.log("Check .env file for the MongoDB connection string.");
console.log("");

// Ensure the uploads directory exists
const uploadsDir = path.join(serverDir, "../uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log(`Created uploads directory: ${uploadsDir}`);
}

// Run the database seeder
console.log("Starting database seed process...");
seedDatabase()
  .then(() => {
    console.log("");
    console.log("Database seeding completed successfully!");
    console.log("");
    console.log("You can now start the application with:");
    console.log("npm run dev:all");
    console.log("");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Error seeding database:", error);
    process.exit(1);
  });
