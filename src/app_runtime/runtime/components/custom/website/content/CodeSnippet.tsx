import * as React from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark, oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { cn } from '@/lib/utils';

// Assuming the interface is imported from its definition file
import { CodeSnippetProps } from '@/interfaces/components/website/content/content';

/**
 * Renders a formatted code block with syntax highlighting, line numbers,
 * and an optional copy-to-clipboard button.
 * This component is SSR-compatible by default.
 */
export const CodeSnippet = ({
  code,
  language,
  showLineNumbers = false,
  highlightLines = [],
  copyable = true,
  theme = 'dark',
  maxHeight,
  classes,
}: CodeSnippetProps) => {

  // Select the theme for the syntax highlighter
  const syntaxTheme = theme === 'dark' ? oneDark : oneLight;

  return (
    <div 
      className={cn("relative rounded-lg border bg-background text-sm group", classes)}
      style={{ maxHeight: maxHeight }}
    >
      {copyable && (
        <CopyButton textToCopy={code} />
      )}
      <div className="overflow-auto">
        <SyntaxHighlighter
          language={language}
          style={syntaxTheme}
          showLineNumbers={showLineNumbers}
          wrapLines={true}
          lineProps={lineNumber => {
            const style: React.CSSProperties = { display: 'block', width: 'fit-content' };
            if (highlightLines.includes(lineNumber)) {
              style.backgroundColor = theme === 'dark' ? '#ffffff1a' : '#0000001a';
              style.borderColor = theme === 'dark' ? '#ffffff33' : '#00000033';
              style.borderWidth = '0 0 0 2px';
            }
            return { style };
          }}
          customStyle={{
            margin: 0,
            padding: '1rem',
            backgroundColor: 'transparent',
            width: '100%',
          }}
          codeTagProps={{
            style: {
              fontFamily: 'var(--font-mono)',
            }
          }}
        >
          {code}
        </SyntaxHighlighter>
      </div>
    </div>
  );
};


// --- Client Component for the Copy Button ---
// This should be in a separate file, e.g., './CopyButton.tsx'

const CopyButton = ({ textToCopy }: { textToCopy: string }) => {
    "use client";

    const [isCopied, setIsCopied] = React.useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(textToCopy).then(() => {
            setIsCopied(true);
            setTimeout(() => setIsCopied(false), 2000);
        });
    };

    return (
        <button
            onClick={handleCopy}
            className="absolute top-2 right-2 z-20 p-1.5 rounded-md text-gray-400 bg-black/20 hover:bg-black/40 hover:text-white transition-all opacity-0 group-hover:opacity-100"
            aria-label="Copy code"
        >
            {isCopied ? (
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
            ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
            )}
        </button>
    );
};
