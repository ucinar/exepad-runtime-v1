// components/Section.tsx
"use client";

import React, { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils'; // Assumes a utility for class names
import { DynamicRenderer } from '@/components/DynamicRenderer';
import { SectionProps } from '@/interfaces/components/common/layout/layout'; // Adjust path
import { VideoProps, ComponentProps } from '@/interfaces/components/common/core'; // Adjust path
import { useAutoContrast } from '@/hooks/useAutoContrast';

// --- Helper Component for Video Background ---

const BackgroundVideo: React.FC<{ video: VideoProps }> = ({ video }) => {
    if (video.provider !== 'file') {
        console.warn(`Background video provider '${video.provider}' is not supported for direct playback.`);
        return null;
    }

    return (
        <video
            className="absolute z-0 w-full h-full object-cover"
            src={video.source}
            poster={video.poster?.src}
            autoPlay={video.autoplay ?? true}
            loop={video.loop ?? true}
            muted={video.muted ?? true}
            playsInline // Essential for autoplay on mobile browsers
        />
    );
};

// --- The Updated Section Component Implementation ---

export const Section: React.FC<SectionProps> = ({
  sectionSlug,
  uuid,
  title,
  content,
  background,
  layout = 'singleColumnCentered',
  contentBleed = false,
  spacing = 'lg',
  fullHeight = false,
  parallax = false,
  speed = 0.4,
  classes,
}) => {
  const [offsetY, setOffsetY] = useState(0);
  const sectionRef = useRef<HTMLElement>(null);
  
  useEffect(() => {
    if (!parallax || typeof window === 'undefined') return;

    const handleScroll = () => {
        if (sectionRef.current) {
            const rect = sectionRef.current.getBoundingClientRect();
            if (rect.top < window.innerHeight && rect.bottom >= 0) {
                setOffsetY(rect.top);
            }
        }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [parallax]);

  const spacingClasses = {
    sm: 'py-8',
    md: 'py-12 md:py-16',
    lg: 'py-16 md:py-24',
    xl: 'py-24 md:py-32',
  };

  // Section wrapper - handle content bleed
  const sectionClasses = cn(
    'relative overflow-hidden',
    spacingClasses[spacing],
    fullHeight && 'min-h-screen flex flex-col justify-center',
    'w-full', // Always use w-full to prevent horizontal overflow
    classes
  );

  // Content container - handle contentBleed properly
  const contentContainerClasses = cn(
    'relative',
    // Only add margin/padding when NOT bleeding
    !contentBleed && 'mx-auto px-4 sm:px-6 lg:px-8',
    // Handle max-width based on contentBleed
    contentBleed ? 'w-full px-4 sm:px-6 lg:px-8' : 'container',
    // Only apply layout constraints when NOT bleeding to full width
    !contentBleed && {
      'max-w-4xl text-center': layout === 'singleColumnCentered',
      'max-w-7xl': layout === 'singleColumnWide',
      'grid grid-cols-1 md:grid-cols-2 gap-12 items-center': layout === 'twoColumnEven',
      'grid grid-cols-1 md:grid-cols-3 gap-8 items-start': layout === 'threeColumnEven',
      'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 items-start': layout === 'fourColumnEven',
      'grid grid-cols-1 lg:grid-cols-[1fr,2fr] gap-12 items-center': layout === 'twoColumnSidebarLeft',
      'grid grid-cols-1 lg:grid-cols-[2fr,1fr] gap-12 items-center': layout === 'twoColumnSidebarRight',
    },
    // When bleeding, just handle the basic layout types without max-width constraints
    contentBleed && {
      'text-center': layout === 'singleColumnCentered',
      'grid grid-cols-1 md:grid-cols-2 gap-12 items-center': layout === 'twoColumnEven',
      'grid grid-cols-1 md:grid-cols-3 gap-8 items-start': layout === 'threeColumnEven',
      'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 items-start': layout === 'fourColumnEven',
      'grid grid-cols-1 lg:grid-cols-[1fr,2fr] gap-12 items-center': layout === 'twoColumnSidebarLeft',
      'grid grid-cols-1 lg:grid-cols-[2fr,1fr] gap-12 items-center': layout === 'twoColumnSidebarRight',
    }
  );

  const isMultiColumn = layout !== 'singleColumnCentered' && layout !== 'singleColumnWide';

  // Detect dark mode on the client so we don't override dark: bg variants with inline styles
  const [isDarkMode, setIsDarkMode] = useState(false);
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const update = () => {
      try {
        setIsDarkMode(document.documentElement.classList.contains('dark'));
      } catch {
        setIsDarkMode(false);
      }
    };
    update();
    // Observe class changes to <html> to react to dark mode toggles
    const observer = new MutationObserver(update);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  // Extract arbitrary Tailwind color (bg-[#HEX]) so we can inline it when Tailwind doesn't generate classes for JSON
  const arbitraryBgHex = (() => {
    if (!classes) return null;
    const m = classes.match(/(?:^|\s)bg-\[#([0-9A-Fa-f]{3,6})\](?=\s|$)/);
    return m ? `#${m[1]}` : null;
  })();
  const hasDarkBgVariant = /\bdark:bg-/.test(classes || '');

  // Prefer explicit background prop, then safely inline arbitrary hex in light mode only (to respect dark: variants)
  // Fall back to auto-contrast detected background when available.
  const { correctedTextColor, backgroundColor: detectedBg } = useAutoContrast(classes, {
    elementRef: sectionRef as React.RefObject<HTMLElement>,
    componentName: 'Section'
  });
  const resolvedBackgroundColor =
    background?.overlayColor ??
    background?.color ??
    ((!hasDarkBgVariant || !isDarkMode) ? (arbitraryBgHex || detectedBg || undefined) : undefined);

  // Inline styles for viewport bleed when enabled
  const bleedStyles = contentBleed
    ? {
        marginLeft: 'calc(50% - 50vw)',
        marginRight: 'calc(50% - 50vw)',
        width: '100vw',
      } as React.CSSProperties
    : {};

  return (
    <section
      ref={sectionRef}
      className={sectionClasses}
      id={sectionSlug}
      style={{ 
        // Ensure effective background even when Tailwind doesn't generate JSON-defined arbitrary colors
        backgroundColor: resolvedBackgroundColor,
        ...(correctedTextColor && { color: correctedTextColor }),
        ...bleedStyles,
      }}
      data-contrast-corrected={correctedTextColor && process.env.NODE_ENV === 'development' ? 'true' : undefined}
    >
      {/* Background Layer with Image/Video - spans full section width */}
      {background && (
        <div
            className="absolute top-0 left-0 w-full h-full z-0"
            style={{
                transform: parallax ? `translateY(${offsetY * speed}px)` : 'none',
                willChange: 'transform',
            }}
        >
            {background.image && (
                <img
                    src={background.image.src}
                    alt={background.image.alt}
                    className="w-full h-full object-cover"
                />
            )}
            {background.video && <BackgroundVideo video={background.video} />}
            {background.overlayColor && (
                <div
                    className="absolute inset-0"
                    style={{ backgroundColor: background.overlayColor }}
                />
            )}
        </div>
      )}

      {/* Content Container - maintains readability with automatic contrast */}
      <div className="relative z-10">
        {title && (
          <div className="mx-auto px-4 sm:px-6 lg:px-8 text-center mb-12 max-w-4xl">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              {title}
            </h2>
          </div>
        )}

        <div className={contentContainerClasses}>
          {isMultiColumn ? (
            <>
              {Array.isArray(content) && content.map((component, index) => (
                <div key={component.uuid || `col-${index}`} className="[&>*]:mt-0 [&>*]:mb-0">
                  <DynamicRenderer component={component} />
                </div>
              ))}
            </>
          ) : (
            // Enforce vertical rhythm for single-column layouts
            <div
              className={cn(
                (
                  {
                    sm: 'space-y-4',
                    md: 'space-y-6',
                    lg: 'space-y-8',
                    xl: 'space-y-12',
                  } as Record<string, string>
                )[spacing],
                '[&>*]:mt-0 [&>*]:mb-0'
              )}
            >
              {Array.isArray(content) && content.map((component, index) => (
                <DynamicRenderer key={component.uuid || `item-${index}`} component={component} />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default Section;
