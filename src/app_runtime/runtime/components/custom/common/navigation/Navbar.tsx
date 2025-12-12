"use client";

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn, filterDOMProps, getHref } from '@/lib/utils';
import { getLayoutClasses } from '@/utils/layoutPatterns';
import type { LayoutOption } from '@/interfaces/apps/core';

import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuIndicator,
  NavigationMenuItem as NavMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  NavigationMenuViewport,
  navigationMenuTriggerStyle,
} from '@/runtime/components/ui/navigation-menu';

import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose,
} from '@/runtime/components/ui/sheet';

import { Button } from '@/runtime/components/ui/button';
import { Menu, ChevronDown } from 'lucide-react';
import { DynamicRenderer } from '@/components/DynamicRenderer';
import { useAppContext } from '@/context/AppContext';

import { 
  NavbarProps, 
  NavbarLogoProps, 
  NavigationMenuItem,
  MenuLinkItemProps,
  MenuButtonItemProps,
  MenuDropdownItemProps,
  MenuMegaItemProps,
  MenuCustomContentItemProps,
} from '@/interfaces/components/common/navigation/navbar';

// --- SUB-COMPONENTS ---

const NavbarLogo: React.FC<NavbarLogoProps & { basePath?: string }> = ({ type, image, text, href, basePath = "" }) => {
  const content = type === 'image' && image
    ? <img src={image.src} alt={image.alt} className="h-8 w-auto" />
    : <span className="text-xl font-bold">{text || 'Logo'}</span>;

  if (href) {
    return (
      <Link href={getHref(href.href, basePath)} className="flex-shrink-0">
        {content}
      </Link>
    );
  }
  return <div className="flex-shrink-0">{content}</div>;
};

const ListItem = React.forwardRef<
  React.ElementRef<'a'>,
  React.ComponentPropsWithoutRef<typeof Link> & { title: string; basePath?: string }
>(({ className, title, children, href, basePath = "", ...props }, ref) => {
  return (
    <li>
      <NavigationMenuLink asChild>
        <Link
          href={getHref(href as string, basePath)}
          ref={ref}
          className={cn(
            "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
            className
          )}
          {...props}
        >
          <div className="text-sm font-medium leading-none">{title}</div>
          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
            {children}
          </p>
        </Link>
      </NavigationMenuLink>
    </li>
  );
});
ListItem.displayName = 'ListItem';

// --- NAVBAR COMPONENT ---

