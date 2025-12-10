'use client';

import '@/_legacy/public/PortfolioPage.css';
import { useSettings } from '@/services/settingsService';
import { ExternalLink, Github, Star } from 'lucide-react';

export default function PortfolioPage() {
    const { settings, loading } = useSettings();

    if (loading || !settings) {
        return <div className="loading-container">Loading...</div>;
    }

    const portfolio = settings.portfolio || { title: 'Portfolio', subtitle: '', projects: [] };
    const featuredProjects = (portfolio.projects || []).filter(p => p.featured);
    const otherProjects = (portfolio.projects || []).filter(p => !p.featured);

    return (
        <div className="portfolio-page">
            <div className="container">
                {/* Header */}
                <header className="portfolio-header">
                    <h1 className="portfolio-title">
                        <span className="gradient-text">{portfolio.title}</span>
                    </h1>
                    <p className="portfolio-subtitle">{portfolio.subtitle}</p>
                </header>

                {/* Featured Projects */}
                {featuredProjects.length > 0 && (
                    <section className="featured-section">
                        <div className="section-label">
                            <Star size={16} />
                            <span>Featured Projects</span>
                        </div>
                        <div className="featured-grid">
                            {featuredProjects.map((project) => (
                                <article key={project.id} className="project-card featured">
                                    <div className="project-image">
                                        <img src={project.image} alt={project.title} />
                                        <div className="project-overlay">
                                            <div className="project-links">
                                                {project.liveUrl && (
                                                    <a
                                                        href={project.liveUrl}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="project-link"
                                                    >
                                                        <ExternalLink size={20} />
                                                        <span>Live Demo</span>
                                                    </a>
                                                )}
                                                {project.githubUrl && (
                                                    <a
                                                        href={project.githubUrl}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="project-link"
                                                    >
                                                        <Github size={20} />
                                                        <span>Code</span>
                                                    </a>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="project-content">
                                        <h3 className="project-title">{project.title}</h3>
                                        <p className="project-description">{project.description}</p>
                                        <div className="project-tags">
                                            {(project.tags || []).map((tag) => (
                                                <span key={tag} className="project-tag">{tag}</span>
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
                        <h2 className="section-title">Other Projects</h2>
                        <div className="projects-grid">
                            {otherProjects.map((project) => (
                                <article key={project.id} className="project-card">
                                    <div className="project-image">
                                        <img src={project.image} alt={project.title} />
                                        <div className="project-overlay">
                                            <div className="project-links">
                                                {project.liveUrl && (
                                                    <a
                                                        href={project.liveUrl}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="project-link"
                                                    >
                                                        <ExternalLink size={18} />
                                                    </a>
                                                )}
                                                {project.githubUrl && (
                                                    <a
                                                        href={project.githubUrl}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="project-link"
                                                    >
                                                        <Github size={18} />
                                                    </a>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="project-content">
                                        <h3 className="project-title">{project.title}</h3>
                                        <p className="project-description">{project.description}</p>
                                        <div className="project-tags">
                                            {(project.tags || []).map((tag) => (
                                                <span key={tag} className="project-tag">{tag}</span>
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
                    <div className="empty-state">
                        <p>No projects to display yet.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
