// components/common/Image.tsx
import * as React from 'react';
import { cn, filterDOMProps } from '@/lib/utils'; // Assuming a utility for class names
import { ImageProps } from '@/interfaces/components/common/core'; // Adjust path


/**
 * A data-driven component that renders an image and supports various hover effects.
 */
export const Image: React.FC<ImageProps> = ({
  src,
  alt,
  width,
  height,
  hoverEffect,
  classes,
  ...restProps
}) => {
  // The main container needs the `group` class to enable `group-hover` on child elements.
  const containerClasses = cn(
    'relative overflow-hidden transition-all duration-300 ease-in-out',
    hoverEffect && 'group',
    // Apply the lift effect to the container itself
    hoverEffect === 'lift' && 'hover:shadow-xl hover:-translate-y-1',
    classes
  );

  const imageClasses = cn(
    'w-full h-full object-contain transition-all duration-300 ease-in-out',
    // Apply specific hover effects to the image tag
    {
      'group-hover:scale-110': hoverEffect === 'zoom',
      'group-hover:grayscale': hoverEffect === 'grayscale',
      'group-hover:blur-sm': hoverEffect === 'blur',
      'group-hover:brightness-125': hoverEffect === 'brightness',
    }
  );

  return (
    <div className={containerClasses} style={{ width, height }} {...filterDOMProps(restProps)}>
      <img
        src={src}
        alt={alt}
        className={imageClasses}
        // Add a fallback for broken image links
        onError={(e) => {
          (e.target as HTMLImageElement).src = `https://placehold.co/${width || 120}x${height || 40}/EFEFEF/333333?text=Image+Error`;
        }}
      />
      {/* This overlay div becomes visible on hover when the effect is 'darken' */}
      {hoverEffect === 'darken' && (
        <div
          className="absolute inset-0 bg-black opacity-0 group-hover:opacity-20 transition-opacity duration-300"
          aria-hidden="true"
        />
      )}
    </div>
  );
};

export default Image;
