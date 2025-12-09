// File: src/app_runtime/runtime/components/custom/common/media/PDFViewer.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

import { Button } from '@/app_runtime/runtime/components/ui/button';
import {
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  RotateCw,
} from 'lucide-react';

import type { PDFViewerProps } from '@/interfaces/components/common/media/media';

// Serve the worker from your own public folder
if (typeof window !== 'undefined') {
  pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.mjs';
}

export const PDFViewer = ({
  src,
  initialPage = 1,
  fitMode = 'width',
  zoom: initialZoom = 1.0,
  showControls = true,
  onPageChange,
  uuid,
  classes,
}: PDFViewerProps) => {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState(initialPage);
  const [zoom, setZoom] = useState(initialZoom);
  const [rotation, setRotation] = useState(0);

  // Note: onPageChange is a string identifier for the event handler system
  // In the future, this could be integrated with the runtime event system
  // For now, we just track the page number in local state

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setPageNumber(initialPage);
  };

  const goToPrevPage = () => setPageNumber(n => Math.max(n - 1, 1));
  const goToNextPage = () =>
    setPageNumber(n => Math.min(n + 1, numPages || 1));
  const handleZoomIn = () => setZoom(z => Math.min(z + 0.2, 3));
  const handleZoomOut = () => setZoom(z => Math.max(z - 0.2, 0.2));
  const handleRotate = () => setRotation(r => (r + 90) % 360);

  const fitClass = {
    width: 'w-full',
    height: 'h-full',
    page: '',
  }[fitMode];

  return (
    <div className={`pdf-viewer bg-zinc-800 p-4 rounded-lg shadow-lg ${classes ?? ''}`}>
      <div className="relative overflow-auto" style={{ height: '75vh' }}>
        <Document
          file={src}
          onLoadSuccess={onDocumentLoadSuccess}
          onLoadError={err => console.error('Error loading PDF:', err)}
          className="flex justify-center"
        >
          <Page
            pageNumber={pageNumber}
            scale={zoom}
            rotate={rotation}
            className={fitClass}
          />
        </Document>
      </div>

      {showControls && numPages && (
        <div className="controls flex items-center justify-center gap-4 mt-4 p-2 bg-zinc-900/50 rounded-md">
          <Button
            variant="outline"
            size="icon"
            onClick={goToPrevPage}
            disabled={pageNumber <= 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          <span className="text-white">
            Page {pageNumber} of {numPages}
          </span>

          <Button
            variant="outline"
            size="icon"
            onClick={goToNextPage}
            disabled={pageNumber >= numPages}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>

          <div className="flex items-center gap-2 ml-4">
            <Button variant="outline" size="icon" onClick={handleZoomOut}>
              <ZoomOut className="h-4 w-4" />
            </Button>
            <span className="text-white w-12 text-center">
              {(zoom * 100).toFixed(0)}%
            </span>
            <Button variant="outline" size="icon" onClick={handleZoomIn}>
              <ZoomIn className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={handleRotate}>
              <RotateCw className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PDFViewer;
