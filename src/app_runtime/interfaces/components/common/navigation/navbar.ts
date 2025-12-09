import { ComponentProps, LinkProps,ImageProps,ButtonProps, SubComponentProps } from "@/interfaces/components/common/core";
import type { LayoutOption } from "../../../apps/core";

// --- Dropdown Interfaces (for simple menus) ---

/** A link item within a dropdown menu. */
export interface DropdownLink extends SubComponentProps  {
    /** The display text for the link. */
    title: string;
    /** The URL or route for the link. */
    href: string;
}

/** Properties for a simple dropdown menu with links. */
export interface DropdownProps extends SubComponentProps {
    /** Array of links to display in the dropdown. */
    content: DropdownLink[];
}

// --- Mega Menu Interfaces (for complex dropdown layouts) ---

/** A link item within a mega menu with description. */
export interface MegaMenuLink extends SubComponentProps {
    /** The display text for the link. */
    title: string;
    /** The URL or route for the link. */
    href: string;
    /** Descriptive text for the link. */
    description: string;
}

/** A featured item in a mega menu, typically highlighted. */
export interface MegaMenuFeaturedItem extends SubComponentProps {
    /** The display text for the featured item. */
    title: string;
    /** The URL or route for the featured item. */
    href: string;
    /** Descriptive text for the featured item. */
    description: string;
}

/** Properties for a complex mega menu with multiple columns. */
export interface MegaMenuProps extends SubComponentProps {
    /** Number of columns to display the menu items in. */
    columns: number;
    /** Array of links to display in the mega menu. */
    content: MegaMenuLink[];
    /** Optional featured item to highlight in the menu. */
    featuredItem?: MegaMenuFeaturedItem;
}

// --- Navigation Menu Item Interfaces ---

/** A navigation menu item that renders as a simple link. */
export interface MenuLinkItemProps extends SubComponentProps {
    /** The type identifier for this menu item. */
    type: 'link';
    /** The display text for the link. */
    label: string;
    /** The link properties including URL and target. */
    href: LinkProps;
    /** Whether this menu item is currently active. */
    active?: boolean;
}

/** A navigation menu item that renders as a button. */
export interface MenuButtonItemProps extends SubComponentProps {
    /** The type identifier for this menu item. */
    type: 'button';
    /** The button properties and configuration. */
    button: ButtonProps;
}

/** A navigation menu item that renders as a dropdown menu. */
export interface MenuDropdownItemProps extends SubComponentProps {
    /** The type identifier for this menu item. */
    type: 'dropdown';
    /** The display text for the dropdown trigger. */
    label: string;
    /** The dropdown menu configuration. */
    dropdown: DropdownProps;
}

/** A navigation menu item that renders as a mega menu. */
export interface MenuMegaItemProps extends SubComponentProps {
    /** The type identifier for this menu item. */
    type: 'mega';
    /** The display text for the mega menu trigger. */
    label: string;
    /** The mega menu configuration. */
    megaMenu: MegaMenuProps;
}

/** A navigation menu item that renders custom content. */
export interface MenuCustomContentItemProps extends SubComponentProps {
    /** The type identifier for this menu item. */
    type: 'custom';
    /** The custom component to render. */
    content: ComponentProps;
}

/** Union type for all possible navigation menu item types. */
export type NavigationMenuItem = 
    | MenuLinkItemProps 
    | MenuButtonItemProps 
    | MenuDropdownItemProps 
    | MenuMegaItemProps 
    | MenuCustomContentItemProps;

// --- Navbar Interfaces ---

/** Properties for the navbar logo, which can be an image or text. */
export interface NavbarLogoProps extends SubComponentProps { 
  /** Whether the logo is an image or text. */
  type: 'image' | 'text'; 
  /** Image to display when type is 'image'. */
  image?: ImageProps; 
  /** Text to display when type is 'text'. */
  text?: string; 
  /** Optional link for the logo to navigate when clicked. */
  href?: LinkProps; 
}

// --- Navbar Props ---

/** Main navigation bar component with logo, menu items, and various styling options. */
export interface NavbarProps extends ComponentProps {
  /** The logo configuration for the navbar. */
  logo: NavbarLogoProps;
  /** Array of navigation menu items to display. */
  content: NavigationMenuItem[];
  /** Visual layout variant for the navbar. */
  variant?: 'default' | 'split' | 'centerLogo';
  /** Position of the navbar on the page. */
  position?: 'top' | 'bottom';
  /** Whether the navbar should stick to its position when scrolling. */
  sticky?: boolean;
  /** Layout configuration option for the navbar. */
  layout?: LayoutOption;
  /** Whether to render as a header wrapper (default: true). */
  asWrapper?: boolean;
  /** Visual style variant for menu items. */
  menuVariant?: 'default' | 'pill' | 'underline' | 'lift' | 'scale' | 'none';
  /** Animation duration for menu interactions in milliseconds. */
  menuAnimationDuration?: 150 | 200 | 300 | 500 | 700 | 1000;
  /** Animation delay for menu interactions in milliseconds. */
  menuAnimationDelay?: 0 | 75 | 100 | 150 | 200 | 300;
  /** Additional CSS classes for menu styling. */
  menuClasses?: string;
  /** CSS classes for menu item borders. */
  menuBorderClasses?: string;
  /** CSS classes for menu item hover effects. */
  menuHoverClasses?: string;
  /** CSS classes for active menu items. */
  menuActiveClasses?: string;
}