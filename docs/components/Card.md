# Card Component

A flexible, generic card container component inspired by shadcn/ui. The Card component provides structured sections (header, content, footer) with comprehensive styling options.

## Interface Definition

Located in: `src/app_runtime/interfaces/components/common/layout/layout.ts`

```typescript
export interface CardHeaderProps extends SubComponentProps {
  title?: HeadingProps;
  description?: TextProps;
  actions?: ComponentProps[];
}

export interface CardProps extends ComponentProps {
  header?: CardHeaderProps;
  content: ComponentProps[];
  footer?: ComponentProps[];
  variant?: 'default' | 'outlined' | 'filled' | 'elevated';
  size?: 'sm' | 'md' | 'lg';
  interactive?: boolean;
  link?: LinkProps;
  elevation?: 0 | 1 | 2 | 3;
  radius?: 'none' | 'sm' | 'md' | 'lg' | 'full';
  backgroundColor?: string;
  borderColor?: string;
}
```

## Props

### CardProps

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `header` | `CardHeaderProps` | - | Optional header section with title, description, and actions |
| `content` | `ComponentProps[]` | **required** | Main content area of the card |
| `footer` | `ComponentProps[]` | - | Optional footer section |
| `variant` | `'default' \| 'outlined' \| 'filled' \| 'elevated'` | `'default'` | Visual style variant |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Size/padding preset |
| `interactive` | `boolean` | `false` | Adds hover effects for clickable cards |
| `link` | `LinkProps` | - | Makes the entire card a clickable link |
| `elevation` | `0 \| 1 \| 2 \| 3` | `1` | Shadow/elevation level |
| `radius` | `'none' \| 'sm' \| 'md' \| 'lg' \| 'full'` | `'md'` | Border radius size |
| `backgroundColor` | `string` | - | Custom background color class |
| `borderColor` | `string` | - | Custom border color class |

### CardHeaderProps

| Prop | Type | Description |
|------|------|-------------|
| `title` | `HeadingProps` | The card's title |
| `description` | `TextProps` | Optional description text |
| `actions` | `ComponentProps[]` | Optional action components (buttons, icons, etc.) |

## Variants

### default
Standard card with border and background.

### outlined
Transparent background with a thicker border.

### filled
No border, only background color.

### elevated
No border, uses shadow for depth.

## Usage Examples

### Basic Card

```json
{
  "componentType": "CardProps",
  "variant": "default",
  "size": "md",
  "header": {
    "title": {
      "componentType": "HeadingProps",
      "level": 3,
      "text": "Card Title"
    },
    "description": {
      "componentType": "TextProps",
      "text": "Card description goes here"
    }
  },
  "content": [
    {
      "componentType": "TextProps",
      "text": "Main content of the card"
    }
  ]
}
```

### Card with Footer Actions

```json
{
  "componentType": "CardProps",
  "variant": "default",
  "size": "md",
  "header": {
    "title": {
      "componentType": "HeadingProps",
      "level": 3,
      "text": "Confirm Action"
    }
  },
  "content": [
    {
      "componentType": "TextProps",
      "text": "Are you sure you want to proceed?"
    }
  ],
  "footer": [
    {
      "componentType": "ButtonProps",
      "label": "Cancel",
      "variant": "outline"
    },
    {
      "componentType": "ButtonProps",
      "label": "Confirm",
      "variant": "default"
    }
  ]
}
```

### Clickable/Interactive Card

```json
{
  "componentType": "CardProps",
  "variant": "outlined",
  "size": "md",
  "interactive": true,
  "link": {
    "componentType": "LinkProps",
    "href": "/product/123"
  },
  "header": {
    "title": {
      "componentType": "HeadingProps",
      "level": 3,
      "text": "Product Name"
    }
  },
  "content": [
    {
      "componentType": "TextProps",
      "text": "Click to view details"
    }
  ]
}
```

### Card with Header Actions

```json
{
  "componentType": "CardProps",
  "variant": "default",
  "header": {
    "title": {
      "componentType": "HeadingProps",
      "level": 3,
      "text": "Settings"
    },
    "actions": [
      {
        "componentType": "ButtonProps",
        "label": "Edit",
        "variant": "ghost",
        "size": "sm"
      }
    ]
  },
  "content": [
    {
      "componentType": "TextProps",
      "text": "Configure your preferences"
    }
  ]
}
```

### Product Card Example

```json
{
  "componentType": "CardProps",
  "variant": "elevated",
  "size": "lg",
  "elevation": 2,
  "interactive": true,
  "header": {
    "title": {
      "componentType": "HeadingProps",
      "level": 3,
      "text": "Premium Product"
    },
    "description": {
      "componentType": "TextProps",
      "text": "Limited edition"
    },
    "actions": [
      {
        "componentType": "IconProps",
        "name": "Heart",
        "size": "sm"
      }
    ]
  },
  "content": [
    {
      "componentType": "ImageProps",
      "src": "/product.jpg",
      "alt": "Product"
    },
    {
      "componentType": "FlexProps",
      "justify": "between",
      "content": [
        {
          "componentType": "TextProps",
          "text": "$199.99",
          "classes": "text-2xl font-bold"
        },
        {
          "componentType": "BadgeProps",
          "label": "New"
        }
      ]
    }
  ],
  "footer": [
    {
      "componentType": "ButtonProps",
      "label": "Add to Cart",
      "variant": "default"
    }
  ]
}
```

## Customization

### Custom Colors

```json
{
  "componentType": "CardProps",
  "variant": "outlined",
  "borderColor": "border-blue-500",
  "backgroundColor": "bg-blue-50",
  "content": [...]
}
```

### Custom Border Radius

```json
{
  "componentType": "CardProps",
  "radius": "full",
  "content": [...]
}
```

### Custom Elevation

```json
{
  "componentType": "CardProps",
  "variant": "elevated",
  "elevation": 3,
  "content": [...]
}
```

## Size Reference

- **sm**: Compact padding (p-4)
- **md**: Standard padding (p-6) - default
- **lg**: Large padding (p-8)

## Elevation Reference

- **0**: No shadow
- **1**: Small shadow (default)
- **2**: Medium shadow
- **3**: Large shadow

## Best Practices

1. **Use semantic structure**: Leverage header, content, and footer sections for clear organization
2. **Interactive cards**: Set `interactive={true}` and provide a `link` for clickable cards
3. **Consistent sizing**: Stick to one size within a grid for visual harmony
4. **Elevation hierarchy**: Use higher elevation for important or focused cards
5. **Actions placement**: Use header actions for card-level controls, footer for primary CTAs

## Examples

See the following example files:
- `public/example/apps/webapp/card-example.json` - Basic card usage
- `public/example/apps/webapp/card-link-example.json` - Clickable card
- `public/example/apps/webapp/card-showcase.json` - Comprehensive showcase

## Related Components

- **Grid**: For laying out multiple cards
- **Flex**: For arranging card content
- **Button**: For card actions
- **Badge**: For card metadata

