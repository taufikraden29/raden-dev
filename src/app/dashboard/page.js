'use client';

import { useBlogStats, usePosts } from '@/hooks/useData';
import { Skeleton } from '@/components/ui/Skeleton';
import '@/pages/dashboard/DashboardHome.css';
import { format } from 'date-fns';
import { Eye, FileText, Plus, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import { useMemo } from 'react';

// Dashboard Skeleton Component
const DashboardSkeleton = () => (
    <div className="dashboard-home">
        <header className="dashboard-header">
            <div>
                <Skeleton width="150px" height="2rem" className="mb-sm" />
                <Skeleton width="280px" height="1rem" />
            </div>
            <Skeleton width="120px" height="40px" borderRadius="var(--radius-md)" />
        </header>

        <section className="stats-grid">
            {[1, 2, 3, 4].map(i => (
                <div key={i} className="stat-card card">
                    <Skeleton width="48px" height="48px" borderRadius="var(--radius-md)" />
                    <div className="stat-info">
                        <Skeleton width="40px" height="1.5rem" className="mb-xs" />
                        <Skeleton width="80px" height="0.875rem" />
                    </div>
                </div>
            ))}
        </section>

        <section className="recent-section">
            <div className="section-header">
                <Skeleton width="120px" height="1.5rem" />
                <Skeleton width="80px" height="32px" borderRadius="var(--radius-sm)" />
            </div>
            <div className="card" style={{ padding: 'var(--space-lg)' }}>
                {[1, 2, 3, 4, 5].map(i => (
                    <div key={i} style={{ display: 'flex', gap: 'var(--space-md)', marginBottom: 'var(--space-md)' }}>
                        <Skeleton width="40%" height="1rem" />
                        <Skeleton width="15%" height="1rem" />
                        <Skeleton width="15%" height="1rem" />
                        <Skeleton width="20%" height="1rem" />
                    </div>
                ))}
            </div>
        </section>
    </div>
);

export default function DashboardHome() {
    const { stats, loading: statsLoading } = useBlogStats();
    const { posts, loading: postsLoading } = usePosts(false);

    // Memoize recentPosts
    const recentPosts = useMemo(() => (posts || []).slice(0, 5), [posts]);

    // Memoize statCards with null safety
    const statCards = useMemo(() => [
        {
            label: 'Total Posts',
            value: stats?.totalPosts ?? 0,
            icon: FileText,
            color: 'primary'
        },
        {
            label: 'Published',
            value: stats?.publishedPosts ?? 0,
            icon: Eye,
            color: 'success'
        },
        {
            label: 'Drafts',
            value: stats?.draftPosts ?? 0,
            icon: TrendingUp,
            color: 'warning'
        },
        {
            label: 'Categories',
            value: stats?.categories ?? 0,
            icon: TrendingUp,
            color: 'secondary'
        },
    ], [stats]);

    if (statsLoading || postsLoading) {
        return <DashboardSkeleton />;
    }

    return (
        <div className="dashboard-home">
            <header className="dashboard-header">
                <div>
                    <h1 className="dashboard-title">Dashboard</h1>
                    <p className="dashboard-subtitle">Welcome back! Here's your blog overview.</p>
                </div>
                <Link href="/dashboard/posts/new" className="btn btn-primary">
                    <Plus size={18} />
                    New Post
                </Link>
            </header>

            {/* Stats Grid */}
            <section className="stats-grid">
                {statCards.map(({ label, value, icon: Icon, color }) => (
                    <div key={label} className={`stat-card card ${color}`}>
                        <div className="stat-icon">
                            <Icon size={24} />
                        </div>
                        <div className="stat-info">
                            <span className="stat-value">{value}</span>
                            <span className="stat-label">{label}</span>
                        </div>
                    </div>
                ))}
            </section>

            {/* Recent Posts */}
            <section className="recent-section">
                <div className="section-header">
                    <h2>Recent Posts</h2>
                    <Link href="/dashboard/posts" className="btn btn-ghost btn-sm">
                        View All
                    </Link>
                </div>

                <div className="card">
                    <div className="table-container">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>Title</th>
                                    <th>Category</th>
                                    <th>Status</th>
                                    <th>Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                {recentPosts.map(post => (
                                    <tr key={post.id}>
                                        <td>
                                            <Link href={`/dashboard/posts/${post.id}/edit`} className="post-title-link">
                                                {post.title}
                                            </Link>
                                        </td>
                                        <td>
                                            <span className="badge">{post.category}</span>
                                        </td>
                                        <td>
                                            <span className={`badge ${post.published ? 'badge-success' : 'badge-warning'}`}>
                                                {post.published ? 'Published' : 'Draft'}
                                            </span>
                                        </td>
                                        <td className="text-muted">
                                            {format(new Date(post.created_at), 'MMM d, yyyy')}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </section>

            {/* Quick Actions */}
            <section className="quick-actions">
                <h2>Quick Actions</h2>
                <div className="actions-grid">
                    <Link href="/dashboard/posts/new" className="action-card card">
                        <Plus size={24} />
                        <span>Create New Post</span>
                    </Link>
                    <Link href="/dashboard/posts" className="action-card card">
                        <FileText size={24} />
                        <span>Manage Posts</span>
                    </Link>
                    <Link href="/" target="_blank" className="action-card card">
                        <Eye size={24} />
                        <span>View Blog</span>
                    </Link>
                </div>
            </section>
        </div>
    );
}

