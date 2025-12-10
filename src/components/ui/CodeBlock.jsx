'use client';

import '@/components/ui/CodeBlock.css';
import { Check, Copy } from 'lucide-react';
import dynamic from 'next/dynamic';
import { memo, useEffect, useState } from 'react';

// Dynamic import untuk react-syntax-highlighter - lazy load untuk performa
const SyntaxHighlighter = dynamic(
    () => import('react-syntax-highlighter').then(mod => mod.Prism),
    {
        loading: () => <CodeSkeleton />,
        ssr: false
    }
);

// Dynamic import untuk theme
const getTheme = () => import('react-syntax-highlighter/dist/cjs/styles/prism/one-dark').then(mod => mod.default);

// Skeleton loader untuk code block
const CodeSkeleton = () => (
    <div className="code-skeleton">
        <div className="skeleton-line" style={{ width: '80%' }} />
        <div className="skeleton-line" style={{ width: '60%' }} />
        <div className="skeleton-line" style={{ width: '90%' }} />
        <div className="skeleton-line" style={{ width: '45%' }} />
        <div className="skeleton-line" style={{ width: '70%' }} />
    </div>
);

const CodeBlock = memo(function CodeBlock({ language, children }) {
    const [copied, setCopied] = useState(false);
    const [theme, setTheme] = useState(null);

    // Load theme on mount
    useEffect(() => {
        getTheme().then(setTheme);
    }, []);

    const handleCopy = async () => {
        await navigator.clipboard.writeText(children);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const displayLanguage = language || 'text';
    const lineCount = children.split('\n').length;

    return (
        <div className="code-block">
            <div className="code-header">
                <span className="code-language">{displayLanguage}</span>
                <button
                    className="code-copy-btn"
                    onClick={handleCopy}
                    aria-label={copied ? 'Copied!' : 'Copy code'}
                >
                    {copied ? (
                        <>
                            <Check size={14} />
                            <span>Copied!</span>
                        </>
                    ) : (
                        <>
                            <Copy size={14} />
                            <span>Copy</span>
                        </>
                    )}
                </button>
            </div>
            {theme ? (
                <SyntaxHighlighter
                    language={displayLanguage}
                    style={theme}
                    customStyle={{
                        margin: 0,
                        padding: '1.25rem',
                        borderRadius: '0 0 10px 10px',
                        fontSize: '0.875rem',
                        lineHeight: 1.6,
                    }}
                    showLineNumbers={lineCount > 5}
                    wrapLines
                >
                    {children}
                </SyntaxHighlighter>
            ) : (
                <CodeSkeleton />
            )}
        </div>
    );
});

export default CodeBlock;
