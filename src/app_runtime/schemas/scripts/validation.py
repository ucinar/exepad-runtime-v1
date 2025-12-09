import json
from typing import Any
from jsonschema import validators, RefResolver, FormatChecker
import os
import json_repair

#Paths to utilize the schemas
current_dir             = os.path.dirname(os.path.abspath(__file__))
SCHEMAS_BASE_PATH       = current_dir
CATALOG_PATH_ABS        = os.path.join(SCHEMAS_BASE_PATH, '../full_schema_model', 'full_catalog.json')
LEAPDO_SCHEMA_PATH_ABS  = os.path.join(SCHEMAS_BASE_PATH, '../full_schema_model', 'full_schema.json')
APP_SCHEMA_PATH_ABS     = os.path.join(SCHEMAS_BASE_PATH, '../full_schema_model', 'full_schema.json')  
LUCIDE_ICONS_PATH_ABS   = os.path.join(SCHEMAS_BASE_PATH, '../icons', 'lucide_icons.txt')
GOOGLE_FONTS_PATH_ABS   = os.path.join(SCHEMAS_BASE_PATH, '../fonts', 'google_fonts.json')

# Global list of component types to skip during validation
# Add component type names here to skip their validation
SKIP_VALIDATION_COMPONENTS = [
    "IconProps",  # Example: Skip IconProps validation
    # Add more component types here as needed
]

# Load Lucide icons list once at module load for performance
_LUCIDE_ICONS_SET = None

# Load Google fonts data once at module load for performance
_GOOGLE_FONTS_DATA = None

def _get_lucide_icons_set():
    """Load Lucide icons into a set for fast lookup."""
    global _LUCIDE_ICONS_SET
    if _LUCIDE_ICONS_SET is None:
        try:
            with open(LUCIDE_ICONS_PATH_ABS, 'r') as f:
                _LUCIDE_ICONS_SET = set(f.read().splitlines())
        except FileNotFoundError:
            print(f"Warning: Lucide icons file not found at {LUCIDE_ICONS_PATH_ABS}")
            _LUCIDE_ICONS_SET = set()
    return _LUCIDE_ICONS_SET

def _get_google_fonts_data():
    """Load Google fonts data with family names and their valid variants."""
    global _GOOGLE_FONTS_DATA
    if _GOOGLE_FONTS_DATA is None:
        try:
            with open(GOOGLE_FONTS_PATH_ABS, 'r') as f:
                fonts_data = json.load(f)
                # Create a dictionary mapping family names to their variants
                _GOOGLE_FONTS_DATA = {
                    item['family']: item.get('variants', []) 
                    for item in fonts_data.get('items', [])
                }
        except FileNotFoundError:
            print(f"Warning: Google fonts file not found at {GOOGLE_FONTS_PATH_ABS}")
            _GOOGLE_FONTS_DATA = {}
        except (json.JSONDecodeError, KeyError) as e:
            print(f"Warning: Error parsing Google fonts file: {e}")
            _GOOGLE_FONTS_DATA = {}
    return _GOOGLE_FONTS_DATA

def validate_icon_list(icon_list: list[str]) ->  list[str]:
    """
    Tool: For the given list of icon names, validate if they are valid Lucide icon names.

    Args:
        icon_list (list[str]): List of icon names to validate.

    Returns:
        list[str]: List of errors if any, empty list if all icons are valid.
    """
    lucide_icons_set = _get_lucide_icons_set()
    errors = []
    for icon_name in icon_list:
        if icon_name not in lucide_icons_set:
            errors.append(f"Invalid icon name: {icon_name}")
    return errors

def validate_single_icon_name(icon_name: str) -> str | None:
    """
    Validate a single icon name.
    
    Args:
        icon_name (str): Icon name to validate.
        
    Returns:
        str | None: Error message if invalid, None if valid.
    """
    lucide_icons_set = _get_lucide_icons_set()
    icon_name_lower = icon_name.lower()
    if icon_name_lower not in lucide_icons_set:
        return f"Invalid icon name: '{icon_name}'"
    return None

