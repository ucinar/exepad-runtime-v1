import React from 'react';
import { Card } from '@/runtime/components/ui/card'; // Import the Card component from shadcn/ui

// Import the necessary types from your project's interface files.
import type { MediaGalleryItemProps } from '@/interfaces/components/common/media/media'; // Adjust path as per your project structure

/**
 * A single item within a MediaGallery.
 * It is designed to be a flexible component for various gallery layouts.
 * @param {MediaGalleryItemProps} props - The properties for the media gallery item.
 */
export const MediaGalleryItem = ({ image, caption, onClick, uuid, classes }: MediaGalleryItemProps) => {
  // This handler triggers events based on the string identifier provided.
  const handleClick = () => {
    if (onClick) {
      console.log(`Handler triggered for item ${uuid}: ${onClick}`);
      // Example of dispatching a custom event that the system can listen for:
      // window.dispatchEvent(new CustomEvent('app-event', { detail: { handler: onClick, itemId: uuid } }));
    }
  };

  return (
    <Card
      className={`group relative h-full w-full cursor-pointer overflow-hidden border-0 bg-zinc-800 shadow-md transition-shadow duration-300 ease-in-out hover:shadow-xl ${classes || ''}`}
      onClick={handleClick}
      role={onClick ? 'button' : 'figure'}
      tabIndex={onClick ? 0 : -1}
      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && handleClick()}
      aria-label={caption || image.alt}
    >
      <img
        src={image.src}
        alt={image.alt}
        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        onError={(e) => {
          (e.target as HTMLImageElement).src = `https://placehold.co/600x400/27272a/a1a1aa?text=Image+Not+Found`;
        }}
        loading="lazy"
      />
      {caption && (
        <div className="absolute bottom-0 left-0 flex h-full w-full items-end bg-gradient-to-t from-black/70 to-transparent p-4 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          <p className="text-sm font-semibold text-white truncate">{caption}</p>
        </div>
      )}
      {/* A subtle overlay to indicate interactivity */}
      <div className="absolute inset-0 bg-black/10 transition-colors group-hover:bg-black/0"></div>
    </Card>
  );
};

export default MediaGalleryItem;
