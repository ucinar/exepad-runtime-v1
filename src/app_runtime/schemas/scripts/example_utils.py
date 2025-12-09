"""
Utility functions for retrieving examples from the examples folder.

This module provides functions to retrieve example catalogs and specific examples
by ID for all categories: blocks, blog, components, forms, full, and skeleton.
"""

import json
import os
from typing import Optional

# Path configuration
current_dir = os.path.dirname(os.path.abspath(__file__))
EXAMPLES_BASE_PATH = os.path.join(current_dir, '../examples')


def _read_catalog_file(catalog_name: str) -> dict:
    """
    Helper function to read a catalog file.
    
    Args:
        catalog_name: Name of the catalog file (e.g., 'catalog_blocks.json')
        
    Returns:
        dict: Dictionary with 'status' and 'catalog' or 'error_message'
    """
    catalog_path = os.path.join(EXAMPLES_BASE_PATH, catalog_name)
    try:
        with open(catalog_path, 'r', encoding='utf-8') as file:
            catalog = json.load(file)
        return {
            "status": "success",
            "catalog": catalog
        }
    except FileNotFoundError:
        return {
            "status": "error",
            "error_message": f"Catalog file not found at {catalog_path}"
        }
    except Exception as e:
        return {
            "status": "error",
            "error_message": f"Error reading catalog: {e}"
        }


def _read_example_file(category: str, example_id: str, subfolder: Optional[str] = None) -> dict:
    """
    Helper function to read an example file by ID.
    
    Args:
        category: Category name (e.g., 'blocks', 'blog', 'components')
        example_id: Example ID (e.g., 'block-hero-1')
        subfolder: Optional subfolder within category (e.g., 'main', 'posts' for blog)
        
    Returns:
        dict: Dictionary with 'status' and 'example' or 'error_message'
    """
    if subfolder:
        example_path = os.path.join(EXAMPLES_BASE_PATH, category, subfolder, f"{example_id}.json")
    else:
        example_path = os.path.join(EXAMPLES_BASE_PATH, category, f"{example_id}.json")
    
    try:
        with open(example_path, 'r', encoding='utf-8') as file:
            example = json.load(file)
        return {
            "status": "success",
            "example": example
        }
    except FileNotFoundError:
        return {
            "status": "error",
            "error_message": f"Example file not found at {example_path}"
        }
    except Exception as e:
        return {
            "status": "error",
            "error_message": f"Error reading example: {e}"
        }


# ============================================================================
# BLOCKS Category Functions
# ============================================================================

def get_example_catalog_blocks() -> dict:
    """
    Retrieves the blocks catalog containing all available block examples.
    
    Returns:
        dict: Dictionary with 'status' ('success' or 'error') and 'catalog' 
              (mapping of block IDs to descriptions)
    
    Example:
        result = get_example_catalog_blocks()
        if result["status"] == "success":
            catalog = result["catalog"]
            print(catalog["block-hero-1"])
    """
    return _read_catalog_file('catalog_blocks.json')


def get_example_blocks_by_id(example_id: str) -> dict:
    """
    Retrieves a specific block example by its ID.
    
    Args:
        example_id: The block ID (e.g., 'block-hero-1', 'block-feature-2')
        
    Returns:
        dict: Dictionary with 'status' ('success' or 'error') and 'example' 
              (the block example data)
    
    Example:
        result = get_example_blocks_by_id("block-hero-1")
        if result["status"] == "success":
            block = result["example"]
    """
    return _read_example_file('blocks', example_id)


# ============================================================================
# BLOG Category Functions
# ============================================================================

def get_example_catalog_blog() -> dict:
    """
    Retrieves the blog catalog containing all available blog examples.
    
    Returns:
        dict: Dictionary with 'status' ('success' or 'error') and 'catalog' 
              (mapping of blog IDs to descriptions)
    
    Example:
        result = get_example_catalog_blog()
        if result["status"] == "success":
            catalog = result["catalog"]
    """
    return _read_catalog_file('catalog_blog.json')


def get_example_blog_by_id(example_id: str, subfolder: str = 'main') -> dict:
    """
    Retrieves a specific blog example by its ID.
    
    Args:
        example_id: The blog ID (e.g., 'website-with-blog', 'post-ai-web-development')
        subfolder: The subfolder ('main' or 'posts'), defaults to 'main'
        
    Returns:
        dict: Dictionary with 'status' ('success' or 'error') and 'example' 
              (the blog example data)
    
    Example:
        result = get_example_blog_by_id("website-with-blog", "main")
        if result["status"] == "success":
            blog = result["example"]
    """
    return _read_example_file('blog', example_id, subfolder)


# ============================================================================
# COMPONENTS Category Functions
# ============================================================================

def get_example_catalog_components() -> dict:
    """
    Retrieves the components catalog containing all available component examples.
    
    Returns:
        dict: Dictionary with 'status' ('success' or 'error') and 'catalog' 
              (mapping of component IDs to descriptions)
    
    Example:
        result = get_example_catalog_components()
        if result["status"] == "success":
            catalog = result["catalog"]
    """
    return _read_catalog_file('catalog_components.json')


