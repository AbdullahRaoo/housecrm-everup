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

    console.log("Processing single file upload:", req.file.originalname);

    // Convert buffer to data URL for Cloudinary upload
    const fileStr = `data:${
      req.file.mimetype
    };base64,${req.file.buffer.toString("base64")}`;

    // Upload to Cloudinary with retry and fallback
    const result = await uploadToCloudinary(fileStr, {
      folder: "real-estate-crm/properties",
    });

    if (!result.success) {
      console.error("Image upload failed:", result.error);
      return res
        .status(500)
        .json({ error: `Failed to upload image: ${result.error}` });
    }

    res.status(201).json({
      url: result.url,
      public_id: result.public_id,
      isLocalFallback: result.isLocalFallback || false,
    });
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({ error: `Image upload failed: ${error.message}` });
  }
});

// Upload multiple images to Cloudinary
router.post("/images", uploadMemory.array("images", 10), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: "No image files provided" });
    }

    console.log(`Processing ${req.files.length} files for upload`);

    // Process files one at a time to better handle failures
    const uploadResults = [];
    const failedUploads = [];

    for (const file of req.files) {
      try {
        // Convert buffer to data URL for Cloudinary upload
        const fileStr = `data:${file.mimetype};base64,${file.buffer.toString(
          "base64"
        )}`;

        // Upload to Cloudinary with retry and fallback
        const result = await uploadToCloudinary(fileStr, {
          folder: "real-estate-crm/properties",
        });

        if (result.success) {
          uploadResults.push({
            url: result.url,
            public_id: result.public_id,
            isLocalFallback: result.isLocalFallback || false,
          });
        } else {
          failedUploads.push({
            filename: file.originalname,
            error: result.error,
          });
        }
      } catch (fileError) {
        failedUploads.push({
          filename: file.originalname,
          error: fileError.message,
        });
      }
    }

    console.log(
      `Successfully processed ${uploadResults.length} of ${req.files.length} images`
    );

    // If all uploads failed, return an error
    if (uploadResults.length === 0 && failedUploads.length > 0) {
      return res.status(500).json({
        error: "All image uploads failed",
        failedUploads,
      });
    }

    // Otherwise return what succeeded, even if some failed
    res.status(201).json(uploadResults);
  } catch (error) {
    console.error("Multiple upload error:", error);
    res.status(500).json({ error: `Image uploads failed: ${error.message}` });
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
        .json({ error: `Failed to delete image: ${result.error}` });
    }

    res.json({ message: "Image deleted successfully" });
  } catch (error) {
    console.error("Delete image error:", error);
    res.status(500).json({ error: `Image deletion failed: ${error.message}` });
  }
});

export default router;
