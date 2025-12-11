import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function hexToHsl(hex: string): string {

// --- Example Usage ---
// const myHexColor = "#1a202c";
// const hslString = hexToHsl(myHexColor);
// console.log(hslString); // Outputs: "220 26% 14%"

  // Remove the '#' if it exists
  let sanitizedHex = hex.startsWith('#') ? hex.slice(1) : hex;

  // Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
  if (sanitizedHex.length === 3) {
    sanitizedHex = sanitizedHex.split('').map(char => char + char).join('');
  }

  if (sanitizedHex.length !== 6) {
    // You can also return a default or throw an error
    console.error("Invalid HEX color provided.");
    return "0 0% 0%"; 
  }

  // Convert hex to RGB
  const r_num = parseInt(sanitizedHex.substring(0, 2), 16);
  const g_num = parseInt(sanitizedHex.substring(2, 4), 16);
  const b_num = parseInt(sanitizedHex.substring(4, 6), 16);

  // Normalize RGB values to be between 0 and 1
  const r = r_num / 255;
  const g = g_num / 255;
  const b = b_num / 255;

  // Find the minimum and maximum values to calculate H, S, and L
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);

  let h = 0;
  let s = 0;
  let l = (max + min) / 2;

  if (max === min) {
    // Achromatic (the color is a shade of grey)
    h = s = 0;
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }

  // Round and format the HSL values
  const hue = Math.round(h * 360);
  const saturation = Math.round(s * 100);
  const lightness = Math.round(l * 100);

  return `${hue} ${saturation}% ${lightness}%`;
}

/**
 * Convert hex color to RGB values
 * Supports 3, 6, and 8 character hex values (ignores alpha in 8-char)
 */
export function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  let sanitizedHex = hex.startsWith('#') ? hex.slice(1) : hex;
  
  if (sanitizedHex.length === 3) {
    sanitizedHex = sanitizedHex.split('').map(char => char + char).join('');
  }
  
  // Handle 8-character hex (with alpha) - just extract RGB, ignore alpha
  if (sanitizedHex.length === 8) {
    sanitizedHex = sanitizedHex.substring(0, 6);
  }
  
  if (sanitizedHex.length !== 6) {
    return null;
  }
  
  const r = parseInt(sanitizedHex.substring(0, 2), 16);
  const g = parseInt(sanitizedHex.substring(2, 4), 16);
  const b = parseInt(sanitizedHex.substring(4, 6), 16);
  
  return { r, g, b };
}

/**
 * Convert a CSS rgb()/rgba() color string to hex (e.g., "rgb(199, 154, 154)" -> "#C79A9A")
 * Supports both comma-separated and space-separated formats
 */
