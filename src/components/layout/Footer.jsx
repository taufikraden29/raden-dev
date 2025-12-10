'use client';

import { useSettings } from '@/services/settingsService';
import {
    Facebook, Github, Globe, Heart, Instagram, Link as LinkIcon, Linkedin, Mail, Twitter, Youtube
} from 'lucide-react';
import Link from 'next/link';
import { memo, useMemo } from 'react';
import './Footer.css';

// Icon mapping - defined outside component to avoid recreation
const iconMap = {
    Github, Twitter, Linkedin, Youtube, Instagram, Facebook, Mail, Globe, Link: LinkIcon
};

// Current year - calculated once at module load
const currentYear = new Date().getFullYear();

const Footer = memo(function Footer() {
    const { settings, loading } = useSettings();

    // Memoize socialLinks array
    const socialLinks = useMemo(() => {
        if (!settings?.social) return [];
        return Array.isArray(settings.social) ? settings.social : [];
    }, [settings?.social]);

    // Memoize site settings
    const siteConfig = useMemo(() => ({
        logoText: settings?.site?.logoText || 'DevDocs',
        footerDescription: settings?.site?.footerDescription || 'Personal blog for documentation and tutorials.'
    }), [settings?.site?.logoText, settings?.site?.footerDescription]);

    // Handle loading state
    if (loading || !settings) {
        return null;
    }

    return (
        <footer className="footer">
            <div className="footer-container container">
                <div className="footer-content">
                    <div className="footer-brand">
                        <Link href="/" className="footer-logo">
                            <span className="logo-icon">{'</>'}</span>
                            <span className="logo-text">{siteConfig.logoText}</span>
                        </Link>
                        <p className="footer-description">
                            {siteConfig.footerDescription}
                        </p>
                    </div>

                    <div className="footer-links">
                        <div className="footer-section">
                            <h4>Navigation</h4>
                            <ul>
                                <li><Link href="/">Home</Link></li>
                                <li><Link href="/blog">Blog</Link></li>
                                <li><Link href="/about">About</Link></li>
                            </ul>
                        </div>

                        <div className="footer-section">
                            <h4>Categories</h4>
                            <ul>
                                <li><Link href="/blog?category=React">React</Link></li>
                                <li><Link href="/blog?category=Backend">Backend</Link></li>
                                <li><Link href="/blog?category=CSS">CSS</Link></li>
                            </ul>
                        </div>
                    </div>
                </div>

                <div className="footer-bottom">
                    <div className="footer-social">
                        {socialLinks.map(({ id, url, platform, icon }) => {
                            const IconComponent = iconMap[icon] || LinkIcon;
                            return (
                                <a
                                    key={id}
                                    href={url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="social-link"
                                    aria-label={platform}
                                    title={platform}
                                >
                                    <IconComponent size={20} />
                                </a>
                            );
                        })}
                    </div>

                    <p className="footer-copyright">
                        Made with <Heart size={14} className="heart-icon" /> © {currentYear} {siteConfig.logoText}. All rights reserved.
                    </p>
                </div>
            </div>
        </footer>
    );
});

export default Footer;

