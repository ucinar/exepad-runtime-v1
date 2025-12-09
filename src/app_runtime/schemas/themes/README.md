# LeapDo Theme System

## Overview

The LeapDo theme system enables comprehensive UI customization through a structured `ThemeProps` object. Themes control colors, typography, spacing, shadows, and other visual properties that are applied consistently across all components.

## Theme Structure

A complete theme consists of:

### 1. Color Palettes (Required)

Define coordinated color schemes for both light and dark modes:

```json
{
  "light": {
    "background": "0 0% 100%",
    "foreground": "222.2 84% 4.9%",
    "card": "0 0% 100%",
    "card-foreground": "222.2 84% 4.9%",
    "popover": "0 0% 100%",
    "popover-foreground": "222.2 84% 4.9%",
    "primary": "221.2 83.2% 53.3%",
    "primary-foreground": "210 40% 98%",
    "secondary": "210 40% 96.1%",
    "secondary-foreground": "222.2 47.4% 11.2%",
    "muted": "210 40% 96.1%",
    "muted-foreground": "215.4 16.3% 46.9%",
    "accent": "210 40% 96.1%",
    "accent-foreground": "222.2 47.4% 11.2%",
    "destructive": "0 84.2% 60.2%",
    "destructive-foreground": "210 40% 98%",
    "border": "214.3 31.8% 91.4%",
    "input": "214.3 31.8% 91.4%",
    "ring": "221.2 83.2% 53.3%"
  },
  "dark": {
    "background": "222.2 84% 4.9%",
    "foreground": "210 40% 98%",
    ... (similar structure)
  }
}
```

**Color Token Reference:**
- `background` / `foreground`: Main surface and text
- `card` / `card-foreground`: Elevated surfaces (cards, panels)
- `popover` / `popover-foreground`: Floating elements (tooltips, dropdowns)
- `primary` / `primary-foreground`: Brand color and CTA buttons
- `secondary` / `secondary-foreground`: Less prominent actions
- `muted` / `muted-foreground`: Disabled/subtle elements
- `accent` / `accent-foreground`: Highlights and hover states
- `destructive` / `destructive-foreground`: Errors and warnings
- `border`, `input`, `ring`: Outlines, form fields, focus indicators

**Color Format:** HSL without the `hsl()` wrapper: `"220 50% 60%"`

**Accessibility:** Ensure foreground colors have at least 4.5:1 contrast ratio against their backgrounds for WCAG AA compliance.

### 2. Typography (Required)

Define fonts for headings and body text using Google Fonts:

```json
{
  "fonts": {
    "heading": {
      "family": "Inter",
      "variant": "700",
      "url": "https://fonts.googleapis.com/css2?family=Inter:wght@700&display=swap"
    },
    "body": {
      "family": "Inter",
      "variant": "regular",
      "url": "https://fonts.googleapis.com/css2?family=Inter:wght@400&display=swap"
    }
  }
}
```

**Variant Options:**
- Weights: `regular` (400), `100`, `200`, `300`, `400`, `500`, `600`, `700` (bold), `800`, `900`
- Styles: `italic`, `100italic`, `200italic`, ..., `900italic`

### 3. Font Sizes (Optional)

Define typographic scale:

```json
{
  "fontSizes": {
    "xs": "0.75rem",
    "sm": "0.875rem",
    "base": "1rem",
    "lg": "1.125rem",
    "xl": "1.25rem",
    "2xl": "1.5rem",
    "3xl": "1.875rem",
    "4xl": "2.25rem",
    "5xl": "3rem",
    "6xl": "3.75rem",
    "7xl": "4.5rem",
    "8xl": "6rem",
    "9xl": "8rem"
  }
}
```

Use in components: `text-[var(--font-size-2xl)]`

### 4. Border Radius (Recommended)

Control component roundness:

```json
{
  "radius": "0.5rem"
}
```

Common values:
- `0.25rem` - Sharp, precise (fintech, legal)
- `0.5rem` - Moderate, modern (tech, SaaS)
- `1rem` - Soft, friendly (wellness, lifestyle)

Use in components: `rounded-[var(--radius)]`

### 5. Spacing (Recommended)

Define section padding:

```json
{
  "spacing": {
    "x": "1.5rem",
    "y": "4rem"
  }
}
```

Use in components: `py-[var(--spacing-section-y)] px-[var(--spacing-section-x)]`

### 6. Style Variables (Optional)

Control shadows and transitions:

```json
{
  "styles": {
    "shadowSm": "0 1px 2px 0 rgb(0 0 0 / 0.05)",
    "shadow": "0 1px 3px 0 rgb(0 0 0 / 0.1)",
    "shadowMd": "0 4px 6px -1px rgb(0 0 0 / 0.1)",
    "shadowLg": "0 10px 15px -3px rgb(0 0 0 / 0.1)",
    "shadowXl": "0 20px 25px -5px rgb(0 0 0 / 0.1)",
    "shadow2xl": "0 25px 50px -12px rgb(0 0 0 / 0.25)",
    "shadowInner": "inset 0 2px 4px 0 rgb(0 0 0 / 0.05)",
    "transitionDuration": "200ms",
    "transitionTimingFunction": "ease-in-out"
  }
}
```

### 7. Layout (Optional)

Control max widths and padding:

```json
{
  "layout": {
    "containerWidth": "1280px",
    "contentPadding": "2rem"
  }
}
```

### 8. Charts (Optional)

Define distinct colors for data visualization:

```json
{
  "charts": {
    "chart-1": "12 76% 61%",
    "chart-2": "173 58% 39%",
    "chart-3": "197 37% 24%",
    "chart-4": "43 74% 66%",
    "chart-5": "27 87% 67%"
  }
}
```

