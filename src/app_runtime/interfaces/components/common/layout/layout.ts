// src/interfaces/layout.ts

import { ComponentProps, ImageProps, VideoProps, SubComponentProps, HeadingProps, TextProps, LinkProps } from '../core';
import * as React from 'react';

// --- Type Definitions for Layout Properties ---

/**
 * Flexbox justify-content options
 */
export type JustifyContent = 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly';

/**
 * Flexbox align-items options
 */
export type AlignItems = 'start' | 'center' | 'end' | 'stretch' | 'baseline';

/**
 * Direction for flex layouts
 */
export type FlexDirection = 'row' | 'column' | 'rowReverse' | 'columnReverse';

/**
 * Direction for SplitPane
 */
export type SplitDirection = 'horizontal' | 'vertical';


// --- Core Layout Building Blocks ---
/**
 * A section is a container for a group of components.
 */
export interface SectionProps extends ComponentProps {
  /** A slug for the section. */
  sectionSlug: string;
  
  /** An optional title rendered at the top of the section. */
  title?: string;

  /** An array of components from your catalog to be rendered inside this section. */
  content: ComponentProps[];

  /** Optional background settings for the entire section. */
  background?: {
    image?: ImageProps;
    video?: VideoProps;
    color?: string; // e.g., 'bg-muted'
    overlayColor?: string; // e.g., 'rgba(0, 0, 0, 0.5)'
  };

  /** * Defines the overall layout structure for the content within the section.
   * This has been expanded to support more complex and common layouts.
   */
  layout?: 
    | 'singleColumnCentered' // For centered text, like a classic hero
    | 'singleColumnWide'     // For full-width content like a feature grid
    | 'twoColumnEven'        // A 50/50 split
    | 'threeColumnEven'      // A 33/33/33 split
    | 'fourColumnEven'       // A 25/25/25/25 split
    | 'twoColumnSidebarLeft'  // A smaller left column (e.g., 1/3) and larger right
    | 'twoColumnSidebarRight'; // A larger left column and smaller right

  /** Whether this section should bleed to viewport edges */
  contentBleed?: boolean;

  /** Controls the vertical padding of the section. */
  spacing?: 'sm' | 'md' | 'lg' | 'xl';

  /** Whether the section should take up the full viewport height. */
  fullHeight?: boolean;
    
  /** Parallax speed */
  speed?: number;
    
  /** Whether to enable parallax effect */
  parallax?: boolean;
}

/**
 * Unified flexbox container with comprehensive layout options.
 * This is the primary tool for arranging items in a single dimension.
 */
export interface FlexProps extends ComponentProps {
  /** Array of child components to be laid out. */
  content?: ComponentProps[];
  /** Flex direction. */
  direction?: FlexDirection;
  /** Whether flex items should wrap. */
  wrap?: 'nowrap' | 'wrap' | 'wrapReverse';
  /** Justify content alignment. */
  justify?: JustifyContent;
  /** Align items alignment. */
  align?: AlignItems;
  /** Gap between items (e.g., '4', '8', 'sm', 'md'). */
  gap?: string;
}

/**
 * Unified grid layout with responsive options and gap control.
 * The primary tool for creating two-dimensional layouts.
 */
export interface GridProps extends ComponentProps {
  /** Array of child components to be placed in the grid. */
  content: ComponentProps[];
  /** Number of columns. */
  columns: number;
  /** Number of rows (optional). */
  rows?: number;
  /** Horizontal gap. */
  gapX?: string;
  /** Vertical gap. */
  gapY?: string;
  /** Unified gap for both X and Y directions. Takes precedence over gapX/gapY if specified. */
  gap?: string;
}


// --- Specialized Layout Components & Wrappers ---

/**
 * Header section of a card, containing title, description, and optional actions.
 */
export interface CardHeaderProps extends SubComponentProps {
  /** The card's title. */
  title?: HeadingProps;
  
  /** Optional description text below the title. */
  description?: TextProps;
  
  /** Optional action component(s) in the header (e.g., buttons, links, icons). */
  actions?: ComponentProps[];
}

/**
 * A generic card container component inspired by shadcn/ui.
 * Provides structured sections (header, content, footer) with flexible styling.
 * This is a fundamental building block that can contain any other components.
 */
export interface CardProps extends ComponentProps {
  /** Optional header section with title, description, and actions. */
  header?: CardHeaderProps;
  
  /** The main content area of the card. */
  content: ComponentProps[];
  
  /** Optional footer section (e.g., actions, metadata). */
  footer?: ComponentProps[];
  
  /** Visual style variant of the card. */
  variant?: 'default' | 'outlined' | 'filled' | 'elevated';
  
  /** Size/padding preset for the card. */
  size?: 'sm' | 'md' | 'lg';
  
  /** Whether the card should be clickable/interactive (adds hover effects). */
  interactive?: boolean;
  
  /** Optional link properties (makes the entire card a link). */
  link?: LinkProps;
  
  /** Shadow/elevation level (0 = none, 1 = sm, 2 = md, 3 = lg). */
  elevation?: 0 | 1 | 2 | 3;
  
  /** Border radius size. */
  radius?: 'none' | 'sm' | 'md' | 'lg' | 'full';
  
  /** Background color/class. */
  backgroundColor?: string;
  
  /** Border color/class (when variant is 'outlined'). */
  borderColor?: string;
}

/**
 * Maintains a fixed aspect ratio for its child.
 */
export interface AspectRatioProps extends ComponentProps {
  /** Aspect ratio value (e.g., '16 / 9', '1 / 1'). */
  ratio: string;
  /** The single child component. */
  content: ComponentProps;
}

/**
 * A utility component that centers its content horizontally and vertically.
 */
