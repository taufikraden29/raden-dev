'use client';

// Settings Service - Supabase-based site configuration
import { handleSupabaseError, supabase } from '@/lib/supabaseClient';
import { useEffect, useState } from 'react';

// Default settings (fallback)
const defaultSettings = {
    hero: {
        badge: 'Documentation & Tutorials',
        title: 'Personal',
        titleHighlight: 'Dev',
        titleSuffix: 'Docs',
        description: 'A collection of documentation, tutorials, and code snippets. Sharing knowledge and best practices for modern web development.',
        primaryButtonText: 'Explore Blog',
        secondaryButtonText: 'About Me'
    },
    stats: {
        showStats: true,
        stat1Label: 'Articles',
        stat2Label: 'Topics',
        stat2Value: '10+',
        stat3Label: 'Learning',
        stat3Value: '∞'
    },
    features: [
        {
            icon: 'Code',
            title: 'Code Documentation',
            description: 'Well-structured code examples with syntax highlighting for multiple languages.'
        },
        {
            icon: 'BookOpen',
            title: 'In-depth Tutorials',
            description: 'Step-by-step guides to help you master new technologies and concepts.'
        },
        {
            icon: 'Zap',
            title: 'Best Practices',
            description: 'Learn industry-standard patterns and practices for clean, maintainable code.'
        }
    ],
    cta: {
        title: 'Want to manage your documentation?',
        description: 'Access the dashboard to create, edit, and manage your blog posts.',
        buttonText: 'Go to Dashboard'
    },
    profile: {
        name: 'Developer',
        role: 'Full Stack Developer',
        location: 'Indonesia',
        bio: 'A passionate developer who loves building web applications and sharing knowledge through documentation and tutorials. I believe in clean code, best practices, and continuous learning.',
        skills: [
            { category: 'Frontend', items: ['React', 'Vue.js', 'TypeScript', 'Next.js', 'CSS/SCSS'] },
            { category: 'Backend', items: ['Node.js', 'Python', 'PostgreSQL', 'MongoDB', 'REST APIs'] },
            { category: 'Tools', items: ['Git', 'Docker', 'VS Code', 'Figma', 'Linux'] }
        ]
    },
    site: {
        logoText: 'DevDocs',
        footerDescription: 'Personal blog for documentation, tutorials, and code snippets. Sharing knowledge one post at a time.',
        aboutBlogTitle: 'About This Blog',
        aboutBlogDescription: 'This blog serves as my personal documentation hub where I share tutorials, code snippets, and insights about web development. Every post is crafted with code examples and explanations to help fellow developers learn and grow.\n\nTopics covered include frontend development with React, backend with Node.js, database design, DevOps practices, and much more. Feel free to explore and reach out if you have any questions!'
    },
    portfolio: {
        title: 'My Portfolio',
        subtitle: 'A showcase of my recent projects and work',
        projects: []
    }
};

// Cache for settings
let settingsCache = null;

// Get setting by section
const getSettingBySection = async (section) => {
    try {
        const { data, error } = await supabase
            .from('settings')
            .select('data')
            .eq('section', section)
            .single();

        if (error && error.code !== 'PGRST116') {
            handleSupabaseError(error);
        }

        return data?.data || defaultSettings[section] || {};
    } catch (error) {
        console.error(`Error fetching ${section} settings:`, error);
        return defaultSettings[section] || {};
    }
};

// Get all settings
export const getSettings = async () => {
    try {
        const { data, error } = await supabase
            .from('settings')
            .select('section, data');

        handleSupabaseError(error);

        const settings = { ...defaultSettings };

        (data || []).forEach(item => {
            settings[item.section] = item.data;
        });

        // Get social links separately
        settings.social = await getSocialSettings();

        settingsCache = settings;
        return settings;
    } catch (error) {
        console.error('Error fetching settings:', error);
        return defaultSettings;
    }
};

// Get specific sections
export const getHeroSettings = async () => await getSettingBySection('hero');
export const getStatsSettings = async () => await getSettingBySection('stats');
export const getFeaturesSettings = async () => await getSettingBySection('features');
export const getCtaSettings = async () => await getSettingBySection('cta');
export const getProfileSettings = async () => await getSettingBySection('profile');
export const getSiteSettings = async () => await getSettingBySection('site');
export const getPortfolioSettings = async () => await getSettingBySection('portfolio');

// Get social links
export const getSocialSettings = async () => {
    try {
        const { data, error } = await supabase
            .from('social_links')
            .select('*')
            .order('display_order', { ascending: true });

        handleSupabaseError(error);

        return (data || []).map(link => ({
            id: link.id,
            platform: link.platform,
            url: link.url,
            icon: link.icon
        }));
    } catch (error) {
        console.error('Error fetching social links:', error);
        return [];
    }
};

