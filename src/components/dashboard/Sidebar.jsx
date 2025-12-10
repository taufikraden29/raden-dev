'use client';

import '@/components/dashboard/Sidebar.css';
import { useAuth } from '@/contexts/authContext';
import {
    BookOpen,
    ChevronLeft,
    FileText,
    LayoutDashboard,
    LogOut,
    Menu,
    PlusCircle,
    Settings,
    Terminal
} from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

const Sidebar = ({ isCollapsed, onToggle }) => {
    const { logout } = useAuth();
    const router = useRouter();
    const pathname = usePathname();

    const handleLogout = () => {
        logout();
        router.push('/dashboard/login');
    };

    const navItems = [
        { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard', end: true },
        { path: '/dashboard/posts', icon: FileText, label: 'Posts' },
        { path: '/dashboard/posts/new', icon: PlusCircle, label: 'New Post' },
        { path: '/dashboard/tutorials', icon: BookOpen, label: 'Tutorials' },
        { path: '/dashboard/scripts', icon: Terminal, label: 'Scripts' },
        { path: '/dashboard/settings', icon: Settings, label: 'Settings' },
    ];

    const isActive = (path, end) => {
        if (end) {
            return pathname === path;
        }
        return pathname.startsWith(path);
    };

    return (
        <>
            <aside className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
                <div className="sidebar-header">
                    <div className="sidebar-logo">
                        <span className="logo-icon">{'</>'}</span>
                        {!isCollapsed && <span className="logo-text">DevDocs</span>}
                    </div>
                    <button
                        className="collapse-btn"
                        onClick={onToggle}
                        aria-label="Toggle sidebar"
                    >
                        <ChevronLeft size={18} />
                    </button>
                </div>

                <nav className="sidebar-nav">
                    {navItems.map(({ path, icon: Icon, label, end }) => (
                        <Link
                            key={path}
                            href={path}
                            className={`nav-item ${isActive(path, end) ? 'active' : ''}`}
                            title={isCollapsed ? label : undefined}
                        >
                            <Icon size={20} />
                            {!isCollapsed && <span>{label}</span>}
                        </Link>
                    ))}
                </nav>

                <div className="sidebar-footer">
                    <button
                        className="nav-item logout-btn"
                        onClick={handleLogout}
                        title={isCollapsed ? 'Logout' : undefined}
                    >
                        <LogOut size={20} />
                        {!isCollapsed && <span>Logout</span>}
                    </button>
                </div>
            </aside>

            {/* Mobile Toggle */}
            <button
                className="mobile-menu-btn"
                onClick={onToggle}
                aria-label="Toggle menu"
            >
                <Menu size={24} />
            </button>

            {/* Mobile Overlay */}
            {!isCollapsed && (
                <div
                    className="sidebar-overlay"
                    onClick={onToggle}
                />
            )}
        </>
    );
};

export default Sidebar;