export interface CenterProps extends ComponentProps {
  /** Array of child components to be centered. */
  content: ComponentProps[];
}

/**
 * A container that provides a user-resizable splitter between its content.
 */
export interface SplitPaneProps extends ComponentProps {
  /** The direction of the split. */
  direction: SplitDirection;
  /** The components to be placed in each pane. */
  content: [ComponentProps, ComponentProps];
  /** Initial sizes for each pane as percentages (e.g., [50, 50]). */
  initialSizes?: number[];
  /** Minimum sizes for each pane in pixels (e.g., ['100px', '200px']). */
  minSizes?: string[];
}

/**
 * A layout that arranges items in a "Pinterest-style" masonry grid.
 */
export interface MasonryLayoutProps extends ComponentProps {
  /** The components to be laid out. */
  content: ComponentProps[];
  /** The number of columns in the grid. */
  columnCount: number;
  /** The spacing between items. */
  gutter?: string;
}

/**
 * A container that makes its content scrollable when it overflows.
 */
export interface OverflowContainerProps extends ComponentProps {
  /** The components to be placed inside the container. */
  content: ComponentProps[];
  /** Horizontal overflow behavior. */
  overflowX?: 'auto' | 'hidden' | 'scroll' | 'visible';
  /** Vertical overflow behavior. */
  overflowY?: 'auto' | 'hidden' | 'scroll' | 'visible';
}

/**
 * A box that can be resized by the user.
 */
export interface ResizableBoxProps extends ComponentProps {
  /** The components inside the resizable box. */
  content: ComponentProps[];
  /** Minimum width. */
  minWidth?: string;
  /** Minimum height. */
  minHeight?: string;
  /** Maximum width. */
  maxWidth?: string;
  /** Maximum height. */
  maxHeight?: string;
}


// --- Advanced & JSON-Compatible Virtualized List ---

/**
 * An individual data item for the virtualized list.
 * It holds the specific data for a single item in the list.
 */
export interface VirtualListItemData extends ComponentProps {
  // This allows for any data properties needed for an item, e.g.,
  // "title": "My List Item",
  // "description": "Some details here.",
  // "imageUrl": "/images/item.png"
  [key: string]: any;
}

/**
 * Renders a large list of items efficiently using virtualization.
 * This version is fully JSON-serializable.
 */
export interface VirtualListProps extends ComponentProps {
  /** The array of data objects to be rendered in the list. */
  content: VirtualListItemData[];
  
  /** * A template component configuration that defines how each item in the list
   * should be rendered. The VirtualList will merge each item's data into this template.
   */
  itemTemplate: ComponentProps;
  
  /** Height of each item in pixels. */
  itemHeight: number;
  
  /** Height of the scrollable container. Use number for pixels (500) or string for CSS values ("500px", "50vh"). */
  containerHeight: number | string;
  
  /** Number of items to render outside the visible area for smoother scrolling. */
  overscanCount?: number;
}


/**
 * A generic, data-driven carousel component for displaying a slidable
 * collection of any other components. This is a low-level layout primitive.
 */
export interface CarouselProps extends ComponentProps {
  /** An array of any components to be rendered as individual slides. */
  content: ComponentProps[];

  /** Whether the carousel should automatically transition between slides. @default false */
  autoplay?: boolean;

  /** The time in milliseconds between slides when autoplay is enabled. @default 5000 */
  interval?: number;

  /** Whether to display next/previous navigation arrows. @default true */
  showControls?: boolean;

  /** Whether to display dot indicators for each slide. @default true */
  showIndicators?: boolean;

  /** The number of slides to show at once in the viewport. @default 1 */
  slidesPerView?: number;

  /** The spacing between slides (e.g., '1rem', '16'). */
  gap?: string;

  /** Whether the carousel should loop back to the beginning after the last slide. @default true */
  loop?: boolean;
}


// --------------------------------------------------------------------------
// 1. ACCORDION ITEM DEFINITION
// Defines the structure for a single, collapsible item within the accordion.
// --------------------------------------------------------------------------

/**
 * Defines a single collapsible item for the Accordion component.
 * It consists of a trigger (the clickable header) and the content
 * that is revealed when the trigger is activated.
 */
export interface AccordionItemProps extends SubComponentProps {
  /** * The component(s) to be rendered in the accordion trigger. 
   * This is typically a Text, Heading, or a Flex component with an icon.
   */
  trigger: ComponentProps[];

  /** * An array of any components to be rendered inside the collapsible panel.
   */
  content: ComponentProps[];
}


// --------------------------------------------------------------------------
// 2. ACCORDION LAYOUT COMPONENT
// The primary component that brings together accordion items and options.
// --------------------------------------------------------------------------

/**
 * A generic, data-driven layout component that displays a vertically
 * stacked list of interactive, collapsible panels.
 */
export interface AccordionProps extends ComponentProps {
  /** An array of the accordion items to be displayed. */
  content: AccordionItemProps[];

  /**
   * Determines the accordion's behavior.
   * - `single`: Allows only one item to be open at a time.
   * - `multiple`: Allows multiple items to be open simultaneously.
   * @default 'single'
   */
  type?: 'single' | 'multiple';

  /**
   * The `uuid` of the item (or an array of `uuid`s for 'multiple' type)
   * that should be open by default when the component loads.
   */
  defaultValue?: string | string[];

  /**
   * When `type` is 'single', allows the currently open item to be collapsed
   * by clicking its trigger again.
   * @default false
   */
  collapsible?: boolean;

  /**
   * Defines the visual style of the accordion.
   * - `default`: Standard style with borders between items.
   * - `flush`: A borderless style where items are flush against each other.
   * @default 'default'
   */
  style?: 'default' | 'flush';
}

