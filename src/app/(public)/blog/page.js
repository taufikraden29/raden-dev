'use client';

import BlogCard from '@/components/ui/BlogCard';
import { useCategories, usePosts } from '@/hooks/useData';
import '@/_legacy/public/BlogListPage.css';
import { BookOpen, Filter, Layers, Search, Sparkles, X } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useMemo, useState } from 'react';

function BlogListContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
    const selectedCategory = searchParams.get('category') || '';

    const { posts: allPosts, loading: postsLoading } = usePosts(true);
    const { categories, loading: categoriesLoading } = useCategories();

    const filteredPosts = useMemo(() => {
        let posts = allPosts;

        if (selectedCategory) {
            posts = posts.filter(post => post.category === selectedCategory);
        }

        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            posts = posts.filter(post =>
                post.title.toLowerCase().includes(query) ||
                post.excerpt?.toLowerCase().includes(query) ||
                post.tags?.some(tag => tag.toLowerCase().includes(query))
            );
        }

        return posts;
    }, [allPosts, selectedCategory, searchQuery]);

    const updateSearchParams = (updates) => {
        const params = new URLSearchParams(searchParams.toString());
        Object.entries(updates).forEach(([key, value]) => {
            if (value) {
                params.set(key, value);
            } else {
                params.delete(key);
            }
        });
        router.push(`/blog?${params.toString()}`);
    };

    const handleSearch = (e) => {
        const value = e.target.value;
        setSearchQuery(value);
        updateSearchParams({ search: value.trim() || null });
    };

    const handleCategoryChange = (category) => {
        updateSearchParams({ category: category || null });
    };

    const clearFilters = () => {
        setSearchQuery('');
        router.push('/blog');
    };

    const hasFilters = searchQuery || selectedCategory;

    if (postsLoading || categoriesLoading) {
        return (
            <div className="loading-container">
                <div className="loading-spinner-large" />
                <p>Loading posts...</p>
            </div>
        );
    }

    return (
        <div className="blog-list-page">
            {/* Premium Hero Section */}
            <section className="blog-hero">
                <div className="blog-hero-bg">
                    <div className="hero-gradient-1" />
                    <div className="hero-gradient-2" />
                    <div className="hero-grid-pattern" />
                </div>

                <div className="container blog-hero-content">
                    <div className="hero-badge">
                        <Sparkles size={14} />
                        <span>Documentation & Insights</span>
                    </div>

                    <h1 className="blog-hero-title">
                        <span>Explore the</span>
                        <span className="gradient-text">Knowledge Base</span>
                    </h1>

                    <p className="blog-hero-description">
                        Discover tutorials, code snippets, and in-depth articles to level up your skills
                    </p>

                    {/* Search Box - Glass Style */}
                    <div className="hero-search-box">
                        <Search size={20} className="search-icon" />
                        <input
                            type="text"
                            placeholder="Search articles, tutorials, snippets..."
                            value={searchQuery}
                            onChange={handleSearch}
                            className="hero-search-input"
                        />
                        {searchQuery && (
                            <button className="search-clear" onClick={() => { setSearchQuery(''); updateSearchParams({ search: null }); }}>
                                <X size={16} />
                            </button>
                        )}
                    </div>

                    {/* Category Pills */}
                    <div className="category-pills">
                        <button
                            className={`category-pill ${!selectedCategory ? 'active' : ''}`}
                            onClick={() => handleCategoryChange('')}
                        >
                            <Layers size={14} />
                            All Posts
                        </button>
                        {categories.map(category => (
                            <button
                                key={category}
                                className={`category-pill ${selectedCategory === category ? 'active' : ''}`}
                                onClick={() => handleCategoryChange(category)}
                            >
                                {category}
                            </button>
                        ))}
                    </div>

                    {/* Stats Row */}
                    <div className="blog-stats">
                        <div className="stat-item">
                            <span className="stat-number">{allPosts.length}</span>
                            <span className="stat-text">Total Articles</span>
                        </div>
                        <div className="stat-divider" />
                        <div className="stat-item">
                            <span className="stat-number">{categories.length}</span>
                            <span className="stat-text">Categories</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* Posts Section */}
            <section className="posts-section container">
                {/* Results Header */}
                <div className="posts-header">
                    <div className="results-info">
                        <span className="results-count">{filteredPosts.length}</span>
                        <span>{filteredPosts.length === 1 ? 'article' : 'articles'} found</span>
                        {selectedCategory && <span className="filter-tag">in {selectedCategory}</span>}
                    </div>

                    {hasFilters && (
                        <button className="clear-filters-btn" onClick={clearFilters}>
                            <X size={14} />
                            Clear all filters
                        </button>
                    )}
                </div>

                {/* Posts Grid */}
                {filteredPosts.length > 0 ? (
                    <div className="posts-grid">
                        {filteredPosts.map((post, index) => (
                            <div key={post.id} className="post-item" style={{ '--delay': `${index * 0.05}s` }}>
                                <BlogCard post={post} featured={index === 0 && !hasFilters} />
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="empty-state-modern">
                        <div className="empty-icon-wrapper">
                            <BookOpen size={48} strokeWidth={1.5} />
                        </div>
                        <h3>No articles found</h3>
                        <p>Try adjusting your search or filter criteria</p>
                        <button className="btn btn-primary" onClick={clearFilters}>
                            Reset Filters
                        </button>
                    </div>
                )}
            </section>
        </div>
    );
}

export default function BlogListPage() {
    return (
        <Suspense fallback={<div className="loading-container"><div className="loading-spinner-large" /></div>}>
            <BlogListContent />
        </Suspense>
    );
}
