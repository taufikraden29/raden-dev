'use client';

import CodeBlock from '@/components/ui/CodeBlock';
import '@/components/ui/MarkdownRenderer.css';
import { memo, useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeSlug from 'rehype-slug';
import remarkGfm from 'remark-gfm';

// Extract YouTube video ID from various URL formats
const getYouTubeId = (url) => {
    if (!url) return null;
    const patterns = [
        /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
        /youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/
    ];
    for (const pattern of patterns) {
        const match = url.match(pattern);
        if (match) return match[1];
    }
    return null;
};

// YouTube Embed Component - Memoized
const YouTubeEmbed = memo(function YouTubeEmbed({ videoId, title }) {
    return (
        <div className="youtube-embed">
            <iframe
                src={`https://www.youtube.com/embed/${videoId}`}
                title={title || 'YouTube video'}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                loading="lazy"
            />
        </div>
    );
});

const MarkdownRenderer = memo(function MarkdownRenderer({ content }) {
    // Memoize plugins array
    const remarkPlugins = useMemo(() => [remarkGfm], []);
    const rehypePlugins = useMemo(() => [rehypeSlug], []);

    // Components map - memoized since we no longer need per-render slug generation
    const components = useMemo(() => ({
        code({ node, inline, className, children, ...props }) {
            const match = /language-(\w+)/.exec(className || '');

            if (!inline && match) {
                return (
                    <CodeBlock language={match[1]}>
                        {String(children).replace(/\n$/, '')}
                    </CodeBlock>
                );
            }

            return (
                <code className="inline-code" {...props}>
                    {children}
                </code>
            );
        },
        h1: ({ children, ...props }) => <h1 className="md-h1" {...props}>{children}</h1>,
        h2: ({ children, ...props }) => <h2 className="md-h2" {...props}>{children}</h2>,
        h3: ({ children, ...props }) => <h3 className="md-h3" {...props}>{children}</h3>,
        h4: ({ children, ...props }) => <h4 className="md-h4" {...props}>{children}</h4>,
        p: ({ children, node }) => {
            // Check if paragraph contains only a YouTube link
            if (node.children?.length === 1) {
                const child = node.children[0];
                if (child.type === 'link' || child.type === 'text') {
                    const url = child.url || child.value;
                    const videoId = getYouTubeId(url);
                    if (videoId) {
                        return <YouTubeEmbed videoId={videoId} title={url} />;
                    }
                }
            }
            return <p className="md-paragraph">{children}</p>;
        },
        a: ({ href, children }) => {
            // Check if it's a YouTube link - render as embed
            const videoId = getYouTubeId(href);
            if (videoId) {
                return <YouTubeEmbed videoId={videoId} title={String(children)} />;
            }
            return (
                <a href={href} className="md-link" target="_blank" rel="noopener noreferrer">
                    {children}
                </a>
            );
        },
        ul: ({ children }) => <ul className="md-list">{children}</ul>,
        ol: ({ children }) => <ol className="md-list md-ordered">{children}</ol>,
        li: ({ children }) => <li className="md-list-item">{children}</li>,
        blockquote: ({ children }) => (
            <blockquote className="md-blockquote">{children}</blockquote>
        ),
        table: ({ children }) => (
            <div className="md-table-wrapper">
                <table className="md-table">{children}</table>
            </div>
        ),
        img: ({ src, alt }) => (
            <figure className="md-figure">
                <img src={src} alt={alt} className="md-image" loading="lazy" />
                {alt && <figcaption className="md-figcaption">{alt}</figcaption>}
            </figure>
        ),
        hr: () => <hr className="md-hr" />,
    }), []);

    return (
        <div className="markdown-content">
            <ReactMarkdown
                remarkPlugins={remarkPlugins}
                rehypePlugins={rehypePlugins}
                components={components}
            >
                {content}
            </ReactMarkdown>
        </div>
    );
});

export default MarkdownRenderer;
