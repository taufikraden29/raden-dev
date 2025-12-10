'use client';

import BlogCard from '@/components/ui/BlogCard';
import { usePosts, useTutorials } from '@/hooks/useData';
import '@/_legacy/public/HomePage.css';
import { useSettings } from '@/services/settingsService';
import {
    ArrowRight, ArrowUpRight, BookOpen, Clock, Code, ExternalLink,
    Github, Globe, GraduationCap, Heart, Rocket, Shield, Sparkles, Star, Zap
} from 'lucide-react';
import Link from 'next/link';

// Icon mapping
const iconMap = {
    Code, BookOpen, Zap, Star, Heart, Rocket, Shield, Globe, Sparkles
};

// Difficulty badge colors
const difficultyColors = {
    beginner: { bg: 'rgba(34, 197, 94, 0.15)', color: '#22c55e', border: 'rgba(34, 197, 94, 0.3)' },
    intermediate: { bg: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b', border: 'rgba(245, 158, 11, 0.3)' },
    advanced: { bg: 'rgba(239, 68, 68, 0.15)', color: '#ef4444', border: 'rgba(239, 68, 68, 0.3)' }
};

export default function HomePage() {
    const { posts, loading: postsLoading } = usePosts(true);
    const { tutorials, loading: tutorialsLoading } = useTutorials(true);
    const { settings, loading: settingsLoading } = useSettings();

    if (postsLoading || settingsLoading) {
        return (
            <div className="loading-container">
                <div className="loading-spinner-large" />
                <p>Loading...</p>
            </div>
        );
    }

    const recentPosts = posts.slice(0, 3);
    const { hero, stats, features, cta, portfolio } = settings;

    // Get featured projects
    const featuredProjects = portfolio?.projects
        ?.filter(p => p.featured)
        .slice(0, 3) || [];

    if (featuredProjects.length < 3) {
        const nonFeatured = portfolio?.projects
            ?.filter(p => !p.featured)
            .slice(0, 3 - featuredProjects.length) || [];
        featuredProjects.push(...nonFeatured);
    }

    const latestTutorials = tutorials.slice(0, 3);

    return (
        <div className="home-page">
            {/* Hero Section - Premium Design */}
            <section className="hero">
                <div className="hero-bg">
                    <div className="hero-gradient" />
                    <div className="hero-gradient-secondary" />
                    <div className="hero-grid" />
                    <div className="hero-orbs">
                        <div className="orb orb-1" />
                        <div className="orb orb-2" />
                        <div className="orb orb-3" />
                    </div>
                </div>

                <div className="hero-content container">
                    <div className="hero-badge animate-float">
                        <Sparkles size={14} />
                        <span>{hero?.badge || 'Welcome'}</span>
                    </div>

                    <h1 className="hero-title">
                        <span className="title-line">{hero?.title}</span>
                        <span className="title-line gradient-text">{hero?.titleHighlight}</span>
                        <span className="title-line">{hero?.titleSuffix}</span>
                    </h1>

                    <p className="hero-description">
                        {hero?.description}
                    </p>

                    <div className="hero-actions">
                        <Link href="/blog" className="btn btn-primary btn-lg btn-glow">
                            <span>{hero?.primaryButtonText}</span>
                            <ArrowRight size={18} />
                        </Link>
                        <Link href="/about" className="btn btn-glass btn-lg">
                            <span>{hero?.secondaryButtonText}</span>
                            <ArrowUpRight size={18} />
                        </Link>
                    </div>

                    {stats?.showStats && (
                        <div className="hero-stats glass-card">
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

                <div className="scroll-indicator">
                    <div className="mouse">
                        <div className="wheel" />
                    </div>
                    <span>Scroll to explore</span>
                </div>
            </section>

            {/* Features - Bento Grid Layout */}
            <section className="features-section container">
                <div className="section-intro">
                    <span className="section-label">What I Do</span>
                    <h2 className="section-title-large">Crafting Digital Experiences</h2>
                </div>

                <div className="bento-grid">
                    {features?.map((feature, index) => {
                        const IconComponent = iconMap[feature.icon] || Code;
                        const isLarge = index === 0;
                        return (
                            <div
                                key={index}
                                className={`bento-card ${isLarge ? 'bento-large' : ''}`}
                                style={{ '--delay': `${index * 0.1}s` }}
                            >
                                <div className="bento-icon">
                                    <IconComponent size={isLarge ? 32 : 24} />
                                </div>
                                <h3 className="bento-title">{feature.title}</h3>
                                <p className="bento-description">{feature.description}</p>
                                {isLarge && (
                                    <div className="bento-decoration">
                                        <div className="decoration-line" />
                                        <div className="decoration-line" />
                                        <div className="decoration-line" />
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </section>

            {/* Featured Projects - Showcase Style */}
            {featuredProjects.length > 0 && (
                <section className="projects-section">
                    <div className="container">
                        <div className="section-header-modern">
                            <div className="section-header-left">
                                <span className="section-label">Portfolio</span>
                                <h2 className="section-title-large">Featured Projects</h2>
                                <p className="section-subtitle">Showcase of my latest work and experiments</p>
                            </div>
                            <Link href="/portfolio" className="btn btn-outline">
                                View All <ArrowRight size={16} />
                            </Link>
                        </div>

                        <div className="projects-showcase">
                            {featuredProjects.map((project, index) => (
                                <article
                                    key={project.id || index}
                                    className={`project-showcase-card ${index === 0 ? 'featured' : ''}`}
                                >
                                    <div className="project-image-wrapper">
                                        {project.image ? (
                                            <img
                                                src={project.image}
                                                alt={project.title}
                                                style={{ objectFit: 'cover', width: '100%', height: '100%' }}
                                                onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
                                            />
                                        ) : null}
                                        <div className="project-placeholder-modern" style={{ display: project.image ? 'none' : 'flex' }}>
                                            <Code size={48} strokeWidth={1} />
                                        </div>
                                        <div className="project-overlay">
                                            <div className="project-links-overlay">
                                                {project.liveUrl && (
                                                    <a href={project.liveUrl} target="_blank" rel="noopener noreferrer" className="overlay-link">
                                                        <ExternalLink size={20} />
                                                    </a>
                                                )}
                                                {project.githubUrl && (
                                                    <a href={project.githubUrl} target="_blank" rel="noopener noreferrer" className="overlay-link">
                                                        <Github size={20} />
                                                    </a>
                                                )}
                                            </div>
                                        </div>
                                        {project.featured && (
                                            <span className="featured-ribbon">
                                                <Star size={12} /> Featured
                                            </span>
                                        )}
                                    </div>
                                    <div className="project-info">
                                        <h3 className="project-title-modern">{project.title}</h3>
                                        <p className="project-description-modern">{project.description}</p>
                                        <div className="project-tech-stack">
                                            {project.tags?.slice(0, 4).map((tag, i) => (
                                                <span key={i} className="tech-tag">{tag}</span>
                                            ))}
                                        </div>
                                    </div>
                                </article>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* Latest Tutorials - Modern Cards */}
            {latestTutorials.length > 0 && (
                <section className="tutorials-section container">
                    <div className="section-header-modern">
                        <div className="section-header-left">
                            <span className="section-label">Learn</span>
                            <h2 className="section-title-large">Latest Tutorials</h2>
                            <p className="section-subtitle">Step-by-step guides to help you grow</p>
                        </div>
                        <Link href="/tutorials" className="btn btn-outline">
                            Explore All <ArrowRight size={16} />
                        </Link>
                    </div>

                    <div className="tutorials-modern-grid">
                        {latestTutorials.map((tutorial, index) => {
                            const diffStyle = difficultyColors[tutorial.difficulty] || difficultyColors.beginner;
                            return (
                                <Link
                                    key={tutorial.id}
                                    href={`/tutorials/${tutorial.slug}`}
                                    className="tutorial-modern-card"
                                    style={{ '--delay': `${index * 0.1}s` }}
                                >
                                    <div className="tutorial-card-image">
                                        {tutorial.thumbnail ? (
                                            <Image
                                                src={tutorial.thumbnail}
                                                alt={tutorial.title}
                                                width={400}
                                                height={200}
                                                style={{ objectFit: 'cover', width: '100%', height: '100%' }}
                                            />
                                        ) : (
                                            <div className="tutorial-placeholder-modern">
                                                <GraduationCap size={40} strokeWidth={1.5} />
                                            </div>
                                        )}
                                        <div className="tutorial-badges">
                                            <span
                                                className="difficulty-pill"
                                                style={{
                                                    background: diffStyle.bg,
                                                    color: diffStyle.color,
                                                    borderColor: diffStyle.border
                                                }}
                                            >
                                                {tutorial.difficulty}
                                            </span>
                                            {tutorial.is_premium && (
                                                <span className="premium-pill">Premium</span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="tutorial-card-body">
                                        <div className="tutorial-meta-row">
                                            {tutorial.category && (
                                                <span className="tutorial-category-tag">{tutorial.category}</span>
                                            )}
                                            {tutorial.estimated_time && (
                                                <span className="tutorial-time-tag">
                                                    <Clock size={12} /> {tutorial.estimated_time}
                                                </span>
                                            )}
                                        </div>
                                        <h3 className="tutorial-card-title">{tutorial.title}</h3>
                                        {tutorial.description && (
                                            <p className="tutorial-card-desc">{tutorial.description}</p>
                                        )}
                                        <div className="tutorial-card-footer">
                                            <span className="steps-badge">
                                                {tutorial.steps?.length || 0} steps
                                            </span>
                                            <span className="start-learning">
                                                Start Learning <ArrowRight size={14} />
                                            </span>
                                        </div>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                </section>
            )}

            {/* Recent Posts - Clean Modern */}
            <section className="posts-section container">
                <div className="section-header-modern">
                    <div className="section-header-left">
                        <span className="section-label">Blog</span>
                        <h2 className="section-title-large">Recent Posts</h2>
                        <p className="section-subtitle">Latest documentation and insights</p>
                    </div>
                    <Link href="/blog" className="btn btn-outline">
                        View All <ArrowRight size={16} />
                    </Link>
                </div>

                <div className="posts-grid-modern">
                    {recentPosts.map((post, index) => (
                        <BlogCard
                            key={post.id}
                            post={post}
                            featured={index === 0}
                        />
                    ))}
                </div>
            </section>

            {/* CTA - Premium Glass */}
            <section className="cta-section container">
                <div className="cta-card-modern">
                    <div className="cta-bg-shapes">
                        <div className="cta-shape shape-1" />
                        <div className="cta-shape shape-2" />
                    </div>
                    <div className="cta-content">
                        <h2 className="cta-title-modern">{cta?.title}</h2>
                        <p className="cta-description-modern">{cta?.description}</p>
                        <Link href="/dashboard" className="btn btn-primary btn-lg btn-glow">
                            {cta?.buttonText} <ArrowRight size={18} />
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
}
