'use client';

import BlogCard from '@/components/ui/BlogCard';
import { usePosts } from '@/hooks/useData';
import '@/_legacy/public/HomePage.css';
import { useSettings } from '@/services/settingsService';
import { ArrowRight, BookOpen, Code, Globe, Heart, Rocket, Shield, Star, Zap } from 'lucide-react';
import Link from 'next/link';

// Icon mapping
const iconMap = {
    Code,
    BookOpen,
    Zap,
    Star,
    Heart,
    Rocket,
    Shield,
    Globe
};

export default function HomePage() {
    const { posts, loading: postsLoading } = usePosts(true);
    const { settings, loading: settingsLoading } = useSettings();

    if (postsLoading || settingsLoading) {
        return <div className="loading-container">Loading...</div>;
    }

    const recentPosts = posts.slice(0, 3);
    const { hero, stats, features, cta } = settings;

    return (
        <div className="home-page">
            {/* Hero Section */}
            <section className="hero">
                <div className="hero-bg">
                    <div className="hero-gradient" />
                    <div className="hero-grid" />
                </div>

                <div className="hero-content container">
                    <div className="hero-badge">
                        <span className="badge badge-primary">{hero?.badge}</span>
                    </div>

                    <h1 className="hero-title">
                        {hero?.title} <span className="gradient-text">{hero?.titleHighlight}</span>{hero?.titleSuffix}
                    </h1>

                    <p className="hero-description">
                        {hero?.description}
                    </p>

                    <div className="hero-actions">
                        <Link href="/blog" className="btn btn-primary btn-lg">
                            {hero?.primaryButtonText} <ArrowRight size={18} />
                        </Link>
                        <Link href="/about" className="btn btn-secondary btn-lg">
                            {hero?.secondaryButtonText}
                        </Link>
                    </div>

                    {stats?.showStats && (
                        <div className="hero-stats">
                            <div className="stat">
                                <span className="stat-value">{posts.length}+</span>
                                <span className="stat-label">{stats?.stat1Label}</span>
                            </div>
                            <div className="stat-divider" />
                            <div className="stat">
                                <span className="stat-value">{stats?.stat2Value}</span>
                                <span className="stat-label">{stats?.stat2Label}</span>
                            </div>
                            <div className="stat-divider" />
                            <div className="stat">
                                <span className="stat-value">{stats?.stat3Value}</span>
                                <span className="stat-label">{stats?.stat3Label}</span>
                            </div>
                        </div>
                    )}
                </div>
            </section>

            {/* Features Section */}
            <section className="features container">
                <div className="features-grid">
                    {features?.map((feature, index) => {
                        const IconComponent = iconMap[feature.icon] || Code;
                        return (
                            <div key={index} className="feature-card card">
                                <div className="feature-icon">
                                    <IconComponent size={24} />
                                </div>
                                <h3 className="feature-title">{feature.title}</h3>
                                <p className="feature-description">{feature.description}</p>
                            </div>
                        );
                    })}
                </div>
            </section>

            {/* Recent Posts Section */}
            <section className="recent-posts container">
                <div className="section-header">
                    <div>
                        <h2 className="section-title">Recent Posts</h2>
                        <p className="section-description">
                            Latest documentation and tutorials
                        </p>
                    </div>
                    <Link href="/blog" className="btn btn-secondary">
                        View All <ArrowRight size={16} />
                    </Link>
                </div>

                <div className="posts-grid">
                    {recentPosts.map((post, index) => (
                        <BlogCard
                            key={post.id}
                            post={post}
                            featured={index === 0}
                        />
                    ))}
                </div>
            </section>

            {/* CTA Section */}
            <section className="cta container">
                <div className="cta-card card-glass">
                    <h2 className="cta-title">{cta?.title}</h2>
                    <p className="cta-description">
                        {cta?.description}
                    </p>
                    <Link href="/dashboard" className="btn btn-primary btn-lg">
                        {cta?.buttonText} <ArrowRight size={18} />
                    </Link>
                </div>
            </section>
        </div>
    );
}
