import { IconProps } from '../components/common/core';

/**
 * Layout options for web applications
 */
export type MenuPosition = "HeaderMenuTop" | "SidebarMenuLeft";

export type LayoutOption = "boxed" | "wide" | "narrow" | "full-width";

/**
 * app type options for web applications
 */
export type AppTypeOption = "WebAppProps";


/**
 * Language option for web applications
 */
export interface LanguageOption {
  code: string;
  nameEnglish: string;
  nameNative: string;
  isDefault: boolean;
}

/**
 * Font configuration for web applications
 */
export interface FontConfig {
  family: string;
  /** Font weight and style variant (e.g., 'regular', 'italic', '400' for regular, '700' for bold, '400italic' for italic). */
  variant: 'regular' | 'italic' | '100' | '200' | '300' | '400' | '500' | '600' | '700' | '800' | '900' | 
           '100italic' | '200italic' | '300italic' | '400italic' | '500italic' | 
           '600italic' | '700italic' | '800italic' | '900italic';
  url?: string;
}

/**
 * Chart color palette for data visualizations
 */
export interface ChartPalette {
  'chart-1'?: string;
  'chart-2'?: string;
  'chart-3'?: string;
  'chart-4'?: string;
  'chart-5'?: string;
}

/**
 * Color palette for web applications
 */
export interface ColorPalette {
  background?: string;
  foreground?: string;
  card?: string;
  'card-foreground'?: string;
  popover?: string;
  'popover-foreground'?: string;
  primary?: string;
  'primary-foreground'?: string;
  secondary?: string;
  'secondary-foreground'?: string;
  muted?: string;
  'muted-foreground'?: string;
  accent?: string;
  'accent-foreground'?: string;
  destructive?: string;
  'destructive-foreground'?: string;
  border?: string;
  input?: string;
  ring?: string;
}

/**
 * Style variables for web applications
 */
export interface StyleVariables {
  shadowSm?: string;
  shadow?: string;
  shadowMd?: string;
  shadowLg?: string;
  shadowXl?: string;
  shadow2xl?: string;
  shadowInner?: string;
  transitionDuration?: string;
  transitionTimingFunction?: string;
}

/**
 * Defines all customizable theme properties for a WebApp.
 */
export interface ThemeProps {
  light?: ColorPalette;
  dark?: ColorPalette;
  charts?: ChartPalette;
  fonts?: {
    body?: FontConfig;
    heading?: FontConfig;
  };
  /** Defines the font size for different typographic scale steps. */
  fontSizes?: {
    xs?: string;
    sm?: string;
    base?: string;
    lg?: string;
    xl?: string;
    '2xl'?: string;
    '3xl'?: string;
    '4xl'?: string;
    '5xl'?: string;
    '6xl'?: string;
    '7xl'?: string;
    '8xl'?: string;
    '9xl'?: string;
  };
  radius?: string;
  spacing?: {
    y?: string;
    x?: string;
  };
  styles?: StyleVariables;
  layout?: {
    containerWidth?: string;
    contentPadding?: string;
  };
    /** Site-wide default metadata */
    metadata?: MetadataProps;
}

/**
 * Defines the SEO and social sharing metadata for a page or the entire site.
 */
export interface MetadataProps {
  /** The title of the page or the site. */
  title?: string;
  /** The description of the page or the site. */
  description?: string;
  /** The site's favicon icon. Should be a valid icon configuration. */
  favicon?: IconProps;
  /** Comma-separated keywords. */
  keywords?: string;
  /** Open Graph metadata for social sharing. */
  openGraph?: {
    title?: string;
    description?: string;
    image?: string; // A full URL to an image
    url?: string; // The canonical URL for the page
    /** Open Graph type for social media cards. Common values: 'website' for homepages, 'article' for blog posts. */
    type?: 'website' | 'article' | 'profile' | 'book' | 'music.song' | 'music.album' | 'video.movie' | 'video.episode';
  };
}

export type AppSecondaryTypeOption = "website" | "form";

/** Base App schema */
export interface AppProps{
    /** Required unique identifier for the instance assign randomly  */
    uuid: string;

    /** Application Type */
    appType: AppTypeOption;
    
    /** Application Secondary Type */
    appSecondaryType: AppSecondaryTypeOption;

    /** Application name */
    name: string;

    /** Comprehensive summary of the application, visible to the user. This is not the SEO summary. */
    summary: string;

    /** Short summary of the application, ony one sentence, visible to the user. This is not the SEO summary. */
    shortSummary: string;
    
    /** Last updated timestamp in epoch seconds, managed by the backend */
    lastUpdatedEpoch: number;

    /** Signature of the application. */
    signature?: string;
}