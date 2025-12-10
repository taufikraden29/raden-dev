'use client';

import '@/components/ui/TableOfContents.css';
import GithubSlugger from 'github-slugger';
import { List } from 'lucide-react';
import { memo, useCallback, useEffect, useMemo, useState } from 'react';

const TableOfContents = memo(function TableOfContents({ content }) {
    const [activeId, setActiveId] = useState('');

    // Extract headings from markdown content using github-slugger (same as rehype-slug)
    const headings = useMemo(() => {
        if (!content) return [];

        const slugger = new GithubSlugger();
        const lines = content.split('\n');
        const extracted = [];

        lines.forEach((line) => {
            // Match ## and ### headings (h2 and h3)
            const match = line.match(/^(#{2,3})\s+(.+)$/);
            if (match) {
                const level = match[1].length;
                const text = match[2].trim();
                // github-slugger generates the same slugs as rehype-slug
                const id = slugger.slug(text);

                extracted.push({ id, text, level });
            }
        });

        return extracted;
    }, [content]);

    // Track active heading on scroll
    useEffect(() => {
        if (headings.length < 2) return;

        const handleScroll = () => {
            const headingElements = headings.map(h => document.getElementById(h.id)).filter(Boolean);

            for (let i = headingElements.length - 1; i >= 0; i--) {
                const el = headingElements[i];
                if (el) {
                    const rect = el.getBoundingClientRect();
                    if (rect.top <= 120) {
                        setActiveId(headings[i].id);
                        return;
                    }
                }
            }

            if (headings.length > 0) {
                setActiveId(headings[0].id);
            }
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        handleScroll(); // Initial check

        return () => window.removeEventListener('scroll', handleScroll);
    }, [headings]);

    // Smooth scroll to heading
    const scrollToHeading = useCallback((id) => {
        const element = document.getElementById(id);
        if (element) {
            const offset = 100; // Account for fixed header
            const elementPosition = element.getBoundingClientRect().top + window.scrollY;
            window.scrollTo({
                top: elementPosition - offset,
                behavior: 'smooth'
            });
            setActiveId(id);
        }
    }, []);

    // Don't show if no headings or less than 2
    if (headings.length < 2) return null;

    return (
        <nav className="table-of-contents">
            <div className="toc-header">
                <List size={16} />
                <span>Daftar Isi</span>
            </div>
            <ul className="toc-list">
                {headings.map((heading) => (
                    <li
                        key={heading.id}
                        className={`toc-item toc-level-${heading.level} ${activeId === heading.id ? 'active' : ''}`}
                    >
                        <button onClick={() => scrollToHeading(heading.id)}>
                            {heading.text}
                        </button>
                    </li>
                ))}
            </ul>
        </nav>
    );
});

export default TableOfContents;
