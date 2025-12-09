/**
 * Tests for automatic color contrast detection and correction
 */

import {
  extractColorFromTailwindClass,
  extractColorsFromClasses,
  getContrastRatio,
  meetsContrastRequirement,
  getContrastingTextColor,
  isDarkColor,
} from '../utils';

describe('Color Extraction', () => {
  describe('extractColorFromTailwindClass', () => {
    test('should extract standard Tailwind background colors', () => {
      expect(extractColorFromTailwindClass('bg-blue-500', 'bg')).toBe('#3b82f6');
      expect(extractColorFromTailwindClass('bg-gray-900', 'bg')).toBe('#111827');
      expect(extractColorFromTailwindClass('bg-white', 'bg')).toBe('#ffffff');
    });

    test('should extract arbitrary Tailwind background colors', () => {
      expect(extractColorFromTailwindClass('bg-[#A8C6C3]', 'bg')).toBe('#A8C6C3');
      expect(extractColorFromTailwindClass('bg-[#fff]', 'bg')).toBe('#fff');
      expect(extractColorFromTailwindClass('bg-[#123456]', 'bg')).toBe('#123456');
    });

    test('should extract standard Tailwind text colors', () => {
      expect(extractColorFromTailwindClass('text-white', 'text')).toBe('#ffffff');
      expect(extractColorFromTailwindClass('text-gray-900', 'text')).toBe('#111827');
    });

    test('should extract arbitrary Tailwind text colors', () => {
      expect(extractColorFromTailwindClass('text-[#A8C6C3]', 'text')).toBe('#A8C6C3');
      expect(extractColorFromTailwindClass('text-[#000]', 'text')).toBe('#000');
    });

    test('should return null for non-color classes', () => {
      expect(extractColorFromTailwindClass('py-4', 'bg')).toBeNull();
      expect(extractColorFromTailwindClass('text-center', 'text')).toBeNull();
    });
  });

  describe('extractColorsFromClasses', () => {
    test('should extract both background and text colors', () => {
      const result = extractColorsFromClasses('py-16 bg-[#A8C6C3] text-white mb-8');
      expect(result.backgroundColor).toBe('#A8C6C3');
      expect(result.textColor).toBe('#ffffff');
    });

    test('should handle multiple color classes (last one wins)', () => {
      const result = extractColorsFromClasses('bg-blue-500 bg-[#A8C6C3] text-gray-900 text-white');
      expect(result.backgroundColor).toBe('#A8C6C3');
      expect(result.textColor).toBe('#ffffff');
    });

    test('should handle missing colors', () => {
      const result1 = extractColorsFromClasses('py-16 text-white');
      expect(result1.backgroundColor).toBeNull();
      expect(result1.textColor).toBe('#ffffff');

      const result2 = extractColorsFromClasses('bg-blue-500 py-16');
      expect(result2.backgroundColor).toBe('#3b82f6');
      expect(result2.textColor).toBeNull();
    });

    test('should handle empty or undefined classes', () => {
      const result1 = extractColorsFromClasses('');
      expect(result1.backgroundColor).toBeNull();
      expect(result1.textColor).toBeNull();

      const result2 = extractColorsFromClasses(undefined);
      expect(result2.backgroundColor).toBeNull();
      expect(result2.textColor).toBeNull();
    });
  });
});

