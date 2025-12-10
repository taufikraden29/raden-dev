import {
    Briefcase,
    Check,
    Globe,
    Layout,
    MessageSquare,
    Plus,
    RotateCcw,
    Save,
    Share2,
    Sparkles,
    Trash2,
    User
} from 'lucide-react';
import { useEffect, useState } from 'react';
import {
    resetSettings,
    updateCtaSettings,
    updateFeaturesSettings,
    updateHeroSettings,
    updatePortfolioSettings,
    updateProfileSettings,
    updateSiteSettings,
    updateSocialSettings,
    updateStatsSettings,
    useSettings
} from '../../services/settingsService';
import './SettingsPage.css';

const SettingsPage = () => {
    const { settings: loadedSettings, loading } = useSettings();
    const [settings, setSettings] = useState(null);
    const [activeTab, setActiveTab] = useState('hero');
    const [saved, setSaved] = useState(false);
    const [showResetModal, setShowResetModal] = useState(false);

    useEffect(() => {
        if (loadedSettings) {
            setSettings(loadedSettings);
        }
    }, [loadedSettings]);

    const handleChange = (section, field, value) => {
        setSettings(prev => ({
            ...prev,
            [section]: {
                ...prev[section],
                [field]: value
            }
        }));
    };

    const handleFeatureChange = (index, field, value) => {
        const newFeatures = [...settings.features];
        newFeatures[index] = { ...newFeatures[index], [field]: value };
        setSettings(prev => ({ ...prev, features: newFeatures }));
    };

    const handleSkillChange = (index, field, value) => {
        const newSkills = [...settings.profile.skills];
        if (field === 'items') {
            newSkills[index] = { ...newSkills[index], items: value.split(',').map(s => s.trim()) };
        } else {
            newSkills[index] = { ...newSkills[index], [field]: value };
        }
        setSettings(prev => ({
            ...prev,
            profile: { ...prev.profile, skills: newSkills }
        }));
    };

    // Portfolio handlers
    const handlePortfolioChange = (field, value) => {
        setSettings(prev => ({
            ...prev,
            portfolio: { ...prev.portfolio, [field]: value }
        }));
    };

    const handleProjectChange = (index, field, value) => {
        const newProjects = [...settings.portfolio.projects];
        if (field === 'tags') {
            newProjects[index] = { ...newProjects[index], tags: value.split(',').map(t => t.trim()) };
        } else if (field === 'featured') {
            newProjects[index] = { ...newProjects[index], featured: value };
        } else {
            newProjects[index] = { ...newProjects[index], [field]: value };
        }
        setSettings(prev => ({
            ...prev,
            portfolio: { ...prev.portfolio, projects: newProjects }
        }));
    };

    const addProject = () => {
        const newProject = {
            id: Date.now().toString(),
            title: 'New Project',
            description: 'Project description...',
            image: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600',
            tags: ['Tag1', 'Tag2'],
            liveUrl: '',
            githubUrl: '',
            featured: false
        };
        setSettings(prev => ({
            ...prev,
            portfolio: { ...prev.portfolio, projects: [...prev.portfolio.projects, newProject] }
        }));
    };

    const removeProject = (index) => {
        const newProjects = settings.portfolio.projects.filter((_, i) => i !== index);
        setSettings(prev => ({
            ...prev,
            portfolio: { ...prev.portfolio, projects: newProjects }
        }));
    };

    const handleSave = async () => {
        await updateHeroSettings(settings.hero);
        await updateStatsSettings(settings.stats);
        await updateFeaturesSettings(settings.features);
        await updateCtaSettings(settings.cta);
        await updateProfileSettings(settings.profile);
        await updateSocialSettings(settings.social);
        await updateSiteSettings(settings.site);
        await updatePortfolioSettings(settings.portfolio);

        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
    };

    const handleReset = async () => {
        const defaultSettings = await resetSettings();
        setSettings(defaultSettings);
        setShowResetModal(false);
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
    };

    if (loading || !settings) {
        return <div className="loading-container">Loading...</div>;
    }

    const tabs = [
        { id: 'hero', label: 'Hero Section', icon: Layout },
        { id: 'features', label: 'Features', icon: Sparkles },
        { id: 'cta', label: 'CTA Section', icon: MessageSquare },
        { id: 'portfolio', label: 'Portfolio', icon: Briefcase },
        { id: 'profile', label: 'Profile', icon: User },
        { id: 'social', label: 'Social Links', icon: Share2 },
        { id: 'site', label: 'Site Info', icon: Globe },
    ];

    return (
        <div className="settings-page">
            <header className="page-header">
                <div>
                    <h1>Settings</h1>
                    <p>Customize your website content</p>
                </div>
                <div className="header-actions">
                    <button className="btn btn-secondary" onClick={() => setShowResetModal(true)}>
                        <RotateCcw size={18} />
                        Reset
                    </button>
                    <button className="btn btn-primary" onClick={handleSave}>
                        {saved ? <Check size={18} /> : <Save size={18} />}
                        {saved ? 'Saved!' : 'Save Changes'}
                    </button>
                </div>
            </header>

            <div className="settings-container">
                <div className="settings-tabs">
                    {tabs.map(({ id, label, icon: Icon }) => (
                        <button
                            key={id}
                            className={`tab-btn ${activeTab === id ? 'active' : ''}`}
                            onClick={() => setActiveTab(id)}
                        >
                            <Icon size={18} />
                            <span>{label}</span>
                        </button>
                    ))}
                </div>

                <div className="settings-content card">
                    {/* Hero Section */}
                    {activeTab === 'hero' && (
                        <div className="settings-section">
                            <h2>Hero Section</h2>
                            <p className="section-description">Customize the main hero section on the homepage</p>

                            <div className="form-grid">
                                <div className="form-group">
                                    <label className="form-label">Badge Text</label>
                                    <input type="text" className="form-input" value={settings.hero.badge}
                                        onChange={(e) => handleChange('hero', 'badge', e.target.value)} />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Title Prefix</label>
                                    <input type="text" className="form-input" value={settings.hero.title}
                                        onChange={(e) => handleChange('hero', 'title', e.target.value)} />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Title Highlight (Gradient)</label>
                                    <input type="text" className="form-input" value={settings.hero.titleHighlight}
                                        onChange={(e) => handleChange('hero', 'titleHighlight', e.target.value)} />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Title Suffix</label>
                                    <input type="text" className="form-input" value={settings.hero.titleSuffix}
                                        onChange={(e) => handleChange('hero', 'titleSuffix', e.target.value)} />
                                </div>
                                <div className="form-group full-width">
                                    <label className="form-label">Description</label>
                                    <textarea className="form-textarea" rows={3} value={settings.hero.description}
                                        onChange={(e) => handleChange('hero', 'description', e.target.value)} />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Primary Button Text</label>
                                    <input type="text" className="form-input" value={settings.hero.primaryButtonText}
                                        onChange={(e) => handleChange('hero', 'primaryButtonText', e.target.value)} />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Secondary Button Text</label>
                                    <input type="text" className="form-input" value={settings.hero.secondaryButtonText}
                                        onChange={(e) => handleChange('hero', 'secondaryButtonText', e.target.value)} />
                                </div>
                            </div>

                            <h3 className="subsection-title">Stats Section</h3>
                            <div className="form-grid">
                                <div className="form-group">
                                    <label className="form-checkbox">
                                        <input type="checkbox" checked={settings.stats.showStats}
                                            onChange={(e) => handleChange('stats', 'showStats', e.target.checked)} />
                                        <span>Show Stats Section</span>
                                    </label>
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Stat 1 Label</label>
                                    <input type="text" className="form-input" value={settings.stats.stat1Label}
                                        onChange={(e) => handleChange('stats', 'stat1Label', e.target.value)} />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Stat 2 Value</label>
                                    <input type="text" className="form-input" value={settings.stats.stat2Value}
                                        onChange={(e) => handleChange('stats', 'stat2Value', e.target.value)} />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Stat 2 Label</label>
                                    <input type="text" className="form-input" value={settings.stats.stat2Label}
                                        onChange={(e) => handleChange('stats', 'stat2Label', e.target.value)} />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Stat 3 Value</label>
                                    <input type="text" className="form-input" value={settings.stats.stat3Value}
                                        onChange={(e) => handleChange('stats', 'stat3Value', e.target.value)} />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Stat 3 Label</label>
                                    <input type="text" className="form-input" value={settings.stats.stat3Label}
                                        onChange={(e) => handleChange('stats', 'stat3Label', e.target.value)} />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Features Section */}
                    {activeTab === 'features' && (
                        <div className="settings-section">
                            <h2>Features Section</h2>
                            <p className="section-description">Edit the three feature cards on the homepage</p>

                            {settings.features.map((feature, index) => (
                                <div key={index} className="feature-editor">
                                    <h3>Feature {index + 1}</h3>
                                    <div className="form-grid">
                                        <div className="form-group">
                                            <label className="form-label">Icon</label>
                                            <select className="form-select" value={feature.icon}
                                                onChange={(e) => handleFeatureChange(index, 'icon', e.target.value)}>
                                                <option value="Code">Code</option>
                                                <option value="BookOpen">Book</option>
                                                <option value="Zap">Lightning</option>
                                                <option value="Star">Star</option>
                                                <option value="Heart">Heart</option>
                                                <option value="Rocket">Rocket</option>
                                                <option value="Shield">Shield</option>
                                                <option value="Globe">Globe</option>
                                            </select>
                                        </div>
                                        <div className="form-group">
                                            <label className="form-label">Title</label>
                                            <input type="text" className="form-input" value={feature.title}
                                                onChange={(e) => handleFeatureChange(index, 'title', e.target.value)} />
                                        </div>
                                        <div className="form-group full-width">
                                            <label className="form-label">Description</label>
                                            <textarea className="form-textarea" rows={2} value={feature.description}
                                                onChange={(e) => handleFeatureChange(index, 'description', e.target.value)} />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* CTA Section */}
                    {activeTab === 'cta' && (
                        <div className="settings-section">
                            <h2>Call to Action Section</h2>
                            <p className="section-description">Customize the CTA section at the bottom of homepage</p>

                            <div className="form-grid">
                                <div className="form-group full-width">
                                    <label className="form-label">Title</label>
                                    <input type="text" className="form-input" value={settings.cta.title}
                                        onChange={(e) => handleChange('cta', 'title', e.target.value)} />
                                </div>
                                <div className="form-group full-width">
                                    <label className="form-label">Description</label>
                                    <textarea className="form-textarea" rows={2} value={settings.cta.description}
                                        onChange={(e) => handleChange('cta', 'description', e.target.value)} />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Button Text</label>
                                    <input type="text" className="form-input" value={settings.cta.buttonText}
                                        onChange={(e) => handleChange('cta', 'buttonText', e.target.value)} />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Portfolio Section */}
                    {activeTab === 'portfolio' && (
                        <div className="settings-section">
                            <h2>Portfolio</h2>
                            <p className="section-description">Manage your portfolio projects</p>

                            <div className="form-grid">
                                <div className="form-group">
                                    <label className="form-label">Page Title</label>
                                    <input type="text" className="form-input" value={settings.portfolio.title}
                                        onChange={(e) => handlePortfolioChange('title', e.target.value)} />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Subtitle</label>
                                    <input type="text" className="form-input" value={settings.portfolio.subtitle}
                                        onChange={(e) => handlePortfolioChange('subtitle', e.target.value)} />
                                </div>
                            </div>

                            <div className="projects-header">
                                <h3 className="subsection-title">Projects</h3>
                                <button className="btn btn-secondary btn-sm" onClick={addProject}>
                                    <Plus size={16} /> Add Project
                                </button>
                            </div>

                            {settings.portfolio.projects.map((project, index) => (
                                <div key={project.id} className="feature-editor project-editor">
                                    <div className="project-editor-header">
                                        <h4>{project.title || `Project ${index + 1}`}</h4>
                                        <div className="project-editor-actions">
                                            <label className="form-checkbox inline">
                                                <input type="checkbox" checked={project.featured}
                                                    onChange={(e) => handleProjectChange(index, 'featured', e.target.checked)} />
                                                <span>Featured</span>
                                            </label>
                                            <button className="btn-icon danger" onClick={() => removeProject(index)} title="Delete">
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>
                                    <div className="form-grid">
                                        <div className="form-group">
                                            <label className="form-label">Title</label>
                                            <input type="text" className="form-input" value={project.title}
                                                onChange={(e) => handleProjectChange(index, 'title', e.target.value)} />
                                        </div>
                                        <div className="form-group">
                                            <label className="form-label">Image URL</label>
                                            <input type="url" className="form-input" value={project.image}
                                                onChange={(e) => handleProjectChange(index, 'image', e.target.value)} />
                                        </div>
                                        <div className="form-group full-width">
                                            <label className="form-label">Description</label>
                                            <textarea className="form-textarea" rows={2} value={project.description}
                                                onChange={(e) => handleProjectChange(index, 'description', e.target.value)} />
                                        </div>
                                        <div className="form-group">
                                            <label className="form-label">Tags (comma separated)</label>
                                            <input type="text" className="form-input" value={project.tags.join(', ')}
                                                onChange={(e) => handleProjectChange(index, 'tags', e.target.value)} />
                                        </div>
                                        <div className="form-group">
                                            <label className="form-label">Live URL</label>
                                            <input type="url" className="form-input" value={project.liveUrl}
                                                onChange={(e) => handleProjectChange(index, 'liveUrl', e.target.value)} />
                                        </div>
                                        <div className="form-group">
                                            <label className="form-label">GitHub URL</label>
                                            <input type="url" className="form-input" value={project.githubUrl}
                                                onChange={(e) => handleProjectChange(index, 'githubUrl', e.target.value)} />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Profile Section */}
                    {activeTab === 'profile' && (
                        <div className="settings-section">
                            <h2>Profile / About Page</h2>
                            <p className="section-description">Customize your profile information on the About page</p>

                            <div className="form-grid">
                                <div className="form-group">
                                    <label className="form-label">Name</label>
                                    <input type="text" className="form-input" value={settings.profile.name}
                                        onChange={(e) => handleChange('profile', 'name', e.target.value)} />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Role/Title</label>
                                    <input type="text" className="form-input" value={settings.profile.role}
                                        onChange={(e) => handleChange('profile', 'role', e.target.value)} />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Location</label>
                                    <input type="text" className="form-input" value={settings.profile.location}
                                        onChange={(e) => handleChange('profile', 'location', e.target.value)} />
                                </div>
                                <div className="form-group full-width">
                                    <label className="form-label">Bio</label>
                                    <textarea className="form-textarea" rows={4} value={settings.profile.bio}
                                        onChange={(e) => handleChange('profile', 'bio', e.target.value)} />
                                </div>
                            </div>

                            <h3 className="subsection-title">Skills</h3>
                            {settings.profile.skills.map((skill, index) => (
                                <div key={index} className="skill-editor">
                                    <div className="form-grid">
                                        <div className="form-group">
                                            <label className="form-label">Category</label>
                                            <input type="text" className="form-input" value={skill.category}
                                                onChange={(e) => handleSkillChange(index, 'category', e.target.value)} />
                                        </div>
                                        <div className="form-group">
                                            <label className="form-label">Items (comma separated)</label>
                                            <input type="text" className="form-input" value={skill.items.join(', ')}
                                                onChange={(e) => handleSkillChange(index, 'items', e.target.value)} />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Social Links */}
                    {activeTab === 'social' && (
                        <div className="settings-section">
                            <h2>Social Links</h2>
                            <p className="section-description">Manage your social media links and icons</p>

                            <div className="social-links-editor">
                                <div className="projects-header">
                                    <h3 className="subsection-title">Links</h3>
                                    <button
                                        className="btn btn-secondary btn-sm"
                                        onClick={() => {
                                            const newLink = {
                                                id: Date.now().toString(),
                                                platform: 'New Link',
                                                url: 'https://',
                                                icon: 'Link'
                                            };
                                            const newSocial = [...settings.social, newLink];
                                            setSettings(prev => ({ ...prev, social: newSocial }));
                                        }}
                                    >
                                        <Plus size={16} /> Add Link
                                    </button>
                                </div>

                                {Array.isArray(settings.social) && settings.social.map((link, index) => (
                                    <div key={link.id} className="feature-editor">
                                        <div className="project-editor-header">
                                            <h4>{link.platform}</h4>
                                            <button
                                                className="btn-icon danger"
                                                onClick={() => {
                                                    const newSocial = settings.social.filter((_, i) => i !== index);
                                                    setSettings(prev => ({ ...prev, social: newSocial }));
                                                }}
                                                title="Remove"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                        <div className="form-grid">
                                            <div className="form-group">
                                                <label className="form-label">Platform Name</label>
                                                <input
                                                    type="text"
                                                    className="form-input"
                                                    value={link.platform}
                                                    onChange={(e) => {
                                                        const newSocial = [...settings.social];
                                                        newSocial[index] = { ...newSocial[index], platform: e.target.value };
                                                        setSettings(prev => ({ ...prev, social: newSocial }));
                                                    }}
                                                />
                                            </div>
                                            <div className="form-group">
                                                <label className="form-label">Icon</label>
                                                <select
                                                    className="form-select"
                                                    value={link.icon}
                                                    onChange={(e) => {
                                                        const newSocial = [...settings.social];
                                                        newSocial[index] = { ...newSocial[index], icon: e.target.value };
                                                        setSettings(prev => ({ ...prev, social: newSocial }));
                                                    }}
                                                >
                                                    <option value="Github">Github</option>
                                                    <option value="Twitter">Twitter</option>
                                                    <option value="Linkedin">Linkedin</option>
                                                    <option value="Youtube">Youtube</option>
                                                    <option value="Instagram">Instagram</option>
                                                    <option value="Facebook">Facebook</option>
                                                    <option value="Mail">Mail</option>
                                                    <option value="Globe">Web</option>
                                                    <option value="Link">Link</option>
                                                </select>
                                            </div>
                                            <div className="form-group full-width">
                                                <label className="form-label">URL</label>
                                                <input
                                                    type="url"
                                                    className="form-input"
                                                    value={link.url}
                                                    onChange={(e) => {
                                                        const newSocial = [...settings.social];
                                                        newSocial[index] = { ...newSocial[index], url: e.target.value };
                                                        setSettings(prev => ({ ...prev, social: newSocial }));
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Site Info */}
                    {activeTab === 'site' && (
                        <div className="settings-section">
                            <h2>Site Information</h2>
                            <p className="section-description">General site settings</p>

                            <div className="form-grid">
                                <div className="form-group">
                                    <label className="form-label">Logo Text</label>
                                    <input type="text" className="form-input" value={settings.site.logoText}
                                        onChange={(e) => handleChange('site', 'logoText', e.target.value)} />
                                </div>
                                <div className="form-group full-width">
                                    <label className="form-label">Footer Description</label>
                                    <textarea className="form-textarea" rows={2} value={settings.site.footerDescription}
                                        onChange={(e) => handleChange('site', 'footerDescription', e.target.value)} />
                                </div>
                                <div className="form-group full-width">
                                    <label className="form-label">About Blog Title</label>
                                    <input type="text" className="form-input" value={settings.site.aboutBlogTitle}
                                        onChange={(e) => handleChange('site', 'aboutBlogTitle', e.target.value)} />
                                </div>
                                <div className="form-group full-width">
                                    <label className="form-label">About Blog Description</label>
                                    <textarea className="form-textarea" rows={5} value={settings.site.aboutBlogDescription}
                                        onChange={(e) => handleChange('site', 'aboutBlogDescription', e.target.value)} />
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Reset Modal */}
            {showResetModal && (
                <div className="modal-overlay" onClick={() => setShowResetModal(false)}>
                    <div className="modal" onClick={e => e.stopPropagation()}>
                        <h3>Reset Settings</h3>
                        <p>Are you sure you want to reset all settings to defaults? This cannot be undone.</p>
                        <div className="modal-actions">
                            <button className="btn btn-secondary" onClick={() => setShowResetModal(false)}>Cancel</button>
                            <button className="btn btn-danger" onClick={handleReset}>Reset All</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SettingsPage;
