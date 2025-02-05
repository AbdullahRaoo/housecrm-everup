import { useState } from 'react';

interface PropertyGalleryProps {
  images: string[];
  title: string;
}

export function PropertyGallery({ images, title }: PropertyGalleryProps) {
  const [activeImage, setActiveImage] = useState(0);

  return (
    <div className="bg-white rounded-lg shadow-md p-4 border border-gray-100">
      <div className="relative group">
        <img
          src={images[activeImage]}
          alt={title}
          className="w-full h-96 object-cover rounded-lg shadow-sm"
        />
        {images.length > 1 && (
          <>
            <button
              onClick={() => setActiveImage((prev) => (prev === 0 ? images.length - 1 : prev - 1))}
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
              onClick={() => setActiveImage((prev) => (prev === images.length - 1 ? 0 : prev + 1))}
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
      </div>
      <div className="grid grid-cols-5 gap-2 mt-4">
        {images.map((img, index) => (
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
              src={img}
              alt={`${title} ${index + 1}`}
              className="w-full h-20 object-cover transition-transform duration-200
                group-hover:scale-110"
            />
            <div className={`absolute inset-0 bg-black/20 transition-opacity duration-200
              ${index === activeImage ? 'opacity-0' : 'group-hover:opacity-0'}`}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
