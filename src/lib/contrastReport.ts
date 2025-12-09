/**
 * Contrast Report Tool
 * Generates comprehensive reports of all auto-contrast corrections on the page
 */

interface ContrastCorrection {
  component: string;
  element: HTMLElement;
  originalTextColor: string | null;
  correctedTextColor: string | null;
  backgroundColor: string | null;
  contrastRatio: number | null;
  minRequired: number;
  location: {
    xpath: string;
    selector: string;
  };
}

interface ContrastReport {
  timestamp: string;
  totalCorrections: number;
  corrections: ContrastCorrection[];
  summary: {
    byComponent: Record<string, number>;
    averageContrastImprovement: number;
  };
}

/**
 * Get XPath for an element
 */
function getXPath(element: HTMLElement): string {
  if (element.id) {
    return `//*[@id="${element.id}"]`;
  }
  
  if (element === document.body) {
    return '/html/body';
  }
  
  const siblings = element.parentNode?.childNodes || [];
  let index = 0;
  
  for (let i = 0; i < siblings.length; i++) {
    const sibling = siblings[i];
    if (sibling === element) {
      const tagName = element.tagName.toLowerCase();
      const parent = element.parentElement;
      const parentPath = parent ? getXPath(parent) : '';
      return `${parentPath}/${tagName}[${index + 1}]`;
    }
    if (sibling.nodeType === 1 && (sibling as Element).tagName === element.tagName) {
      index++;
    }
  }
  
  return '';
}

/**
 * Generate CSS selector for an element
 */
function getSelector(element: HTMLElement): string {
  if (element.id) {
    return `#${element.id}`;
  }
  
  const path: string[] = [];
  let current: HTMLElement | null = element;
  
  while (current && current !== document.body) {
    let selector = current.tagName.toLowerCase();
    
    if (current.className) {
      const classes = current.className.split(' ').filter(c => c && !c.startsWith('data-'));
      if (classes.length > 0) {
        selector += '.' + classes.slice(0, 2).join('.');
      }
    }
    
    path.unshift(selector);
    current = current.parentElement;
  }
  
  return path.join(' > ');
}

/**
 * Scan the page for all elements with contrast corrections
 */
export function scanContrastCorrections(): ContrastCorrection[] {
  const corrections: ContrastCorrection[] = [];
  const elements = document.querySelectorAll('[data-contrast-corrected="true"]');
  
  elements.forEach((el) => {
    const element = el as HTMLElement;
    const component = element.getAttribute('data-component-name') || 'Unknown';
    const computedStyle = getComputedStyle(element);
    
    corrections.push({
      component,
      element,
      originalTextColor: element.getAttribute('data-original-color') || null,
      correctedTextColor: computedStyle.color,
      backgroundColor: computedStyle.backgroundColor,
      contrastRatio: null, // Would need to calculate from stored data
      minRequired: 4.5, // Default
      location: {
        xpath: getXPath(element),
        selector: getSelector(element),
      },
    });
  });
  
  return corrections;
}

/**
 * Generate a comprehensive contrast report
 */
export function generateContrastReport(): ContrastReport {
  const corrections = scanContrastCorrections();
  
  // Count by component type
  const byComponent: Record<string, number> = {};
  corrections.forEach(c => {
    byComponent[c.component] = (byComponent[c.component] || 0) + 1;
  });
  
  return {
    timestamp: new Date().toISOString(),
    totalCorrections: corrections.length,
    corrections,
    summary: {
      byComponent,
      averageContrastImprovement: 0, // Would need historical data to calculate
    },
  };
}

/**
 * Export report as JSON
 */
export function exportReportAsJSON(): string {
  const report = generateContrastReport();
  return JSON.stringify(report, null, 2);
}

/**
 * Log report to console in a readable format
 */
export function logContrastReport(): void {
  const report = generateContrastReport();
  
  console.group('📊 Auto-Contrast Report');
  console.log(`Generated: ${report.timestamp}`);
  console.log(`Total Corrections: ${report.totalCorrections}`);
  
  if (report.totalCorrections > 0) {
    console.group('By Component:');
    Object.entries(report.summary.byComponent).forEach(([component, count]) => {
      console.log(`  ${component}: ${count}`);
    });
    console.groupEnd();
    
    console.group('All Corrections:');
    report.corrections.forEach((correction, index) => {
      console.group(`${index + 1}. ${correction.component}`);
      console.log(`Selector: ${correction.location.selector}`);
      console.log(`Original Color: ${correction.originalTextColor || 'N/A'}`);
      console.log(`Corrected Color: ${correction.correctedTextColor}`);
      console.log(`Background: ${correction.backgroundColor}`);
      console.groupEnd();
    });
    console.groupEnd();
  } else {
    console.log('✅ No contrast corrections needed!');
  }
  
  console.groupEnd();
}

/**
 * Download report as JSON file
 */
export function downloadContrastReport(filename: string = 'contrast-report.json'): void {
  const json = exportReportAsJSON();
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Add global utility functions to window for easy access in console
 */
if (typeof window !== 'undefined') {
  (window as any).__leapdoContrast = {
    report: logContrastReport,
    export: exportReportAsJSON,
    download: downloadContrastReport,
    scan: scanContrastCorrections,
  };
  
  if (process.env.NODE_ENV === 'development') {
    console.log(
      '💡 Auto-Contrast utilities available:\n' +
      '  __leapdoContrast.report() - Log contrast report\n' +
      '  __leapdoContrast.export() - Export as JSON string\n' +
      '  __leapdoContrast.download() - Download as JSON file\n' +
      '  __leapdoContrast.scan() - Get all corrections'
    );
  }
}

