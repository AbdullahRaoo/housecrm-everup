import { useCallback, useEffect, useRef, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { mediaApi } from '../services/api';

interface CloudinaryImage {
  url: string;
  public_id: string;
}

interface PropertyGalleryProps {
  images: CloudinaryImage[] | string[];
  title: string;
  editable?: boolean;
  onImagesChange?: (images: CloudinaryImage[]) => void;
}

export function PropertyGallery({
  images,
  title,
  editable = false,
  onImagesChange
}: PropertyGalleryProps) {
  const [activeImage, setActiveImage] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { token } = useAuth();

  // Convert old string array format to CloudinaryImage format if needed
  const normalizeImages = useCallback((imageArray: CloudinaryImage[] | string[]) => {
    return imageArray.map((img) => {
      if (typeof img === 'string') {
        // Extract public_id from URL
        const urlParts = img.split('/');
        const fileName = urlParts.pop() || '';
        const folder = urlParts[urlParts.length - 1] || '';

        return {
          url: img,
          public_id: folder && fileName ? `${folder}/${fileName.split('.')[0]}` : fileName
        };
      }
      return img as CloudinaryImage;
    });
  }, []);

  const [normalizedImages, setNormalizedImages] = useState<CloudinaryImage[]>([]);

  // Initialize and update normalized images
  useEffect(() => {
    const normalized = normalizeImages(images);
    setNormalizedImages(normalized);
  }, [images, normalizeImages]);

  // Reset active image when images change
  useEffect(() => {
    if (normalizedImages.length > 0 && activeImage >= normalizedImages.length) {
      setActiveImage(0);
    }
  }, [normalizedImages, activeImage]);

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0 || !token) return;

    const files = Array.from(e.target.files);
    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Simulate progress for UX purposes
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) return 90;
          return prev + 5;
        });
      }, 200);

      // Upload images to Cloudinary
      const uploadedImages = await mediaApi.uploadImages(files, token);

      clearInterval(progressInterval);
      setUploadProgress(100);

      // Update images list with new uploads
      const updatedImages = [...normalizedImages, ...uploadedImages];
      setNormalizedImages(updatedImages);

      // Notify parent component of changes
      if (onImagesChange) {
        onImagesChange(updatedImages);
      }

      // Set the active image to the first new upload
      setActiveImage(normalizedImages.length);
    } catch (error) {
      console.error('Error uploading images:', error);
      alert('Failed to upload images. Please try again.');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
      // Clear the input to allow uploading the same file again
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemoveImage = async (index: number) => {
    if (!token || isDeleting) return;

    const imageToRemove = normalizedImages[index];

    // Ask for confirmation
    if (!confirm('Are you sure you want to remove this image?')) {
      return;
    }

    try {
      setIsDeleting(true);

      // Extract the proper public_id if needed
      let publicId = imageToRemove.public_id;
      if (imageToRemove.public_id && !imageToRemove.public_id.includes('/')) {
        // Try to extract from URL if the public_id doesn't contain a folder path
        const urlParts = imageToRemove.url.split('/');
        const fileName = urlParts.pop() || '';
        const folder = urlParts[urlParts.length - 1];
        if (folder && fileName) {
          publicId = `${folder}/${fileName.split('.')[0]}`;
        }
      }

      // Only attempt to delete if we have a public_id
      if (publicId) {
        await mediaApi.deleteImage(publicId, token);
      }

      // Update the images array
      const updatedImages = [...normalizedImages];
      updatedImages.splice(index, 1);
      setNormalizedImages(updatedImages);

      // Notify parent component of changes
      if (onImagesChange) {
        onImagesChange(updatedImages);
      }

      // Update active image if needed
      if (activeImage >= updatedImages.length) {
        setActiveImage(updatedImages.length - 1 >= 0 ? updatedImages.length - 1 : 0);
      }
    } catch (error) {
      console.error('Error removing image:', error);
      alert('Failed to remove image. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4 border border-gray-100">
      <div className="relative group">
        {normalizedImages.length > 0 ? (
          <img
            src={normalizedImages[activeImage].url}
            alt={title}
            className="w-full h-96 object-cover rounded-lg shadow-sm"
          />
        ) : (
          <div className="w-full h-96 bg-gray-100 rounded-lg flex items-center justify-center">
            <p className="text-gray-400">No images available</p>
          </div>
        )}

        {normalizedImages.length > 1 && (
          <>
            <button
              onClick={() => setActiveImage((prev) => (prev === 0 ? normalizedImages.length - 1 : prev - 1))}
              className="absolute left-4 top-1/2 transform -translate-y-1/2
                bg-black/50 text-white p-3 rounded-full
                opacity-0 group-hover:opacity-100 transition-opacity duration-200
                hover:bg-black/70"
              aria-label="Previous image"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={() => setActiveImage((prev) => (prev === normalizedImages.length - 1 ? 0 : prev + 1))}
              className="absolute right-4 top-1/2 transform -translate-y-1/2
                bg-black/50 text-white p-3 rounded-full
                opacity-0 group-hover:opacity-100 transition-opacity duration-200
                hover:bg-black/70"
              aria-label="Next image"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </>
        )}

        {editable && normalizedImages.length > 0 && (
          <button
            onClick={() => handleRemoveImage(activeImage)}
            disabled={isDeleting || isUploading}
            className="absolute top-4 right-4 bg-red-500 text-white p-2 rounded-full
              opacity-0 group-hover:opacity-100 transition-opacity duration-200
              hover:bg-red-600 disabled:bg-gray-400"
            aria-label="Remove image"
          >
            {isDeleting ? (
              <span className="animate-pulse">...</span>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            )}
          </button>
        )}

        {isUploading && (
          <div className="absolute inset-0 bg-black/30 flex flex-col items-center justify-center">
            <div className="w-3/4 bg-gray-200 rounded-full h-2.5 mb-2">
              <div
                className="bg-[#e56e43] h-2.5 rounded-full"
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
            <p className="text-white">Uploading... {uploadProgress}%</p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-5 gap-2 mt-4">
        {normalizedImages.map((img, index) => (
          <div
            key={index}
            className={`relative rounded-lg overflow-hidden cursor-pointer group
              ${index === activeImage
                ? 'ring-2 ring-[#e56e43] ring-offset-2'
                : 'hover:ring-2 hover:ring-[#e56e43]/50 hover:ring-offset-2'
              }`}
            onClick={() => setActiveImage(index)}
          >
            <img
              src={img.url}
              alt={`${title} ${index + 1}`}
              className="w-full h-20 object-cover transition-transform duration-200
                group-hover:scale-110"
            />
            <div className={`absolute inset-0 bg-black/20 transition-opacity duration-200
              ${index === activeImage ? 'opacity-0' : 'group-hover:opacity-0'}`}
            />
          </div>
        ))}

        {editable && (
          <div
            className={`flex items-center justify-center h-20 rounded-lg border-2 border-dashed border-gray-300
              cursor-pointer hover:border-[#e56e43] transition-colors duration-200
              ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}
            onClick={isUploading ? undefined : handleUploadClick}
          >
            <div className="text-center">
              {isUploading ? (
                <div className="w-6 h-6 border-2 border-t-[#e56e43] border-r-[#e56e43]/30 border-b-[#e56e43]/30 border-l-[#e56e43]/30 rounded-full animate-spin mx-auto"></div>
              ) : (
                <svg
                  className="w-8 h-8 mx-auto text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                  />
                </svg>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
              disabled={isUploading}
            />
          </div>
        )}
      </div>
    </div>
  );
}
