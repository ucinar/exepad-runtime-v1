// src/interfaces/feedback.ts

import { ComponentProps, Alignment, IconProps, ButtonProps, SubComponentProps, TextProps, HeadingProps } from '../core';

// --- Consolidated & Unified Types ---

/**
 * A unified set of status types for all feedback components.
 */
export type FeedbackStatusType = 'success' | 'error' | 'warning' | 'info';

/**
 * Placement options for toast notifications.
 */
export type ToastPosition =
  | 'top'
  | 'bottom'
  | 'topLeft'
  | 'topRight'
  | 'bottomLeft'
  | 'bottomRight'
  | 'topCenter'
  | 'bottomCenter';


// --- Feedback & Notification Components ---

/**
 * Transient message popup with duration.
 */
export interface ToastProps extends ComponentProps {
  /** The message text to display in the toast. */
  message: string;
  /** The type/status of the toast for styling. */
  type: FeedbackStatusType;
  /** Duration in milliseconds before the toast automatically disappears. */
  duration: number;
  /** Position where the toast should appear on screen. */
  position: ToastPosition;
  /** Optional icon to display alongside the message. */
  icon?: IconProps;
  /** Optional action button text. */
  action?: string;
  /** Handler identifier for when the action button is clicked. */
  onAction?: string;
  /** Handler identifier for when the toast is closed. */
  onClose?: string;
}

/**
 * Base properties common to all individual feedback items like alerts and notifications.
 */
export interface BaseFeedbackItemProps extends ComponentProps {
  /** The type/status of the feedback item for styling. */
  type: FeedbackStatusType;
  /** The main message content of the feedback item. */
  message: string;
  /** Optional title for the feedback item. */
  title?: string;
  /** Optional icon to display with the feedback item. */
  icon?: IconProps;
  /** Optional action button text. */
  action?: string;
  /** Handler identifier for when the action button is clicked. */
  onAction?: string;
}

/**
 * An individual alert, extending the base feedback item.
 */
export interface AlertItemProps extends BaseFeedbackItemProps {
  /** Timestamp when the alert was created. */
  timestamp: string;
  /** Whether the alert can be dismissed by the user. */
  dismissible: boolean;
  /** Handler identifier for when the alert is dismissed. */
  onDismiss?: string;
}


/**
 * Persistent banner for notifications with dismiss option.
 */
export interface NotificationBannerProps extends ComponentProps {
  /** The message text to display in the banner. */
  message: string;
  /** The type/status of the notification for styling. */
  type: FeedbackStatusType;
  /** Optional icon to display with the notification. */
  icon?: IconProps;
  /** Whether the banner can be dismissed by the user. */
  dismissible: boolean;
  /** Handler identifier for when the banner is dismissed. */
  onDismiss?: string;
}


/** Visual variants for callout styling. */
export type CalloutVariant = 'info' | 'success' | 'warning' | 'error' | 'default';

/**
 * Highlighted message box for info, warning, success, or danger.
 */
export interface CalloutProps extends ComponentProps {
  /** Optional title for the callout. */
  title?: HeadingProps;
  /** The main message content of the callout. */
  message: TextProps;
  /** Visual style variant for the callout. */
  variant?: CalloutVariant;
  /** Optional icon to display with the callout. */
  icon?: IconProps;
  /** Whether the callout can be dismissed by the user. */
  dismissible?: boolean;
  /** Handler identifier for when the callout is dismissed. */
  onDismiss?: string;
}



// --- Loading & Progress Indicators ---

/**
 * Full-page loader with message.
 */
export interface LoaderProps extends ComponentProps {
  /** The message text to display with the loader. */
  message: string;
  /** The size of the loader in pixels. */
  size: number;
  /** The color of the loader. */
  color: string;
  /** Whether to show an overlay behind the loader. */
  overlay: boolean;
}

/**
 * Linear progress indicator.
 */
export interface ProgressBarProps extends ComponentProps {
  /** The current value of the progress bar. */
  value: number;
  /** The maximum value, used to calculate the percentage. Defaults to 100. */
  max?: number;
  /** Whether to display the percentage value as text. */
  showValue?: boolean;
  /** A visual variant for different color schemes. */
  variant?: 'default' | 'success' | 'warning' | 'error';
  /** If true, the progress bar will have a striped pattern. */
  striped?: boolean;
  /** If true, the striped pattern will be animated. */
  animated?: boolean;
}
/**
 * Circular progress indicator.
 */
export interface CircularProgressProps extends ComponentProps {
  /** The current value of the progress indicator. */
  value: number;
  /** The maximum value, used to calculate the percentage. Defaults to 100. */
  max?: number;
  /** The diameter of the circle in pixels. */
  size?: number;
  /** The thickness of the progress ring in pixels. */
  thickness?: number;
  /** Whether to display the percentage value as text. */
  showValue?: boolean;
  /** A visual variant for different color schemes. */
  variant?: 'default' | 'success' | 'warning' | 'error';
}


/**
 * Placeholder for content that is loading.
 */
export interface LoadingPlaceholderProps extends ComponentProps {
  /** The shape of the placeholder. */
  type?: 'text' | 'rect' | 'circle';
  /** For 'text' type, the number of lines to render. */
  lines?: number;
  /** The width of the placeholder (e.g., '100%', 'w-32', '250px'). */
  width?: string;
  /** The height of the placeholder (e.g., '1rem', 'h-8', '250px'). */
  height?: string;
  /** The animation style for the placeholder. */
  animation?: 'pulse' | 'wave';
}


/**
 * Displays cookie consent with accept/decline callbacks.
 */
export interface CookieConsentBannerProps extends ComponentProps {
  /** The position of the banner on the screen. */
  position?: ToastPosition;
  /** The message displayed to the user. */
  message?: string;
  /** The text for the accept button. */
  acceptText?: string;
  /** The text for the decline button. */
  declineText?: string;
  /** The width of the banner, e.g., "50%". */
  width?: string;
  /** Handler identifier for when the accept button is clicked. */
  onAccept?: string;
  /** Handler identifier for when the decline button is clicked. */
  onDecline?: string;
  /** Whether to show a cookie icon. */
  showIcon?: boolean;
  /** Whether the banner can be dismissed without accepting or declining. */
  dismissible?: boolean;
  /** The key used to store the user's consent choice in localStorage. */
  storageKey?: string;
  /** The number of days until the consent expires. */
  expiryDays?: number;
}