// Update settings
export const updateSettings = async (newSettings) => {
    try {
        const updates = [];

        for (const [section, data] of Object.entries(newSettings)) {
            if (section === 'social') continue; // Handle separately

            updates.push(
                supabase
                    .from('settings')
                    .upsert({
                        section,
                        data
                    }, {
                        onConflict: 'section'
                    })
            );
        }

        await Promise.all(updates);

        // Clear cache
        settingsCache = null;

        // Dispatch custom event for real-time updates
        window.dispatchEvent(new Event('settings-updated'));

        return await getSettings();
    } catch (error) {
        console.error('Error updating settings:', error);
        throw error;
    }
};

// Update specific sections
export const updateHeroSettings = async (hero) => {
    return await updateSettings({ hero });
};

export const updateStatsSettings = async (stats) => {
    return await updateSettings({ stats });
};

export const updateFeaturesSettings = async (features) => {
    return await updateSettings({ features });
};

export const updateCtaSettings = async (cta) => {
    return await updateSettings({ cta });
};

export const updateProfileSettings = async (profile) => {
    return await updateSettings({ profile });
};

export const updateSiteSettings = async (site) => {
    return await updateSettings({ site });
};

export const updatePortfolioSettings = async (portfolio) => {
    return await updateSettings({ portfolio });
};

// Social links management
export const updateSocialSettings = async (socialLinks) => {
    try {
        // Delete all existing links
        await supabase
            .from('social_links')
            .delete()
            .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all

        // Insert new links
        if (socialLinks && socialLinks.length > 0) {
            const linksData = socialLinks.map((link, index) => ({
                platform: link.platform,
                url: link.url,
                icon: link.icon,
                display_order: index + 1
            }));

            const { error } = await supabase
                .from('social_links')
                .insert(linksData);

            handleSupabaseError(error);
        }

        // Clear cache
        settingsCache = null;

        window.dispatchEvent(new Event('settings-updated'));

        return await getSocialSettings();
    } catch (error) {
        console.error('Error updating social links:', error);
        throw error;
    }
};

// Add single social link
export const addSocialLink = async (link) => {
    try {
        // Get current max order
        const { data: existing } = await supabase
            .from('social_links')
            .select('display_order')
            .order('display_order', { ascending: false })
            .limit(1);

        const nextOrder = existing && existing.length > 0 ? existing[0].display_order + 1 : 1;

        const { data, error } = await supabase
            .from('social_links')
            .insert([{
                platform: link.platform,
                url: link.url,
                icon: link.icon,
                display_order: nextOrder
            }])
            .select()
            .single();

        handleSupabaseError(error);

        window.dispatchEvent(new Event('settings-updated'));

        return data;
    } catch (error) {
        console.error('Error adding social link:', error);
        throw error;
    }
};

// Update single social link
export const updateSocialLink = async (id, link) => {
    try {
        const { data, error } = await supabase
            .from('social_links')
            .update({
                platform: link.platform,
                url: link.url,
                icon: link.icon
            })
            .eq('id', id)
            .select()
            .single();

        handleSupabaseError(error);

        window.dispatchEvent(new Event('settings-updated'));

        return data;
    } catch (error) {
        console.error('Error updating social link:', error);
        throw error;
    }
};

// Delete social link
export const deleteSocialLink = async (id) => {
    try {
        const { error } = await supabase
            .from('social_links')
            .delete()
            .eq('id', id);

        handleSupabaseError(error);

        window.dispatchEvent(new Event('settings-updated'));

        return true;
    } catch (error) {
        console.error('Error deleting social link:', error);
        throw error;
    }
};

// Reset to defaults
export const resetSettings = async () => {
    try {
        // Clear all settings
        await supabase
            .from('settings')
            .delete()
            .neq('section', '');

        // Insert defaults
        const settingsData = Object.entries(defaultSettings)
            .filter(([key]) => key !== 'social')
            .map(([section, data]) => ({
                section,
                data
            }));

        await supabase
            .from('settings')
            .insert(settingsData);

        // Clear cache
        settingsCache = null;

        window.dispatchEvent(new Event('settings-updated'));

        return defaultSettings;
    } catch (error) {
        console.error('Error resetting settings:', error);
        throw error;
    }
};

// Get default settings
export const getDefaultSettings = () => defaultSettings;

// Hook for React components to subscribe to settings changes
export const useSettings = () => {
    const [settings, setSettings] = useState(settingsCache || defaultSettings);
    const [loading, setLoading] = useState(!settingsCache);

    useEffect(() => {
        // Load settings if not cached
        if (!settingsCache) {
            getSettings().then(data => {
                setSettings(data);
                setLoading(false);
            });
        }

        const handleSettingsUpdate = () => {
            getSettings().then(setSettings);
        };

        window.addEventListener('settings-updated', handleSettingsUpdate);
        window.addEventListener('storage', handleSettingsUpdate);

        return () => {
            window.removeEventListener('settings-updated', handleSettingsUpdate);
            window.removeEventListener('storage', handleSettingsUpdate);
        };
    }, []);

    return { settings, loading };
};
