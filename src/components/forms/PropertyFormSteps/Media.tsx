/* eslint-disable @typescript-eslint/no-explicit-any */

import { useCallback, useEffect, useRef, useState } from 'react';
import { FieldErrors, UseFormRegister, UseFormSetValue, UseFormWatch } from 'react-hook-form';
import { useAuth } from '../../../hooks/useAuth';
import { mediaApi } from '../../../services/api';
import { CloudinaryImage, Property } from '../../../types/property';

interface MediaProps {
  register: UseFormRegister<Property>;
  setValue: UseFormSetValue<Property>;
  watch: UseFormWatch<Property>;
  errors: FieldErrors<Property>;
}

export function Media({ setValue, watch, errors }: MediaProps) {
  const [previews, setPreviews] = useState<string[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const { token } = useAuth();
  const isInitialRender = useRef(true);

  // Watch for images value changes
  const currentImages = watch('media.images');

  // Initialize with existing images when editing - use useEffect and useRef to avoid setState during render
  useEffect(() => {
    if (isInitialRender.current && !isInitialized && currentImages?.length > 0) {
      isInitialRender.current = false;

      // Convert to CloudinaryImage format if needed
      const normalizeImage = (img: string | CloudinaryImage): CloudinaryImage => {
        if (typeof img === 'string') {
          return {
            url: img,
            public_id: img.split('/').pop() || img
          };
        }
        return img as CloudinaryImage;
      };

      // Process all images at once
      const normalizedImages: CloudinaryImage[] = Array.isArray(currentImages)
        ? currentImages.map(normalizeImage)
        : [];

      // Set previews and images states
      setPreviews(normalizedImages.map(img => img.url));

      // Use setTimeout to ensure setValue happens after render is complete
      setTimeout(() => {
        setValue('media.images', normalizedImages);
        setIsInitialized(true);
      }, 0);
    }
  }, [currentImages, isInitialized, setValue]);

  const processFiles = useCallback(async (files: FileList) => {
    if (!token) {
      alert('You must be logged in to upload images');
      return;
    }

    // Validate file types and sizes
    const validFiles = Array.from(files).filter(file => {
      const isValidType = ['image/jpeg', 'image/png', 'image/gif'].includes(file.type);
      const isValidSize = file.size <= 10 * 1024 * 1024; // 10MB
      return isValidType && isValidSize;
    });

    if (validFiles.length !== files.length) {
      alert('Some files were skipped. Please only upload PNG, JPG, or GIF files under 10MB.');
    }

    if (validFiles.length === 0) return;

    try {
      setIsUploading(true);

      // Upload images to Cloudinary
      const uploadedImages = await mediaApi.uploadImages(validFiles, token);

      // Update the images state with the new CloudinaryImages
      setTimeout(() => {
        setValue('media.images', uploadedImages as any, { shouldValidate: true });
      }, 0);

      // Update previews with the new URLs
      setPreviews(prev => [...prev, ...uploadedImages.map(img => img.url)]);
    } catch (error) {
      console.error('Error uploading images:', error);
      alert('Failed to upload images. Please try again.');
    } finally {
      setIsUploading(false);
    }
  }, [token, setValue]);

  const handleImageChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      processFiles(files);
    }
  }, [processFiles]);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files) {
      processFiles(files);
    }
  }, [processFiles]);

  const removeImage = useCallback((index: number) => {
    // Remove from previews
    setPreviews(prev => prev.filter((_, i) => i !== index));

    // Remove from images and update form
    const currentImages = watch('media.images') || [];
    // Create a new array without the item at the specified index
    const updatedImages = [...currentImages];
    updatedImages.splice(index, 1);
    // Set the new value
    setValue('media.images', updatedImages as CloudinaryImage[], { shouldValidate: true });
  }, [setValue, watch]);

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-semibold text-gray-800 mb-2">
          Property Images
          <span className="text-red-500 ml-1">*</span>
        </label>
        {errors.media?.images && (
          <p className="mt-1 text-sm text-red-500">
            Please upload at least one image
          </p>
        )}
        <div
          className={`mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-lg
            transition-colors duration-200 relative
            ${isDragging ? 'border-[#e56e43] bg-[#e56e43]/5' :
              errors.media?.images ? 'border-red-300' : 'border-gray-300 hover:border-[#e56e43]'}`}
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
        >
          {isUploading ? (
            <div className="flex flex-col items-center justify-center">
              <div className="w-12 h-12 border-4 border-t-[#e56e43] border-r-[#e56e43]/30 border-b-[#e56e43]/30 border-l-[#e56e43]/30 rounded-full animate-spin"></div>
              <p className="mt-2 text-sm text-gray-600">Uploading images...</p>
            </div>
          ) : (
            <div className="space-y-2 text-center">
              <svg
                className={`mx-auto h-12 w-12 transition-colors duration-200
                  ${isDragging ? 'text-[#e56e43]' : 'text-gray-400'}`}
                stroke="currentColor"
                fill="none"
                viewBox="0 0 48 48"
              >
                <path
                  d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <div className="flex flex-col items-center text-sm text-gray-600">
                <label className="relative cursor-pointer rounded-md font-medium text-[#e56e43] hover:text-[#e56e43]/80 transition-colors duration-200">
                  <span>Upload files</span>
                  <input
                    type="file"
                    multiple
                    accept="image/jpeg,image/png,image/gif"
                    className="sr-only"
                    onChange={handleImageChange}
                    disabled={isUploading}
                  />
                </label>
                <p className="mt-1">or drag and drop</p>
                <p className="text-xs text-gray-500 mt-2">PNG, JPG, GIF up to 10MB</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {previews.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {previews.map((preview, index) => (
            <div key={index} className="relative group">
              <img
                src={preview}
                alt={`Preview ${index + 1}`}
                className="w-full h-32 object-cover rounded-lg shadow-sm transition-transform duration-200 group-hover:scale-[1.02]"
              />
              <button
                type="button"
                onClick={() => removeImage(index)}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6
                  flex items-center justify-center opacity-0 group-hover:opacity-100
                  transition-all duration-200 hover:bg-red-600 shadow-lg"
                disabled={isUploading}
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
