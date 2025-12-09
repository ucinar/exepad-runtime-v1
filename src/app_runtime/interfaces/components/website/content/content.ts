// src/interfaces/content.ts

import { ComponentProps, IconProps, ImageProps, LinkProps, VideoProps, SubComponentProps, TextProps, HeadingProps } from '../../common/core'; // LinkProps restored here
import { Alignment, LayoutMode, ButtonProps, ButtonVariant } from '../../common/core';



/**
 * Animated numeric counter from start to end over duration
 */
export interface StatsCounterProps extends ComponentProps {
  /** Starting value */
  start: number;
  /** Ending value */
  end: number;
  /** Animation duration */
  duration: number;
  /** Counter label */
  label: string;
  /** Value prefix */
  prefix?: string;
  /** Value suffix */
  suffix?: string;
}

/**
 * An individual process step with icon, title, and description.
 */
export interface ProcessStepItemProps extends ComponentProps {
  /** Step icon, consistent with other components. */
  icon: IconProps; // Changed from string for consistency
  /** Step title. */
  title: HeadingProps;
  /** Step description text. */
  text: TextProps;
  /** Step number, displayed visually. */
  number?: number; // Making it optional could add flexibility
}

/**
* A data-driven component for displaying a sequence of steps.
 */
export interface ProcessStepsBlockProps extends ComponentProps {
  /** Array of the process steps to display. */
  content: ProcessStepItemProps[];
  /** The layout orientation of the steps. */
  orientation: 'vertical' | 'horizontal'; // Changed from string for type safety
  /** Whether to display connector lines between the steps. @default true */
  showConnectors?: boolean; // Changed to be more descriptive
}

/**
 * An individual timeline event with date, title, description, and optional icon
 */
export interface TimelineEventProps extends ComponentProps {
  /** Event date */
  date: string;
  /** Event title */
  title: HeadingProps;
  /** Event description text */
  text: TextProps;
  /** Event icon */
  icon: IconProps;
  /** Event media */
  media: ImageProps;
}

/**
 * Horizontal or vertical timeline of TimelineEvent blocks
 */
export interface TimelineBlockProps extends ComponentProps {
  /** Array of timeline events */
  content: TimelineEventProps[];
  /** Timeline orientation */
  orientation: string;
  /** Whether to use alternating layout */
  alternating: boolean;
}

/**
 * An individual social platform icon with link URL
 */
export interface SocialLinkProps extends ComponentProps {
  /** Social platform name */
  platform: string;
  /** Platform URL */
  url: string;
  /** Link label */
  label?: string;
}


/**
 * An individual pricing plan with name, price, features, and highlight
 */
export interface PricingPlanProps extends ComponentProps {
  /** Plan name */
  name: HeadingProps;
  /** Plan price. Use number for numeric pricing (99) or string for formatted/special pricing ("$99/mo", "Free", "Contact us"). */
  price: number | string;
  /** Billing period */
  period: string;
  /** Plan features list. Each feature should be a clear benefit statement (e.g., "Unlimited projects", "24/7 support", "Advanced analytics"). */
  features: string[];
  /** A short description of the plan */
  description?: TextProps;
  /** Whether plan is highlighted */
  highlight: boolean;
  /** Call-to-action button */
  button: ButtonProps;

}

/**
 * Comparison table of PricingPlan blocks with features and highlights
 */
export interface PricingTableProps extends ComponentProps {
  /** Array of pricing plans */
  content: PricingPlanProps[];
  /** Currency symbol */
  currency: string;
  /** Whether to show billing toggle */
  showToggle: boolean;

}

/**
 * Defines the type of content that can be rendered within a single table cell.
 * It can be a simple primitive value or a complete component configuration
 * for rich content rendering.
 */
export type CellValue = string | number | boolean | ComponentProps;

/**
 * Defines the structure for a single row of data in the table.
 * This refined structure separates the row's metadata (like `id`) from its
 * dynamic cell values to prevent TypeScript index signature conflicts.
 */
export interface TableRowData {
  /** The unique identifier for this row of data. */
  id: string;

  /**
   * An object containing the data for each cell in this row.
   * The keys of this object should correspond to the `accessorKey` of a column.
   */
  values: {
    [key: string]: CellValue;
  };
}

/**
 * Defines a single column for the comparison table, including its header,
 * data mapping, and styling options.
 */