export function cssRgbToHex(rgbString: string): string | null {
  // Try comma-separated format first: rgb(255, 100, 50) or rgba(255, 100, 50, 0.5)
  let match = rgbString.trim().match(/^rgba?\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})/i);
  
  // Try space-separated format: rgb(255 100 50) or rgb(255 100 50 / 0.5)
  if (!match) {
    match = rgbString.trim().match(/^rgba?\(\s*(\d{1,3})\s+(\d{1,3})\s+(\d{1,3})/i);
  }
  
  if (!match) return null;
  const r = Math.max(0, Math.min(255, parseInt(match[1], 10)));
  const g = Math.max(0, Math.min(255, parseInt(match[2], 10)));
  const b = Math.max(0, Math.min(255, parseInt(match[3], 10)));
  const toHex = (n: number) => n.toString(16).padStart(2, '0').toUpperCase();
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

/**
 * Convert a CSS hsl()/hsla() color string to hex
 * Supports: hsl(200, 100%, 50%), hsla(200, 100%, 50%, 0.5), hsl(200 100% 50%)
 */
export function cssHslToHex(hslString: string): string | null {
  // Try comma-separated format: hsl(200, 100%, 50%)
  let match = hslString.trim().match(/^hsla?\(\s*(\d{1,3})\s*,\s*(\d{1,3})%?\s*,\s*(\d{1,3})%?/i);
  
  // Try space-separated format: hsl(200 100% 50%)
  if (!match) {
    match = hslString.trim().match(/^hsla?\(\s*(\d{1,3})\s+(\d{1,3})%?\s+(\d{1,3})%?/i);
  }
  
  if (!match) return null;
  
  const h = parseInt(match[1], 10) / 360;
  const s = parseInt(match[2], 10) / 100;
  const l = parseInt(match[3], 10) / 100;
  
  // HSL to RGB conversion
  let r, g, b;
  if (s === 0) {
    r = g = b = l;
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1/6) return p + (q - p) * 6 * t;
      if (t < 1/2) return q;
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
      return p;
    };
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1/3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1/3);
  }
  
  const toHex = (n: number) => Math.round(n * 255).toString(16).padStart(2, '0').toUpperCase();
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

/**
 * Parse an arbitrary CSS color value from Tailwind bracket notation
 * Handles: #hex, rgb(), rgba(), hsl(), hsla()
 * @param value - The value inside the brackets (e.g., "#fff", "rgb(255,0,0)")
 * @returns Hex color string or null
 */
export function parseArbitraryColorValue(value: string): string | null {
  const trimmed = value.trim();
  
  // Hex color
  if (trimmed.startsWith('#')) {
    const hexMatch = trimmed.match(/^#([0-9A-Fa-f]{3,8})$/);
    if (hexMatch) {
      return trimmed;
    }
  }
  
  // RGB/RGBA
  if (trimmed.toLowerCase().startsWith('rgb')) {
    return cssRgbToHex(trimmed);
  }
  
  // HSL/HSLA
  if (trimmed.toLowerCase().startsWith('hsl')) {
    return cssHslToHex(trimmed);
  }
  
  return null;
}

/**
 * Calculate relative luminance of a color
 * Based on WCAG 2.1 specification
 */
export function getLuminance(rgb: { r: number; g: number; b: number }): number {
  const { r, g, b } = rgb;
  
  // Normalize RGB values
  const [rs, gs, bs] = [r, g, b].map(c => {
    c = c / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

/**
 * Calculate contrast ratio between two colors
 * Returns a value between 1 and 21
 */
export function getContrastRatio(color1: string, color2: string): number {
  const rgb1 = hexToRgb(color1);
  const rgb2 = hexToRgb(color2);
  
  if (!rgb1 || !rgb2) return 1;
  
  const lum1 = getLuminance(rgb1);
  const lum2 = getLuminance(rgb2);
  
  const brightest = Math.max(lum1, lum2);
  const darkest = Math.min(lum1, lum2);
  
  return (brightest + 0.05) / (darkest + 0.05);
}

/**
 * Check if a color combination meets WCAG accessibility standards
 */
export function meetsContrastRequirement(
  foreground: string, 
  background: string, 
  level: 'AA' | 'AAA' = 'AA'
): boolean {
  const ratio = getContrastRatio(foreground, background);
  return level === 'AA' ? ratio >= 4.5 : ratio >= 7;
}

/**
 * Determine if a color is dark based on luminance
 */
export function isDarkColor(hex: string): boolean {
  const rgb = hexToRgb(hex);
  if (!rgb) return false;
  
  const luminance = getLuminance(rgb);
  return luminance < 0.5;
}

/**
 * Get contrasting text color for a given background
 */
export function getContrastingTextColor(backgroundColor: string): string {
  // Fallback to black if background is invalid
  const baseBg = hexToRgb(backgroundColor) ? backgroundColor : '#000000';

  // Evaluate a small set of sensible text candidates and pick the highest contrast
  const candidateTextColors = ['#FFFFFF', '#111827', '#000000'];

  let bestColor = candidateTextColors[0];
  let bestRatio = 0;

  for (const candidate of candidateTextColors) {
    const ratio = getContrastRatio(baseBg, candidate);
    if (ratio > bestRatio) {
      bestRatio = ratio;
      bestColor = candidate;
    }
  }

  return bestColor;
}

/**
 * Map of common Tailwind background classes to hex colors
 * Comprehensive color palette covering all Tailwind colors
 */
const TAILWIND_COLOR_MAP: Record<string, string> = {
  // Basic colors
  'bg-white': '#ffffff',
  'bg-black': '#000000',
  
  // Slate
  'bg-slate-50': '#f8fafc',
  'bg-slate-100': '#f1f5f9',
  'bg-slate-200': '#e2e8f0',
  'bg-slate-300': '#cbd5e1',
  'bg-slate-400': '#94a3b8',
  'bg-slate-500': '#64748b',
  'bg-slate-600': '#475569',
  'bg-slate-700': '#334155',
  'bg-slate-800': '#1e293b',
  'bg-slate-900': '#0f172a',
  'bg-slate-950': '#020617',
  
  // Gray
  'bg-gray-50': '#f9fafb',
  'bg-gray-100': '#f3f4f6',
  'bg-gray-200': '#e5e7eb',
  'bg-gray-300': '#d1d5db',
  'bg-gray-400': '#9ca3af',
  'bg-gray-500': '#6b7280',
  'bg-gray-600': '#4b5563',
  'bg-gray-700': '#374151',
  'bg-gray-800': '#1f2937',
  'bg-gray-900': '#111827',
  'bg-gray-950': '#030712',
  
  // Zinc
  'bg-zinc-50': '#fafafa',
  'bg-zinc-100': '#f4f4f5',
  'bg-zinc-200': '#e4e4e7',
  'bg-zinc-300': '#d4d4d8',
  'bg-zinc-400': '#a1a1aa',
  'bg-zinc-500': '#71717a',
  'bg-zinc-600': '#52525b',
  'bg-zinc-700': '#3f3f46',
  'bg-zinc-800': '#27272a',
  'bg-zinc-900': '#18181b',
  'bg-zinc-950': '#09090b',
  
  // Neutral
  'bg-neutral-50': '#fafafa',
  'bg-neutral-100': '#f5f5f5',
  'bg-neutral-200': '#e5e5e5',
  'bg-neutral-300': '#d4d4d4',
  'bg-neutral-400': '#a3a3a3',
  'bg-neutral-500': '#737373',
  'bg-neutral-600': '#525252',
  'bg-neutral-700': '#404040',
  'bg-neutral-800': '#262626',
  'bg-neutral-900': '#171717',
  'bg-neutral-950': '#0a0a0a',
  
  // Stone
  'bg-stone-50': '#fafaf9',
  'bg-stone-100': '#f5f5f4',
  'bg-stone-200': '#e7e5e4',
  'bg-stone-300': '#d6d3d1',
  'bg-stone-400': '#a8a29e',
  'bg-stone-500': '#78716c',
  'bg-stone-600': '#57534e',
  'bg-stone-700': '#44403c',
  'bg-stone-800': '#292524',
  'bg-stone-900': '#1c1917',
  'bg-stone-950': '#0c0a09',
  
  // Red
  'bg-red-50': '#fef2f2',
  'bg-red-100': '#fee2e2',
  'bg-red-200': '#fecaca',
  'bg-red-300': '#fca5a5',
  'bg-red-400': '#f87171',
  'bg-red-500': '#ef4444',
  'bg-red-600': '#dc2626',
  'bg-red-700': '#b91c1c',
  'bg-red-800': '#991b1b',
  'bg-red-900': '#7f1d1d',
  'bg-red-950': '#450a0a',
  
  // Orange
  'bg-orange-50': '#fff7ed',
  'bg-orange-100': '#ffedd5',
  'bg-orange-200': '#fed7aa',
  'bg-orange-300': '#fdba74',
  'bg-orange-400': '#fb923c',
  'bg-orange-500': '#f97316',
  'bg-orange-600': '#ea580c',
  'bg-orange-700': '#c2410c',
  'bg-orange-800': '#9a3412',
  'bg-orange-900': '#7c2d12',
  'bg-orange-950': '#431407',
  
  // Amber
  'bg-amber-50': '#fffbeb',
  'bg-amber-100': '#fef3c7',
  'bg-amber-200': '#fde68a',
  'bg-amber-300': '#fcd34d',
  'bg-amber-400': '#fbbf24',
  'bg-amber-500': '#f59e0b',
  'bg-amber-600': '#d97706',
  'bg-amber-700': '#b45309',
  'bg-amber-800': '#92400e',
  'bg-amber-900': '#78350f',
  'bg-amber-950': '#451a03',
  
  // Yellow
  'bg-yellow-50': '#fefce8',
  'bg-yellow-100': '#fef3c7',
  'bg-yellow-200': '#fde68a',
  'bg-yellow-300': '#fcd34d',
  'bg-yellow-400': '#fbbf24',
  'bg-yellow-500': '#eab308',
  'bg-yellow-600': '#ca8a04',
  'bg-yellow-700': '#a16207',
  'bg-yellow-800': '#854d0e',
  'bg-yellow-900': '#713f12',
  'bg-yellow-950': '#422006',
  
  // Lime
  'bg-lime-50': '#f7fee7',
  'bg-lime-100': '#ecfccb',
  'bg-lime-200': '#d9f99d',
  'bg-lime-300': '#bef264',
  'bg-lime-400': '#a3e635',
  'bg-lime-500': '#84cc16',
  'bg-lime-600': '#65a30d',
  'bg-lime-700': '#4d7c0f',
  'bg-lime-800': '#3f6212',
  'bg-lime-900': '#365314',
  'bg-lime-950': '#1a2e05',
  
  // Green
  'bg-green-50': '#f0fdf4',
  'bg-green-100': '#dcfce7',
  'bg-green-200': '#bbf7d0',
  'bg-green-300': '#86efac',
  'bg-green-400': '#4ade80',
  'bg-green-500': '#22c55e',
  'bg-green-600': '#16a34a',
  'bg-green-700': '#15803d',
  'bg-green-800': '#166534',
  'bg-green-900': '#14532d',
  'bg-green-950': '#052e16',
  
  // Emerald
  'bg-emerald-50': '#ecfdf5',
  'bg-emerald-100': '#d1fae5',
  'bg-emerald-200': '#a7f3d0',
  'bg-emerald-300': '#6ee7b7',
  'bg-emerald-400': '#34d399',
  'bg-emerald-500': '#10b981',
  'bg-emerald-600': '#059669',
  'bg-emerald-700': '#047857',
  'bg-emerald-800': '#065f46',
  'bg-emerald-900': '#064e3b',
  'bg-emerald-950': '#022c22',
  
  // Teal
  'bg-teal-50': '#f0fdfa',
  'bg-teal-100': '#ccfbf1',
  'bg-teal-200': '#99f6e4',
  'bg-teal-300': '#5eead4',
  'bg-teal-400': '#2dd4bf',
  'bg-teal-500': '#14b8a6',
  'bg-teal-600': '#0d9488',
  'bg-teal-700': '#0f766e',
  'bg-teal-800': '#115e59',
  'bg-teal-900': '#134e4a',
  'bg-teal-950': '#042f2e',
  
  // Cyan
  'bg-cyan-50': '#ecfeff',
  'bg-cyan-100': '#cffafe',
  'bg-cyan-200': '#a5f3fc',
  'bg-cyan-300': '#67e8f9',
  'bg-cyan-400': '#22d3ee',
  'bg-cyan-500': '#06b6d4',
  'bg-cyan-600': '#0891b2',
  'bg-cyan-700': '#0e7490',
  'bg-cyan-800': '#155e75',
  'bg-cyan-900': '#164e63',
  'bg-cyan-950': '#083344',
  
  // Sky
  'bg-sky-50': '#f0f9ff',
  'bg-sky-100': '#e0f2fe',
  'bg-sky-200': '#bae6fd',
  'bg-sky-300': '#7dd3fc',
  'bg-sky-400': '#38bdf8',
  'bg-sky-500': '#0ea5e9',
  'bg-sky-600': '#0284c7',
  'bg-sky-700': '#0369a1',
  'bg-sky-800': '#075985',
  'bg-sky-900': '#0c4a6e',
  'bg-sky-950': '#082f49',
  
  // Blue
  'bg-blue-50': '#eff6ff',
  'bg-blue-100': '#dbeafe',
  'bg-blue-200': '#bfdbfe',
  'bg-blue-300': '#93c5fd',
  'bg-blue-400': '#60a5fa',
  'bg-blue-500': '#3b82f6',
  'bg-blue-600': '#2563eb',
  'bg-blue-700': '#1d4ed8',
  'bg-blue-800': '#1e40af',
  'bg-blue-900': '#1e3a8a',
  'bg-blue-950': '#172554',
  
  // Indigo
  'bg-indigo-50': '#eef2ff',
  'bg-indigo-100': '#e0e7ff',
  'bg-indigo-200': '#c7d2fe',
  'bg-indigo-300': '#a5b4fc',
  'bg-indigo-400': '#818cf8',
  'bg-indigo-500': '#6366f1',
  'bg-indigo-600': '#4f46e5',
  'bg-indigo-700': '#4338ca',
  'bg-indigo-800': '#3730a3',
  'bg-indigo-900': '#312e81',
  'bg-indigo-950': '#1e1b4b',
  
  // Violet
  'bg-violet-50': '#f5f3ff',
  'bg-violet-100': '#ede9fe',
  'bg-violet-200': '#ddd6fe',
  'bg-violet-300': '#c4b5fd',
  'bg-violet-400': '#a78bfa',
  'bg-violet-500': '#8b5cf6',
  'bg-violet-600': '#7c3aed',
  'bg-violet-700': '#6d28d9',
  'bg-violet-800': '#5b21b6',
  'bg-violet-900': '#4c1d95',
  'bg-violet-950': '#2e1065',
  
  // Purple
  'bg-purple-50': '#faf5ff',
  'bg-purple-100': '#f3e8ff',
  'bg-purple-200': '#e9d5ff',
  'bg-purple-300': '#d8b4fe',
  'bg-purple-400': '#c084fc',
  'bg-purple-500': '#a855f7',
  'bg-purple-600': '#9333ea',
  'bg-purple-700': '#7e22ce',
  'bg-purple-800': '#6b21a8',
  'bg-purple-900': '#581c87',
  'bg-purple-950': '#3b0764',
  
  // Fuchsia
  'bg-fuchsia-50': '#fdf4ff',
  'bg-fuchsia-100': '#fae8ff',
  'bg-fuchsia-200': '#f5d0fe',
  'bg-fuchsia-300': '#f0abfc',
  'bg-fuchsia-400': '#e879f9',
  'bg-fuchsia-500': '#d946ef',
  'bg-fuchsia-600': '#c026d3',
  'bg-fuchsia-700': '#a21caf',
  'bg-fuchsia-800': '#86198f',
  'bg-fuchsia-900': '#701a75',
  'bg-fuchsia-950': '#4a044e',
  
  // Pink
  'bg-pink-50': '#fdf2f8',
  'bg-pink-100': '#fce7f3',
  'bg-pink-200': '#fbcfe8',
  'bg-pink-300': '#f9a8d4',
  'bg-pink-400': '#f472b6',
  'bg-pink-500': '#ec4899',
  'bg-pink-600': '#db2777',
  'bg-pink-700': '#be185d',
  'bg-pink-800': '#9d174d',
  'bg-pink-900': '#831843',
  'bg-pink-950': '#500724',
  
  // Rose
  'bg-rose-50': '#fff1f2',
  'bg-rose-100': '#ffe4e6',
  'bg-rose-200': '#fecdd3',
  'bg-rose-300': '#fda4af',
  'bg-rose-400': '#fb7185',
  'bg-rose-500': '#f43f5e',
  'bg-rose-600': '#e11d48',
  'bg-rose-700': '#be123c',
  'bg-rose-800': '#9f1239',
  'bg-rose-900': '#881337',
  'bg-rose-950': '#4c0519',
};

/**
 * Map of common Tailwind text color classes to hex colors
 * Comprehensive color palette matching background colors
 */
const TAILWIND_TEXT_COLOR_MAP: Record<string, string> = {
  'text-white': '#ffffff',
  'text-black': '#000000',
  'text-slate-50': '#f8fafc',
  'text-slate-100': '#f1f5f9',
  'text-slate-200': '#e2e8f0',
  'text-slate-300': '#cbd5e1',
  'text-slate-400': '#94a3b8',
  'text-slate-500': '#64748b',
  'text-slate-600': '#475569',
  'text-slate-700': '#334155',
  'text-slate-800': '#1e293b',
  'text-slate-900': '#0f172a',
  'text-slate-950': '#020617',
  'text-gray-50': '#f9fafb',
  'text-gray-100': '#f3f4f6',
  'text-gray-200': '#e5e7eb',
  'text-gray-300': '#d1d5db',
  'text-gray-400': '#9ca3af',
  'text-gray-500': '#6b7280',
  'text-gray-600': '#4b5563',
  'text-gray-700': '#374151',
  'text-gray-800': '#1f2937',
  'text-gray-900': '#111827',
  'text-gray-950': '#030712',
  'text-zinc-50': '#fafafa',
  'text-zinc-100': '#f4f4f5',
  'text-zinc-200': '#e4e4e7',
  'text-zinc-300': '#d4d4d8',
  'text-zinc-400': '#a1a1aa',
  'text-zinc-500': '#71717a',
  'text-zinc-600': '#52525b',
  'text-zinc-700': '#3f3f46',
  'text-zinc-800': '#27272a',
  'text-zinc-900': '#18181b',
  'text-zinc-950': '#09090b',
  'text-neutral-50': '#fafafa',
  'text-neutral-100': '#f5f5f5',
  'text-neutral-200': '#e5e5e5',
  'text-neutral-300': '#d4d4d4',
  'text-neutral-400': '#a3a3a3',
  'text-neutral-500': '#737373',
  'text-neutral-600': '#525252',
  'text-neutral-700': '#404040',
  'text-neutral-800': '#262626',
  'text-neutral-900': '#171717',
  'text-neutral-950': '#0a0a0a',
  'text-stone-50': '#fafaf9',
  'text-stone-100': '#f5f5f4',
  'text-stone-200': '#e7e5e4',
  'text-stone-300': '#d6d3d1',
  'text-stone-400': '#a8a29e',
  'text-stone-500': '#78716c',
  'text-stone-600': '#57534e',
  'text-stone-700': '#44403c',
  'text-stone-800': '#292524',
  'text-stone-900': '#1c1917',
  'text-stone-950': '#0c0a09',
  'text-red-50': '#fef2f2',
  'text-red-100': '#fee2e2',
  'text-red-200': '#fecaca',
  'text-red-300': '#fca5a5',
  'text-red-400': '#f87171',
  'text-red-500': '#ef4444',
  'text-red-600': '#dc2626',
  'text-red-700': '#b91c1c',
  'text-red-800': '#991b1b',
  'text-red-900': '#7f1d1d',
  'text-red-950': '#450a0a',
  'text-orange-50': '#fff7ed',
  'text-orange-100': '#ffedd5',
  'text-orange-200': '#fed7aa',
  'text-orange-300': '#fdba74',
  'text-orange-400': '#fb923c',
  'text-orange-500': '#f97316',
  'text-orange-600': '#ea580c',
  'text-orange-700': '#c2410c',
  'text-orange-800': '#9a3412',
  'text-orange-900': '#7c2d12',
  'text-orange-950': '#431407',
  'text-amber-50': '#fffbeb',
  'text-amber-100': '#fef3c7',
  'text-amber-200': '#fde68a',
  'text-amber-300': '#fcd34d',
  'text-amber-400': '#fbbf24',
  'text-amber-500': '#f59e0b',
  'text-amber-600': '#d97706',
  'text-amber-700': '#b45309',
  'text-amber-800': '#92400e',
  'text-amber-900': '#78350f',
  'text-amber-950': '#451a03',
  'text-yellow-50': '#fefce8',
  'text-yellow-100': '#fef3c7',
  'text-yellow-200': '#fde68a',
  'text-yellow-300': '#fcd34d',
  'text-yellow-400': '#fbbf24',
  'text-yellow-500': '#eab308',
  'text-yellow-600': '#ca8a04',
  'text-yellow-700': '#a16207',
  'text-yellow-800': '#854d0e',
  'text-yellow-900': '#713f12',
  'text-yellow-950': '#422006',
  'text-lime-50': '#f7fee7',
  'text-lime-100': '#ecfccb',
  'text-lime-200': '#d9f99d',
  'text-lime-300': '#bef264',
  'text-lime-400': '#a3e635',
  'text-lime-500': '#84cc16',
  'text-lime-600': '#65a30d',
  'text-lime-700': '#4d7c0f',
  'text-lime-800': '#3f6212',
  'text-lime-900': '#365314',
  'text-lime-950': '#1a2e05',
  'text-green-50': '#f0fdf4',
  'text-green-100': '#dcfce7',
  'text-green-200': '#bbf7d0',
  'text-green-300': '#86efac',
  'text-green-400': '#4ade80',
  'text-green-500': '#22c55e',
  'text-green-600': '#16a34a',
  'text-green-700': '#15803d',
  'text-green-800': '#166534',
  'text-green-900': '#14532d',
  'text-green-950': '#052e16',
  'text-emerald-50': '#ecfdf5',
  'text-emerald-100': '#d1fae5',
  'text-emerald-200': '#a7f3d0',
  'text-emerald-300': '#6ee7b7',
  'text-emerald-400': '#34d399',
  'text-emerald-500': '#10b981',
  'text-emerald-600': '#059669',
  'text-emerald-700': '#047857',
  'text-emerald-800': '#065f46',
  'text-emerald-900': '#064e3b',
  'text-emerald-950': '#022c22',
  'text-teal-50': '#f0fdfa',
  'text-teal-100': '#ccfbf1',
  'text-teal-200': '#99f6e4',
  'text-teal-300': '#5eead4',
  'text-teal-400': '#2dd4bf',
  'text-teal-500': '#14b8a6',
  'text-teal-600': '#0d9488',
  'text-teal-700': '#0f766e',
  'text-teal-800': '#115e59',
  'text-teal-900': '#134e4a',
  'text-teal-950': '#042f2e',
  'text-cyan-50': '#ecfeff',
  'text-cyan-100': '#cffafe',
  'text-cyan-200': '#a5f3fc',
  'text-cyan-300': '#67e8f9',
  'text-cyan-400': '#22d3ee',
  'text-cyan-500': '#06b6d4',
  'text-cyan-600': '#0891b2',
  'text-cyan-700': '#0e7490',
  'text-cyan-800': '#155e75',
  'text-cyan-900': '#164e63',
  'text-cyan-950': '#083344',
  'text-sky-50': '#f0f9ff',
  'text-sky-100': '#e0f2fe',
  'text-sky-200': '#bae6fd',
  'text-sky-300': '#7dd3fc',
  'text-sky-400': '#38bdf8',
  'text-sky-500': '#0ea5e9',
  'text-sky-600': '#0284c7',
  'text-sky-700': '#0369a1',
  'text-sky-800': '#075985',
  'text-sky-900': '#0c4a6e',
  'text-sky-950': '#082f49',
  'text-blue-50': '#eff6ff',
  'text-blue-100': '#dbeafe',
  'text-blue-200': '#bfdbfe',
  'text-blue-300': '#93c5fd',
  'text-blue-400': '#60a5fa',
  'text-blue-500': '#3b82f6',
  'text-blue-600': '#2563eb',
  'text-blue-700': '#1d4ed8',
  'text-blue-800': '#1e40af',
  'text-blue-900': '#1e3a8a',
  'text-blue-950': '#172554',
  'text-indigo-50': '#eef2ff',
  'text-indigo-100': '#e0e7ff',
  'text-indigo-200': '#c7d2fe',
  'text-indigo-300': '#a5b4fc',
  'text-indigo-400': '#818cf8',
  'text-indigo-500': '#6366f1',
  'text-indigo-600': '#4f46e5',
  'text-indigo-700': '#4338ca',
  'text-indigo-800': '#3730a3',
  'text-indigo-900': '#312e81',
  'text-indigo-950': '#1e1b4b',
  'text-violet-50': '#f5f3ff',
  'text-violet-100': '#ede9fe',
  'text-violet-200': '#ddd6fe',
  'text-violet-300': '#c4b5fd',
  'text-violet-400': '#a78bfa',
  'text-violet-500': '#8b5cf6',
  'text-violet-600': '#7c3aed',
  'text-violet-700': '#6d28d9',
  'text-violet-800': '#5b21b6',
  'text-violet-900': '#4c1d95',
  'text-violet-950': '#2e1065',
  'text-purple-50': '#faf5ff',
  'text-purple-100': '#f3e8ff',
  'text-purple-200': '#e9d5ff',
  'text-purple-300': '#d8b4fe',
  'text-purple-400': '#c084fc',
  'text-purple-500': '#a855f7',
  'text-purple-600': '#9333ea',
  'text-purple-700': '#7e22ce',
  'text-purple-800': '#6b21a8',
  'text-purple-900': '#581c87',
  'text-purple-950': '#3b0764',
  'text-fuchsia-50': '#fdf4ff',
  'text-fuchsia-100': '#fae8ff',
  'text-fuchsia-200': '#f5d0fe',
  'text-fuchsia-300': '#f0abfc',
  'text-fuchsia-400': '#e879f9',
  'text-fuchsia-500': '#d946ef',
  'text-fuchsia-600': '#c026d3',
  'text-fuchsia-700': '#a21caf',
  'text-fuchsia-800': '#86198f',
  'text-fuchsia-900': '#701a75',
  'text-fuchsia-950': '#4a044e',
  'text-pink-50': '#fdf2f8',
  'text-pink-100': '#fce7f3',
  'text-pink-200': '#fbcfe8',
  'text-pink-300': '#f9a8d4',
  'text-pink-400': '#f472b6',
  'text-pink-500': '#ec4899',
  'text-pink-600': '#db2777',
  'text-pink-700': '#be185d',
  'text-pink-800': '#9d174d',
  'text-pink-900': '#831843',
  'text-pink-950': '#500724',
  'text-rose-50': '#fff1f2',
  'text-rose-100': '#ffe4e6',
  'text-rose-200': '#fecdd3',
  'text-rose-300': '#fda4af',
  'text-rose-400': '#fb7185',
  'text-rose-500': '#f43f5e',
  'text-rose-600': '#e11d48',
  'text-rose-700': '#be123c',
  'text-rose-800': '#9f1239',
  'text-rose-900': '#881337',
  'text-rose-950': '#4c0519',
};

/**
 * Blend two hex colors together
 * @param color1 - First hex color
 * @param color2 - Second hex color
 * @param ratio - Blend ratio (0-1, default 0.5 for even blend)
 * @returns Blended hex color
 */
export function blendColors(color1: string, color2: string, ratio: number = 0.5): string {
  const rgb1 = hexToRgb(color1);
  const rgb2 = hexToRgb(color2);
  
  if (!rgb1 || !rgb2) return color1;
  
  const r = Math.round(rgb1.r * ratio + rgb2.r * (1 - ratio));
  const g = Math.round(rgb1.g * ratio + rgb2.g * (1 - ratio));
  const b = Math.round(rgb1.b * ratio + rgb2.b * (1 - ratio));
  
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

/**
 * Analyze background complexity (gradients, semi-transparency)
 * @param classes - Tailwind classes string
 * @returns Analysis result with complexity flags and average color
 */
export function analyzeBackgroundComplexity(classes?: string): {
  hasGradient: boolean;
  hasSemiTransparency: boolean;
  averageColor: string | null;
} {
  if (!classes) return { hasGradient: false, hasSemiTransparency: false, averageColor: null };
  
  const hasGradient = /bg-gradient-/.test(classes);
  const hasSemiTransparency = /bg-\w+\/\d+/.test(classes);
  
  if (hasGradient) {
    // Extract gradient colors and calculate average
    const fromMatch = classes.match(/from-\[#([0-9A-Fa-f]{6})\]/);
    const toMatch = classes.match(/to-\[#([0-9A-Fa-f]{6})\]/);
    
    if (fromMatch && toMatch) {
      const averageColor = blendColors(`#${fromMatch[1]}`, `#${toMatch[1]}`);
      return { hasGradient: true, hasSemiTransparency: false, averageColor };
    }
    
    // Try standard Tailwind gradient classes
    const fromStandard = classes.match(/from-(\w+-\d+)/);
    const toStandard = classes.match(/to-(\w+-\d+)/);
    
    if (fromStandard && toStandard) {
      const fromColor = TAILWIND_COLOR_MAP[`bg-${fromStandard[1]}`];
      const toColor = TAILWIND_COLOR_MAP[`bg-${toStandard[1]}`];
      
      if (fromColor && toColor) {
        const averageColor = blendColors(fromColor, toColor);
        return { hasGradient: true, hasSemiTransparency: false, averageColor };
      }
    }
  }
  
  return { hasGradient, hasSemiTransparency, averageColor: null };
}

/**
 * Get effective background color by traversing parent chain
 * @param element - Starting element
 * @returns First non-transparent background color as hex, or null
 */
export function getEffectiveBackgroundColor(element: HTMLElement | null): string | null {
  if (!element) return null;
  
  let current = element.parentElement;
  let depth = 0;
  const maxDepth = 10; // Prevent infinite loops
  
  while (current && depth < maxDepth) {
    const bg = getComputedStyle(current).backgroundColor;
    
    // Check if it's not transparent
    const rgbaMatch = bg.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);
    if (rgbaMatch) {
      const alpha = rgbaMatch[4] ? parseFloat(rgbaMatch[4]) : 1;
      if (alpha > 0.1) { // Consider semi-transparent as actual background
        return cssRgbToHex(bg);
      }
    }
    
    current = current.parentElement;
    depth++;
  }
  
  return null;
}

/**
 * Resolve color from Tailwind class using temporary DOM element
 * Useful for CSS variables and theme colors
 * @param className - Single Tailwind class
 * @param type - Type of color class ('bg' or 'text')
 * @returns Hex color string or null
 */
export function resolveColorFromClass(className: string, type: 'bg' | 'text' = 'bg'): string | null {
  if (typeof document === 'undefined') return null;
  
  try {
    // Create temporary element
    const testDiv = document.createElement('div');
    testDiv.className = className;
    testDiv.style.display = 'none';
    testDiv.style.position = 'absolute';
    testDiv.style.pointerEvents = 'none';
    
    document.body.appendChild(testDiv);
    
    // Get computed style
    const computed = getComputedStyle(testDiv);
    const colorValue = type === 'bg' ? computed.backgroundColor : computed.color;
    const hex = cssRgbToHex(colorValue);
    
    // Clean up
    document.body.removeChild(testDiv);
    
    return hex;
  } catch (error) {
    // Silently fail - this is a fallback mechanism
    return null;
  }
}

/**
 * Inject hover styles dynamically for contrast corrections
 * @param elementId - Unique identifier for the element
 * @param hoverTextColor - Text color for hover state
 */
export function injectHoverStyles(elementId: string, hoverTextColor: string): void {
  if (typeof document === 'undefined') return;
  
  const styleId = `hover-contrast-${elementId}`;
  
  // Remove existing style if present
  const existingStyle = document.getElementById(styleId);
  if (existingStyle) {
    existingStyle.remove();
  }
  
  // Create new style element
  const style = document.createElement('style');
  style.id = styleId;
  style.textContent = `
    [data-contrast-id="${elementId}"]:hover {
      color: ${hoverTextColor} !important;
    }
  `;
  document.head.appendChild(style);
}

/**
 * Remove injected hover styles
 * @param elementId - Unique identifier for the element
 */
export function removeHoverStyles(elementId: string): void {
  if (typeof document === 'undefined') return;
  
  const styleId = `hover-contrast-${elementId}`;
  const style = document.getElementById(styleId);
  if (style) {
    style.remove();
  }
}

/**
 * Semantic color classes that require DOM resolution (CSS variables)
 */
const SEMANTIC_COLOR_CLASSES = new Set([
  'bg-primary', 'bg-secondary', 'bg-muted', 'bg-accent', 
  'bg-card', 'bg-background', 'bg-foreground', 'bg-destructive',
  'bg-popover', 'bg-input', 'bg-ring', 'bg-border',
  'text-primary', 'text-secondary', 'text-muted', 'text-muted-foreground',
  'text-foreground', 'text-destructive', 'text-accent-foreground',
  'text-card-foreground', 'text-popover-foreground', 'text-primary-foreground',
  'text-secondary-foreground', 'text-destructive-foreground',
]);

/**
 * Check if a class is a semantic color that needs DOM resolution
 */
export function isSemanticColorClass(className: string): boolean {
  // Also check for variants like bg-primary/50
  const baseClass = className.replace(/\/\d+$/, '');
  return SEMANTIC_COLOR_CLASSES.has(baseClass);
}

/**
 * Extract color from a Tailwind class (supports both standard and arbitrary classes)
 * @param className - Single Tailwind class (e.g., "bg-blue-500" or "bg-[#A8C6C3]")
 * @param type - Type of color class ('bg' or 'text')
 * @returns Hex color string or null if not a color class
 */
export function extractColorFromTailwindClass(className: string, type: 'bg' | 'text' = 'bg'): string | null {
  const prefix = type === 'bg' ? 'bg-' : 'text-';
  
  if (!className.startsWith(prefix)) {
    return null;
  }
  
  // Check for arbitrary color values: bg-[#...], bg-[rgb(...)], bg-[hsl(...)]
  const arbitraryMatch = className.match(/^(?:bg|text)-\[(.+)\]$/);
  if (arbitraryMatch) {
    const value = arbitraryMatch[1];
    
    // Skip CSS variables - these need DOM resolution
    if (value.startsWith('var(')) {
      return null;
    }
    
    return parseArbitraryColorValue(value);
  }
  
  // Check for opacity modifiers: bg-blue-500/50
  const opacityMatch = className.match(/^((?:bg|text)-[\w-]+)\/\d+$/);
  if (opacityMatch) {
    const baseClass = opacityMatch[1];
    // Recursively extract the base color (ignoring opacity for contrast calculation)
    return extractColorFromTailwindClass(baseClass, type);
  }
  
  // Check standard Tailwind color from maps
  if (type === 'bg') {
    return TAILWIND_COLOR_MAP[className] || null;
  } else {
    return TAILWIND_TEXT_COLOR_MAP[className] || null;
  }
}

/**
 * Check if a class looks like a color class (not text-center, text-sm, etc.)
 */
function looksLikeColorClass(className: string, type: 'bg' | 'text'): boolean {
  if (type === 'bg') {
    // bg- classes are almost always color-related, except bg-clip, bg-repeat, etc.
    const nonColorBgPatterns = /^bg-(clip|repeat|origin|position|size|attachment|blend|gradient|none|fixed|local|scroll)/;
    return !nonColorBgPatterns.test(className);
  } else {
    // text- has many non-color utilities
    const nonColorTextPatterns = /^text-(center|left|right|justify|start|end|xs|sm|base|lg|xl|2xl|3xl|4xl|5xl|6xl|7xl|8xl|9xl|wrap|nowrap|balance|pretty|ellipsis|clip|truncate)/;
    return !nonColorTextPatterns.test(className);
  }
}

/**
 * Extract background and text colors from a Tailwind classes string
 * @param classes - Space-separated Tailwind classes
 * @param element - Optional element to resolve CSS variables (improves accuracy)
 * @returns Object with background and text color hex values (or null if not found)
 */
export function extractColorsFromClasses(classes?: string, element?: HTMLElement): { 
  backgroundColor: string | null; 
  textColor: string | null;
} {
  if (!classes) {
    return { backgroundColor: null, textColor: null };
  }
  
  const classList = classes.split(/\s+/);
  let backgroundColor: string | null = null;
  let textColor: string | null = null;
  
  for (const className of classList) {
    // Extract background color (only keep the last one if multiple)
    if (className.startsWith('bg-') && looksLikeColorClass(className, 'bg')) {
      const color = extractColorFromTailwindClass(className, 'bg');
      if (color) {
        backgroundColor = color;
      } else {
        // Always try DOM resolution for unrecognized color classes
        // This handles semantic colors (bg-primary, etc.) and CSS variables
        const resolved = resolveColorFromClass(className, 'bg');
        if (resolved) backgroundColor = resolved;
      }
    }
    
    // Extract text color (only keep the last one if multiple)
    if (className.startsWith('text-') && looksLikeColorClass(className, 'text')) {
      const color = extractColorFromTailwindClass(className, 'text');
      if (color) {
        textColor = color;
      } else {
        // Always try DOM resolution for unrecognized color classes
        // This handles semantic colors (text-foreground, etc.) and CSS variables
        const resolved = resolveColorFromClass(className, 'text');
        if (resolved) textColor = resolved;
      }
    }
  }
  
  return { backgroundColor, textColor };
}

/**
 * List of props that should not be passed to DOM elements
 * These are component metadata props used by the runtime
 */
const NON_DOM_PROPS = [
  'componentType',
  'uuid',
  'lastUpdatedEpoch',
  'content',
  'asset',
] as const;

/**
 * Filter out non-DOM props from an object before spreading to DOM elements
 * This prevents React warnings about unrecognized props on DOM elements
 * 
 * @param props - The props object to filter
 * @returns A new object with non-DOM props removed
 * 
 * @example
 * ```tsx
 * const { classes, ...restProps } = props;
 * return <div className={classes} {...filterDOMProps(restProps)} />;
 * ```
 */
export function filterDOMProps<T extends Record<string, any>>(props: T): Partial<T> {
  const filtered = { ...props };
  
  // Remove known non-DOM props
  NON_DOM_PROPS.forEach(prop => {
    delete filtered[prop];
  });
  
  return filtered;
}