Use in chart components: `fill-[hsl(var(--chart-1))]`

## Industry-Specific Theme Patterns

### Fintech / Legal
```json
{
  "light": {
    "primary": "210 100% 45%",        // Trust blue
    "background": "0 0% 100%",
    "foreground": "222 47% 11%"       // High contrast
  },
  "fonts": {
    "heading": { "family": "Inter", "variant": "700" },
    "body": { "family": "Inter", "variant": "regular" }
  },
  "radius": "0.25rem",                // Sharp corners
  "spacing": { "x": "1rem", "y": "2.5rem" }
}
```

### Wellness / Lifestyle
```json
{
  "light": {
    "primary": "25 95% 53%",          // Warm orange
    "background": "30 20% 98%",       // Soft cream
    "foreground": "25 20% 20%"
  },
  "fonts": {
    "heading": { "family": "Lora", "variant": "600" },
    "body": { "family": "Open Sans", "variant": "regular" }
  },
  "radius": "1rem",                   // Soft corners
  "spacing": { "x": "2rem", "y": "5rem" }
}
```

### Tech / SaaS
```json
{
  "light": {
    "primary": "262 83% 58%",         // Modern purple
    "background": "0 0% 100%",
    "foreground": "222 84% 5%"
  },
  "fonts": {
    "heading": { "family": "Poppins", "variant": "600" },
    "body": { "family": "Inter", "variant": "regular" }
  },
  "radius": "0.5rem",                 // Balanced
  "spacing": { "x": "1.5rem", "y": "4rem" }
}
```

## Using Themes in Components

### Accessing Theme Colors

Use Tailwind utility classes with CSS variables:

```tsx
// Background colors
<div className="bg-background text-foreground">
<div className="bg-primary text-primary-foreground">
<div className="bg-card text-card-foreground">

// Using arbitrary values
<div className="bg-[hsl(var(--primary))]">
<div className="text-[hsl(var(--muted-foreground))]">
```

### Using Spacing and Sizing

```tsx
// Section padding
<section className="py-[var(--spacing-section-y)] px-[var(--spacing-section-x)]">

// Border radius
<div className="rounded-[var(--radius)]">

// Font sizes
<h1 className="text-[var(--font-size-4xl)]">
```

### Semantic Usage

Always use semantic tokens instead of hardcoded colors:

✅ **Good:**
```tsx
<button className="bg-primary text-primary-foreground hover:bg-primary/90">
<p className="text-muted-foreground">
<div className="border-border">
```

❌ **Bad:**
```tsx
<button className="bg-blue-600 text-white">
<p className="text-gray-500">
<div className="border-gray-200">
```

## Theme Generation Guidelines for LLMs

When generating themes automatically:

1. **Analyze the application domain and target audience**
   - Fintech → professional, trustworthy colors
   - Wellness → warm, organic tones
   - Tech → modern, energetic colors
   - Creative → bold, expressive palette

2. **Ensure color accessibility**
   - Minimum 4.5:1 contrast for normal text
   - Minimum 3:1 contrast for large text
   - Test foreground on background pairs

3. **Create coordinated light/dark modes**
   - Maintain semantic consistency
   - Invert lightness while preserving hue relationships
   - Adjust saturation for dark mode readability

4. **Select appropriate typography**
   - Choose Google Fonts that match brand personality
   - Pair serif with sans-serif or geometric with humanist
   - Include proper font weights for hierarchy

5. **Define consistent spacing**
   - Tighter spacing for dashboards/dense UIs
   - Generous spacing for marketing/editorial sites
   - Maintain vertical rhythm

6. **Use industry-appropriate geometry**
   - Sharp corners (small radius) → precision, formality
   - Soft corners (large radius) → friendliness, approachability
   - Moderate corners → balanced, modern

## Validation

Themes are automatically validated for:
- Valid HSL color format
- Contrast ratios (AA standard)
- Valid Google Font families and variants
- Font URL correctness
- Chart color distinctiveness

## Examples

See `theme-1.json` for a complete example theme.

## CSS Variable Reference

All theme properties are exposed as CSS variables:

```css
/* Colors */
--background, --foreground
--card, --card-foreground
--popover, --popover-foreground
--primary, --primary-foreground
--secondary, --secondary-foreground
--muted, --muted-foreground
--accent, --accent-foreground
--destructive, --destructive-foreground
--border, --input, --ring

/* Charts */
--chart-1, --chart-2, --chart-3, --chart-4, --chart-5

/* Typography */
--font-sans, --font-heading
--font-size-xs, --font-size-sm, --font-size-base, etc.

/* Geometry */
--radius
--spacing-section-x, --spacing-section-y

/* Layout */
--containerWidth, --contentPadding

/* Shadows & Transitions */
--shadow, --shadowSm, --shadowMd, etc.
--transitionDuration, --transitionTimingFunction
```

## Best Practices

1. **Always use semantic tokens** - Never hardcode colors
2. **Test in both modes** - Verify light and dark appearances
3. **Maintain consistency** - Use the same token for similar UI elements
4. **Consider accessibility** - Ensure sufficient contrast
5. **Preserve theme structure** - Don't modify generated themes unless necessary
6. **Use appropriate scales** - Match font sizes and spacing to content density

## Resources

- [WCAG Contrast Checker](https://webaim.org/resources/contrastchecker/)
- [Google Fonts](https://fonts.google.com/)
- [HSL Color Picker](https://hslpicker.com/)
- [Tailwind CSS Variables](https://tailwindcss.com/docs/customizing-colors#using-css-variables)

