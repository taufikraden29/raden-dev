'use client';

import { useSettings } from '@/services/settingsService';
import { BookOpen, Briefcase, FileText, Home, Menu, Settings, Terminal, User, X } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { memo, useCallback, useMemo, useState } from 'react';
import './Navbar.css';

const navLinksConfig = [
    { path: '/', label: 'Home', icon: Home },
    { path: '/blog', label: 'Blog', icon: FileText },
    { path: '/tutorials', label: 'Tutorials', icon: BookOpen },
    { path: '/scripts', label: 'Scripts', icon: Terminal },
    { path: '/portfolio', label: 'Portfolio', icon: Briefcase },
    { path: '/about', label: 'About', icon: User },
];

const Navbar = memo(function Navbar() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const pathname = usePathname();
    const { settings } = useSettings();

    // Memoize logoText
    const logoText = useMemo(() => settings?.site?.logoText || 'DevDocs', [settings?.site?.logoText]);

    // Memoize isActive function
    const isActive = useCallback((path) => {
        if (path === '/') return pathname === '/';
        return pathname.startsWith(path);
    }, [pathname]);

    // Memoize menu toggle handler
    const toggleMenu = useCallback(() => setIsMenuOpen(prev => !prev), []);
    const closeMenu = useCallback(() => setIsMenuOpen(false), []);

    return (
        <header className="navbar">
            <div className="navbar-container container">
                <Link href="/" className="navbar-logo">
                    <span className="logo-icon">{'</>'}</span>
                    <span className="logo-text">{logoText}</span>
                </Link>

                <nav className={`navbar-nav ${isMenuOpen ? 'nav-open' : ''}`}>
                    {navLinksConfig.map(({ path, label, icon: Icon }) => (
                        <Link
                            key={path}
                            href={path}
                            className={`nav-link ${isActive(path) ? 'active' : ''}`}
                            onClick={closeMenu}
                        >
                            <Icon size={18} />
                            <span>{label}</span>
                        </Link>
                    ))}
                </nav>

                <div className="navbar-actions">
                    <Link href="/dashboard" className="btn btn-primary btn-sm">
                        <Settings size={16} />
                        <span>Dashboard</span>
                    </Link>

                    <button
                        className="menu-toggle"
                        onClick={toggleMenu}
                        aria-label="Toggle menu"
                    >
                        {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>
            </div>

            {isMenuOpen && (
                <div
                    className="nav-overlay"
                    onClick={closeMenu}
                />
            )}
        </header>
    );
});

export default Navbar;

