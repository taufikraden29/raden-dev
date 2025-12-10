'use client';

import '@/_legacy/public/PortfolioPage.css';
import { useSettings } from '@/services/settingsService';
import { Code, ExternalLink, Folder, Github, Globe, Sparkles, Star } from 'lucide-react';

export default function PortfolioPage() {
    const { settings, loading } = useSettings();

    if (loading || !settings) {
        return (
            <div className="loading-container">
                <div className="loading-spinner-large" />
                <p>Loading portfolio...</p>
            </div>
        );
    }

    const portfolio = settings.portfolio || { title: 'Portfolio', subtitle: '', projects: [] };
    const featuredProjects = (portfolio.projects || []).filter(p => p.featured);
    const otherProjects = (portfolio.projects || []).filter(p => !p.featured);

    return (
        <div className="portfolio-page">
            {/* Hero Section */}
            <section className="portfolio-hero">
                <div className="portfolio-hero-bg">
                    <div className="hero-orb orb-1" />
                    <div className="hero-orb orb-2" />
                    <div className="hero-orb orb-3" />
                    <div className="hero-grid-pattern" />
                </div>

                <div className="container portfolio-hero-content">
                    <div className="hero-badge">
                        <Sparkles size={14} />
                        <span>My Work</span>
                    </div>

                    <h1 className="portfolio-hero-title">
                        <span className="gradient-text">{portfolio.title}</span>
                    </h1>

                    <p className="portfolio-hero-description">
                        {portfolio.subtitle || 'A showcase of projects, experiments, and creative work'}
                    </p>

                    {/* Stats */}
                    <div className="portfolio-stats">
                        <div className="stat-item">
                            <span className="stat-number">{portfolio.projects?.length || 0}</span>
                            <span className="stat-text">Projects</span>
                        </div>
                        <div className="stat-divider" />
                        <div className="stat-item">
                            <span className="stat-number">{featuredProjects.length}</span>
                            <span className="stat-text">Featured</span>
                        </div>
                    </div>
                </div>
            </section>

            <div className="container">
                {/* Featured Projects */}
                {featuredProjects.length > 0 && (
                    <section className="featured-section">
                        <div className="section-header">
                            <div className="section-label">
                                <Star size={14} />
                                <span>Featured Projects</span>
                            </div>
                        </div>

                        <div className="featured-grid">
                            {featuredProjects.map((project, index) => (
                                <article
                                    key={project.id}
                                    className="project-card-modern featured"
                                    style={{ '--delay': `${index * 0.1}s` }}
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
                                        <div className="project-placeholder" style={{ display: project.image ? 'none' : 'flex' }}>
                                            <Folder size={48} strokeWidth={1} />
                                        </div>

                                        <div className="project-overlay">
                                            <div className="overlay-links">
                                                {project.liveUrl && (
                                                    <a
                                                        href={project.liveUrl}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="overlay-btn"
                                                    >
                                                        <Globe size={18} />
                                                        <span>Live Demo</span>
                                                    </a>
                                                )}
                                                {project.githubUrl && (
                                                    <a
                                                        href={project.githubUrl}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="overlay-btn"
                                                    >
                                                        <Github size={18} />
                                                        <span>Source</span>
                                                    </a>
                                                )}
                                            </div>
                                        </div>

                                        <div className="project-badges">
                                            {project.type && (
                                                <span className={`type-badge ${project.type}`}>
                                                    {project.type === 'design' ? '🎨 Design' : project.type === 'both' ? '💻🎨' : '💻 Code'}
                                                </span>
                                            )}
                                            <span className="featured-ribbon">
                                                <Star size={12} /> Featured
                                            </span>
                                        </div>
                                    </div>

                                    <div className="project-info">
                                        <h3 className="project-title">{project.title}</h3>
                                        <p className="project-description">{project.description}</p>
                                        <div className="tech-tags">
                                            {(project.tags || []).slice(0, 5).map((tag) => (
                                                <span key={tag} className="tech-tag">{tag}</span>
                                            ))}
                                        </div>
                                    </div>
                                </article>
                            ))}
                        </div>
                    </section>
                )}

                {/* Other Projects */}
                {otherProjects.length > 0 && (
                    <section className="other-section">
                        <div className="section-header">
                            <div className="section-label">
                                <Folder size={14} />
                                <span>Other Projects</span>
                            </div>
                        </div>

                        <div className="projects-grid">
                            {otherProjects.map((project, index) => (
                                <article
                                    key={project.id}
                                    className="project-card-modern"
                                    style={{ '--delay': `${index * 0.05}s` }}
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
                                        <div className="project-placeholder" style={{ display: project.image ? 'none' : 'flex' }}>
                                            <Code size={36} strokeWidth={1} />
                                        </div>

                                        <div className="project-overlay">
                                            <div className="overlay-links">
                                                {project.liveUrl && (
                                                    <a
                                                        href={project.liveUrl}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="overlay-btn-small"
                                                    >
                                                        <ExternalLink size={16} />
                                                    </a>
                                                )}
                                                {project.githubUrl && (
                                                    <a
                                                        href={project.githubUrl}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="overlay-btn-small"
                                                    >
                                                        <Github size={16} />
                                                    </a>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="project-info">
                                        <h3 className="project-title">{project.title}</h3>
                                        <p className="project-description">{project.description}</p>
                                        <div className="tech-tags">
                                            {(project.tags || []).slice(0, 4).map((tag) => (
                                                <span key={tag} className="tech-tag">{tag}</span>
                                            ))}
                                        </div>
                                    </div>
                                </article>
                            ))}
                        </div>
                    </section>
                )}

                {/* Empty State */}
                {(portfolio.projects || []).length === 0 && (
                    <div className="empty-state-modern">
                        <div className="empty-icon-wrapper">
                            <Folder size={48} strokeWidth={1.5} />
                        </div>
                        <h3>No projects yet</h3>
                        <p>Check back soon for new additions</p>
                    </div>
                )}
            </div>
        </div>
    );
}