def validate_font_list(font_list: list[str]) -> list[str]:
    """
    Tool: For the given list of font family names, validate if they are valid Google Font families.

    Args:
        font_list (list[str]): List of font family names to validate.

    Returns:
        list[str]: List of errors if any, empty list if all fonts are valid.
    """
    google_fonts_data = _get_google_fonts_data()
    errors = []
    for font_name in font_list:
        if font_name not in google_fonts_data:
            errors.append(f"Invalid font family: {font_name}")
    return errors

def validate_single_font_family(font_family: str) -> str | None:
    """
    Validate a single font family name.
    
    Args:
        font_family (str): Font family name to validate.
        
    Returns:
        str | None: Error message if invalid, None if valid.
    """
    google_fonts_data = _get_google_fonts_data()
    if font_family not in google_fonts_data:
        return f"Invalid font family: '{font_family}'"
    return None

def validate_font_variant(font_family: str, variant: str) -> str | None:
    """
    Validate a font variant for a specific font family.
    
    Args:
        font_family (str): Font family name.
        variant (str): Font variant (weight/style) to validate.
        
    Returns:
        str | None: Error message if invalid, None if valid.
    """
    google_fonts_data = _get_google_fonts_data()
    if font_family not in google_fonts_data:
        return f"Invalid font family: '{font_family}'"
    
    # Map common variant names to actual Google Fonts variant codes
    variant_mapping = {
        'regular': '400',
        'italic': '400italic',
        'bold': '700',
        'bolditalic': '700italic',
    }
    
    # Normalize the variant
    normalized_variant = variant_mapping.get(variant.lower(), variant)
    
    variants = google_fonts_data[font_family]
    
    # Check if the normalized variant exists
    if normalized_variant not in variants:
        # Also check if the original variant exists (in case user provided exact code)
        if variant not in variants:
            return f"Invalid variant '{variant}' for font family '{font_family}'. Valid variants: {', '.join(variants)}"
    return None

def validate_google_fonts_url(url: str, font_family: str) -> str | None:
    """
    Validate a Google Fonts CSS URL.
    
    Args:
        url (str): The Google Fonts CSS URL to validate.
        font_family (str): Expected font family name in the URL.
        
    Returns:
        str | None: Error message if invalid, None if valid.
    """
    if not url.startswith('https://fonts.googleapis.com/css'):
        return f"Invalid Google Fonts URL: must start with 'https://fonts.googleapis.com/css'"
    
    # Check if the font family appears in the URL (with + encoding for spaces)
    encoded_family = font_family.replace(' ', '+')
    if f"family={encoded_family}" not in url:
        return f"Font family '{font_family}' not found in URL: {url}"
    
    return None

def validate_hex_color(hex_color: str) -> str | None:
    """
    Validate a hex color string.
    
    Args:
        hex_color (str): Hex color string (e.g., "#FF5733" or "FF5733")
        
    Returns:
        str | None: Error message if invalid, None if valid.
    """
    import re
    # Allow both with and without # prefix
    hex_pattern = r'^#?[0-9A-Fa-f]{6}$|^#?[0-9A-Fa-f]{3}$'
    if not re.match(hex_pattern, hex_color):
        return f"Invalid hex color: '{hex_color}'. Must be in format #RRGGBB or #RGB"
    return None

def hex_to_rgb(hex_color: str) -> tuple[int, int, int] | None:
    """
    Convert hex color to RGB tuple.
    
    Args:
        hex_color (str): Hex color string
        
    Returns:
        tuple[int, int, int] | None: RGB tuple or None if invalid
    """
    # Remove # if present
    hex_color = hex_color.lstrip('#')
    
    # Expand 3-digit hex to 6-digit
    if len(hex_color) == 3:
        hex_color = ''.join([c*2 for c in hex_color])
    
    if len(hex_color) != 6:
        return None
    
    try:
        return (int(hex_color[0:2], 16), int(hex_color[2:4], 16), int(hex_color[4:6], 16))
    except ValueError:
        return None

