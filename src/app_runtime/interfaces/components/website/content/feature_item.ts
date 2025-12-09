import { ComponentProps, IconProps, LinkProps, ImageProps, SubComponentProps, TextProps, HeadingProps } from '../../common/core';
import { GridProps } from '../../common/layout/layout';

// --------------------------------------------------------------------------
// 1. INDIVIDUAL FEATURE ITEM PROPS
// These are the building blocks for any feature section. Each represents
// a different type of feature that can be displayed.
// --------------------------------------------------------------------------

/** A standard feature with an icon, title, and text. */
export interface StandardFeatureProps extends ComponentProps {
    variant: 'standard';
    /** Internal layout of the feature content. */
    layout?: 'iconTopCenter' | 'iconTopLeft' | 'iconLeft' | 'iconRight';
    style?: 'default' | 'card' | 'bordered';
    size?: 'sm' | 'md' | 'lg';
    icon?: IconProps;
    title: HeadingProps;
    text: TextProps;
    link?: LinkProps;
}
  
/** An item within a checklist feature. */
export interface ChecklistItemProps extends ComponentProps {
    text: TextProps;
    icon?: IconProps;
    link?: LinkProps;
    checked?: boolean;
    defaultItemIcon?: IconProps;
}

/** A feature that displays a checklist of items. */
export interface ChecklistFeatureProps extends ComponentProps {
    variant: 'checklist';
    icon?: IconProps;
    title: HeadingProps;
    text?: TextProps;
    defaultItemIcon: IconProps;
    content: ChecklistItemProps[];
}
  
/** A clickable link card with a colored side-bar and eyebrow text. */
export interface LinkCardFeatureProps extends ComponentProps {
    variant: 'linkCard';
    href: string;
    eyebrowText: TextProps;
    title: HeadingProps;
    color: string;
}
  
/** An individual metric/statistic block for displaying a single KPI. */
export interface MetricFeatureProps extends ComponentProps {
    variant: 'metric';
    label: TextProps;
    /** Metric value. Use number for raw values (1000) or string for formatted values ("1,000", "1K", "99.9%"). */
    value: number | string;
    unit?: string;
    icon?: IconProps;
    trend?: {
      direction: 'up' | 'down' | 'neutral';
      value: string;
    };
}
  
/** A union of all possible feature types. */
export type FeatureItemProps = StandardFeatureProps | ChecklistFeatureProps | LinkCardFeatureProps | MetricFeatureProps;
