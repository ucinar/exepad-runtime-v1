// src/components/DynamicTheme.tsx
import { hexToHsl } from '@/lib/utils';
import { ThemeProps, ColorPalette, ChartPalette, StyleVariables } from '@/app_runtime/interfaces/apps/core';

const DynamicTheme = ({ theme }: { theme?: ThemeProps }) => {
  if (!theme) {
    return null;
  }

  const generateColorVariables = (colors?: ColorPalette): string => {
    if (!colors) return '';
    return Object.entries(colors)
      .map(([name, value]) => {
        if (!value) return '';
        // Check if value is already in HSL format (contains space and %)
        const isHsl = typeof value === 'string' && value.includes(' ') && value.includes('%');
        const hslValue = isHsl ? value : hexToHsl(value);
        return `--${name}: ${hslValue};`;
      })
      .join('\n');
  };
  
  const generateChartVariables = (charts?: ChartPalette): string => {
    if (!charts) return '';
    return Object.entries(charts)
      .map(([name, value]) => {
        if (!value) return '';
        // Check if value is already in HSL format (contains space and %)
        const isHsl = typeof value === 'string' && value.includes(' ') && value.includes('%');
        const hslValue = isHsl ? value : hexToHsl(value);
        return `--${name}: ${hslValue};`;
      })
      .join('\n');
  };
  
  const generateStyleVariables = (styles?: StyleVariables): string => {
    if (!styles) return '';
    return Object.entries(styles)
      .map(([name, value]) => value ? `--${name}: ${value};` : '')
      .join('\n');
  };

  const generateLayoutVariables = (layout?: ThemeProps['layout']): string => {
    if (!layout) return '';
    return Object.entries(layout)
      .map(([name, value]) => value ? `--${name}: ${value};` : '')
      .join('\n');
  };

  // New function to generate font size variables
  const generateFontSizeVariables = (fontSizes?: ThemeProps['fontSizes']): string => {
    if (!fontSizes) return '';
    return Object.entries(fontSizes)
      .map(([key, value]) => value ? `--font-size-${key}: ${value};` : '')
      .join('\n');
  };

  const lightThemeColors = generateColorVariables(theme.light);
  const darkThemeColors = generateColorVariables(theme.dark);
  const chartVariables = generateChartVariables(theme.charts);
  const styleVariables = generateStyleVariables(theme.styles);
  const layoutVariables = generateLayoutVariables(theme.layout);
  const fontSizeVariables = generateFontSizeVariables(theme.fontSizes);

  const otherStyles = `
    ${theme.radius ? `--radius: ${theme.radius};` : ''}
    ${theme.spacing?.y ? `--spacing-section-y: ${theme.spacing.y};` : ''}
    ${theme.spacing?.x ? `--spacing-section-x: ${theme.spacing.x};` : ''}
  `;

  const themeStyles = `
    :root {
      ${lightThemeColors}
      ${chartVariables}
      ${otherStyles}
      ${styleVariables}
      ${layoutVariables}
      ${fontSizeVariables}
    }
    .dark {
      ${darkThemeColors}
    }
  `;

  return <style dangerouslySetInnerHTML={{ __html: themeStyles.trim() }} />;
};

export default DynamicTheme;
