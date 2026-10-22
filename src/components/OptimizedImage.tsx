import React, { useState, useEffect } from 'react';

interface OptimizedImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  width?: string | number;
  height?: string | number;
  aspectRatio?: string;
  className?: string;
  fetchPriority?: 'high' | 'low' | 'auto';
  loading?: 'lazy' | 'eager';
}

/**
 * OptimizedImage component for luxury performance:
 * 1. Prefers WebP if possible (inferred from path or provided).
 * 2. Golden gradient fallback on load error.
 * 3. Zero layout shift by enforcing dimensions or aspect ratio.
 */
export const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  width,
  height,
  aspectRatio,
  className = '',
  fetchPriority = 'auto',
  loading = 'lazy',
  ...props
}) => {
  const [error, setError] = useState(false);
  const [loaded, setLoaded] = useState(false);

  // Attempt to use WebP version if not already specified
  const webpSrc = src.endsWith('.webp') ? src : src.replace(/\.(jpg|jpeg|png)$/i, '.webp');

  const containerStyle: React.CSSProperties = {
    position: 'relative',
    overflow: 'hidden',
    width: width || '100%',
    height: height || (aspectRatio ? 'auto' : '100%'),
    aspectRatio: aspectRatio,
  };

  if (error) {
    return (
      <div 
        className={`gold-gradient-bg ${className}`} 
        style={containerStyle}
        aria-label={alt}
      />
    );
  }

  return (
    <div style={containerStyle} className={`bg-slate-900/20 ${className}`}>
      {!loaded && (
        <div className="absolute inset-0 gold-gradient-bg opacity-10 animate-pulse" />
      )}
      <picture>
        <source srcSet={webpSrc} type="image/webp" />
        <img
          src={src}
          alt={alt}
          width={width}
          height={height}
          loading={loading}
          // @ts-ignore
          fetchPriority={fetchPriority}
          onLoad={() => setLoaded(true)}
          onError={() => setError(true)}
          className={`w-full h-full object-cover transition-opacity duration-500 ${loaded ? 'opacity-100' : 'opacity-0'}`}
          {...props}
        />
      </picture>
    </div>
  );
};
