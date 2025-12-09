// components/layout/Card.tsx
"use client";

import React from 'react';
import { cn, filterDOMProps } from '@/lib/utils';
import { DynamicRenderer } from '@/components/DynamicRenderer';
import { CardProps } from '@/interfaces/components/common/layout/layout';
import { ComponentProps } from '@/interfaces/components/common/core';
import {
  Card as ShadcnCard,
  CardHeader as ShadcnCardHeader,
  CardTitle as ShadcnCardTitle,
  CardDescription as ShadcnCardDescription,
  CardContent as ShadcnCardContent,
  CardFooter as ShadcnCardFooter,
} from '@/runtime/components/ui/card';
import Link from 'next/link';

/**
 * Card Component Implementation
 * A generic card container inspired by shadcn/ui with flexible content support.
 */
export const Card: React.FC<CardProps> = (props) => {
  const {
    header,
    content,
    footer,
    variant = 'default',
    size = 'md',
    interactive = false,
    link,
    elevation = 1,
    radius = 'md',
    backgroundColor,
    borderColor,
    classes,
    // Destructure component-specific props to prevent them from being spread to DOM
    componentType,
    uuid,
    ...restProps
  } = props as any;

  // Variant class mappings
  const variantClasses = {
    default: 'bg-card text-card-foreground border',
    outlined: 'bg-transparent border-2',
    filled: 'border-0',
    elevated: 'border-0',
  };

  // Size/padding mappings for header, content, and footer
  const sizeClasses = {
    sm: {
      header: 'p-4 space-y-1',
      content: 'p-4 pt-0',
      footer: 'p-4 pt-0',
    },
    md: {
      header: 'p-6 space-y-1.5',
      content: 'p-6 pt-0',
      footer: 'p-6 pt-0',
    },
    lg: {
      header: 'p-8 space-y-2',
      content: 'p-8 pt-0',
      footer: 'p-8 pt-0',
    },
  };

  // Elevation/shadow mappings
  const elevationClasses = {
    0: 'shadow-none',
    1: 'shadow-sm',
    2: 'shadow-md',
    3: 'shadow-lg',
  };

  // Border radius mappings
  const radiusClasses = {
    none: 'rounded-none',
    sm: 'rounded-sm',
    md: 'rounded-lg',
    lg: 'rounded-xl',
    full: 'rounded-3xl',
  };

  // Build the card classes
  const cardClasses = cn(
    variantClasses[variant as keyof typeof variantClasses],
    elevationClasses[elevation as keyof typeof elevationClasses],
    radiusClasses[radius as keyof typeof radiusClasses],
    interactive && 'transition-all duration-200 cursor-pointer hover:shadow-lg',
    backgroundColor,
    borderColor && `border-${borderColor}`,
    classes
  );

  // Card content renderer
  const renderCardContent = () => (
    <>
      {/* Header Section */}
      {header && (
        <div
          className={cn(
            'flex flex-col',
            sizeClasses[size as keyof typeof sizeClasses].header
          )}
        >
          {/* Title and Description Container */}
          <div className="flex-1 space-y-1.5">
            {header.title && (
              <DynamicRenderer component={{ ...header.title, componentType: 'HeadingProps' }} />
            )}
            {header.description && (
              <DynamicRenderer component={{ ...header.description, componentType: 'TextProps' }} />
            )}
          </div>

          {/* Actions */}
          {header.actions && header.actions.length > 0 && (
            <div className="flex items-center gap-2 mt-2">
              {header.actions.map((action: ComponentProps, index: number) => (
                <DynamicRenderer
                  key={action.uuid || `action-${index}`}
                  component={action}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Content Section */}
      {content && content.length > 0 && (
        <div
          className={cn(
            sizeClasses[size as keyof typeof sizeClasses].content
          )}
        >
          {content.map((component: ComponentProps, index: number) => (
            <DynamicRenderer
              key={component.uuid || `content-${index}`}
              component={component}
            />
          ))}
        </div>
      )}

      {/* Footer Section */}
      {footer && footer.length > 0 && (
        <div
          className={cn(
            'flex items-center',
            sizeClasses[size as keyof typeof sizeClasses].footer
          )}
        >
          {footer.map((component: ComponentProps, index: number) => (
            <DynamicRenderer
              key={component.uuid || `footer-${index}`}
              component={component}
            />
          ))}
        </div>
      )}
    </>
  );

  // If the card has a link, wrap it in a Link component
  if (link?.href) {
    return (
      <Link
        href={link.href}
        target={link.target}
        rel={link.rel}
        className={cn(cardClasses, 'block')}
        {...filterDOMProps(restProps)}
      >
        {renderCardContent()}
      </Link>
    );
  }

  // Otherwise, render a regular div
  return (
    <div className={cardClasses} {...filterDOMProps(restProps)}>
      {renderCardContent()}
    </div>
  );
};

Card.displayName = 'Card';

export default Card;

