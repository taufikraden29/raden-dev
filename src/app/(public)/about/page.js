'use client';

import '@/_legacy/public/AboutPage.css';
import { useSettings } from '@/services/settingsService';
import { Briefcase, Code, Github, Linkedin, Mail, MapPin, Sparkles, Twitter } from 'lucide-react';

export default function AboutPage() {
    const { settings, loading } = useSettings();

    if (loading || !settings) {
        return (
            <div className="loading-container">
                <div className="loading-spinner-large" />
                <p>Loading...</p>
            </div>
        );
    }

    const { profile, social, site } = settings;

    // Handle social as array or object for backward compatibility
    const socialData = Array.isArray(social) ? social.reduce((acc, item) => {
        acc[item.platform?.toLowerCase()] = item.url;
        return acc;
    }, {}) : (social || {});

    const socialLinks = [
        { icon: Github, href: socialData.github, label: 'GitHub' },
        { icon: Twitter, href: socialData.twitter, label: 'Twitter' },
        { icon: Linkedin, href: socialData.linkedin, label: 'LinkedIn' },
        { icon: Mail, href: socialData.email ? `mailto:${socialData.email}` : null, label: 'Email' },
    ].filter(link => link.href);

    return (
        <div className="about-page">
            {/* Hero Section */}
            <section className="about-hero">
                <div className="about-hero-bg">
                    <div className="hero-orb orb-1" />
                    <div className="hero-orb orb-2" />
                    <div className="hero-grid-pattern" />
                </div>

                <div className="container about-hero-content">
                    <div className="hero-badge">
                        <Sparkles size={14} />
                        <span>About Me</span>
                    </div>

                    <div className="profile-card-modern">
                        <div className="profile-avatar">
                            <div className="avatar-glow" />
                            <div className="avatar-inner">
                                <Code size={48} strokeWidth={1.5} />
                            </div>
                        </div>

                        <div className="profile-content">
                            <h1 className="profile-name">
                                Hi, I'm <span className="gradient-text">{profile?.name || 'Developer'}</span>
                            </h1>

                            <div className="profile-meta">
                                <span className="meta-chip">
                                    <Briefcase size={16} />
                                    {profile?.role || 'Developer'}
                                </span>
                                <span className="meta-chip">
                                    <MapPin size={16} />
                                    {profile?.location || 'Indonesia'}
                                </span>
                            </div>

                            <p className="profile-bio">
                                {profile?.bio || 'A passionate developer who loves building things for the web.'}
                            </p>

                            <div className="profile-social">
                                {socialLinks.map(({ icon: Icon, href, label }) => (
                                    <a
                                        key={label}
                                        href={href}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="social-btn"
                                        aria-label={label}
                                    >
                                        <Icon size={20} />
                                    </a>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <div className="container">
                {/* Skills Section */}
                {profile?.skills?.length > 0 && (
                    <section className="skills-section">
                        <div className="section-header">
                            <div className="section-label">
                                <Code size={14} />
                                <span>Skills & Technologies</span>
                            </div>
                        </div>

                        <div className="skills-bento">
                            {profile.skills.map(({ category, items }, index) => (
                                <div
                                    key={category}
                                    className={`skill-card-modern ${index === 0 ? 'featured' : ''}`}
                                    style={{ '--delay': `${index * 0.1}s` }}
                                >
                                    <h3 className="skill-category">{category}</h3>
                                    <div className="skill-tags">
                                        {items.map(item => (
                                            <span key={item} className="skill-tag">{item}</span>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* About Blog Section */}
                {site?.aboutBlogTitle && (
                    <section className="blog-info-section">
                        <div className="blog-info-card-modern">
                            <div className="card-glow" />
                            <div className="card-content">
                                <h2>{site.aboutBlogTitle}</h2>
                                {(site.aboutBlogDescription || '').split('\n\n').map((paragraph, index) => (
                                    <p key={index}>{paragraph}</p>
                                ))}
                            </div>
                        </div>
                    </section>
                )}
            </div>
        </div>
    );
}
