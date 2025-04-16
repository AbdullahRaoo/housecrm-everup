import cloudinary from "cloudinary";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

// Configure Cloudinary
cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Upload a file to Cloudinary
 * @param {Buffer|String} file - The file buffer or file path to upload
 * @param {Object} options - Upload options
 * @returns {Promise} - Cloudinary upload result
 */
export const uploadToCloudinary = async (file, options = {}) => {
  try {
    // Set default options
    const uploadOptions = {
      resource_type: "auto",
      folder: "real-estate-crm",
      ...options,
    };

    // Upload file to Cloudinary
    const result = await cloudinary.v2.uploader.upload(file, uploadOptions);
    return {
      success: true,
      url: result.secure_url,
      public_id: result.public_id,
    };
  } catch (error) {
    console.error("Cloudinary upload error:", error);
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * Delete a file from Cloudinary
 * @param {String} publicId - The public ID of the file to delete
 * @returns {Promise} - Cloudinary deletion result
 */
export const deleteFromCloudinary = async (publicId) => {
  try {
    const result = await cloudinary.v2.uploader.destroy(publicId);
    return {
      success: result === "ok",
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

export default cloudinary.v2;
