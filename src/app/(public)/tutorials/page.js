'use client';

import { useTutorials } from '@/hooks/useData';
import '@/pages/public/TutorialsPage.css';
import { getTutorialCategories, getUnlockedTutorials } from '@/services/tutorialService';
import { BookOpen, ChevronRight, Clock, Layers, Lock, Search, X } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function TutorialsPage() {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [categories, setCategories] = useState([]);
    const [unlockedTutorialIds, setUnlockedTutorialIds] = useState([]);
    const [mounted, setMounted] = useState(false);

    const { tutorials, loading } = useTutorials(true);

    // Mark as mounted after hydration
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

    // Load unlocked tutorial IDs (only after mount to avoid hydration mismatch)
    useEffect(() => {
        if (!mounted) return;
        const loadUnlockedStatus = async () => {
            const unlocked = await getUnlockedTutorials();
            setUnlockedTutorialIds(unlocked);
        };
        loadUnlockedStatus();
    }, [mounted]);

    if (loading || !mounted) {
        return <div className="loading-container">Loading...</div>;
    }

    // Filter tutorials
    const filteredTutorials = (tutorials || []).filter(tutorial => {
        const matchesSearch = !searchQuery ||
            tutorial.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            tutorial.description?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = !selectedCategory || tutorial.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    const getDifficultyColor = (difficulty) => {
        switch (difficulty) {
            case 'beginner': return 'badge-success';
            case 'intermediate': return 'badge-warning';
            case 'advanced': return 'badge-error';
            default: return 'badge-secondary';
        }
    };

    const getDifficultyLabel = (difficulty) => {
        switch (difficulty) {
            case 'beginner': return 'Pemula';
            case 'intermediate': return 'Menengah';
            case 'advanced': return 'Lanjutan';
            default: return difficulty;
        }
    };

    const clearFilters = () => {
        setSearchQuery('');
        setSelectedCategory('');
    };

    // Helper function to check if tutorial is unlocked (synchronous)
    const isUnlocked = (tutorialId) => unlockedTutorialIds.includes(tutorialId);

    const hasFilters = searchQuery || selectedCategory;

    return (
        <div className="tutorials-page">
            {/* Simple Hero with Search */}
            <section className="tutorials-hero">
                <div className="container">
                    <h1>Mini Tutorial</h1>
                    <p>Panduan step-by-step untuk belajar teknologi</p>

                    {/* Integrated Search */}
                    <div className="hero-search">
                        <Search size={20} />
                        <input
                            type="text"
                            placeholder="Cari tutorial..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        {searchQuery && (
                            <button className="clear-search" onClick={() => setSearchQuery('')}>
                                <X size={16} />
                            </button>
                        )}
                    </div>

                    {/* Category Pills */}
                    {categories.length > 0 && (
                        <div className="category-pills">
                            <button
                                className={`pill ${!selectedCategory ? 'active' : ''}`}
                                onClick={() => setSelectedCategory('')}
                            >
                                Semua
                            </button>
                            {categories.map(cat => (
                                <button
                                    key={cat}
                                    className={`pill ${selectedCategory === cat ? 'active' : ''}`}
                                    onClick={() => setSelectedCategory(cat)}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </section>

            {/* Results */}
            <section className="tutorials-list">
                <div className="container">
                    {/* Results Header */}
                    <div className="list-header">
                        <span className="results-info">
                            {filteredTutorials.length} tutorial {hasFilters && 'ditemukan'}
                        </span>
                        {hasFilters && (
                            <button className="clear-filters" onClick={clearFilters}>
                                <X size={14} />
                                Hapus filter
                            </button>
                        )}
                    </div>

                    {filteredTutorials.length === 0 ? (
                        <div className="empty-state">
                            <BookOpen size={40} />
                            <h3>Tidak ada tutorial</h3>
                            <p>Coba kata kunci atau kategori lain</p>
                            <button className="btn btn-secondary" onClick={clearFilters}>
                                Reset Filter
                            </button>
                        </div>
                    ) : (
                        <div className="tutorials-grid">
                            {filteredTutorials.map(tutorial => {
                                const tutorialIsUnlocked = !tutorial.is_premium || isUnlocked(tutorial.id);
                                const isLocked = tutorial.is_premium && !tutorialIsUnlocked;

                                return (
                                    <Link
                                        key={tutorial.id}
                                        href={`/tutorials/${tutorial.slug}`}
                                        className={`tutorial-card ${isLocked ? 'is-locked' : ''}`}
                                        style={{ textDecoration: 'none', color: 'inherit', display: 'flex', flexDirection: 'column' }}
                                    >
                                        <div className="card-thumbnail">
                                            {tutorial.thumbnail ? (
                                                <img src={tutorial.thumbnail} alt={tutorial.title} />
                                            ) : (
                                                <div className="thumbnail-placeholder">
                                                    <BookOpen size={28} />
                                                </div>
                                            )}
                                            <span className={`difficulty-badge ${getDifficultyColor(tutorial.difficulty)}`}>
                                                {getDifficultyLabel(tutorial.difficulty)}
                                            </span>
                                            {tutorial.is_premium && (
                                                <div className={`premium-badge ${tutorialIsUnlocked ? 'unlocked' : ''}`}>
                                                    <Lock size={12} />
                                                    {tutorialIsUnlocked ? 'Unlocked' : 'Premium'}
                                                </div>
                                            )}
                                        </div>
                                        <div className="card-body">
                                            <h3>{tutorial.title}</h3>
                                            {tutorial.description && (
                                                <p>{tutorial.description}</p>
                                            )}
                                            <div className="card-footer">
                                                <div className="card-meta">
                                                    <span><Clock size={14} /> {tutorial.estimated_time || '10 min'}</span>
                                                    <span><Layers size={14} /> {tutorial.steps?.length || 0} step</span>
                                                </div>
                                                {!isLocked && <ChevronRight size={18} className="card-arrow" />}
                                            </div>
                                            {isLocked && (
                                                <div className="locked-overlay">
                                                    <Lock size={24} />
                                                    <span>Unlock Required</span>
                                                </div>
                                            )}
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
}

function TutorialCardContent({ tutorial, isLocked, isUnlocked, getDifficultyColor, getDifficultyLabel }) {
    return (
        <div className="card-inner">
            <div className="card-thumbnail">
                {tutorial.thumbnail ? (
                    <img src={tutorial.thumbnail} alt={tutorial.title} />
                ) : (
                    <div className="thumbnail-placeholder">
                        <BookOpen size={28} />
                    </div>
                )}
                <span className={`difficulty-badge ${getDifficultyColor(tutorial.difficulty)}`}>
                    {getDifficultyLabel(tutorial.difficulty)}
                </span>
                {tutorial.is_premium && (
                    <div className={`premium-badge ${isUnlocked ? 'unlocked' : ''}`}>
                        <Lock size={12} />
                        {isUnlocked ? 'Unlocked' : 'Premium'}
                    </div>
                )}
            </div>
            <div className="card-body">
                <h3>{tutorial.title}</h3>
                {tutorial.description && (
                    <p>{tutorial.description}</p>
                )}
                <div className="card-footer">
                    <div className="card-meta">
                        <span><Clock size={14} /> {tutorial.estimated_time || '10 min'}</span>
                        <span><Layers size={14} /> {tutorial.steps?.length || 0} step</span>
                    </div>
                    {!isLocked && <ChevronRight size={18} className="card-arrow" />}
                </div>
                {isLocked && (
                    <div className="locked-overlay">
                        <Lock size={24} />
                        <span>Unlock Required</span>
                    </div>
                )}
            </div>
        </div>
    );
}


