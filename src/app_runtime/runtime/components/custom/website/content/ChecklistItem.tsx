import * as React from 'react';
import { cn, filterDOMProps } from '@/lib/utils'; // Assuming a utility for class names

// --- IMPORTED PROPS & COMPONENTS ---
// These imports assume you have these interfaces and components defined elsewhere in your project.
import { ChecklistItemProps } from '@/interfaces/components/website/content/feature_item';
import { IconProps, LinkProps, SubComponentProps } from '@/interfaces/components/common/core';
import { Icon } from '@/app_runtime/runtime/components/custom/common/core/Icon';       // Assuming a generic Icon component
import { Link } from '@/app_runtime/runtime/components/custom/common/core/Link';       // Assuming a generic Link component
import { DynamicRenderer } from '@/components/DynamicRenderer';

// --- DEFAULT CHECK ICON ---
// A default icon configuration to use when `checked` is true but no specific `icon` is provided.
// This ensures a consistent look for standard checklist items across the application.
const defaultCheckIcon: IconProps = {
  uuid: 'default-check-icon-a1b2',
  componentType: 'IconProps',
  name: 'check', // Using a name from a library like lucide-react
  size: 18,
  classes: 'text-green-600' // A default success color
};


/**
 * Renders a single item for a checklist. It typically consists of an icon
 * and text content. The text can optionally be rendered as a hyperlink.
 * This component is designed to be a flexible building block within other components.
 */
export const ChecklistItem = ({
  text,
  icon,
  link,
  checked = true, 
  classes,
  uuid,
  componentType,
  defaultItemIcon,
  ...restProps 
}: ChecklistItemProps) => {

  // --- ICON LOGIC ---
  // Determines which icon to display based on the provided props.
  // The priority is:
  // 1. A specific `icon` object passed in the props.
  // 2. The `defaultCheckIcon` if `checked` is true and no `icon` prop is given.
  // 3. No icon is rendered if neither of the above conditions is met.
  const displayIcon = icon ? icon : (checked ? defaultCheckIcon : null);

  // --- CONTENT LOGIC ---
  // Renders the main text content of the checklist item.
  // If a `link` object is provided in the props, the text is wrapped in a Link component,
  // making the entire text content a clickable hyperlink.
  // Note: text is a TextProps object, so we use DynamicRenderer to render it
  const textContent = link ? (
    <Link {...link}><DynamicRenderer component={text} /></Link>
  ) : (
    <DynamicRenderer component={text} />
  );

  return (
    <div 
      className={cn(
        'flex items-start gap-2 text-base text-foreground', // Base styles for alignment and text
        classes // Allows for custom styling via props
      )}
      {...filterDOMProps(restProps)}
    >
      {/* Render the icon container only if an icon is determined to be displayed. */}
      {displayIcon && (
        <div className="flex-shrink-0 pt-0.5">
          <Icon {...displayIcon} />
        </div>
      )}
      
      {/* Container for the text content. */}
      <div className="flex-1">
        {textContent}
      </div>
    </div>
  );
};
