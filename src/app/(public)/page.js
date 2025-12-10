'use client';

import BlogCard from '@/components/ui/BlogCard';
import { usePosts, useTutorials } from '@/hooks/useData';
import '@/_legacy/public/HomePage.css';
import { useSettings } from '@/services/settingsService';
import { ArrowRight, BookOpen, Clock, Code, ExternalLink, Github, Globe, GraduationCap, Heart, Rocket, Shield, Star, Zap } from 'lucide-react';
import Image from 'next/image';
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

// Difficulty badge colors
const difficultyColors = {
    beginner: { bg: 'rgba(34, 197, 94, 0.1)', color: '#22c55e' },
    intermediate: { bg: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b' },
    advanced: { bg: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' }
};

export default function HomePage() {
    const { posts, loading: postsLoading } = usePosts(true);
    const { tutorials, loading: tutorialsLoading } = useTutorials(true);
    const { settings, loading: settingsLoading } = useSettings();

    if (postsLoading || settingsLoading) {
        return <div className="loading-container">Loading...</div>;
    }

    const recentPosts = posts.slice(0, 3);
    const { hero, stats, features, cta, portfolio } = settings;

    // Get featured projects (prioritize featured: true, then latest)
    const featuredProjects = portfolio?.projects
        ?.filter(p => p.featured)
        .slice(0, 3) || [];

    // If less than 3 featured, fill with non-featured
    if (featuredProjects.length < 3) {
        const nonFeatured = portfolio?.projects
            ?.filter(p => !p.featured)
            .slice(0, 3 - featuredProjects.length) || [];
        featuredProjects.push(...nonFeatured);
    }

    // Get latest tutorials (max 3)
    const latestTutorials = tutorials.slice(0, 3);

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

            {/* Featured Projects Section */}
            {featuredProjects.length > 0 && (
                <section className="featured-projects container">
                    <div className="section-header">
                        <div>
                            <h2 className="section-title">Featured Projects</h2>
                            <p className="section-description">
                                Showcase of my latest work and experiments
                            </p>
                        </div>
                        <Link href="/portfolio" className="btn btn-secondary">
                            View All <ArrowRight size={16} />
                        </Link>
                    </div>

                    <div className="projects-grid">
                        {featuredProjects.map((project, index) => (
                            <div key={project.id || index} className="project-card card">
                                <div className="project-image">
                                    {project.image ? (
                                        <Image
                                            src={project.image}
                                            alt={project.title}
                                            width={400}
                                            height={225}
                                            style={{ objectFit: 'cover', width: '100%', height: '100%' }}
                                        />
                                    ) : (
                                        <div className="project-placeholder">
                                            <Code size={48} />
                                        </div>
                                    )}
                                    {project.featured && (
                                        <span className="featured-badge">
                                            <Star size={12} /> Featured
                                        </span>
                                    )}
                                </div>
                                <div className="project-content">
                                    <h3 className="project-title">{project.title}</h3>
                                    <p className="project-description">{project.description}</p>
                                    <div className="project-tags">
                                        {project.tags?.slice(0, 3).map((tag, i) => (
                                            <span key={i} className="tag">{tag}</span>
                                        ))}
                                    </div>
                                    <div className="project-links">
                                        {project.liveUrl && (
                                            <a href={project.liveUrl} target="_blank" rel="noopener noreferrer" className="project-link">
                                                <ExternalLink size={14} /> Live
                                            </a>
                                        )}
                                        {project.githubUrl && (
                                            <a href={project.githubUrl} target="_blank" rel="noopener noreferrer" className="project-link">
                                                <Github size={14} /> Code
                                            </a>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {/* Latest Tutorials Section */}
            {latestTutorials.length > 0 && (
                <section className="latest-tutorials container">
                    <div className="section-header">
                        <div>
                            <h2 className="section-title">Latest Tutorials</h2>
                            <p className="section-description">
                                Step-by-step guides to help you learn
                            </p>
                        </div>
                        <Link href="/tutorials" className="btn btn-secondary">
                            Explore All <ArrowRight size={16} />
                        </Link>
                    </div>

                    <div className="tutorials-grid">
                        {latestTutorials.map((tutorial) => (
                            <Link
                                key={tutorial.id}
                                href={`/tutorials/${tutorial.slug}`}
                                className="tutorial-card card"
                            >
                                <div className="tutorial-image">
                                    {tutorial.thumbnail ? (
                                        <Image
                                            src={tutorial.thumbnail}
                                            alt={tutorial.title}
                                            width={400}
                                            height={200}
                                            style={{ objectFit: 'cover', width: '100%', height: '100%' }}
                                        />
                                    ) : (
                                        <div className="tutorial-placeholder">
                                            <GraduationCap size={48} />
                                        </div>
                                    )}
                                    <span
                                        className="difficulty-badge"
                                        style={difficultyColors[tutorial.difficulty] || difficultyColors.beginner}
                                    >
                                        {tutorial.difficulty}
                                    </span>
                                </div>
                                <div className="tutorial-content">
                                    <div className="tutorial-meta">
                                        {tutorial.category && (
                                            <span className="tutorial-category">{tutorial.category}</span>
                                        )}
                                        {tutorial.estimated_time && (
                                            <span className="tutorial-time">
                                                <Clock size={12} /> {tutorial.estimated_time}
                                            </span>
                                        )}
                                    </div>
                                    <h3 className="tutorial-title">{tutorial.title}</h3>
                                    {tutorial.description && (
                                        <p className="tutorial-description">{tutorial.description}</p>
                                    )}
                                    <div className="tutorial-footer">
                                        <span className="steps-count">
                                            {tutorial.steps?.length || 0} steps
                                        </span>
                                        <span className="learn-more">
                                            Learn more <ArrowRight size={14} />
                                        </span>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </section>
            )}

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
