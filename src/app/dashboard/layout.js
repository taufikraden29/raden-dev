'use client';

import Sidebar from '@/components/dashboard/Sidebar';
import { useAuth } from '@/contexts/authContext';
import '@/pages/dashboard/DashboardLayout.css';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function DashboardLayout({ children }) {
    const { isAuthenticated, isLoading } = useAuth();
    const router = useRouter();
    const pathname = usePathname();
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

    // Allow login page without auth check
    const isLoginPage = pathname === '/dashboard/login';

    // Handle redirect in useEffect to avoid setState during render
    useEffect(() => {
        if (!isLoginPage && !isLoading && !isAuthenticated) {
            router.push('/dashboard/login');
        }
    }, [isLoginPage, isLoading, isAuthenticated, router]);

    // Allow login page without auth check
    if (isLoginPage) {
        return children;
    }

    // Show loading while checking auth or redirecting
    if (isLoading || !isAuthenticated) {
        return (
            <div className="loading-screen">
                <div className="loading-spinner-large" />
            </div>
        );
    }

    return (
        <div className={`dashboard-layout ${isSidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
            <Sidebar
                isCollapsed={isSidebarCollapsed}
                onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            />
            <main className="dashboard-main">
                {children}
            </main>
        </div>
    );
}

