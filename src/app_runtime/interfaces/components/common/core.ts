// src/interfaces/core.ts


/**
 * Every UI component may accept common props like `classes`.
 */
export interface ComponentProps {
  /** Required unique identifier for the component instance*/
  uuid: string;

  /** Type of the component */
  componentType: string;

  /** Last updated timestamp in epoch seconds, managed by the backend */
  lastUpdatedEpoch?: number;

  /** Optional styling hook (e.g. additional CSS classes) */
  classes?: string;

  /** Signature of the component. */
  signature?: string;
}

/**
 * SubComponentProps is a component that is a subcomponent of a parent component.
 * it cannot be used as a standalone component.
 */
export interface SubComponentProps extends ComponentProps {

}


/**
 * Text or element alignment options
 */
export type Alignment = 'left' | 'right' | 'top' | 'bottom' | 'center' | 'justify';

/**
 * Layout display modes
 */
export type LayoutMode = 'grid' | 'list' | 'cards';

// Re-using the ButtonProps variant type for consistency
export type ButtonVariant = 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';


/**
 * Simple text block for arbitrary content
 */
export interface TextProps extends ComponentProps {
  /** Arbitrary text content */
  content: string;
  /** Variant for text styling */
  variant?: 'default' | 'lead' | 'large' | 'small' | 'muted';
  /** HTML element to render */
  as?: 'p' | 'span' | 'div';
  /** Whether to sanitize markdown content for security (default: true) */
  sanitize?: boolean;
}

/**
 * Semantic heading with level 1–6 and text
 */
export interface HeadingProps extends ComponentProps {
  /** Heading level (1–6) */
  level: number;
  /** Heading text */
  text: string;
  /** Whether to sanitize markdown content for security (default: true) */
  sanitize?: boolean;
}


/**
 * Anchor element with href, text, and target
 */
export interface LinkProps extends ComponentProps {
  /** URL or route for the link */
  href: string;
  /** Link text content */
  text: string;
  /** Target attribute, e.g. "_blank" | "_self" */
  target?: string;
}

/**
 * Clickable button with type, handler, and disabled state,
 * now with support for optional icons.
 */
export interface ButtonProps extends ComponentProps {
  /** Button label text */
  text: string;
  /** Handler identifier for click events */
  onClick?: string;
  /** Link to navigate to when the button is clicked */
  link?: LinkProps;
  /** Button type: determines form submission behavior. */
  type?: 'button' | 'submit' | 'reset';
  /** Button variant: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link" */
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'; 
  /** Button size: "default" | "sm" | "lg" | "icon" */
  size?: 'default' | 'sm' | 'lg' | 'icon';
  /** Button classes */
  classes?: string;
  /** Whether the button is disabled */
  disabled?: boolean;
  /** An optional icon to display within the button. */
  icon?: IconProps;
  /** The position of the icon relative to the text. @default 'left' */
  iconPosition?: 'left' | 'right';
}

/**
 * Icon by name and size
 */
export interface IconProps extends ComponentProps {
  /** Icon identifier */
  name: string;
  /** Pixel size of the icon */
  size: number;
}

/**
 * Stores metadata for an image asset, like its origin and processing state. Set keywords field properly. Fill all required fields, leave the optional fields
 */
export interface ImageAssetProps extends ComponentProps {
  /** Assign to false on creation. */
  isProcessed: boolean;

  /** A list of comma-separated keywords for image generation or search. Use 5-8 keywords describing the desired image asset. IT MUST BE IN ENGLISH. DO NOT USE ANYTHING ELSE THAN ENGLISH FOR THIS FIELD.*/
  keywords: string;

  /** Requested width, it will be used to query image provider */
  requestedWidth: number;

  /** Requested height, it will be used to query image provider */
  requestedHeight: number;

  /** Source platform or provider of the image */
  provider?: string;

  /** Unique ID of the image from the provider.*/
  providerImgId?: string;

  /** URL the image from the provider.*/
  providerImgUrl?: string;

  /** datetime string when the image was generated. */
  datetimeGenerated?: string;

}

/**
 * Defines an image component for display, including source and dimensions.
 */
