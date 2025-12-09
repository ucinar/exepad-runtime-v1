"""
Utility functions for retrieving schemas from the full_schema_model folder.

This module provides functions to retrieve the complete unified catalog and specific
schemas (apps, pages, components) from the full_schema_model directory.
"""

import json
import os
import re

# Path configuration
current_dir = os.path.dirname(os.path.abspath(__file__))
FULL_SCHEMA_BASE_PATH = os.path.join(current_dir, '../full_schema_model')
FULL_CATALOG_PATH_ABS = os.path.join(FULL_SCHEMA_BASE_PATH, 'full_catalog.json')
FULL_SCHEMA_PATH_ABS = os.path.join(FULL_SCHEMA_BASE_PATH, 'full_schema.json')


def _find_schema_references(schema_obj) -> set:
    """
    Recursively finds all schema type references in a schema object.
    Returns a set of type names that are referenced.
    
    Args:
        schema_obj: The schema object to search for references
        
    Returns:
        set: A set of referenced type names
    """
    references = set()
    
    if isinstance(schema_obj, dict):
        for key, value in schema_obj.items():
            if key == "$ref" and isinstance(value, str):
                # Extract type from reference like "#/definitions/TypeName"
                match = re.search(r'#/definitions/([^/]+)', value)
                if match:
                    references.add(match.group(1))
            else:
                references.update(_find_schema_references(value))
    elif isinstance(schema_obj, list):
        for item in schema_obj:
            references.update(_find_schema_references(item))
    
    return references


def get_exepad_schema_catalog() -> dict:
    """
    Reads the full schema catalog from the file and returns it as a dictionary.
    The catalog contains apps, pages, and components sections.
    
    Returns:
        dict: Dictionary with 'status' ('success' or 'error') and 'catalog' (the catalog data)
    """
    try:
        with open(FULL_CATALOG_PATH_ABS, 'r', encoding='utf-8') as file:
            catalog = json.load(file)
        return {
            "status": "success",
            "catalog": catalog
        }
    except FileNotFoundError:
        return {
            "status": "error",
            "error_message": f"Catalog file not found at {FULL_CATALOG_PATH_ABS}"
        }
    except Exception as e:
        return {
            "status": "error",
            "error_message": f"Error reading catalog: {e}"
        }


def get_exepad_schema(schema_list: list[str], include_dependencies: bool = True) -> dict:
    """
    Reads specific schemas from the full schema file and returns them as a dictionary.
    
    This function retrieves the requested schemas (apps, pages, or components) from the
    full_schema.json file. It can optionally include all dependent schemas that are
    referenced by the requested schemas.
    
    Args:
        schema_list: list[str]
            A list of schema type names to retrieve. Can include apps (e.g., 'WebAppProps'),
            pages (e.g., 'WebPageProps', 'BlogPostPageProps'), and components
            (e.g., 'ButtonProps').
            
        include_dependencies: bool (default: True)
            If True, automatically includes all schemas that are referenced by the
            requested schemas. This ensures you get a complete, self-contained set of
            schemas. Set to False if you only want the exact schemas requested.
    
    Returns:
        dict: Dictionary with 'status' ('success' or 'error') and 'schemas' (list of schemas)
    
    Example:
        # Get ButtonProps and all its dependencies
        result = get_exepad_schema(['ButtonProps'])
        if result["status"] == "success":
            schemas = result["schemas"]
    """
    schema_dict = {}
    visited_types = set()
    
    try:
        with open(FULL_SCHEMA_PATH_ABS, 'r', encoding='utf-8') as file:
            full_schema = json.load(file)
            
            if "definitions" not in full_schema:
                return {
                    "status": "error",
                    "error_message": "No definitions found in full schema"
                }
            
            def resolve_ref(schema_obj, definitions, resolving=None):
                """
                Recursively resolve $ref references in a schema object.
                This replaces $ref with the actual schema definition inline.
                
                Args:
                    schema_obj: The schema object to resolve
                    definitions: The definitions dictionary from the full schema
                    resolving: Set of types currently being resolved (to detect circular refs)
                
                Returns:
                    The schema object with all $ref references resolved inline
                """
                if resolving is None:
                    resolving = set()
                
                if isinstance(schema_obj, dict):
                    # Check if this is a $ref
                    if "$ref" in schema_obj:
                        ref_path = schema_obj["$ref"]
                        if ref_path.startswith("#/definitions/"):
                            ref_type = ref_path.replace("#/definitions/", "")
                            
                            # Check for circular references
                            if ref_type in resolving:
                                # Return the ref as-is to avoid infinite recursion
                                return schema_obj
                            
                            if ref_type in definitions:
                                # Add to resolving set to track circular refs
                                resolving.add(ref_type)
                                
                                # Get the referenced schema and resolve it
                                referenced_schema = definitions[ref_type]
                                resolved = resolve_ref(referenced_schema, definitions, resolving)
                                
                                # Remove from resolving set
                                resolving.discard(ref_type)
                                
                                # Merge any additional properties from the $ref object
                                # (like "default", "description", etc.)
                                result = {**resolved}
                                for key, value in schema_obj.items():
                                    if key != "$ref":
                                        result[key] = value
                                
                                return result
                        # If ref doesn't match expected pattern, return as-is
                        return schema_obj
                    else:
                        # Recursively resolve all nested objects
                        return {k: resolve_ref(v, definitions, resolving) for k, v in schema_obj.items()}
                elif isinstance(schema_obj, list):
                    return [resolve_ref(item, definitions, resolving) for item in schema_obj]
                else:
                    return schema_obj
            
            def collect_schema_and_dependencies(schema_type: str):
                """Recursively collect schema and all its dependencies"""
                if schema_type in visited_types:
                    return
                    
                visited_types.add(schema_type)
                
                try:
                    if schema_type in full_schema["definitions"]:
                        schema_def = full_schema["definitions"][schema_type]
                        # Resolve all $ref references inline before storing
                        resolved_schema = resolve_ref(schema_def, full_schema["definitions"])
                        schema_with_type = {
                            "schemaTypeName": schema_type,
                            **resolved_schema
                        }
                        schema_dict[schema_type] = schema_with_type
                        
                        if include_dependencies:
                            referenced_types = _find_schema_references(schema_def)
                            for ref_type in referenced_types:
                                collect_schema_and_dependencies(ref_type)
                    else:
                        print(f"Warning: Schema type '{schema_type}' not found in full schema")
                        
                except Exception as e:
                    print(f"Error getting schema for '{schema_type}': {e}")
            
            # Start with the requested schema types
            for schema_type in schema_list:
                collect_schema_and_dependencies(schema_type)
        
        schema_list_result = list(schema_dict.values())
        requested_set = set(schema_list)
        schema_list_result.sort(
            key=lambda x: (x['schemaTypeName'] not in requested_set, x['schemaTypeName'])
        )
        
        return {
            "status": "success",
            "schemas": schema_list_result
        }
        
    except FileNotFoundError:
        return {
            "status": "error",
            "error_message": f"Schema file not found at {FULL_SCHEMA_PATH_ABS}"
        }
    except Exception as e:
        return {
            "status": "error",
            "error_message": f"Error reading schema: {e}"
        }