export const Navbar: React.FC<NavbarProps & { pageLayout?: LayoutOption }> = ({
  logo,
  content = [],
  variant = 'default',
  position = 'top',
  sticky = false,
  layout,        // Navbar's own layout override
  pageLayout,    // Layout inherited from page (if passed)
  classes,
  asWrapper = true, // Default to true for backward compatibility
  menuVariant = 'default',
  menuAnimationDuration = 300,
  menuAnimationDelay = 0,
  menuClasses = '',
  menuBorderClasses = '',
  menuHoverClasses = '',
  menuActiveClasses = '',
  // Destructure component-specific props to prevent them from being spread to DOM
  componentType,
  uuid,
  ...restProps
}) => {
  const { basePath } = useAppContext();
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const [scrolled, setScrolled] = React.useState(false);

  // Helper function to determine if a link is active
  const isLinkActive = (href: string) => {
    // Remove basePath from pathname for comparison
    const currentPath = pathname.replace(basePath, '') || '/';
    return currentPath === href;
  };

  React.useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    if (sticky) {
      window.addEventListener('scroll', handleScroll, { passive: true });
      return () => window.removeEventListener('scroll', handleScroll);
    }
  }, [sticky]);

  const navbarClasses = React.useMemo(() => cn(
    'w-full z-50 transition-all duration-300',
    // Only apply sticky positioning if not inside a header wrapper (asWrapper === true)
    sticky && asWrapper ? 'sticky' : 'relative',
    position === 'top' ? 'top-0' : 'bottom-0',
    scrolled && sticky && asWrapper ? 'shadow-md bg-background/95 backdrop-blur-sm' : 'bg-background',
    classes
  ), [classes, position, sticky, scrolled, asWrapper]);

  // Use layout inheritance: navbar layout -> page layout -> 'boxed' default
  const navbarLayoutClasses = pageLayout && !layout 
    ? getLayoutClasses(undefined, pageLayout)  // Use page layout if no navbar layout
    : layout 
      ? getLayoutClasses(layout, pageLayout)   // Use navbar layout with page fallback
      : 'w-full px-4 sm:px-6 lg:px-8';          // Default to current behavior
  
  // For navbar content, we always want padding even with full-width backgrounds
  // Full-width layouts get width classes but we add padding for content spacing
  const getNavbarContentClasses = () => {
    // Check if this is exactly the full-width layout (w-full only, no container)
    if (navbarLayoutClasses === 'w-full') {
      // Full-width layout: keep full width but add content padding
      return 'w-full px-4 sm:px-6 lg:px-8';
    }
    // For all other layouts (wide, boxed, narrow), use the layout classes as-is
    // since they already include proper container and padding classes
    return navbarLayoutClasses;
  };
  
  // Replace hardcoded containerClasses with dynamic layout classes
  const containerClasses = cn(
    getNavbarContentClasses(),
    'flex h-16 items-center'
  );

  // Helper function to get menu item base classes based on variant
  const getMenuItemClasses = (isActive: boolean = false) => {
    const baseClasses = 'relative inline-flex items-center transition-all';
    
    switch (menuVariant) {
      case 'pill':
        return cn(
          baseClasses,
          'rounded-full px-5 py-2.5 mx-1',
          menuClasses || 'hover:bg-accent hover:text-accent-foreground',
          isActive && (menuActiveClasses || 'bg-primary text-primary-foreground')
        );
      
      case 'underline':
        return cn(
          baseClasses,
          'px-4 py-2 pb-1', // Add extra bottom padding for underline
          menuClasses || 'hover:text-primary',
          isActive && (menuActiveClasses || 'text-primary font-medium')
        );
      
      case 'lift':
        return cn(
          baseClasses,
          'px-4 py-2 transform',
          menuClasses || 'hover:-translate-y-1 hover:text-primary',
          isActive && (menuActiveClasses || 'text-primary -translate-y-0.5 font-medium')
        );
      
      case 'scale':
        return cn(
          baseClasses,
          'px-4 py-2 transform origin-center',
          menuClasses || 'hover:scale-110 hover:text-primary',
          isActive && (menuActiveClasses || 'text-primary scale-105 font-medium')
        );
      
      case 'none':
        return cn(baseClasses, 'px-4 py-2', menuClasses);
      
      default: // 'default'
        return cn(
          navigationMenuTriggerStyle(),
          isActive && "bg-accent text-accent-foreground",
          menuClasses
        );
    }
  };

  // Helper function to get animation classes
  const getAnimationClasses = () => {
    if (menuVariant === 'none' || menuVariant === 'default') return '';
    
    // Use predefined duration classes for Tailwind CSS purging
    const durationClass = `duration-${menuAnimationDuration}`;
    const delayClass = menuAnimationDelay > 0 ? `delay-${menuAnimationDelay}` : '';
    
    return cn('transition-all', durationClass, delayClass);
  };

  // Helper function to create underline element
  const createUnderlineElement = (isActive: boolean, isHovered: boolean) => {
    if (menuVariant !== 'underline') return null;
    
    return (
      <span 
        className={cn(
          'absolute bottom-0 left-0 right-0 h-0.5 transform origin-center transition-transform',
          getAnimationClasses(),
          (isActive || isHovered) ? 'scale-x-100' : 'scale-x-0',
          menuBorderClasses || 'bg-current'
        )}
      />
    );
  };

  // Custom Link component with isolated hover state
  const NavLink: React.FC<{
    href: string;
    isActive: boolean;
    className: string;
    children: React.ReactNode;
  }> = ({ href, isActive, className, children }) => {
    const [isHovered, setIsHovered] = React.useState(false);
    
    return (
      <Link
        href={href}
        className={className}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <span className="relative z-10">{children}</span>
        {createUnderlineElement(isActive, isHovered)}
      </Link>
    );
  };

  const renderNavigationItem = (item: NavigationMenuItem, index: number) => {
    const key = item.uuid || `nav-${index}`;

    switch (item.type) {
      case 'link':
        const isActive = isLinkActive(item.href.href);
        
        return (
          <NavMenuItem key={key}>
            <NavigationMenuLink asChild>
              <NavLink
                href={getHref(item.href.href, basePath)}
                isActive={isActive}
                className={cn(
                  "relative inline-flex items-center overflow-hidden", 
                  getMenuItemClasses(isActive),
                  getAnimationClasses(),
                  menuHoverClasses
                )}
              >
                {item.label}
              </NavLink>
            </NavigationMenuLink>
          </NavMenuItem>
        );

      case 'button':
        // item.button is already of type ButtonProps, which is what DynamicRenderer expects.
        // The Button component itself will handle basePath for the link.
        return (
          <NavMenuItem key={key} className="ml-2">
            <DynamicRenderer component={item.button} />
          </NavMenuItem>
        );

      case 'dropdown':
        const [isDropdownHovered, setIsDropdownHovered] = React.useState(false);
        
        return (
          <NavMenuItem key={key}>
            <NavigationMenuTrigger 
              className={cn("relative inline-flex items-center overflow-hidden", getMenuItemClasses(false), menuHoverClasses)}
              onMouseEnter={() => setIsDropdownHovered(true)}
              onMouseLeave={() => setIsDropdownHovered(false)}
            >
              <span className="relative z-10">{item.label}</span>
              {createUnderlineElement(false, isDropdownHovered)}
            </NavigationMenuTrigger>
            <NavigationMenuContent>
              <ul className="grid w-[250px] gap-1 p-2">
                {item.dropdown.content.map((link) => (
                  <li key={link.title}>
                    <NavigationMenuLink asChild>
                      <Link
                        href={getHref(link.href, basePath)}
                        className="block select-none rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                      >
                        {link.title}
                      </Link>
                    </NavigationMenuLink>
                  </li>
                ))}
              </ul>
            </NavigationMenuContent>
          </NavMenuItem>
        );

      case 'mega':
        {
          const menuItems = item.megaMenu.content;
          const featuredItem = item.megaMenu.featuredItem;
          const hasFeaturedItem = !!featuredItem;
          
          // Determine the number of columns based on the megaMenu configuration
          const columns = item.megaMenu.columns || 2;
          const ulClassName = `grid gap-2 p-4 ${
            hasFeaturedItem 
              ? `grid-cols-${columns} w-[600px]` 
              : `grid-cols-${columns} w-[500px]`
          }`;

          const [isMegaHovered, setIsMegaHovered] = React.useState(false);
          
          return (
            <NavMenuItem key={key}>
              <NavigationMenuTrigger 
                className={cn("relative inline-flex items-center overflow-hidden", getMenuItemClasses(false), menuHoverClasses)}
                onMouseEnter={() => setIsMegaHovered(true)}
                onMouseLeave={() => setIsMegaHovered(false)}
              >
                <span className="relative z-10">{item.label}</span>
                {createUnderlineElement(false, isMegaHovered)}
              </NavigationMenuTrigger>
              <NavigationMenuContent>
                <ul className={ulClassName}>
                  {hasFeaturedItem && (
                    <li className="row-span-3">
                      <NavigationMenuLink asChild>
                        <Link
                          href={getHref(featuredItem.href, basePath)}
                          className="flex h-full w-full select-none flex-col justify-end rounded-md bg-gradient-to-b from-muted/50 to-muted p-6 no-underline outline-none focus:shadow-md"
                        >
                          <div className="mb-2 mt-4 text-lg font-medium">{featuredItem.title}</div>
                          <p className="text-sm leading-tight text-muted-foreground">
                            {featuredItem.description}
                          </p>
                        </Link>
                      </NavigationMenuLink>
                    </li>
                  )}
                  {menuItems.map((component) => (
                    <ListItem key={component.title} title={component.title} href={getHref(component.href, basePath)} basePath="">
                      {component.description}
                    </ListItem>
                  ))}
                </ul>
              </NavigationMenuContent>
            </NavMenuItem>
          );
        }

      case 'custom':
        return (
          <NavMenuItem key={key}>
            <DynamicRenderer component={item.content} />
          </NavMenuItem>
        );

      default:
        return null;
    }
  };

  const renderMobileNavItem = (item: NavigationMenuItem, index: number) => {
    const key = item.uuid || `mobile-nav-${index}`;
    let content: React.ReactNode;
    let href = '#';
    let isActive = false;

    switch (item.type) {
      case 'link':
        content = item.label;
        href = getHref(item.href.href, basePath);
        isActive = isLinkActive(item.href.href);
        break;
      case 'button':
        content = item.button.text;
        href = item.button.link ? getHref(item.button.link.href, basePath) : '#';
        if (item.button.link) {
          isActive = isLinkActive(item.button.link.href);
        }
        break;
      case 'dropdown':
      case 'mega':
        content = item.label;
        break;
      case 'custom':
        return <div key={key} className="px-4 py-2"><DynamicRenderer component={item.content} /></div>;
      default:
        return null;
    }

    return (
      <SheetClose asChild key={key}>
        <Link
          href={href}
          className={cn(
            buttonVariants({ variant: 'ghost'}), 
            'w-full justify-start text-base py-3 h-auto',
            isActive && 'bg-accent text-accent-foreground'
          )}
        >
          {content}
        </Link>
      </SheetClose>
    );
  };

  const buttonVariants = (options: { variant: 'ghost' }) =>
    'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background hover:bg-accent hover:text-accent-foreground';

  const leftItems = variant === 'split'
    ? content.filter(i => i.type !== 'button' && i.type !== 'custom')
    : (variant === 'centerLogo'
      ? content.slice(0, Math.ceil(content.length / 2))
      : content
    );
  const rightItems = variant === 'split'
    ? content.filter(i => i.type === 'button' || i.type === 'custom')
    : (variant === 'centerLogo'
      ? content.slice(Math.ceil(content.length / 2))
      : []
    );

  const desktopNav = (navItems: NavigationMenuItem[]) => (
    <NavigationMenu className="hidden md:flex">
      <NavigationMenuList>
        {navItems.map(renderNavigationItem)}
      </NavigationMenuList>
    </NavigationMenu>
  );

  const navbarContent = (
    <div className={cn(containerClasses, { 'justify-between': variant !== 'centerLogo' })}>
      <div className="flex items-center md:hidden">
        <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" aria-label="Open navigation menu">
              <Menu className="h-6 w-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[300px] p-0">
            <div className="p-4">
              <NavbarLogo {...logo} basePath={basePath} />
            </div>
            <nav className="flex flex-col space-y-1 p-4">
              {content.map(renderMobileNavItem)}
            </nav>
          </SheetContent>
        </Sheet>
      </div>

      {(variant === 'default' || variant === 'split') && (
        <div className="hidden md:flex">
          <NavbarLogo {...logo} basePath={basePath} />
        </div>
      )}

      {variant === 'default' && <div className="ml-auto">{desktopNav(content)}</div>}

      {variant === 'split' && (
        <>
          <div className="hidden md:flex pl-4">{desktopNav(leftItems)}</div>
          <div className="hidden md:flex ml-auto">{desktopNav(rightItems)}</div>
        </>
      )}

      {variant === 'centerLogo' && (
        <div className="hidden md:flex flex-grow items-center justify-between">
          <div className="flex-1">{desktopNav(leftItems)}</div>
          <div className="px-4"><NavbarLogo {...logo} basePath={basePath} /></div>
          <div className="flex-1 flex justify-end">{desktopNav(rightItems)}</div>
        </div>
      )}

      <div className="absolute left-1/2 -translate-x-1/2 md:hidden">
        <NavbarLogo {...logo} basePath={basePath} />
      </div>

      <div className="md:hidden w-10" />
    </div>
  );

  // Conditionally wrap in header or nav based on asWrapper prop
  if (asWrapper) {
    return (
      <header className={navbarClasses} {...filterDOMProps(restProps)}>
        {navbarContent}
      </header>
    );
  }

  // When not used as wrapper, render as nav element
  return (
    <nav className={navbarClasses} {...filterDOMProps(restProps)}>
      {navbarContent}
    </nav>
  );
};

Navbar.displayName = 'Navbar';
