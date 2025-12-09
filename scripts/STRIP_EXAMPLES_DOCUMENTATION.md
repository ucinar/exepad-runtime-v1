# Example Catalog Generation - Strip Examples Feature

## Overview
The `generate-example-catalog.js` script now supports a `--strip-examples` parameter that allows you to strip specific fields from examples based on their category. This is useful when you want to reduce the size of examples or remove unnecessary data for specific use cases.

## Usage

### Basic Usage (No Stripping)
```bash
npm run gen:schemas:examples
# or
node scripts/generate-example-catalog.js
```

### With Stripping Enabled
```bash
npm run gen:schemas:examples:stripped
# or
node scripts/generate-example-catalog.js --strip-examples
```

## Stripping Rules

When `--strip-examples` is enabled, the script strips fields based on the category:

### Blocks Category
Strips the following fields by setting them to empty arrays/objects:
- `header` → `[]`
- `footer` → `[]`
- `theme` → `{}`
- `languages` → `[]`

### Blog Category
Strips the following fields:
- `header` → `[]`
- `footer` → `[]`
- `theme` → `{}`
- `languages` → `[]`

### Components Category
Strips the following fields:
- `header` → `[]`
- `footer` → `[]`
- `theme` → `{}`
- `languages` → `[]`

### Forms Category
Strips the following fields:
- `header` → `[]`
- `footer` → `[]`
- `theme` → `{}`
- `languages` → `[]`

### Skeleton Category
Strips the following fields:
- `pages` → `[]`
- `theme` → `{}`

### Full Category
**No stripping applied** - full examples are kept intact with all their data.

## Example

### Before Stripping (block-hero-1.json):
```json
{
  "name": "InvestCo",
  "header": [{ "componentType": "Header", ... }],
  "footer": [{ "componentType": "Footer", ... }],
  "theme": { "light": { ... }, "dark": { ... } },
  "languages": [{ "code": "en", "nameEnglish": "English", ... }],
  "pages": [...]
}
```

### After Stripping (with --strip-examples):
```json
{
  "name": "InvestCo",
  "header": [],
  "footer": [],
  "theme": {},
  "languages": [],
  "pages": [...]
}
```

## NPM Scripts

Two scripts are available:

| Script | Command | Description |
|--------|---------|-------------|
| `gen:schemas:examples` | `npm run gen:schemas:examples` | Generate examples without stripping |
| `gen:schemas:examples:stripped` | `npm run gen:schemas:examples:stripped` | Generate examples with stripping enabled |

## Use Cases

### When to Use Stripping
- Reducing example file size for LLM prompts
- Focusing on page content without header/footer/theme complexity
- Testing or development environments where full data is not needed
- Creating simplified examples for documentation

### When NOT to Use Stripping
- Production environments requiring complete examples
- When header, footer, theme, or language data is needed
- When generating examples for validation or testing
- When examples need to be fully functional

## Verification

You can verify the stripping is working correctly by checking the generated files:

```bash
# Run with stripping
npm run gen:schemas:examples:stripped

# Check a blocks example
cat src/app_runtime/schemas/examples/blocks/block-hero-1.json | grep -A 1 "header\|footer\|theme\|languages"

# Check a full example (should NOT be stripped)
cat src/app_runtime/schemas/examples/full/websites/website-blog-example.json | grep -A 1 "header\|footer\|theme"
```

## Implementation Details

The script:
1. Parses command line arguments to check for `--strip-examples` flag
2. When enabled, applies the `stripExampleFields()` function during file copying
3. Reads each JSON file, strips the appropriate fields based on category
4. Writes the modified JSON back to the destination
5. Falls back to simple copy if there's an error parsing/stripping

The stripping logic is category-aware and ensures that:
- Arrays are set to empty arrays `[]`
- Objects are set to empty objects `{}`
- All other fields remain unchanged
- Full examples are never modified

## Output

When stripping is enabled, you'll see this message in the console:

```
🔄 Generating example catalogs and copying files...
📂 Source: public/example/apps/webapp
📁 Output Directory: src/app_runtime/schemas/examples
📋 Subcategories: blocks, skeleton, components, forms, blog, full
✂️  Strip examples mode: ENABLED
```

This confirms that the `--strip-examples` flag is active and stripping will be applied.

