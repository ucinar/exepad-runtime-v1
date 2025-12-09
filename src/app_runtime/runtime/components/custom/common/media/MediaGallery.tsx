import React from 'react';
import { cn } from '@/lib/utils'; // Assumes a utility for class names

// --- TYPE IMPORTS ---
import type { 
    MediaGalleryItemProps, 
    MediaGalleryProps, 
    LightboxProps,
} from '@/interfaces/components/common/media/media';
import type { CarouselProps } from '@/interfaces/components/common/layout/layout';

// --- COMPONENT IMPORTS ---
import MediaGalleryItem from './MediaGalleryItem';
import { Lightbox } from './Lightbox'; // The component that handles the dialog functionality
import { DynamicRenderer } from '@/components/DynamicRenderer';


/**
 * A versatile gallery component that can display media in a grid, masonry, or carousel layout,
 * with optional lightbox functionality.
 *
 * @param {MediaGalleryProps & Partial<CarouselProps>} props - The properties for the MediaGallery, including optional props for the Carousel layout.
 */
export const MediaGallery = ({
  content = [], // Add default empty array
  layout,
  columns = 3,
  gap = '4', // Defaulting to a unitless value for Tailwind
  lightbox = false,
  showThumbnails = false,
  classes,
  uuid,
  // Destructuring props intended for the custom Carousel
  autoplay,
  interval,
  showControls,
  showIndicators,
  slidesPerView,
  loop,
}: MediaGalleryProps & Partial<CarouselProps>) => { 

  // Add early return if content is empty
  if (!content || content.length === 0) {
    return (
      <div className={`media-gallery ${classes || ''}`}>
        <div className="text-gray-500 text-center p-4">
          No media content available
        </div>
      </div>
    );
  }

  // Renders the appropriate layout based on the 'layout' prop.
  const renderLayout = () => {
    switch (layout) {
      case 'carousel':
        // The custom CarouselProps expects a 'content' array of components.
        // We map the gallery items to a compatible structure.
        // If lightbox is enabled, each item in the carousel's content will be a Lightbox component.
        const carouselContent = content.map(item => {
            const imageToShow = showThumbnails && item.thumbnail ? item.thumbnail : item.image;
            
            if (lightbox) {
              return {
                componentType: 'LightboxProps',
                uuid: `lightbox-${item.uuid}`,
                thumbnail: imageToShow,
                fullImage: item.image,
                caption: item.caption,
                trigger: 'click',
              } as LightboxProps;
            }

            return {
                ...item, // Pass down item props
                image: imageToShow,
                componentType: 'MediaGalleryItem', // Assuming this is the component type
            } as MediaGalleryItemProps;
        });

        // Create a component configuration for dynamic rendering
        const carouselComponentConfig = {
          uuid: uuid || `carousel-${Date.now()}`,
          componentType: 'CarouselProps',
          content: carouselContent,
          autoplay,
          interval,
          showControls,
          showIndicators,
          slidesPerView,
          gap,
          loop,
        };

        // Use DynamicRenderer to render the carousel
        return <DynamicRenderer component={carouselComponentConfig} />;

      case 'masonry':
        // FIX: Convert the unitless gap into a rem value for inline styles.
        // Tailwind's default spacing scale is 1 unit = 0.25rem.
        const gapInRem = `${Number(gap) * 0.25}rem`;

        const masonryStyle: React.CSSProperties = {
            columnCount: columns,
            columnGap: gapInRem,
        };
        return (
            <div style={masonryStyle} className={cn('w-full', classes)}>
                {content.map((item) => (
                    <div key={item.uuid} style={{ marginBottom: gapInRem }} className="break-inside-avoid">
                      {lightbox ? (
                        <Lightbox
                          uuid={`lightbox-${item.uuid}`}
                          componentType="Lightbox"
                          thumbnail={item.thumbnail || item.image}
                          fullImage={item.image}
                          caption={item.caption}
                          trigger="click"
                        />
                      ) : (
                        <MediaGalleryItem {...item} image={showThumbnails && item.thumbnail ? item.thumbnail : item.image} />
                      )}
                    </div>
                ))}
            </div>
        );
      
      case 'grid':
      default:
        // FIX: Use `cn` to build the className string, including dynamic grid and gap classes.
        const gridClasses = cn(
            'grid',
            `grid-cols-${columns}`,
            `gap-${gap}`,
            classes
        );
        return (
          <div className={gridClasses}>
            {content.map((item) => (
              <div key={item.uuid}>
                {lightbox ? (
                  <Lightbox
                    uuid={`lightbox-${item.uuid}`}
                    componentType="Lightbox"
                    thumbnail={item.thumbnail || item.image}
                    fullImage={item.image}
                    caption={item.caption}
                    trigger="click"
                  />
                ) : (
                  <MediaGalleryItem {...item} image={showThumbnails && item.thumbnail ? item.thumbnail : item.image} />
                )}
              </div>
            ))}
          </div>
        );
    }
  };

  return (
    <div className={`media-gallery ${classes || ''}`}>
      {renderLayout()}
    </div>
  );
};

export default MediaGallery;
