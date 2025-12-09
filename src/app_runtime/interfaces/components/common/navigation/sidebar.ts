import { ComponentProps, ImageProps, SubComponentProps } from "@/interfaces/components/common/core";
import { IconProps } from "@/interfaces/components/common/core";

/** A navigation link item in the sidebar with icon and label. */
export interface SidebarLinkItem extends SubComponentProps { 
  /** The type identifier for this sidebar item. */
  type: 'link'; 
  /** The display text for the link. */
  label: string; 
  /** The URL or route for the link. */
  href: string; 
  /** Icon to display alongside the label. */
  icon: IconProps; 
  /** Whether this link is currently active. */
  active?: boolean; 
}

/** A sub-item within a collapsible sidebar section. */
export interface SidebarSubItem extends SubComponentProps { 
  /** The display text for the sub-item. */
  label: string; 
  /** The URL or route for the sub-item. */
  href: string; 
  /** Whether this sub-item is currently active. */
  active?: boolean; 
}

/** A collapsible sidebar item that contains multiple sub-items. */
export interface SidebarCollapsibleItem extends SubComponentProps { 
  /** The type identifier for this sidebar item. */
  type: 'collapsible'; 
  /** The display text for the collapsible section. */
  label: string; 
  /** Icon to display alongside the label. */
  icon: IconProps; 
  /** Array of sub-items to show when expanded. */
  content: SidebarSubItem[]; 
  /** Whether this section should be expanded by default. */
  defaultOpen?: boolean; 
}

/** A heading item to organize sections in the sidebar. */
export interface SidebarHeadingItem extends SubComponentProps { 
  /** The type identifier for this sidebar item. */
  type: 'heading'; 
  /** The heading text to display. */
  label: string; 
}

/** A visual separator to divide sections in the sidebar. */
export interface SidebarSeparatorItem extends SubComponentProps { 
  /** The type identifier for this sidebar item. */
  type: 'separator'; 
}

/** Union type for all possible sidebar item types. */
export type SidebarItem = SidebarLinkItem | SidebarCollapsibleItem | SidebarHeadingItem | SidebarSeparatorItem;

/** Properties for the sidebar logo section. */
export interface SidebarLogoProps extends SubComponentProps { 
  /** Icon to display as the logo. */
  icon: IconProps; 
  /** Text to display alongside the logo. */
  text: string; 
  /** Optional link for the logo to navigate when clicked. */
  href?: string; 
}

/** Properties for the user profile section in the sidebar. */
export interface SidebarProfileProps extends SubComponentProps { 
  /** Avatar image for the user. */
  avatar: ImageProps; 
  /** User's display name. */
  name: string; 
  /** User's email address. */
  email: string; 
  /** Optional link for the profile to navigate when clicked. */
  href?: string; 
}

/** Main sidebar navigation component with logo, menu items, and optional profile. */
export interface SidebarProps extends ComponentProps {
  /** The logo configuration for the sidebar. */
  logo: SidebarLogoProps;
  /** Array of navigation items to display in the sidebar. */
  content: SidebarItem[];
  /** Optional user profile section at the bottom of the sidebar. */
  profile?: SidebarProfileProps;
  /** Whether the sidebar can be collapsed/expanded. */
  collapsible?: boolean;
  /** Whether the sidebar should start in a collapsed state. */
  defaultCollapsed?: boolean;
}