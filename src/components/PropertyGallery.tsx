import { useState } from 'react';

interface PropertyGalleryProps {
  images: string[];
  title: string;
}

export function PropertyGallery({ images, title }: PropertyGalleryProps) {
  const [activeImage, setActiveImage] = useState(0);

  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <div className="relative">
        <img
          src={images[activeImage]}
          alt={title}
          className="w-full h-96 object-cover rounded-lg"
        />
        {images.length > 1 && (
          <>
            <button
              onClick={() => setActiveImage((prev) => (prev === 0 ? images.length - 1 : prev - 1))}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full"
            >
              ←
            </button>
            <button
              onClick={() => setActiveImage((prev) => (prev === images.length - 1 ? 0 : prev + 1))}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full"
            >
              →
            </button>
          </>
        )}
      </div>
      <div className="grid grid-cols-5 gap-2 mt-2">
        {images.map((img, index) => (
          <img
            key={index}
            src={img}
            alt={`${title} ${index + 1}`}
            className={`w-full h-20 object-cover rounded-lg cursor-pointer ${index === activeImage ? 'ring-2 ring-blue-500' : ''
              }`}
            onClick={() => setActiveImage(index)}
          />
        ))}
      </div>
    </div>
  );
}
