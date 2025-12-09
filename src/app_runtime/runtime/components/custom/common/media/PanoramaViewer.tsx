import React, { useRef, useState } from 'react';
import { Pannellum } from 'pannellum-react';
import { Button } from '@/runtime/components/ui/button'; // Using shadcn/ui button
import { Maximize, Minimize } from 'lucide-react'; // Using lucide-react for icons

// Import types from interface files
import type { PanoramaViewerProps } from '@/interfaces/components/common/media/media';

/**
 * An interactive 360° image viewer component.
 * It uses the Pannellum library wrapped in react-pannellum-2 for the core functionality.
 *
 * @param {PanoramaViewerProps} props - The properties for the PanoramaViewer component.
 */
export const PanoramaViewer = ({
  image,
  autoRotate,
  rotationSpeed,
  isZoomable,
  isFullscreenEnabled,
  uuid,
  classes,
}: PanoramaViewerProps) => {
  const viewerRef = useRef<HTMLDivElement>(null);
  const [isFs, setIsFs] = useState(false); // State to track fullscreen status

  const handleFullscreen = () => {
    const elem = viewerRef.current;
    if (!elem) return;

    if (!isFs) {
      if (elem.requestFullscreen) {
        elem.requestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
    setIsFs(!isFs);
  };
  
  // Listen for exit fullscreen events (like pressing Esc key)
  React.useEffect(() => {
    const onFullscreenChange = () => {
        setIsFs(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', onFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', onFullscreenChange);
  }, []);

  return (
    <div ref={viewerRef} className={`relative w-full h-96 ${classes || ''}`}>
      <Pannellum
        style={{ width: '100%', height: '100%' }}
        image={image.src}
        pitch={10}
        yaw={180}
        hfov={110}
        autoLoad
        autoRotate={autoRotate ? rotationSpeed : undefined}
        autoRotateInactivityDelay={autoRotate ? 2000 : undefined}
        mouseZoom={isZoomable}
        showZoomCtrl={isZoomable}
        showFullscreenCtrl={false} // We use our own custom button
        onError={(err: any) => {
          console.error("Pannellum Error:", err, "for component", uuid);
        }}
      >
        {/* You can add custom hot spots here if needed */}
      </Pannellum>

      {isFullscreenEnabled && (
        <Button
          variant="outline"
          size="icon"
          className="absolute top-4 right-4 z-10"
          onClick={handleFullscreen}
          aria-label={isFs ? "Exit fullscreen" : "Enter fullscreen"}
        >
          {isFs ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
        </Button>
      )}
    </div>
  );
};

export default PanoramaViewer;