def get_relative_luminance(rgb: tuple[int, int, int]) -> float:
    """
    Calculate relative luminance based on WCAG 2.1.
    
    Args:
        rgb (tuple[int, int, int]): RGB color tuple
        
    Returns:
        float: Relative luminance value
    """
    def adjust(c: int) -> float:
        c = c / 255.0
        return c / 12.92 if c <= 0.03928 else ((c + 0.055) / 1.055) ** 2.4
    
    r, g, b = rgb
    return 0.2126 * adjust(r) + 0.7152 * adjust(g) + 0.0722 * adjust(b)

def get_contrast_ratio(color1: str, color2: str) -> float | None:
    """
    Calculate contrast ratio between two hex colors.
    
    Args:
        color1 (str): First hex color
        color2 (str): Second hex color
        
    Returns:
        float | None: Contrast ratio (1-21) or None if invalid colors
    """
    rgb1 = hex_to_rgb(color1)
    rgb2 = hex_to_rgb(color2)
    
    if not rgb1 or not rgb2:
        return None
    
    lum1 = get_relative_luminance(rgb1)
    lum2 = get_relative_luminance(rgb2)
    
    lighter = max(lum1, lum2)
    darker = min(lum1, lum2)
    
    return (lighter + 0.05) / (darker + 0.05)

def validate_color_contrast(foreground: str, background: str, min_ratio: float = 4.5) -> str | None:
    """
    Validate color contrast meets WCAG AA standard.
    
    Args:
        foreground (str): Foreground hex color
        background (str): Background hex color
        min_ratio (float): Minimum contrast ratio (4.5 for AA, 7.0 for AAA)
        
    Returns:
        str | None: Warning message if contrast is poor, None if acceptable
    """
    ratio = get_contrast_ratio(foreground, background)
    
    if ratio is None:
        return "Could not calculate contrast ratio - invalid colors"
    
    if ratio < min_ratio:
        return f"Low contrast ratio {ratio:.2f}:1 (recommended minimum: {min_ratio}:1 for readability)"
    
    return None

