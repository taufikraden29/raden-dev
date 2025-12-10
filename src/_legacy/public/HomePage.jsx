import { ArrowRight, BookOpen, Code, Globe, Heart, Rocket, Shield, Star, Zap } from 'lucide-react';
import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import BlogCard from '../../components/ui/BlogCard';
import { BlogCardSkeleton, Skeleton } from '../../components/ui/Skeleton';
import { usePosts } from '../../hooks/useData';
import { useSettings } from '../../services/settingsService';
import './HomePage.css';

// Icon mapping - defined outside component
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

// Home Page Skeleton
const HomePageSkeleton = () => (
    <div className="home-page">
        <section className="hero">
            <div className="hero-bg">
                <div className="hero-gradient" />
                <div className="hero-grid" />
            </div>
            <div className="hero-content container" style={{ textAlign: 'center' }}>
                <Skeleton width="120px" height="28px" borderRadius="var(--radius-full)" className="mb-lg" style={{ margin: '0 auto' }} />
                <Skeleton width="60%" height="3rem" className="mb-md" style={{ margin: '0 auto' }} />
                <Skeleton width="80%" height="1.25rem" className="mb-xl" style={{ margin: '0 auto' }} />
                <div style={{ display: 'flex', gap: 'var(--space-md)', justifyContent: 'center' }}>
                    <Skeleton width="150px" height="48px" borderRadius="var(--radius-md)" />
                    <Skeleton width="120px" height="48px" borderRadius="var(--radius-md)" />
                </div>
            </div>
        </section>
        <section className="recent-posts container">
            <div className="section-header">
                <div>
                    <Skeleton width="150px" height="1.75rem" className="mb-sm" />
                    <Skeleton width="250px" height="1rem" />
                </div>
            </div>
            <div className="posts-grid">
                <BlogCardSkeleton />
                <BlogCardSkeleton />
                <BlogCardSkeleton />
            </div>
        </section>
    </div>
);

const HomePage = () => {
    const { posts, loading: postsLoading } = usePosts(true);
    const { settings, loading: settingsLoading } = useSettings();

    // Memoize recentPosts
    const recentPosts = useMemo(() => posts.slice(0, 3), [posts]);

    if (postsLoading || settingsLoading) {
        return <HomePageSkeleton />;
    }

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
                        <span className="badge badge-primary">{hero.badge}</span>
                    </div>

                    <h1 className="hero-title">
                        {hero.title} <span className="gradient-text">{hero.titleHighlight}</span>{hero.titleSuffix}
                    </h1>

                    <p className="hero-description">
                        {hero.description}
                    </p>

                    <div className="hero-actions">
                        <Link to="/blog" className="btn btn-primary btn-lg">
                            {hero.primaryButtonText} <ArrowRight size={18} />
                        </Link>
                        <Link to="/about" className="btn btn-secondary btn-lg">
                            {hero.secondaryButtonText}
                        </Link>
                    </div>

                    {stats.showStats && (
                        <div className="hero-stats">
                            <div className="stat">
                                <span className="stat-value">{posts.length}+</span>
                                <span className="stat-label">{stats.stat1Label}</span>
                            </div>
                            <div className="stat-divider" />
                            <div className="stat">
                                <span className="stat-value">{stats.stat2Value}</span>
                                <span className="stat-label">{stats.stat2Label}</span>
                            </div>
                            <div className="stat-divider" />
                            <div className="stat">
                                <span className="stat-value">{stats.stat3Value}</span>
                                <span className="stat-label">{stats.stat3Label}</span>
                            </div>
                        </div>
                    )}
                </div>
            </section>

            {/* Features Section */}
            <section className="features container">
                <div className="features-grid">
                    {features.map((feature, index) => {
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
                    <Link to="/blog" className="btn btn-secondary">
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
                    <h2 className="cta-title">{cta.title}</h2>
                    <p className="cta-description">
                        {cta.description}
                    </p>
                    <Link to="/dashboard" className="btn btn-primary btn-lg">
                        {cta.buttonText} <ArrowRight size={18} />
                    </Link>
                </div>
            </section>
        </div>
    );
};

export default HomePage;
