// components/common/Icon.tsx
import * as React from 'react';
import { icons, HelpCircle } from 'lucide-react'; // Import HelpCircle directly
import { cn, filterDOMProps } from '@/lib/utils';
import { IconProps } from '@/interfaces/components/common/core'; // Adjust path

/**
 * Converts a string from kebab-case or lowercase to PascalCase.
 * e.g., "arrow-right" -> "ArrowRight", "star" -> "Star"
 * @param str The input string.
 * @returns The PascalCase string.
 */
const toPascalCase = (str: string) => {
  return str
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join('');
};

/**
 * A data-driven component that dynamically renders an icon from the lucide-react library.
 * It now correctly handles names in both lowercase and PascalCase.
 */
export const Icon: React.FC<IconProps> = ({
  name,
  size,
  classes,
  uuid,
  componentType,
  ...restProps
}) => {
  // Convert the name to PascalCase to match the lucide-react library's naming convention.
  const pascalCaseName = name ? toPascalCase(name) : '';
  
  // Look up the icon component from the 'icons' object.
  const LucideIcon = pascalCaseName ? (icons[pascalCaseName as keyof typeof icons]) : undefined;

  // If the specified icon name doesn't exist or no name is provided, render a fallback.
  if (!LucideIcon) {
    // Only show a warning if an invalid name was actually provided.
    if (name) {
        console.warn(`[IconComponent] Icon not found for name: "${name}". Rendering fallback.`);
    }
    // Use the directly imported HelpCircle component as a guaranteed safe fallback.
    return <HelpCircle className={cn('h-4 w-4 text-destructive', classes)} size={size} {...filterDOMProps(restProps)} />;
  }

  // Render the dynamically found icon with the specified size and classes.
  return (
    <LucideIcon
      className={cn(classes)}
      size={size}
      {...filterDOMProps(restProps)}
    />
  );
};

export default Icon;
