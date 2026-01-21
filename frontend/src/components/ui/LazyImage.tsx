import React, { useState, useEffect, useRef } from 'react';
import { getMediaTypeIcon, type MediaType } from '@/lib/mediaUtils';

interface LazyImageProps {
  src: string;
  alt: string;
  className?: string;
  mediaType?: MediaType;
  placeholder?: React.ReactNode;
  style?: React.CSSProperties;
  // Media details for overlay
  title?: string;
  description?: string;
  showOverlay?: boolean;
}

/**
 * LazyImage component that only loads images when they enter the viewport
 * Uses Intersection Observer API for efficient viewport detection
 */
export const LazyImage: React.FC<LazyImageProps> = ({
  src,
  alt,
  className = '',
  style = { position: 'relative' },
  mediaType = 'image',
  placeholder,
  title,
  description,
  showOverlay = true,
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

  const containerClassName = showOverlay 
    ? `${className} media-card-image-grid`.trim()
    : className;

  // Helper function to check if URL is actually an image
  const isImageUrl = (url: string): boolean => {
    if (!url) return false;
    const lowerUrl = url.toLowerCase();
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.avif', '.bmp'];
    const audioExtensions = ['.mp3', '.wav', '.ogg', '.flac', '.aac', '.m4a'];
    const videoExtensions = ['.mp4', '.mov', '.avi', '.webm', '.mkv', '.flv'];
    const documentExtensions = ['.pdf', '.doc', '.docx', '.txt'];
    
    // Known image hosting services (trust these URLs)
    const imageHostingServices = ['picsum.photos', 'unsplash.com', 'pexels.com', 'imgur.com', 'cloudinary.com'];
    if (imageHostingServices.some(service => lowerUrl.includes(service))) return true;
    
    // Check if URL contains audio/video/document extensions - definitely not an image
    if (audioExtensions.some(ext => lowerUrl.includes(ext))) return false;
    if (videoExtensions.some(ext => lowerUrl.includes(ext))) return false;
    if (documentExtensions.some(ext => lowerUrl.includes(ext))) return false;
    
    // Check if URL contains image extensions - definitely an image
    if (imageExtensions.some(ext => lowerUrl.includes(ext))) return true;
    
    // If mediaType is 'image' and URL doesn't have any conflicting extensions, trust it
    // This handles URLs without extensions (like picsum.photos) when mediaType is correct
    if (mediaType === 'image') return true;
    
    // Default: don't trust it if we can't determine
    return false;
  };

  // Determine if we should show an image or icon placeholder
  // Show image if: (mediaType is 'image' OR 'video') AND src is valid AND src appears to be an image URL
  // Videos now have uploaded thumbnail images, so they should display thumbnails too
  const shouldShowImage = src && src.trim() !== '' && (mediaType === 'image' || mediaType === 'video') && isImageUrl(src);
  const showPlaceholder = !shouldShowImage || hasError || !isInView;

  return (
    <div ref={imgRef} className={containerClassName} style={style}>
      {showPlaceholder ? (
        // Placeholder for non-image types or when image fails/not in view
        placeholder || (
          <div className="w-full h-full flex items-center justify-center bg-slate-700">
            {React.createElement(IconComponent, { className: "h-8 w-8 text-slate-400" })}
          </div>
        )
      ) : (
        // Image with fade-in effect (only for image mediaType)
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
      {showOverlay && (
        <div className="media-card-image-grid-overlay">
          <div className="p-3 h-full flex flex-col justify-between">
            {title && (
              <div>
                <h4 className="text-sm font-semibold text-white mb-1 line-clamp-2">{title}</h4>
                {description && (
                  <p className="text-xs text-slate-300 line-clamp-2">{description}</p>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default LazyImage;
