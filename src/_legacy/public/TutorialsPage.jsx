import { BookOpen, ChevronRight, Clock, Layers, Lock, Search, X } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Skeleton } from '../../components/ui/Skeleton';
import { useTutorials } from '../../hooks/useData';
import { getTutorialCategories, isTutorialUnlocked } from '../../services/tutorialService';
import './TutorialsPage.css';

// Helper functions - defined outside component
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

// Tutorial Card Skeleton
const TutorialCardSkeleton = () => (
    <div className="tutorial-card">
        <div className="card-thumbnail">
            <Skeleton width="100%" height="140px" />
        </div>
        <div className="card-body">
            <Skeleton width="80%" height="1.25rem" className="mb-sm" />
            <Skeleton width="100%" height="0.875rem" className="mb-sm" />
            <Skeleton width="70%" height="0.875rem" />
            <div className="card-footer" style={{ marginTop: 'var(--space-md)' }}>
                <div style={{ display: 'flex', gap: 'var(--space-md)' }}>
                    <Skeleton width="60px" height="1rem" />
                    <Skeleton width="50px" height="1rem" />
                </div>
            </div>
        </div>
    </div>
);

// Tutorials Page Skeleton
const TutorialsPageSkeleton = () => (
    <div className="tutorials-page">
        <section className="tutorials-hero">
            <div className="container">
                <Skeleton width="200px" height="2.5rem" className="mb-md" style={{ margin: '0 auto' }} />
                <Skeleton width="300px" height="1rem" className="mb-lg" style={{ margin: '0 auto' }} />
                <Skeleton width="100%" height="48px" borderRadius="var(--radius-md)" className="mb-md" style={{ maxWidth: '500px', margin: '0 auto' }} />
            </div>
        </section>
        <section className="tutorials-list">
            <div className="container">
                <div className="tutorials-grid">
                    {[1, 2, 3, 4, 5, 6].map(i => (
                        <TutorialCardSkeleton key={i} />
                    ))}
                </div>
            </div>
        </section>
    </div>
);

const TutorialsPage = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [categories, setCategories] = useState([]);

    const { tutorials, loading } = useTutorials(true);

    useEffect(() => {
        const loadCategories = async () => {
            const cats = await getTutorialCategories();
            setCategories(cats);
        };
        loadCategories();
    }, []);

    // Memoize filtered tutorials
    const filteredTutorials = useMemo(() => {
        return (tutorials || []).filter(tutorial => {
            const matchesSearch = !searchQuery ||
                tutorial.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                tutorial.description?.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesCategory = !selectedCategory || tutorial.category === selectedCategory;
            return matchesSearch && matchesCategory;
        });
    }, [tutorials, searchQuery, selectedCategory]);

    // Memoize handlers
    const handleSearchChange = useCallback((e) => setSearchQuery(e.target.value), []);
    const clearSearch = useCallback(() => setSearchQuery(''), []);
    const handleCategoryChange = useCallback((cat) => setSelectedCategory(cat), []);
    const clearFilters = useCallback(() => {
        setSearchQuery('');
        setSelectedCategory('');
    }, []);

    const hasFilters = searchQuery || selectedCategory;

    if (loading) {
        return <TutorialsPageSkeleton />;
    }

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
                            onChange={handleSearchChange}
                        />
                        {searchQuery && (
                            <button className="clear-search" onClick={clearSearch}>
                                <X size={16} />
                            </button>
                        )}
                    </div>

                    {/* Category Pills */}
                    {categories.length > 0 && (
                        <div className="category-pills">
                            <button
                                className={`pill ${!selectedCategory ? 'active' : ''}`}
                                onClick={() => handleCategoryChange('')}
                            >
                                Semua
                            </button>
                            {categories.map(cat => (
                                <button
                                    key={cat}
                                    className={`pill ${selectedCategory === cat ? 'active' : ''}`}
                                    onClick={() => handleCategoryChange(cat)}
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
                                const isLocked = tutorial.is_premium && !isTutorialUnlocked(tutorial.id);
                                const CardWrapper = isLocked ? 'div' : Link;
                                const cardProps = isLocked ? {} : { to: `/tutorials/${tutorial.slug}` };

                                return (
                                    <CardWrapper
                                        key={tutorial.id}
                                        {...cardProps}
                                        className={`tutorial-card ${isLocked ? 'is-locked' : ''}`}
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
                                                <div className={`premium-badge ${isTutorialUnlocked(tutorial.id) ? 'unlocked' : ''}`}>
                                                    <Lock size={12} />
                                                    {isTutorialUnlocked(tutorial.id) ? 'Unlocked' : 'Premium'}
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
                                    </CardWrapper>
                                );
                            })}
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
};

export default TutorialsPage;
