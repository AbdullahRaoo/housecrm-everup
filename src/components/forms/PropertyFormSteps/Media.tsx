import { useState } from 'react';
import { FieldErrors, UseFormRegister, UseFormSetValue } from 'react-hook-form';
import { Property } from '../../../types/property';

interface MediaProps {
  register: UseFormRegister<Property>;
  setValue: UseFormSetValue<Property>;
  errors: FieldErrors<Property>;
}

export function Media({ setValue }: MediaProps) {
  const [previews, setPreviews] = useState<string[]>([]);
  const [base64Images, setBase64Images] = useState<string[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      processFiles(files);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files) {
      processFiles(files);
    }
  };

  const processFiles = async (files: FileList) => {
    const newPreviews = Array.from(files).map(file => URL.createObjectURL(file));
    setPreviews(prev => [...prev, ...newPreviews]);

    const newBase64Images = await Promise.all(
      Array.from(files).map(file => {
        return new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            resolve(reader.result as string);
          };
          reader.readAsDataURL(file);
        });
      })
    );

    setBase64Images(prev => [...prev, ...newBase64Images]);
    setValue('media.images', [...base64Images, ...newBase64Images]);
  };

  const removeImage = (index: number) => {
    setPreviews(prev => prev.filter((_, i) => i !== index));
    setBase64Images(prev => {
      const newBase64Images = prev.filter((_, i) => i !== index);
      setValue('media.images', newBase64Images);
      return newBase64Images;
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-semibold text-gray-800 mb-2">Property Images</label>
        <div
          className={`mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-lg
            transition-colors duration-200
            ${isDragging ? 'border-[#e56e43] bg-[#e56e43]/5' : 'border-gray-300 hover:border-[#e56e43]'}`}
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
        >
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
                  accept="image/*"
                  className="sr-only"
                  onChange={handleImageChange}
                />
              </label>
              <p className="mt-1">or drag and drop</p>
              <p className="text-xs text-gray-500 mt-2">PNG, JPG, GIF up to 10MB</p>
            </div>
          </div>
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
