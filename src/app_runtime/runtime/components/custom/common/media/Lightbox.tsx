import React, { useState, useEffect } from 'react';

// Import shadcn/ui components and project-specific types
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogHeader,
  DialogTitle, // Ensure DialogTitle is imported
  DialogFooter,
} from '@/runtime/components/ui/dialog';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden'; // Import the utility for hiding content visually
import type { LightboxProps } from '@/interfaces/components/common/media/media'; // Adjust path if needed

/**
 * A reusable Lightbox component that displays a full-size image in a dialog
 * when a thumbnail is clicked.
 * @param {LightboxProps} props - The properties for the Lightbox component.
 */
export const Lightbox = ({
  thumbnail,
  fullImage,
  caption,
  trigger,
  onOpen,
  onClose,
  uuid,
  classes,
}: LightboxProps) => {
  const [isOpen, setIsOpen] = useState(false);

  // Effect to handle the onOpen and onClose event identifiers
  useEffect(() => {
    if (isOpen) {
      if (onOpen) {
        console.log(`Handler triggered for lightbox ${uuid}: ${onOpen}`);
        // Example: window.dispatchEvent(new CustomEvent('app-event', { detail: { handler: onOpen, componentId: uuid } }));
      }
    } else {
      // This will also fire on initial render when isOpen is false.
      // A more robust implementation might check for a previous state.
      if (onClose) {
        console.log(`Handler triggered for lightbox ${uuid}: ${onClose}`);
        // Example: window.dispatchEvent(new CustomEvent('app-event', { detail: { handler: onClose, componentId: uuid } }));
      }
    }
  }, [isOpen, onOpen, onClose, uuid]);

  // The hover trigger is less conventional for a lightbox and can have usability issues,
  // especially on mobile. For this implementation, we will treat 'hover' as 'click'.
  if (trigger === 'hover') {
    console.warn(`Lightbox with uuid "${uuid}": 'hover' trigger is not recommended and will be treated as 'click'.`);
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild className={classes}>
        <div
          className="cursor-pointer relative"
          role="button"
          aria-label={`View image: ${thumbnail.alt}`}
        >
          <img
            src={thumbnail.src}
            alt={thumbnail.alt}
            className="w-full h-full object-cover rounded-md"
            onError={(e) => {
              (e.target as HTMLImageElement).src = `https://placehold.co/400x300/27272a/a1a1aa?text=Thumb+Error`;
            }}
          />
        </div>
      </DialogTrigger>
      <DialogContent className="bg-transparent border-0 p-0 w-auto max-w-[90vw] h-auto max-h-[90vh] flex flex-col items-center justify-center">
        {/*
          * FIX: Added a DialogTitle for accessibility.
          * It is wrapped in VisuallyHidden so it's available to screen readers
          * but does not appear on the screen. The title can be dynamic or static.
          */}
        <VisuallyHidden>
          <DialogTitle>Enlarged view of: {fullImage.alt || 'Image'}</DialogTitle>
        </VisuallyHidden>
        
        <img
          src={fullImage.src}
          alt={fullImage.alt}
          className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
          onError={(e) => {
            (e.target as HTMLImageElement).src = `https://placehold.co/1920x1080/27272a/a1a1aa?text=Image+Error`;
          }}
        />
        {caption && (
          <DialogFooter className="w-full pt-2">
            <p className="text-center text-sm text-white/80 bg-black/50 p-2 rounded-b-lg">{caption}</p>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default Lightbox;
