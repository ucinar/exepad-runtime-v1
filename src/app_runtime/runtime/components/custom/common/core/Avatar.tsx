// components/common/Avatar.tsx
import * as React from 'react';
import { cn, filterDOMProps } from '@/lib/utils';
import { Avatar as ShadcnAvatar, AvatarImage, AvatarFallback } from "@/runtime/components/ui/avatar"; // Adjust path
import { AvatarProps } from '@/interfaces/components/common/core'; // Adjust path

/**
 * A helper function to generate initials from a name string.
 * e.g., "John Doe" -> "JD"
 */
const getInitials = (name: string): string => {
  if (!name) return '?';
  
  const names = name.trim().split(' ');
  if (names.length === 1) {
    return names[0].charAt(0).toUpperCase();
  }
  
  return `${names[0].charAt(0)}${names[names.length - 1].charAt(0)}`.toUpperCase();
};

/**
 * A data-driven component that displays a user's avatar image
 * with a fallback to their initials.
 */
export const Avatar: React.FC<AvatarProps> = ({
  image,
  name,
  size,
  classes,
  ...restProps
}) => {
  const initials = getInitials(name);

  // Inline styles are used to apply the dynamic size from the props.
  const sizeStyle = {
    height: `${size}px`,
    width: `${size}px`,
  };

  // Extract image source and alt text from the image prop
  const imageSrc = image?.src;
  const imageAlt = image?.alt || name;

  return (
    <ShadcnAvatar
      className={cn(classes)}
      style={sizeStyle}
      {...filterDOMProps(restProps)}
    >
      {imageSrc && <AvatarImage src={imageSrc} alt={imageAlt} />}
      <AvatarFallback>{initials}</AvatarFallback>
    </ShadcnAvatar>
  );
};

export default Avatar;