export interface TableColumnDef extends ComponentProps {
  /**
   * The key used to access the corresponding value from a `row.values` object.
   * For example, if `accessorKey` is 'price', the table will look for `row.values.price`.
   */
  accessorKey: string;

  /** The text or component to be displayed in the column's header cell. */
  header: string | ComponentProps;

  /** Horizontal alignment for the content within the column's cells. */
  align?: 'left' | 'center' | 'right';
  
  /** Optional width for the column (e.g., '150px', '20%'). */
  width?: string;
}

/**
 * A data-driven component for creating a tabular comparison of items.
 */
export interface ComparisonTableProps extends ComponentProps {
  /** An optional title displayed above the table. */
  title?: string;

  /** An optional subtitle or description displayed below the title. */
  subtitle?: string;
  
  /** An array of column definition objects that structure the table. */
  columns: TableColumnDef[];

  /** An array of data objects, where each object represents a row. */
  rows: TableRowData[];

  /** The `accessorKey` of the column to be visually highlighted as "featured". */
  featuredColumnKey?: string;

  /** If true, the table header will remain visible while scrolling. */
  stickyHeader?: boolean;

  /** If true, the first column will remain visible during horizontal scrolling. */
  stickyFirstColumn?: boolean;

  /** If true, applies alternating background colors to rows for readability. */
  zebraStriping?: boolean;
}

/**
 * A stylized blockquote with optional author and source.
 */
export interface QuoteBlockProps extends ComponentProps {
  /** The main text of the quote. */
  quote: TextProps;
  /** Optional: The name of the person quoted. */
  author?: TextProps;
  /** Optional: The source of the quote, including its text and an optional URL. */
  source?: {
    text: string;
    sourceUrl?: string;
  };
  /** Alignment of the entire quote block. */
  alignment?: 'left' | 'center' | 'right';
}


/**
 * Render raw markdown content into HTML
 */
export interface MarkdownBlockProps extends ComponentProps {
  /** Markdown content */
  content: string;
  /** Whether to sanitize HTML */
  sanitize: boolean;
}

/**
 * Formatted code block with language syntax highlighting
 */
export interface CodeSnippetProps extends ComponentProps {
  /** Code content */
  code: string;
  /** Programming language */
  language: string;
  /** Whether to show line numbers */
  showLineNumbers?: boolean;
  /** Lines to highlight */
  highlightLines?: number[];
  /** Whether code is copyable */
  copyable?: boolean;
  /** Theme for syntax highlighting */
  theme?: 'light' | 'dark';
  /** Maximum height of the code block */
  maxHeight?: string | number;
}

/**
 * Displays contact information
 */
export interface ContactInfoBlockProps extends ComponentProps {
  /** Section title */
  title?: string;
  /** Contact address */
  address?: string;
  /** Contact phone */
  phone?: string;
  /** Contact email */
  email?: string;
  /** Map embed code - provider auto-detected from URL */
  mapEmbed?: string;
  /** Social media links */
  socialLinks?: SocialLinkProps[];
}

/**
 * Represents a single press or partner logo.
 */
export interface LogoItemProps extends ComponentProps {
  /** The name of the company or publication for accessibility (alt text). */
  name: string;

  /** The image asset for the logo. */
  logo: ImageProps;

  /** An optional URL to link the logo to. */
  url?: string;

  /** If true, the logo will be rendered in grayscale. */
  grayscale?: boolean;
}

/**
 * A specialized button component for initiating a file download.
 * It combines the functionality of a link with the appearance of a button
 * and can display associated file metadata.
 */
export interface DownloadButtonProps extends ComponentProps {
  /** The direct URL of the file to be downloaded. */
  url: string;

  /** The text to display on the button. */
  text: string;

  /** The suggested name for the file when the user saves it. */
  fileName?: string;

  /** The visual style of the button, consistent with shadcn/ui. */
  variant?: ButtonVariant;

  /** An optional icon to display within the button. */
  icon?: IconProps;

  /** Optional metadata: The type of the file (e.g., 'PDF', 'ZIP'). */
  fileType?: string;

  /** Optional metadata: The size of the file as a string (e.g., "1.2 MB"). */
  fileSize?: string;

  /** An optional handler identifier for tracking download events. */
  onDownload?: string;
}

