import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config();

// Configure Cloudinary with timeout settings
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  timeout: 60000, // 60 second timeout
});

// Ensure uploads directory exists for fallback storage
const uploadDir = path.join(__dirname, "../../uploads/images");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

/**
 * Upload a file to Cloudinary with retry logic
 * @param {Buffer|String} file - The file buffer or file path to upload
 * @param {Object} options - Upload options
 * @returns {Promise} - Upload result
 */
export const uploadToCloudinary = async (
  file,
  options = {},
  retryCount = 0
) => {
  try {
    // Set default options
    const uploadOptions = {
      resource_type: "auto",
      folder: "real-estate-crm",
      timeout: 30000, // 30 seconds timeout per request
      ...options,
    };

    console.log(`Attempting Cloudinary upload (attempt ${retryCount + 1})...`);

    // Upload file to Cloudinary
    const result = await cloudinary.uploader.upload(file, uploadOptions);

    console.log("Cloudinary upload successful");
    return {
      success: true,
      url: result.secure_url,
      public_id: result.public_id,
    };
  } catch (error) {
    console.error("Cloudinary upload error:", error);

    // Retry logic - maximum 2 retries
    if (retryCount < 2) {
      console.log(`Retrying upload (${retryCount + 1}/2)...`);
      return uploadToCloudinary(file, options, retryCount + 1);
    }

    // If all retries fail, use local fallback
    try {
      return await saveLocalFallback(file, options);
    } catch (fallbackError) {
      console.error("Local fallback failed:", fallbackError);
      return {
        success: false,
        error: `Upload failed after retries: ${error.message}`,
      };
    }
  }
};

/**
 * Save file locally as a fallback when Cloudinary fails
 * @param {String} dataUrl - The data URL of the image
 * @param {Object} options - Upload options
 * @returns {Promise} - Local file info
 */
async function saveLocalFallback(dataUrl, options = {}) {
  try {
    console.log("Using local storage fallback...");

    // Generate a unique filename
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const filename = `fallback_${timestamp}_${randomString}.jpg`;
    const filePath = path.join(__dirname, "../../uploads/images", filename);

    // Extract the base64 data
    const base64Data = dataUrl.split(";base64,").pop();

    // Write the file
    await fs.promises.writeFile(filePath, base64Data, { encoding: "base64" });

    // Generate a URL that can be accessed through the server
    const publicUrl = `/uploads/images/${filename}`;

    console.log(`Fallback successful: ${publicUrl}`);

    return {
      success: true,
      url: publicUrl,
      public_id: `local_${timestamp}_${randomString}`,
      isLocalFallback: true,
    };
  } catch (error) {
    console.error("Local fallback error:", error);
    throw error;
  }
}

/**
 * Delete a file from Cloudinary
 * @param {String} publicId - The public ID of the file to delete
 * @returns {Promise} - Cloudinary deletion result
 */
export const deleteFromCloudinary = async (publicId) => {
  try {
    // Check if this is a local fallback file
    if (publicId.startsWith("local_")) {
      // Extract the filename from the ID or path
      const parts = publicId.split("_");
      if (parts.length >= 3) {
        const timestamp = parts[1];
        const randomString = parts[2];
        const filename = `fallback_${timestamp}_${randomString}.jpg`;
        const filePath = path.join(__dirname, "../../uploads/images", filename);

        // Delete the local file if it exists
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }

        return { success: true, result: "ok" };
      }
    }

    // Otherwise delete from Cloudinary
    const result = await cloudinary.uploader.destroy(publicId, {
      timeout: 30000,
    });
    return {
      success: result.result === "ok",
      result,
    };
  } catch (error) {
    console.error("Cloudinary delete error:", error);
    return {
      success: false,
      error: error.message,
    };
  }
};

export default cloudinary;
