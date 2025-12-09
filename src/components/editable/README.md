# Edit Mode Implementation

This directory contains the implementation for edit mode functionality in preview webpages.

## Features

- **Conditional Loading**: TipTap editor is only loaded when in edit mode (when `?edit=yes` is in the URL)
- **Context-Aware**: Uses React Context to manage edit state across components
- **Auto-save**: Automatically saves changes every 30 seconds
- **Visual Feedback**: Shows editing indicators and unsaved changes counter
- **Tree-shaking**: Editor code is not shipped in production builds

## How It Works

### 1. Edit Mode Detection

Edit mode is activated when:
- The page is a preview page (URL starts with `/a/preview-`)
- The URL contains `?edit=yes` parameter

### 2. Component Architecture

- **EditModeContext**: Manages edit state, content updates, and save operations
- **Editable Wrappers**: Components like `EditableText` and `EditableHeading` that conditionally render editors
- **Editors**: TipTap-based editors for different content types
- **Registry**: Maps component types to their editable versions

### 3. Usage

To make a component editable, add it to the `editableRegistry.ts` file:

```typescript
export const editableComponents = {
  'TextProps': EditableText,
  'HeadingProps': EditableHeading,
  // Add more editable components here
};
```

### 4. Testing

To test edit mode:

1. Visit a preview URL: `/a/preview-{app-id}?edit=yes`
2. Click on text content to edit it
3. Changes are automatically saved every 30 seconds
4. Use the floating toolbar to save or exit edit mode

### 5. Adding New Editable Components

To add a new editable component:

1. Create an editor component (e.g., `ButtonEditor.tsx`)
2. Create a wrapper component (e.g., `EditableButton.tsx`)
3. Add the mapping to `editableRegistry.ts`
4. The `DynamicRenderer` will automatically use the editable version in edit mode

## File Structure

```
src/components/editable/
├── EditModeContext.tsx      # Context for managing edit state
├── TextEditor.tsx           # TipTap editor for text content
├── HeadingEditor.tsx        # TipTap editor for headings
├── EditableText.tsx         # Wrapper for text components
├── EditableHeading.tsx      # Wrapper for heading components
├── EditModeToolbar.tsx      # Floating toolbar for edit controls
├── editableRegistry.ts      # Registry mapping components to editable versions
└── README.md               # This file
```

## Environment Variables

Make sure `NEXT_PUBLIC_BACKEND_URL` is set for save functionality to work.
