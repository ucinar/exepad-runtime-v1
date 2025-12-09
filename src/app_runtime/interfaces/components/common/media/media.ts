// src/interfaces/media.ts

import { ComponentProps, ImageProps, VideoProps, AudioProps, SubComponentProps } from '../core';

/**
 * The type of media content.
 */
export type MediaType = 'image' | 'video' | 'audio';

/**
 * Defines the user action that triggers the lightbox.
 */
export type LightboxTrigger = 'click' | 'hover';


/**
 * Defines the layout options for a media gallery.
 */
export type GalleryLayout = 'grid' | 'masonry' | 'carousel';

/**
 * Defines the types of documents that can be embedded.
 * 'auto' will infer the type from the file extension.
 */
export type DocumentType =
  | 'pdf'
  | 'doc'
  | 'docx'
  | 'ppt'
  | 'pptx'
  | 'xls'
  | 'xlsx'
  | 'txt'
  | 'html'
  | 'gdoc'
  | 'sheet'
  | 'csv'
  | 'rtf'
  | 'generic'
  | 'auto';


/**
 * Properties for a clickable thumbnail that opens a full-size image in an overlay.
 */
export interface LightboxProps extends ComponentProps {
  /** The thumbnail image. */
  thumbnail: ImageProps;
  /** The full-size image to display in the lightbox. */
  fullImage: ImageProps;
  /** An optional caption for the full image. */
  caption?: string;
  /** The event that triggers the lightbox. */
  trigger: LightboxTrigger;
  /** Handler identifier for when the lightbox is opened. */
  onOpen?: string;
  /** Handler identifier for when the lightbox is closed. */
  onClose?: string;
}



/**
 * Base properties for any media item that can be displayed in a grid or gallery.
 */
export interface MediaGalleryItemProps extends ComponentProps {
  /** The type of the media. */
  type: MediaType;
  /** The primary image for the item. */
  image: ImageProps;
  /** An optional thumbnail image. */
  thumbnail?: ImageProps;
  /** An optional title or caption for the media. */
  caption?: string;
  /** Handler identifier for when the item is clicked. */
  onClick?: string;
}


/**
 * Properties for a gallery of mixed media types.
 */
export interface MediaGalleryProps extends ComponentProps {
  /** An array of media items to display. */
  content: MediaGalleryItemProps[];
  /** The layout of the gallery. */
  layout: GalleryLayout;
  /** The number of columns (for grid and masonry layouts). */
  columns: number;
  /** The gap between gallery items. */
  gap: string;
  /** If true, enables a lightbox for viewing media. */
  lightbox: boolean;
  /** If true, thumbnails are shown in the gallery. */
  showThumbnails: boolean;
}

/**
 * Properties for an interactive 360° image viewer.
 */
export interface PanoramaViewerProps extends ComponentProps {
  /** The 360° panorama image. */
  image: ImageProps;
  /** If true, the image will auto-rotate. */
  autoRotate: boolean;
  /** The speed of the auto-rotation. */
  rotationSpeed: number;
  /** If true, zooming is enabled. */
  isZoomable: boolean;
  /** If true, a fullscreen button is available. */
  isFullscreenEnabled: boolean;
}

/**
 * Properties for a PDF viewer.
 */
export interface PDFViewerProps extends ComponentProps {
  /** The URL of the PDF source. */
  src: string;
  /** The initial page number to display. */
  initialPage: number;
  /** How the PDF should fit into the viewer ('width', 'height', 'page'). */
  fitMode: 'width' | 'height' | 'page';
  /** The initial zoom level. */
  zoom: number;
  /** If true, navigation and zoom controls are visible. */
  showControls: boolean;
  /** Handler identifier for when the page changes. */
  onPageChange?: string;
}

/**
 * Properties for embedding a document.
 */
export interface DocumentEmbedProps extends ComponentProps {
  /** The URL of the document source. */
  src: string;
  /** The type of the document. 'auto' infers from the source URL. */
  type: DocumentType;
  /** The width of the embedded document. */
  width: string | number;
  /** The height of the embedded document. */
  height: string | number;
  /** An accessible title for the iframe. */
  title: string;
  /** If true, a toolbar is shown if available. */
  showToolbar?: boolean;
  /** If true, fullscreen mode is allowed. */
  allowFullscreen?: boolean;
  /** Fallback text to display if the document fails to load. */
  fallbackText?: string;
}
