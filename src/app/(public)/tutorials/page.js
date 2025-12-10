'use client';

import { useTutorials } from '@/hooks/useData';
import '@/_legacy/public/TutorialsPage.css';
import { getTutorialCategories, getUnlockedTutorials } from '@/services/tutorialService';
import { BookOpen, ChevronRight, Clock, GraduationCap, Layers, Lock, Search, Sparkles, X } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function TutorialsPage() {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [categories, setCategories] = useState([]);
    const [unlockedTutorialIds, setUnlockedTutorialIds] = useState([]);
    const [mounted, setMounted] = useState(false);

    const { tutorials, loading } = useTutorials(true);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        const loadCategories = async () => {
            const cats = await getTutorialCategories();
            setCategories(cats);
        };
        loadCategories();
    }, []);

    useEffect(() => {
        if (!mounted) return;
        const loadUnlockedStatus = async () => {
            const unlocked = await getUnlockedTutorials();
            setUnlockedTutorialIds(unlocked);
        };
        loadUnlockedStatus();
    }, [mounted]);

    if (loading || !mounted) {
        return (
            <div className="loading-container">
                <div className="loading-spinner-large" />
                <p>Loading tutorials...</p>
            </div>
        );
    }

    const filteredTutorials = (tutorials || []).filter(tutorial => {
        const matchesSearch = !searchQuery ||
            tutorial.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            tutorial.description?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = !selectedCategory || tutorial.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    const getDifficultyStyle = (difficulty) => {
        switch (difficulty) {
            case 'beginner': return { bg: 'rgba(34, 197, 94, 0.15)', color: '#22c55e', border: 'rgba(34, 197, 94, 0.3)' };
            case 'intermediate': return { bg: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b', border: 'rgba(245, 158, 11, 0.3)' };
            case 'advanced': return { bg: 'rgba(239, 68, 68, 0.15)', color: '#ef4444', border: 'rgba(239, 68, 68, 0.3)' };
            default: return { bg: 'rgba(100, 116, 139, 0.15)', color: '#64748b', border: 'rgba(100, 116, 139, 0.3)' };
        }
    };

    const getDifficultyLabel = (difficulty) => {
        switch (difficulty) {
            case 'beginner': return 'Beginner';
            case 'intermediate': return 'Intermediate';
            case 'advanced': return 'Advanced';
            default: return difficulty;
        }
    };

    const clearFilters = () => {
        setSearchQuery('');
        setSelectedCategory('');
    };

    const isUnlocked = (tutorialId) => unlockedTutorialIds.includes(tutorialId);
    const hasFilters = searchQuery || selectedCategory;

    return (
        <div className="tutorials-page">
            {/* Hero Section */}
            <section className="tutorials-hero">
                <div className="tutorials-hero-bg">
                    <div className="hero-orb orb-1" />
                    <div className="hero-orb orb-2" />
                    <div className="hero-grid-pattern" />
                </div>

                <div className="container tutorials-hero-content">
                    <div className="hero-badge">
                        <Sparkles size={14} />
                        <span>Step-by-Step Guides</span>
                    </div>

                    <h1 className="tutorials-hero-title">
                        <span>Learn & Build with</span>
                        <span className="gradient-text">Mini Tutorials</span>
                    </h1>

                    <p className="tutorials-hero-description">
                        Comprehensive guides to help you master new technologies and build amazing projects
                    </p>

                    {/* Search Box */}
                    <div className="hero-search-box">
                        <Search size={20} className="search-icon" />
                        <input
                            type="text"
                            placeholder="Search tutorials..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="hero-search-input"
                        />
                        {searchQuery && (
                            <button className="search-clear" onClick={() => setSearchQuery('')}>
                                <X size={16} />
                            </button>
                        )}
                    </div>

                    {/* Category Pills */}
                    {categories.length > 0 && (
                        <div className="category-pills">
                            <button
                                className={`category-pill ${!selectedCategory ? 'active' : ''}`}
                                onClick={() => setSelectedCategory('')}
                            >
                                <Layers size={14} />
                                All Tutorials
                            </button>
                            {categories.map(cat => (
                                <button
                                    key={cat}
                                    className={`category-pill ${selectedCategory === cat ? 'active' : ''}`}
                                    onClick={() => setSelectedCategory(cat)}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Stats */}
                    <div className="tutorials-stats">
                        <div className="stat-item">
                            <span className="stat-number">{tutorials.length}</span>
                            <span className="stat-text">Tutorials</span>
                        </div>
                        <div className="stat-divider" />
                        <div className="stat-item">
                            <span className="stat-number">{categories.length}</span>
                            <span className="stat-text">Categories</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* Tutorials Grid Section */}
            <section className="tutorials-content container">
                {/* Header */}
                <div className="content-header">
                    <div className="results-info">
                        <span className="results-count">{filteredTutorials.length}</span>
                        <span>{filteredTutorials.length === 1 ? 'tutorial' : 'tutorials'} found</span>
                        {selectedCategory && <span className="filter-tag">in {selectedCategory}</span>}
                    </div>

                    {hasFilters && (
                        <button className="clear-filters-btn" onClick={clearFilters}>
                            <X size={14} />
                            Clear filters
                        </button>
                    )}
                </div>

                {filteredTutorials.length === 0 ? (
                    <div className="empty-state-modern">
                        <div className="empty-icon-wrapper">
                            <BookOpen size={48} strokeWidth={1.5} />
                        </div>
                        <h3>No tutorials found</h3>
                        <p>Try a different search term or category</p>
                        <button className="btn btn-primary" onClick={clearFilters}>
                            Reset Filters
                        </button>
                    </div>
                ) : (
                    <div className="tutorials-grid">
                        {filteredTutorials.map((tutorial, index) => {
                            const tutorialIsUnlocked = !tutorial.is_premium || isUnlocked(tutorial.id);
                            const isLocked = tutorial.is_premium && !tutorialIsUnlocked;
                            const diffStyle = getDifficultyStyle(tutorial.difficulty);

                            return (
                                <Link
                                    key={tutorial.id}
                                    href={`/tutorials/${tutorial.slug}`}
                                    className={`tutorial-card-modern ${isLocked ? 'is-locked' : ''}`}
                                    style={{ '--delay': `${index * 0.05}s` }}
                                >
                                    <div className="tutorial-thumbnail">
                                        {tutorial.thumbnail ? (
                                            <Image
                                                src={tutorial.thumbnail}
                                                alt={tutorial.title}
                                                width={400}
                                                height={200}
                                                style={{ objectFit: 'cover', width: '100%', height: '100%' }}
                                            />
                                        ) : (
                                            <div className="thumbnail-placeholder">
                                                <GraduationCap size={36} strokeWidth={1.5} />
                                            </div>
                                        )}

                                        {/* Badges */}
                                        <div className="tutorial-badges">
                                            <span
                                                className="difficulty-badge"
                                                style={{
                                                    background: diffStyle.bg,
                                                    color: diffStyle.color,
                                                    borderColor: diffStyle.border
                                                }}
                                            >
                                                {getDifficultyLabel(tutorial.difficulty)}
                                            </span>
                                            {tutorial.is_premium && (
                                                <span className={`premium-badge ${tutorialIsUnlocked ? 'unlocked' : ''}`}>
                                                    <Lock size={10} />
                                                    {tutorialIsUnlocked ? 'Unlocked' : 'Premium'}
                                                </span>
                                            )}
                                        </div>

                                        {/* Locked Overlay */}
                                        {isLocked && (
                                            <div className="locked-overlay">
                                                <Lock size={28} />
                                                <span>Unlock Required</span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="tutorial-body">
                                        {tutorial.category && (
                                            <span className="tutorial-category">{tutorial.category}</span>
                                        )}

                                        <h3 className="tutorial-title">{tutorial.title}</h3>

                                        {tutorial.description && (
                                            <p className="tutorial-desc">{tutorial.description}</p>
                                        )}

                                        <div className="tutorial-footer">
                                            <div className="tutorial-meta">
                                                <span className="meta-item">
                                                    <Clock size={14} />
                                                    {tutorial.estimated_time || '10 min'}
                                                </span>
                                                <span className="meta-item">
                                                    <Layers size={14} />
                                                    {tutorial.steps?.length || 0} steps
                                                </span>
                                            </div>

                                            {!isLocked && (
                                                <span className="start-btn">
                                                    Start <ChevronRight size={16} />
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                )}
            </section>
        </div>
    );
}