export interface ImageProps extends ComponentProps {
  /** Contains the detailed metadata of the image asset. */
  asset: ImageAssetProps;
  /** Image URL. Use "#" as a placeholder if the URL is not yet known. */
  src: string;
  /** Alt text for image accessibility. */
  alt: string;
  /** Optional display width in pixels. */
  width?: number;
  /** Optional display height in pixels. */
  height?: number;
  /** Optional CSS classes for custom styling. */
  classes?: string;
  /** * Defines the hover effect for the image.
   * 'darken': Applies a dark overlay.
   * 'zoom': Scales the image up slightly.
   * 'grayscale': Converts the image to black and white.
   * 'blur': Applies a slight blur.
   * 'brightness': Increases the image brightness.
   * 'lift': Adds a shadow to give a "lifting" effect.
   * 'none': No effect.
   */
  hoverEffect?: 'darken' | 'zoom' | 'grayscale' | 'blur' | 'brightness' | 'lift' | 'none';
}

/**
 * Video element supporting on-server files, YouTube, and Vimeo playback
 */
export interface VideoProps extends ComponentProps {
  /** File URL or YouTube/Vimeo video ID */
  source: string;
  /** Source type */
  provider: 'file' | 'youtube' | 'vimeo';
  /** Optional poster image URL */
  poster?: ImageProps;
  /** Whether to show native controls */
  controls: boolean;
  /** Whether to autoplay the video */
  autoplay: boolean;
  /** Whether to loop playback */
  loop: boolean;
  /** Whether audio is muted */
  muted: boolean;
  /** Start time in seconds (YouTube/Vimeo) */
  startTime?: number;
  /** End time in seconds (YouTube/Vimeo) */
  endTime?: number;
  /** Video width in pixels (optional) */
  width?: number;
  /** Video height in pixels (optional) */
  height?: number;
  /** Handler when playback starts */
  onPlay?: string;
  /** Handler when playback pauses */
  onPause?: string;
  /** Handler when playback ends */
  onEnd?: string;
}

/**
 * Audio element supporting on-server files and streaming with standard controls
 */
export interface AudioProps extends ComponentProps {
  /** File URL or streaming source */
  source: string;
  /** Whether to show native controls */
  controls: boolean;
  /** Whether to autoplay audio */
  autoplay: boolean;
  /** Whether to loop playback */
  loop: boolean;
  /** Whether audio is muted */
  muted: boolean;
  /** Initial volume level (0–1) */
  volume?: number;
  /** Handler when playback starts */
  onPlay?: string;
  /** Handler when playback pauses */
  onPause?: string;
  /** Handler when playback ends */
  onEnd?: string;
}

/**
 * Horizontal or vertical line divider
 */
export interface DividerProps extends ComponentProps {
  /** * The orientation of the divider.
   * @default 'horizontal'
   */
  orientation?: 'horizontal' | 'vertical';
  /** * The thickness of the divider (e.g., "1px").
   * @default '1px'
   */
  thickness?: string;
  /** * The color of the divider. Defaults to the theme's border color.
   */
  color?: string;
}

/**
 * Empty space of defined size
 */
export interface SpacerProps extends ComponentProps {
  /** Space size (e.g. "1rem" | "py-4") */
  size: string;
}

/**
 * Small status badge with variant styling
 */
export interface BadgeProps extends ComponentProps {
  /** Badge content text */
  content: string;
  /** Variant styling (e.g. "success" | "warning") */
  variant?: 'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning';
  /** Whether to sanitize markdown content for security (default: true) */
  sanitize?: boolean;
}

/**
 * Label tag with removable option
 */
export interface TagProps extends ComponentProps {
  /** Label text */
  label: string;
  /** Tag color */
  color?: 'gray' | 'blue' | 'green' | 'red' | 'yellow';
  /** Whether the tag is removable */
  removable: boolean;
  /** Handler when tag is removed */
  onRemove?: string;
}

/**
 * User avatar image with name fallback
 */
export interface AvatarProps extends ComponentProps {
  /** Image source URL */
  image?: ImageProps;
  /** User name for fallback initials */
  name: string;
  /** Avatar size in pixels */
  size: number;
}

/**
 * Loading indicator with size and color
 */
export interface SpinnerProps extends ComponentProps {
  /** Spinner size in pixels */
  size: number;
  /** Spinner color */
  color: string;
}

/**
 * Placeholder skeleton for content loading states
 */
export interface SkeletonProps extends ComponentProps {
  /** Skeleton width (e.g. "100px" | "w-full") */
  width: string;
  /** Skeleton height (e.g. "1rem" | "h-4") */
  height: string;
}
