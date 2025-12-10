import { Briefcase, Github, Linkedin, Mail, MapPin, Twitter } from 'lucide-react';
import { useSettings } from '../../services/settingsService';
import './AboutPage.css';

const AboutPage = () => {
    const { settings, loading } = useSettings();

    if (loading || !settings) {
        return <div className="loading-container">Loading...</div>;
    }

    const { profile, social, site } = settings;

    const socialLinks = [
        { icon: Github, href: social.github, label: 'GitHub' },
        { icon: Twitter, href: social.twitter, label: 'Twitter' },
        { icon: Linkedin, href: social.linkedin, label: 'LinkedIn' },
        { icon: Mail, href: `mailto:${social.email}`, label: 'Email' },
    ];

    return (
        <div className="about-page">
            <div className="container">
                {/* Profile Section */}
                <section className="profile-section">
                    <div className="profile-image">
                        <div className="profile-placeholder">
                            <span>{'</>'}</span>
                        </div>
                    </div>

                    <div className="profile-info">
                        <h1 className="profile-name">
                            Hi, I'm <span className="gradient-text">{profile.name}</span>
                        </h1>

                        <div className="profile-meta">
                            <span className="meta-item">
                                <Briefcase size={18} />
                                {profile.role}
                            </span>
                            <span className="meta-item">
                                <MapPin size={18} />
                                {profile.location}
                            </span>
                        </div>

                        <p className="profile-bio">
                            {profile.bio}
                        </p>

                        <div className="profile-social">
                            {socialLinks.map(({ icon: Icon, href, label }) => (
                                <a
                                    key={label}
                                    href={href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="social-link"
                                    aria-label={label}
                                >
                                    <Icon size={20} />
                                </a>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Skills Section */}
                <section className="skills-section">
                    <h2 className="section-title">Skills & Technologies</h2>

                    <div className="skills-grid">
                        {profile.skills.map(({ category, items }) => (
                            <div key={category} className="skill-card card">
                                <h3 className="skill-category">{category}</h3>
                                <div className="skill-items">
                                    {items.map(item => (
                                        <span key={item} className="skill-item">{item}</span>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* About Blog Section */}
                <section className="blog-info-section">
                    <div className="blog-info-card card-glass">
                        <h2>{site.aboutBlogTitle}</h2>
                        {site.aboutBlogDescription.split('\n\n').map((paragraph, index) => (
                            <p key={index}>{paragraph}</p>
                        ))}
                    </div>
                </section>
            </div>
        </div>
    );
};

export default AboutPage;
