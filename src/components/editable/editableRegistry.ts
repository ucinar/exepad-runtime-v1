import { EditableText } from './EditableText';
import { EditableHeading } from './EditableHeading';
import { EditableMarkdown } from './EditableMarkdown';

// Registry mapping component types to their editable versions
export const editableComponents = {
  'TextProps': EditableText,
  'HeadingProps': EditableHeading,
  'MarkdownBlockProps': EditableMarkdown,
} as const;

// Type helper to check if a component type has an editable version
export type EditableComponentType = keyof typeof editableComponents;

export function isEditableComponent(componentType: string): componentType is EditableComponentType {
  return componentType in editableComponents;
}

export function getEditableComponent(componentType: string) {
  if (isEditableComponent(componentType)) {
    return editableComponents[componentType];
  }
  return null;
}