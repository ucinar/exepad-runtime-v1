# example_utils.py - Quick Reference

## Overview
The `example_utils.py` module provides utility functions for retrieving examples from the examples folder. It follows the same pattern as `full_schema_utils.py` and provides functions to get example catalogs and specific examples by ID.

## Categories
The module supports all example categories:
- **blocks** - UI block examples (hero, features, testimonials, etc.)
- **blog** - Blog and blog post examples
- **components** - Component kitchen sink examples
- **forms** - Form examples (contact, booking, survey, etc.)
- **full** - Full website/application examples
- **skeleton** - Skeleton/template examples

## Function Pattern
For each category, there are two main functions:
1. `get_example_catalog_<category>()` - Get the catalog listing all available examples
2. `get_example_<category>_by_id(example_id)` - Get a specific example by its ID

## Usage Examples

### Blocks
```python
from app_runtime.schemas.scripts.example_utils import (
    get_example_catalog_blocks,
    get_example_blocks_by_id
)

# Get the blocks catalog
result = get_example_catalog_blocks()
if result["status"] == "success":
    catalog = result["catalog"]
    # catalog is a dict: {"block-id": "description", ...}

# Get a specific block
result = get_example_blocks_by_id("block-hero-1")
if result["status"] == "success":
    block = result["example"]
    # block contains the full JSON data
```

### Blog
```python
from app_runtime.schemas.scripts.example_utils import (
    get_example_catalog_blog,
    get_example_blog_by_id
)

# Get the blog catalog
result = get_example_catalog_blog()

# Get a specific blog example
# Blog has subfolders: 'main' and 'posts'
result = get_example_blog_by_id("website-with-blog", subfolder="main")
result = get_example_blog_by_id("post-ai-web-development", subfolder="posts")
```

### Components
```python
from app_runtime.schemas.scripts.example_utils import (
    get_example_catalog_components,
    get_example_components_by_id
)

result = get_example_catalog_components()
result = get_example_components_by_id("kitchen-sink-core")
```

### Forms
```python
from app_runtime.schemas.scripts.example_utils import (
    get_example_catalog_forms,
    get_example_forms_by_id
)

result = get_example_catalog_forms()
result = get_example_forms_by_id("form-contact")
```

### Full
```python
from app_runtime.schemas.scripts.example_utils import (
    get_example_catalog_full,
    get_example_full_by_id
)

result = get_example_catalog_full()

# Full has subfolders: 'websites', 'forms', 'blog_posts'
result = get_example_full_by_id("website-blog-example", subfolder="websites")
result = get_example_full_by_id("form-booking", subfolder="forms")
```

### Skeleton
```python
from app_runtime.schemas.scripts.example_utils import (
    get_example_catalog_skeleton,
    get_example_skeleton_by_id
)

result = get_example_catalog_skeleton()
result = get_example_skeleton_by_id("block-footer-1")
```

## Async Versions
All functions have async versions with the `async_` prefix:

```python
from app_runtime.schemas.scripts.example_utils import (
    async_get_example_catalog_blocks,
    async_get_example_blocks_by_id
)

# Use with await
result = await async_get_example_catalog_blocks()
result = await async_get_example_blocks_by_id("block-hero-1")
```

## Helper Functions for Prompt Generation
String helper functions are available for prompt generation:

```python
from app_runtime.schemas.scripts.example_utils import (
    get_example_blocks_catalog_str,
    get_example_blog_catalog_str,
    get_example_components_catalog_str,
    get_example_forms_catalog_str,
    get_example_full_catalog_str,
    get_example_skeleton_catalog_str
)

# Returns formatted JSON string
blocks_catalog_str = get_example_blocks_catalog_str()
```

## Return Format
All functions return a dictionary with:
- `status`: Either "success" or "error"
- `catalog` or `example`: The data (on success)
- `error_message`: Error description (on failure)

Example:
```python
{
    "status": "success",
    "catalog": {"example-id-1": "description", ...}
}

# or

{
    "status": "success",
    "example": {/* JSON data */}
}

# or on error

{
    "status": "error",
    "error_message": "File not found..."
}
```

## Complete Function List

### Blocks Category
- `get_example_catalog_blocks()`
- `get_example_blocks_by_id(example_id)`
- `async_get_example_catalog_blocks()`
- `async_get_example_blocks_by_id(example_id)`
- `get_example_blocks_catalog_str()`

### Blog Category
- `get_example_catalog_blog()`
- `get_example_blog_by_id(example_id, subfolder='main')`
- `async_get_example_catalog_blog()`
- `async_get_example_blog_by_id(example_id, subfolder='main')`
- `get_example_blog_catalog_str()`

### Components Category
- `get_example_catalog_components()`
- `get_example_components_by_id(example_id)`
- `async_get_example_catalog_components()`
- `async_get_example_components_by_id(example_id)`
- `get_example_components_catalog_str()`

### Forms Category
- `get_example_catalog_forms()`
- `get_example_forms_by_id(example_id)`
- `async_get_example_catalog_forms()`
- `async_get_example_forms_by_id(example_id)`
- `get_example_forms_catalog_str()`

### Full Category
- `get_example_catalog_full()`
- `get_example_full_by_id(example_id, subfolder='websites')`
- `async_get_example_catalog_full()`
- `async_get_example_full_by_id(example_id, subfolder='websites')`
- `get_example_full_catalog_str()`

### Skeleton Category
- `get_example_catalog_skeleton()`
- `get_example_skeleton_by_id(example_id)`
- `async_get_example_catalog_skeleton()`
- `async_get_example_skeleton_by_id(example_id)`
- `get_example_skeleton_catalog_str()`

## Running the Demo
To see all functions in action:
```bash
cd src/app_runtime/schemas/scripts
python3 example_utils_demo.py
```

