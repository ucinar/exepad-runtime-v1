// components/common/Button.tsx
"use client";

import * as React from 'react';
import NextLink from 'next/link';
import { cn, filterDOMProps, getHref } from '@/lib/utils';
import { useComponentStyles } from '@/hooks/useComponentStyles';

// Import the base Button component and its variant props from shadcn/ui
import { Button as ShadcnButton, buttonVariants } from "@/runtime/components/ui/button"; 
import { DynamicRenderer } from '@/components/DynamicRenderer';
import { ButtonProps, IconProps, LinkProps } from '@/interfaces/components/common/core'; // Adjust path
import { useAppContext } from '@/context/AppContext';

// A mock event handler function for demonstration purposes.
// In a real app, this would map the string identifier to a real function.
const getEventHandler = (handlerName: string) => {
    return () => {
        console.log(`Event handler triggered: ${handlerName}`);
    };
};

/**
 * A data-driven Button component that can render as a button or a link,
 * with optional icons and full styling support from shadcn/ui.
 */
export const Button: React.FC<ButtonProps> = ({
  text,
  onClick,
  link,
  type = 'button',
  variant = 'default',
  size = 'default',
  disabled = false,
  icon,
  iconPosition = 'left',
  classes,
  ...restProps
}) => {
  const { basePath } = useAppContext();
  const rootRef = React.useRef<HTMLAnchorElement | HTMLButtonElement | null>(null);
  
  const eventHandler = onClick ? getEventHandler(onClick) : undefined;

  // Single hook call processes all style transformations
  const { className, style, dataAttributes, metadata } = useComponentStyles(classes, {
    elementRef: rootRef as React.RefObject<HTMLElement>,
    componentName: 'Button',
  });

  const hasStyle = Object.keys(style).length > 0;

  const IconComponent = icon ? <DynamicRenderer component={icon} /> : null;

  const buttonContent = (
    <>
      {iconPosition === 'left' && IconComponent && <span className="mr-2">{IconComponent}</span>}
      <span style={metadata.contrastCorrected ? { color: style.color } : undefined}>{text}</span>
      {iconPosition === 'right' && IconComponent && <span className="ml-2">{IconComponent}</span>}
    </>
  );

  // If a link is provided, wrap the button in a Next.js Link component
  if (link?.href) {
    // Automatically prefix relative links with basePath (hash links stay unchanged)
    const finalHref = getHref(link.href, basePath);
    
    const composedClasses = cn(
      // Use the buttonVariants utility from shadcn/ui to get the correct styles
      buttonVariants({ variant, size, className }),
      disabled ? 'pointer-events-none opacity-50' : '',
      // Apply link-specific classes if provided
      link.classes
    );

    return (
      <NextLink
        ref={rootRef as any}
        href={finalHref}
        className={composedClasses}
        style={hasStyle ? style : undefined}
        target={link.target}
        aria-disabled={disabled}
        {...dataAttributes}
        {...filterDOMProps(restProps)}
      >
        {buttonContent}
      </NextLink>
    );
  }

  // Otherwise, render a standard button
  return (
    <ShadcnButton
      ref={rootRef as any}
      type={type as 'button' | 'submit' | 'reset'}
      variant={variant}
      size={size}
      disabled={disabled}
      onClick={eventHandler}
      className={cn(className)}
      style={hasStyle ? style : undefined}
      {...dataAttributes}
      {...filterDOMProps(restProps)}
    >
      {buttonContent}
    </ShadcnButton>
  );
};

export default Button;