describe('Color Contrast Calculations', () => {
  describe('isDarkColor', () => {
    test('should identify dark colors', () => {
      expect(isDarkColor('#000000')).toBe(true);
      expect(isDarkColor('#111827')).toBe(true); // gray-900
      expect(isDarkColor('#1e3a8a')).toBe(true); // blue-900
    });

    test('should identify light colors', () => {
      expect(isDarkColor('#ffffff')).toBe(false);
      expect(isDarkColor('#f9fafb')).toBe(false); // gray-50
      expect(isDarkColor('#A8C6C3')).toBe(false); // light teal
    });
  });

  describe('getContrastRatio', () => {
    test('should calculate contrast ratio correctly', () => {
      // White on black - maximum contrast
      const ratio1 = getContrastRatio('#ffffff', '#000000');
      expect(ratio1).toBeCloseTo(21, 0);

      // Same color - minimum contrast
      const ratio2 = getContrastRatio('#ffffff', '#ffffff');
      expect(ratio2).toBeCloseTo(1, 0);

      // The problematic example: white on #A8C6C3
      const ratio3 = getContrastRatio('#ffffff', '#A8C6C3');
      expect(ratio3).toBeLessThan(4.5); // Should fail WCAG AA
    });
  });

  describe('meetsContrastRequirement', () => {
    test('should check WCAG AA compliance (4.5:1 for normal text)', () => {
      expect(meetsContrastRequirement('#ffffff', '#000000', 'AA')).toBe(true);
      expect(meetsContrastRequirement('#ffffff', '#A8C6C3', 'AA')).toBe(false);
      expect(meetsContrastRequirement('#111827', '#A8C6C3', 'AA')).toBe(true);
    });

    test('should check WCAG AAA compliance (7:1 for normal text)', () => {
      expect(meetsContrastRequirement('#ffffff', '#000000', 'AAA')).toBe(true);
      expect(meetsContrastRequirement('#ffffff', '#A8C6C3', 'AAA')).toBe(false);
    });
  });

  describe('getContrastingTextColor', () => {
    test('should return white for dark backgrounds', () => {
      expect(getContrastingTextColor('#000000')).toBe('#FFFFFF');
      expect(getContrastingTextColor('#111827')).toBe('#FFFFFF');
      expect(getContrastingTextColor('#1e3a8a')).toBe('#FFFFFF');
    });

    test('should return dark gray for light backgrounds', () => {
      expect(getContrastingTextColor('#ffffff')).toBe('#111827');
      expect(getContrastingTextColor('#f9fafb')).toBe('#111827');
      expect(getContrastingTextColor('#A8C6C3')).toBe('#111827'); // The fix for the example!
    });
  });
});

describe('Real-World Examples', () => {
  test('should fix the problematic section from the user example', () => {
    const classes = 'py-16 bg-[#A8C6C3]';
    const { backgroundColor } = extractColorsFromClasses(classes);
    
    // Verify we extracted the background correctly
    expect(backgroundColor).toBe('#A8C6C3');
    
    // Verify the original white text would have poor contrast
    const originalContrast = getContrastRatio('#ffffff', backgroundColor!);
    expect(originalContrast).toBeLessThan(4.5); // Fails WCAG AA
    
    // Verify our correction provides good contrast
    const correctedColor = getContrastingTextColor(backgroundColor!);
    expect(correctedColor).toBe('#111827'); // Dark text
    
    const correctedContrast = getContrastRatio(correctedColor, backgroundColor!);
    expect(correctedContrast).toBeGreaterThanOrEqual(4.5); // Passes WCAG AA
  });

  test('should handle standard Tailwind colors correctly', () => {
    const lightClasses = 'bg-gray-100 text-gray-500';
    const { backgroundColor: lightBg, textColor: lightText } = extractColorsFromClasses(lightClasses);
    
    // On light backgrounds, gray-500 text might not have enough contrast
    const lightContrast = getContrastRatio(lightText!, lightBg!);
    if (lightContrast < 4.5) {
      const corrected = getContrastingTextColor(lightBg!);
      expect(corrected).toBe('#111827'); // Should suggest darker text
    }
    
    const darkClasses = 'bg-gray-900 text-gray-400';
    const { backgroundColor: darkBg, textColor: darkText } = extractColorsFromClasses(darkClasses);
    
    // On dark backgrounds, gray-400 text might not have enough contrast
    const darkContrast = getContrastRatio(darkText!, darkBg!);
    if (darkContrast < 4.5) {
      const corrected = getContrastingTextColor(darkBg!);
      expect(corrected).toBe('#FFFFFF'); // Should suggest white text
    }
  });
});