def validate_chart_colors(charts: dict) -> list[str]:
    """
    Validate chart color palette for distinctiveness.
    
    Args:
        charts (dict): Chart palette dictionary
        
    Returns:
        list[str]: List of warnings
    """
    warnings = []
    chart_colors = [v for k, v in charts.items() if k.startswith('chart-') and v]
    
    # Validate each color is a valid hex
    for i, color in enumerate(chart_colors, 1):
        err = validate_hex_color(color)
        if err:
            warnings.append(f"Chart color {i}: {err}")
    
    # Check for sufficient color variety (simple heuristic: compare first two chars)
    if len(chart_colors) >= 2:
        unique_hues = set()
        for color in chart_colors:
            rgb = hex_to_rgb(color)
            if rgb:
                # Simple hue approximation
                unique_hues.add((rgb[0] // 50, rgb[1] // 50, rgb[2] // 50))
        
        if len(unique_hues) < len(chart_colors) * 0.6:
            warnings.append("Chart colors may be too similar - consider more distinct hues for better differentiation")
    
    return warnings

def validate_hsl_lightness_contrast(color1_hsl: str, color2_hsl: str, min_diff: float = 40) -> str | None:
    """
    Validate lightness difference between two HSL colors.
    
    Args:
        color1_hsl (str): First HSL color in format "H S% L%"
        color2_hsl (str): Second HSL color in format "H S% L%"
        min_diff (float): Minimum lightness difference required (0-100)
        
    Returns:
        str | None: Error message if contrast is insufficient, None if acceptable
    """
    try:
        # Check if colors are in HSL format
        if not (' ' in color1_hsl and '%' in color1_hsl):
            return None  # Not HSL, skip validation
        if not (' ' in color2_hsl and '%' in color2_hsl):
            return None  # Not HSL, skip validation
        
        # Extract lightness values
        parts1 = color1_hsl.strip().split()
        parts2 = color2_hsl.strip().split()
        
        if len(parts1) < 3 or len(parts2) < 3:
            return None  # Invalid format, skip
        
        lightness1 = float(parts1[2].rstrip('%'))
        lightness2 = float(parts2[2].rstrip('%'))
        
        lightness_diff = abs(lightness1 - lightness2)
        
        if lightness_diff < min_diff:
            return (
                f"CRITICAL: Insufficient lightness contrast. "
                f"Color1 L={lightness1}%, Color2 L={lightness2}%. "
                f"Difference={lightness_diff:.1f}% (minimum required: {min_diff}%). "
                f"This will cause visibility issues!"
            )
        
        return None
    except (ValueError, IndexError):
        return None  # Parsing error, skip validation

def validate_app_config(app_config_str: str, target_type: str) -> dict:
    """
    Validates a complete JSON configuration against app and component schemas.
    
    This tool strips markdown fences, parses the JSON string, auto-detects the root 
    component type, and validates the entire JSON configuration (including all nested 
    components) against the combined component and app schemas. It will attempt to 
    repair broken JSON using json_repair if initial parsing fails.
    
    Supported target types:
    - WebAppProps: Full web application configuration
    - WebPageProps: Individual web page configuration
    - BlogMainPageProps: Blog listing page configuration
    - BlogPostPageProps: Individual blog post page configuration
    - ComponentProps: Generic component (auto-detects specific type)

    Args:
        app_config_str (str): JSON string to validate. May include markdown code fences.
        target_type (str): The expected root type of the JSON configuration 
                          (e.g., "WebPageProps", "WebAppProps", "BlogMainPageProps").

    Returns:
        dict: Dictionary with "valid" (bool) and "errors" (list[str]) keys.
              {"valid": True, "errors": []} if valid, otherwise {"valid": False, "errors": [...]}
              with error messages indicating location and nature of validation failures.
            
    Example:
        >>> result = validate_app_config('{"uuid": "123", ...}', "WebPageProps")
        >>> if result["valid"]:
        >>>     print("Valid!")
        >>> else:
        >>>     print(f"Errors: {result['errors']}")
        
    Note:
        - This function automatically detects the root component type if not specified
        - Validates ALL nested components recursively
        - Attempts JSON repair if initial parsing fails
        - Returns detailed error messages for debugging
    """
    print(f"VALIDATE::Validating with target type: {target_type}")
    #print(f"VALIDATE::App config: {app_config_str}")
    # 1) Strip markdown fences and whitespace
    clean_str = app_config_str.replace('```json', '').replace('```', '').strip()
    errors: list[str] = []
    app_config = ""
    is_valid_json = False
    is_fixed_json = False
    # 2) Parse JSON
    try:
        app_config = json.loads(clean_str)
        is_valid_json = True
        #app_config = json_repair.loads(clean_str)
    except json.JSONDecodeError as e:
        errors.append(f"Invalid JSON: {e.msg} at line {e.lineno}, column {e.colno}'")
        errors.append(f"""
        - The JSON you provided cannot be decoded. 
        - Rebuild the JSON from scratch. 
        - Forget about the previous response and generate a new response for the last request again.
        ### Validation Errors:
        {e.msg} at line {e.lineno}, column {e.colno}'
        """)
        return {"valid": False, "errors": errors}

    except Exception as e:
        errors.append(f"Invalid JSON: {e}")
    
    if not is_valid_json:
        return {"valid": False, "errors": errors}
    
    if not isinstance(app_config, dict):
        errors.append("Root JSON must be an object."+" Detected type: "+str(type(app_config)))
        return {"valid": False, "errors": errors}

    # 3) Auto-detect target_type
    target_type_detected = None  # Initialize to avoid UnboundLocalError
    
    if "appType" in app_config: # and "layout" in app_config
        # Use the actual appType value (e.g., "WebAppProps")
        target_type_detected = app_config["appType"]
    elif "title" in app_config and "slug" in app_config and ("pageType" in app_config or "type" in app_config):
        page_type = app_config.get("pageType") or app_config.get("type")
        if page_type in ["WebPageProps", "BlogPostPageProps", "BlogMainPageProps"]:
            target_type_detected = page_type  # Use new types directly
        else:
            return {"valid": False, "errors": [f"Invalid page type: '{page_type}'. Must be one of: WebPageProps, BlogPostPageProps, BlogMainPageProps"]}
    elif "title" in app_config and "slug" in app_config:
        target_type_detected = "WebPageProps"
    elif "componentType" in app_config:
        target_type_detected = app_config["componentType"]
    elif "light" in app_config and "dark" in app_config:  # ThemeProps detection
        target_type_detected = "ThemeProps"
    else:
        errors.append(f"Cannot detect JSON object type. Check the JSON structure and try again.")
        return {"valid": False, "errors": errors}  # Return early if detection fails
    
    # Only check type match if we successfully detected a type
    if target_type_detected != target_type:

        """
        return {
            "valid": False,
            "errors": [
                f"Invalid object type detected: ({target_type_detected}) does not match target type ({target_type}). You must generate a {target_type} object."
            ]
        }
        """
        errors.append(f"Invalid object type detected: ({target_type_detected}) does not match target type ({target_type}). You must generate a {target_type} object.")

    # 4) Load schemas
    try:
        with open(LEAPDO_SCHEMA_PATH_ABS) as f:
            comp_schema = json.load(f)
        with open(APP_SCHEMA_PATH_ABS) as f:
            app_schema = json.load(f)
    except FileNotFoundError as e:
        return {"valid": False, "errors": [f"Schema file not found: {e.filename}"]}

    # prepare schema store and resolver
    comp_id = comp_schema.get("$id", "leapdo_schema.json")
    app_id  = app_schema.get("$id",  "app_schema.json")
    schema_store = {comp_id: comp_schema, app_id: app_schema}
    resolver     = RefResolver.from_schema(app_schema, store=schema_store)

    # pick the right validator class for this schema version
    validator_cls = validators.validator_for(app_schema)
    validator_cls.check_schema(app_schema)

    app_defs  = app_schema.get("definitions", {})
    comp_defs = comp_schema.get("definitions", {})
    

    # Helper: validate one dict against its definition and collect all errors
    def _validate_inst(inst: Any, comp_type: str, loc: str):
        if comp_type in app_defs:
            ref = f"{app_id}#/definitions/{comp_type}"
        elif comp_type in comp_defs:
            ref = f"{comp_id}#/definitions/{comp_type}"
        else:
            errors.append(f"[{loc}] Unknown componentType '{comp_type}'")
            return

        # Standard schema validation
        v = validator_cls(
            schema={"$ref": ref},
            resolver=resolver,
            format_checker=FormatChecker()
        )
        for e in sorted(v.iter_errors(inst), key=lambda e: e.path):
            path = " -> ".join(str(p) for p in e.path) or "<self>"
            errors.append(
                f"[{loc}:{comp_type}] error at '{path}': {e.message} (value={e.instance!r})"
            )
        
        # Special validation for IconProps - validate icon name against Lucide icons
        if comp_type == "IconProps" and isinstance(inst, dict):
            icon_name = inst.get("name")
            if icon_name and isinstance(icon_name, str):
                icon_error = validate_single_icon_name(icon_name)
                if icon_error:
                    errors.append(f"[{loc}:IconProps] {icon_error}")

    # Helper: validate fonts in WebApp configurations
    def _validate_webapp_fonts(webapp_config: dict, loc: str):
        """Validate fonts object in WebApp configuration."""
        if "fonts" in webapp_config and isinstance(webapp_config["fonts"], dict):
            fonts_obj = webapp_config["fonts"]
            for font_key, font_config in fonts_obj.items():
                if isinstance(font_config, dict):
                    font_loc = f"{loc}.fonts.{font_key}"
                    
                    # Validate font family
                    font_family = font_config.get("family")
                    if font_family and isinstance(font_family, str):
                        # Clean the font family name by removing quotes and extra whitespace
                        cleaned_family = font_family.strip().strip("'\"")
                        font_error = validate_single_font_family(cleaned_family)
                        if font_error:
                            errors.append(f"[{font_loc}] {font_error}")
                        
                        # Validate font variant if family is valid
                        if not font_error:
                            variant = font_config.get("variant")
                            if variant and isinstance(variant, str):
                                variant_error = validate_font_variant(cleaned_family, variant)
                                if variant_error:
                                    errors.append(f"[{font_loc}] {variant_error}")
                            
                            # Validate Google Fonts URL
                            url = font_config.get("url")
                            if url and isinstance(url, str):
                                url_error = validate_google_fonts_url(url, cleaned_family)
                                if url_error:
                                    errors.append(f"[{font_loc}] {url_error}")
                    
                    # Check for missing required fields
                    if not font_config.get("family"):
                        errors.append(f"[{font_loc}] Missing required 'family' field")
                    if not font_config.get("variant"):
                        errors.append(f"[{font_loc}] Missing required 'variant' field")
                    if not font_config.get("url"):
                        errors.append(f"[{font_loc}] Missing required 'url' field")

    # Helper: validate theme in WebApp configurations
    def _validate_webapp_theme(webapp_config: dict, loc: str):
        """Validate theme object in WebApp configuration."""
        if "theme" not in webapp_config:
            return
        
        theme = webapp_config["theme"]
        if not isinstance(theme, dict):
            return
        
        theme_loc = f"{loc}.theme"
        
        # Validate light palette
        if "light" in theme and isinstance(theme["light"], dict):
            light_palette = theme["light"]
            for color_name, color_value in light_palette.items():
                if color_value and isinstance(color_value, str):
                    # Check if it's HSL format (contains spaces and %)
                    if ' ' in color_value and '%' in color_value:
                        # Skip hex validation for HSL colors
                        pass
                    else:
                        hex_error = validate_hex_color(color_value)
                        if hex_error:
                            errors.append(f"[{theme_loc}.light.{color_name}] {hex_error}")
            
            # CRITICAL: Check background/foreground lightness contrast (HSL)
            if "background" in light_palette and "foreground" in light_palette:
                bg = light_palette["background"]
                fg = light_palette["foreground"]
                
                # Use HSL lightness validation for better accuracy
                hsl_error = validate_hsl_lightness_contrast(bg, fg, min_diff=50)
                if hsl_error:
                    errors.append(f"[{theme_loc}.light] Background/Foreground: {hsl_error}")
                else:
                    # Fallback to HEX contrast if not HSL
                    contrast_warn = validate_color_contrast(fg, bg)
                    if contrast_warn:
                        errors.append(f"[{theme_loc}.light] Background/Foreground: {contrast_warn}")
            
            # CRITICAL: Check background/primary lightness contrast (HSL)
            if "background" in light_palette and "primary" in light_palette:
                bg = light_palette["background"]
                primary = light_palette["primary"]
                
                hsl_error = validate_hsl_lightness_contrast(bg, primary, min_diff=40)
                if hsl_error:
                    errors.append(f"[{theme_loc}.light] Background/Primary: {hsl_error}")
            
            # CRITICAL: Check primary/primary-foreground lightness contrast (HSL)
            if "primary" in light_palette and "primary-foreground" in light_palette:
                primary = light_palette["primary"]
                primary_fg = light_palette["primary-foreground"]
                
                hsl_error = validate_hsl_lightness_contrast(primary, primary_fg, min_diff=40)
                if hsl_error:
                    errors.append(f"[{theme_loc}.light] Primary/Primary-foreground: {hsl_error}")
                else:
                    # Fallback to HEX contrast if not HSL
                    contrast_warn = validate_color_contrast(primary_fg, primary)
                    if contrast_warn:
                        errors.append(f"[{theme_loc}.light] Primary/Primary-foreground: {contrast_warn}")
            
            # Check background/accent contrast
            if "background" in light_palette and "accent" in light_palette:
                bg = light_palette["background"]
                accent = light_palette["accent"]
                
                hsl_error = validate_hsl_lightness_contrast(bg, accent, min_diff=40)
                if hsl_error:
                    errors.append(f"[{theme_loc}.light] Background/Accent: {hsl_error}")
        
        # Validate dark palette
        if "dark" in theme and isinstance(theme["dark"], dict):
            dark_palette = theme["dark"]
            for color_name, color_value in dark_palette.items():
                if color_value and isinstance(color_value, str):
                    # Check if it's HSL format (contains spaces and %)
                    if ' ' in color_value and '%' in color_value:
                        # Skip hex validation for HSL colors
                        pass
                    else:
                        hex_error = validate_hex_color(color_value)
                        if hex_error:
                            errors.append(f"[{theme_loc}.dark.{color_name}] {hex_error}")
            
            # CRITICAL: Check background/foreground lightness contrast (HSL)
            if "background" in dark_palette and "foreground" in dark_palette:
                bg = dark_palette["background"]
                fg = dark_palette["foreground"]
                
                hsl_error = validate_hsl_lightness_contrast(bg, fg, min_diff=50)
                if hsl_error:
                    errors.append(f"[{theme_loc}.dark] Background/Foreground: {hsl_error}")
                else:
                    # Fallback to HEX contrast if not HSL
                    contrast_warn = validate_color_contrast(fg, bg)
                    if contrast_warn:
                        errors.append(f"[{theme_loc}.dark] Background/Foreground: {contrast_warn}")
            
            # CRITICAL: Check background/primary lightness contrast (HSL)
            if "background" in dark_palette and "primary" in dark_palette:
                bg = dark_palette["background"]
                primary = dark_palette["primary"]
                
                hsl_error = validate_hsl_lightness_contrast(bg, primary, min_diff=40)
                if hsl_error:
                    errors.append(f"[{theme_loc}.dark] Background/Primary: {hsl_error}")
            
            # Check primary/primary-foreground contrast
            if "primary" in dark_palette and "primary-foreground" in dark_palette:
                primary = dark_palette["primary"]
                primary_fg = dark_palette["primary-foreground"]
                
                hsl_error = validate_hsl_lightness_contrast(primary, primary_fg, min_diff=40)
                if hsl_error:
                    errors.append(f"[{theme_loc}.dark] Primary/Primary-foreground: {hsl_error}")
        
        # Validate chart colors
        if "charts" in theme and isinstance(theme["charts"], dict):
            chart_warnings = validate_chart_colors(theme["charts"])
            for warning in chart_warnings:
                errors.append(f"[{theme_loc}.charts] {warning}")
        
        # Validate theme fonts (if present in theme, not just webapp root)
        if "fonts" in theme and isinstance(theme["fonts"], dict):
            _validate_webapp_fonts({"fonts": theme["fonts"]}, theme_loc)

    # 5) Recursively traverse and validate every component, including root
    def _recurse(node: Any, loc: str, parent_key: str = ""):
        # Skip form fields and actions - they're validated by FormProps schema
        if parent_key in ["fields", "actions"]:
            return
            
        if loc == "root":
            # Check if root target type should be skipped
            if target_type not in SKIP_VALIDATION_COMPONENTS:
                _validate_inst(node, target_type, loc)
            # Special handling for WebAppProps fonts and theme
            if target_type == "WebAppProps" and isinstance(node, dict):
                _validate_webapp_fonts(node, loc)
                _validate_webapp_theme(node, loc)
        elif isinstance(node, dict) and "componentType" in node:
            component_type = node["componentType"]
            # Skip validation if component type is in the skip list
            if component_type not in SKIP_VALIDATION_COMPONENTS:
                _validate_inst(node, component_type, loc)

        if isinstance(node, dict):
            for key, val in node.items():
                child_loc = f"{loc}.{key}" if loc != "root" else key
                _recurse(val, child_loc, key)
        elif isinstance(node, list):
            for idx, item in enumerate(node):
                _recurse(item, f"{loc}[{idx}]", parent_key)

    _recurse(app_config, "root")

    # Return dict with valid flag and errors list
    is_valid = len(errors) == 0
    errors_str = "\n".join(errors) if errors else ""
    
    print(f"VALIDATE::is_valid: {is_valid}")
    print(f"VALIDATE::errors_str: {errors_str}")
    
    return {"valid": is_valid, "errors": errors}