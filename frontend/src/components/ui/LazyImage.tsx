import React, { useState, useEffect, useRef } from 'react';
import { getMediaTypeIcon, type MediaType } from '@/lib/mediaUtils';

interface LazyImageProps {
  src: string;
  alt: string;
  className?: string;
  mediaType?: MediaType;
  placeholder?: React.ReactNode;
}

/**
 * LazyImage component that only loads images when they enter the viewport
 * Uses Intersection Observer API for efficient viewport detection
 */
export const LazyImage: React.FC<LazyImageProps> = ({
  src,
  alt,
  className = '',
  mediaType = 'image',
  placeholder,
}) => {
  const [isInView, setIsInView] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            observer.disconnect();
          }
        });
      },
      {
        rootMargin: '50px', // Start loading 50px before entering viewport
      }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, []);

  const handleLoad = () => {
    setIsLoaded(true);
  };

  const handleError = () => {
    setHasError(true);
    setIsLoaded(false);
  };

  const IconComponent = getMediaTypeIcon(mediaType);

  // If src is empty, show placeholder immediately
  if (!src || src.trim() === '') {
    return (
      <div className={className}>
        {placeholder || (
          <div className="w-full h-full flex items-center justify-center bg-slate-700">
            {React.createElement(IconComponent, { className: "h-8 w-8 text-slate-400" })}
          </div>
        )}
      </div>
    );
  }

  return (
    <div ref={imgRef} className={className}>
      {!isInView ? (
        // Placeholder while not in viewport
        placeholder || (
          <div className="w-full h-full flex items-center justify-center bg-slate-700">
            {React.createElement(IconComponent, { className: "h-8 w-8 text-slate-400" })}
          </div>
        )
      ) : hasError ? (
        // Error fallback
        <div className="w-full h-full flex items-center justify-center bg-slate-700">
          {React.createElement(IconComponent, { className: "h-8 w-8 text-slate-400" })}
        </div>
      ) : (
        // Image with fade-in effect
        <img
          src={src}
          alt={alt}
          onLoad={handleLoad}
          onError={handleError}
          className={`w-full h-full object-cover transition-opacity duration-300 ${
            isLoaded ? 'opacity-100' : 'opacity-0'
          }`}
        />
      )}
    </div>
  );
};

export default LazyImage;
