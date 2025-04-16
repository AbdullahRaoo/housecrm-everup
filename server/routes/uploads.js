import express from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import {
  deleteFromCloudinary,
  uploadToCloudinary,
} from "../config/cloudinary.js";
import { uploadMemory } from "../middleware/upload.js";

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, "../../uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Upload a single image to Cloudinary
router.post("/image", uploadMemory.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No image file provided" });
    }

    // Convert buffer to data URL for Cloudinary upload
    const fileStr = `data:${
      req.file.mimetype
    };base64,${req.file.buffer.toString("base64")}`;

    // Upload to Cloudinary
    const result = await uploadToCloudinary(fileStr, {
      folder: "real-estate-crm/properties",
    });

    if (!result.success) {
      return res
        .status(500)
        .json({ error: "Failed to upload image to Cloudinary" });
    }

    res.status(201).json({
      url: result.url,
      public_id: result.public_id,
    });
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({ error: "Image upload failed" });
  }
});

// Upload multiple images to Cloudinary
router.post("/images", uploadMemory.array("images", 10), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: "No image files provided" });
    }

    const uploadPromises = req.files.map((file) => {
      // Convert buffer to data URL for Cloudinary upload
      const fileStr = `data:${file.mimetype};base64,${file.buffer.toString(
        "base64"
      )}`;
      return uploadToCloudinary(fileStr, {
        folder: "real-estate-crm/properties",
      });
    });

    const results = await Promise.all(uploadPromises);
    const failedUploads = results.filter((result) => !result.success);

    if (failedUploads.length > 0) {
      return res.status(500).json({
        error: "Some images failed to upload",
        failedCount: failedUploads.length,
      });
    }

    const uploadedImages = results.map((result) => ({
      url: result.url,
      public_id: result.public_id,
    }));

    res.status(201).json(uploadedImages);
  } catch (error) {
    console.error("Multiple upload error:", error);
    res.status(500).json({ error: "Image uploads failed" });
  }
});

// Delete an image from Cloudinary
router.delete("/image/:publicId", async (req, res) => {
  try {
    const { publicId } = req.params;
    const result = await deleteFromCloudinary(publicId);

    if (!result.success) {
      return res
        .status(500)
        .json({ error: "Failed to delete image from Cloudinary" });
    }

    res.json({ message: "Image deleted successfully" });
  } catch (error) {
    console.error("Delete image error:", error);
    res.status(500).json({ error: "Image deletion failed" });
  }
});

export default router;
