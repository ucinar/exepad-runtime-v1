// src/interfaces/utils.ts

import { ComponentProps, IconProps, ImageProps } from '../common/core';

// --- Core Application Utilities ---

/**
 * Renders content into a different DOM root via a portal. Essential for
 * modals, drawers, and other overlaying UI elements.
 */
export interface PortalProps extends ComponentProps {
  /** The component(s) to render inside the portal. */
  content: ComponentProps[];
  /** The DOM element ID where the portal content should be attached. */
  targetId: string;
}

/**
 * Catches JavaScript errors in its child component tree, logs those errors,
 * and displays a fallback UI instead of a crashed component tree.
 */
export interface ErrorBoundaryProps extends ComponentProps {
  /** The component to render as a fallback when an error is caught. */
  fallback: ComponentProps;
  /** The child components to wrap with the error boundary. */
  content: ComponentProps[];
  /** An optional handler identifier for logging or reporting error events. */
  onError?: string;
}

/**
 * A non-visual component that sets crucial SEO meta tags for a page,
 * including title, description, and Open Graph data for social sharing.
 */
export interface SeoMetaProps extends ComponentProps {
  /** The title of the page, displayed in the browser tab. */
  title: string;
  /** The meta description for search engine results pages (SERPs). */
  pageDescription: string;
  /** An array of individual SEO keywords (e.g., ["web development", "react", "typescript"]). Each keyword should be a separate array element. */
  keywords?: string[];
  /** The title for Open Graph (social media) sharing cards. */
  ogTitle?: string;
  /** The description for Open Graph sharing cards. */
  ogDescription?: string;
  /** The URL of the image for Open Graph sharing cards. */
  ogImageUrl?: string;
  /** The canonical URL for the page to prevent duplicate content issues. */
  canonicalUrl?: string;
}


// --- UI & Formatting Utilities ---

/**
 * Displays a formatted date and time, with options for relative time
 * (e.g., "2 hours ago") and automatic updates.
 */
export interface DateTimeDisplayProps extends ComponentProps {
  /** The date/time value, typically an ISO 8601 string. */
  value: string;
  /** A format string to control the date/time display (e.g., 'MMMM D, YYYY'). */
  format?: string;
  /** If true, displays time relative to now. */
  relative?: boolean;
  /** If true, the relative time will auto-update periodically. */
  autoUpdate?: boolean;
  /** The IANA timezone string for accurate time display (e.g., "America/New_York"). */
  timezone?: string;
}

/**
 * Renders a button that appears after scrolling past a certain threshold
 * and smoothly scrolls the user back to the top of the page.
 */
export interface BackToTopProps extends ComponentProps {
  /** The scroll distance in pixels before the button appears. @default 400 */
  threshold?: number;
  /** If true, scrolling to the top will be animated. @default true */
  smooth?: boolean;
  /** An optional icon for the button. Defaults to an upward arrow. */
  icon?: IconProps;
  /** The position of the button on the screen. @default 'bottomRight' */
  position?: 'bottomLeft' | 'bottomRight';
}

/**
 * Represents a single language option in the LanguageSelector component.
 */
export interface LanguageSelectorOption {
  code: string; // e.g., 'en-US'
  name: string; // e.g., 'English (US)'
  flag?: ImageProps;
}

/**
 * A UI component that allows users to switch the application's language.
 */
export interface LanguageSelectorProps extends ComponentProps {
  /** An array of available language options. */
  options: LanguageSelectorOption[];
  /** The language code of the currently selected language. */
  currentLanguageCode: string;
  /** An optional handler identifier for when the language is changed. */
  onChangeAction?: string;
}

/**
 * A button that allows users to share a URL to various social platforms.
 */
export interface ShareButtonProps extends ComponentProps {
  /** The social media platform to share to. */
  platform: 'twitter' | 'facebook' | 'linkedin' | 'email';
  /** The URL to be shared. */
  url: string;
  /** The text or title to pre-fill in the share dialog. */
  text?: string;
  /** An optional icon to display in the button. */
  icon?: IconProps;
}

/**
 * Toggles overlay visibility over a target element
 */
export interface OverlayProps extends ComponentProps {
  /** CSS selector for the target element to overlay */
  target?: string;
  /** Whether the overlay is currently visible */
  isVisible: boolean;
  /** Optional opacity level (0-1) */
  opacity?: number;
  /** Optional background color */
  backgroundColor?: string;
  /** Optional z-index for layering */
  zIndex?: number;
}

/**
 * A utility wrapper that defers the rendering of its content until they
 * are about to enter the viewport.
 */
export interface LazyLoadProps extends ComponentProps {
  /** The child components to be lazy-loaded. */
  content: ComponentProps[];
  /** A placeholder component to display while waiting for the content to load. */
  placeholder?: ComponentProps;
  /**
   * Defines how much of the element must be visible before loading,
   * from 0.0 (any pixel) to 1.0 (the whole element).
   * @default 0.1
   */
  threshold?: number;
  /**
   * A margin around the root. Can be used to start loading content
   * before it enters the viewport (e.g., '200px').
   */
  rootMargin?: string;
}