def get_app_schemas() -> dict:
    """
    Retrieves all app schemas from the full schema.
    This includes WebAppProps and all related app types.
    
    Returns:
        dict: Dictionary with 'status' ('success' or 'error') and 'schemas' (list of app schemas)
    """
    try:
        catalog_result = get_exepad_schema_catalog()
        if catalog_result["status"] != "success":
            return catalog_result
        
        catalog = catalog_result["catalog"]
        app_types = [app['appType'] for app in catalog.get('apps', [])]
        
        if not app_types:
            return {
                "status": "error",
                "error_message": "No app types found in catalog"
            }
            
        return get_exepad_schema(app_types, include_dependencies=True)
        
    except Exception as e:
        return {
            "status": "error",
            "error_message": f"Error getting app schemas: {e}"
        }


def get_page_schemas() -> dict:
    """
    Retrieves all page schemas from the full schema.
    This includes WebPageProps, BlogMainPageProps, BlogPostPageProps, etc.
    
    Returns:
        dict: Dictionary with 'status' ('success' or 'error') and 'schemas' (list of page schemas)
    """
    try:
        catalog_result = get_exepad_schema_catalog()
        if catalog_result["status"] != "success":
            return catalog_result
        
        catalog = catalog_result["catalog"]
        page_types = [page['pageType'] for page in catalog.get('pages', [])]
        
        if not page_types:
            return {
                "status": "error",
                "error_message": "No page types found in catalog"
            }
            
        return get_exepad_schema(page_types, include_dependencies=True)
        
    except Exception as e:
        return {
            "status": "error",
            "error_message": f"Error getting page schemas: {e}"
        }


def get_component_schemas(component_types: list[str] = None) -> dict:
    """
    Retrieves component schemas from the full schema.
    
    Args:
        component_types: list[str] (optional)
            List of specific component types to retrieve. If None, retrieves all components.
    
    Returns:
        dict: Dictionary with 'status' ('success' or 'error') and 'schemas' (list of component schemas)
    """
    try:
        if component_types is None:
            catalog_result = get_exepad_schema_catalog()
            if catalog_result["status"] != "success":
                return catalog_result
            
            catalog = catalog_result["catalog"]
            component_types = [comp['componentType'] for comp in catalog.get('components', [])]
        
        if not component_types:
            return {
                "status": "error",
                "error_message": "No component types specified or found"
            }
            
        return get_exepad_schema(component_types, include_dependencies=True)
        
    except Exception as e:
        return {
            "status": "error",
            "error_message": f"Error getting component schemas: {e}"
        }

def get_exepad_theme_schema() -> dict:
    """
    Retrieves the theme schema from the full schema.
    This includes ThemeProps and all related theme types.
    
    Returns:
        dict: Dictionary with 'status' ('success' or 'error') and 'schema' (the theme schema)
    """
    try:
        return get_exepad_schema(schema_list=["ThemeProps"], include_dependencies=True)
    except Exception as e:
        return {
            "status": "error",
            "error_message": f"Error getting theme schema: {e}"
        }
   

# Async versions for compatibility with existing codebase
async def async_get_schema_catalog() -> dict:
    """Async version of get_exepad_schema_catalog()"""
    return get_exepad_schema_catalog()


async def async_get_schema(schema_list: list[str], include_dependencies: bool = True) -> dict:
    """Async version of get_exepad_schema()"""
    return get_exepad_schema(schema_list, include_dependencies)


async def async_get_app_schemas() -> dict:
    """Async version of get_app_schemas()"""
    return get_app_schemas()


async def async_get_page_schemas() -> dict:
    """Async version of get_page_schemas()"""
    return get_page_schemas()


async def async_get_component_schemas(component_types: list[str] = None) -> dict:
    """Async version of get_component_schemas()"""
    return get_component_schemas(component_types)



# Helper functions for prompt generation - return formatted JSON strings
def get_app_schema_str() -> str:
    """Helper function for prompt generation - returns formatted JSON string."""
    result = get_exepad_schema(schema_list=["WebAppProps"], include_dependencies=True)
    if result["status"] == "success":
        return "```json\n" + json.dumps(result["schemas"], ensure_ascii=False, separators=(',', ':')) + "\n```"
    else:
        return f"Error: {result.get('error_message', 'Unknown error')}"

