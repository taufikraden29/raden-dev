import { useState } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import Sidebar from '../../components/dashboard/Sidebar';
import { useAuth } from '../../contexts/authContext';
import './DashboardLayout.css';

const DashboardLayout = () => {
    const { isAuthenticated, isLoading } = useAuth();
    const location = useLocation();
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

    if (isLoading) {
        return (
            <div className="loading-screen">
                <div className="loading-spinner-large" />
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/dashboard/login" state={{ from: location }} replace />;
    }

    return (
        <div className={`dashboard-layout ${isSidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
            <Sidebar
                isCollapsed={isSidebarCollapsed}
                onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            />
            <main className="dashboard-main">
                <Outlet />
            </main>
        </div>
    );
};

export default DashboardLayout;
