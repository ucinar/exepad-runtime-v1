import { ComponentProps, ImageProps, TextProps, HeadingProps } from '../../common/core';

/**
 * Represents a single testimonial item with author details, text, and an
 * optional rating. This is the atomic unit for all testimonial layouts.
 */
export interface TestimonialItemProps extends ComponentProps {
  /** The main text content of the testimonial. */
  text: TextProps;

  /** The name of the person who gave the testimonial. */
  author: TextProps;
  
  /** An optional title for the testimonial itself (e.g., "A true time-saver!"). */
  title?: HeadingProps;

  /** An optional job title or company for the author (e.g., "CEO, Acme Inc."). */
  authorTitle?: TextProps;

  /** An optional avatar image for the author. */
  avatar?: ImageProps;
  
  /** An optional star rating, typically on a scale of 1 to 5. */
  rating?: number;

  /**
   * Defines the visual style of the testimonial item itself. This allows for
   * different presentations of the same data.
   * - `card`: The default style, contained within a bordered card.
   * - `quote`: A minimalist style, often with a large quote icon above the text.
   * - `inline`: A simple style with no card or prominent icons, for cleaner layouts.
   * @default 'card'
   */
  style?: 'card' | 'quote' | 'inline';
}