def get_example_components_by_id(example_id: str) -> dict:
    """
    Retrieves a specific component example by its ID.
    
    Args:
        example_id: The component ID (e.g., 'kitchen-sink-core', 'kitchen-sink-forms')
        
    Returns:
        dict: Dictionary with 'status' ('success' or 'error') and 'example' 
              (the component example data)
    
    Example:
        result = get_example_components_by_id("kitchen-sink-core")
        if result["status"] == "success":
            component = result["example"]
    """
    return _read_example_file('components', example_id)


# ============================================================================
# FORMS Category Functions
# ============================================================================

def get_example_catalog_forms() -> dict:
    """
    Retrieves the forms catalog containing all available form examples.
    
    Returns:
        dict: Dictionary with 'status' ('success' or 'error') and 'catalog' 
              (mapping of form IDs to descriptions)
    
    Example:
        result = get_example_catalog_forms()
        if result["status"] == "success":
            catalog = result["catalog"]
    """
    return _read_catalog_file('catalog_forms.json')


def get_example_forms_by_id(example_id: str) -> dict:
    """
    Retrieves a specific form example by its ID.
    
    Args:
        example_id: The form ID (e.g., 'form-contact', 'form-booking')
        
    Returns:
        dict: Dictionary with 'status' ('success' or 'error') and 'example' 
              (the form example data)
    
    Example:
        result = get_example_forms_by_id("form-contact")
        if result["status"] == "success":
            form = result["example"]
    """
    return _read_example_file('forms', example_id)


# ============================================================================
# FULL Category Functions
# ============================================================================

def get_example_catalog_full() -> dict:
    """
    Retrieves the full catalog containing all available full example types.
    
    Returns:
        dict: Dictionary with 'status' ('success' or 'error') and 'catalog' 
              (mapping of full example IDs to descriptions)
    
    Example:
        result = get_example_catalog_full()
        if result["status"] == "success":
            catalog = result["catalog"]
    """
    return _read_catalog_file('catalog_full.json')


def get_example_full_by_id(example_id: str, subfolder: str = 'websites') -> dict:
    """
    Retrieves a specific full example by its ID.
    
    Args:
        example_id: The full example ID
        subfolder: The subfolder ('websites', 'forms', 'blog_posts'), defaults to 'websites'
        
    Returns:
        dict: Dictionary with 'status' ('success' or 'error') and 'example' 
              (the full example data)
    
    Example:
        result = get_example_full_by_id("saas-startup-ai", "websites")
        if result["status"] == "success":
            full_example = result["example"]
    """
    return _read_example_file('full', example_id, subfolder)


# ============================================================================
# SKELETON Category Functions
# ============================================================================

def get_example_catalog_skeleton() -> dict:
    """
    Retrieves the skeleton catalog containing all available skeleton examples.
    
    Returns:
        dict: Dictionary with 'status' ('success' or 'error') and 'catalog' 
              (mapping of skeleton IDs to descriptions)
    
    Example:
        result = get_example_catalog_skeleton()
        if result["status"] == "success":
            catalog = result["catalog"]
    """
    return _read_catalog_file('catalog_skeleton.json')


def get_example_skeleton_by_id(example_id: str) -> dict:
    """
    Retrieves a specific skeleton example by its ID.
    
    Args:
        example_id: The skeleton ID
        
    Returns:
        dict: Dictionary with 'status' ('success' or 'error') and 'example' 
              (the skeleton example data)
    
    Example:
        result = get_example_skeleton_by_id("skeleton-1")
        if result["status"] == "success":
            skeleton = result["example"]
    """
    return _read_example_file('skeleton', example_id)


# ============================================================================
# Async versions for compatibility
# ============================================================================

async def async_get_example_catalog_blocks() -> dict:
    """Async version of get_example_catalog_blocks()"""
    return get_example_catalog_blocks()


async def async_get_example_blocks_by_id(example_id: str) -> dict:
    """Async version of get_example_blocks_by_id()"""
    return get_example_blocks_by_id(example_id)


async def async_get_example_catalog_blog() -> dict:
    """Async version of get_example_catalog_blog()"""
    return get_example_catalog_blog()


async def async_get_example_blog_by_id(example_id: str, subfolder: str = 'main') -> dict:
    """Async version of get_example_blog_by_id()"""
    return get_example_blog_by_id(example_id, subfolder)


async def async_get_example_catalog_components() -> dict:
    """Async version of get_example_catalog_components()"""
    return get_example_catalog_components()


async def async_get_example_components_by_id(example_id: str) -> dict:
    """Async version of get_example_components_by_id()"""
    return get_example_components_by_id(example_id)


async def async_get_example_catalog_forms() -> dict:
    """Async version of get_example_catalog_forms()"""
    return get_example_catalog_forms()


async def async_get_example_forms_by_id(example_id: str) -> dict:
    """Async version of get_example_forms_by_id()"""
    return get_example_forms_by_id(example_id)


async def async_get_example_catalog_full() -> dict:
    """Async version of get_example_catalog_full()"""
    return get_example_catalog_full()


async def async_get_example_full_by_id(example_id: str, subfolder: str = 'websites') -> dict:
    """Async version of get_example_full_by_id()"""
    return get_example_full_by_id(example_id, subfolder)


async def async_get_example_catalog_skeleton() -> dict:
    """Async version of get_example_catalog_skeleton()"""
    return get_example_catalog_skeleton()


async def async_get_example_skeleton_by_id(example_id: str) -> dict:
    """Async version of get_example_skeleton_by_id()"""
    return get_example_skeleton_by_id(example_id)

