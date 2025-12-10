'use client';

import BlogCard from '@/components/ui/BlogCard';
import { useCategories, usePosts } from '@/hooks/useData';
import '@/pages/public/BlogListPage.css';
import { Filter, Search, X } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useMemo, useState } from 'react';

export default function BlogListPage() {
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
        return <div className="loading-container">Loading...</div>;
    }

    return (
        <div className="blog-list-page">
            <div className="container">
                {/* Header */}
                <header className="page-header">
                    <h1 className="page-title">Blog</h1>
                    <p className="page-description">
                        Explore documentation, tutorials, and code snippets
                    </p>
                </header>

                {/* Filters */}
                <div className="filters">
                    <div className="search-box">
                        <Search size={20} className="search-icon" />
                        <input
                            type="text"
                            placeholder="Search posts..."
                            value={searchQuery}
                            onChange={handleSearch}
                            className="form-input search-input"
                        />
                    </div>

                    <div className="filter-group">
                        <Filter size={18} />
                        <select
                            value={selectedCategory}
                            onChange={(e) => handleCategoryChange(e.target.value)}
                            className="form-select category-select"
                        >
                            <option value="">All Categories</option>
                            {categories.map(category => (
                                <option key={category} value={category}>{category}</option>
                            ))}
                        </select>
                    </div>

                    {hasFilters && (
                        <button
                            className="btn btn-ghost btn-sm clear-btn"
                            onClick={clearFilters}
                        >
                            <X size={16} />
                            Clear
                        </button>
                    )}
                </div>

                {/* Results Info */}
                <div className="results-info">
                    <span>
                        {filteredPosts.length} {filteredPosts.length === 1 ? 'post' : 'posts'} found
                        {selectedCategory && ` in ${selectedCategory}`}
                    </span>
                </div>

                {/* Posts Grid */}
                {filteredPosts.length > 0 ? (
                    <div className="posts-grid">
                        {filteredPosts.map(post => (
                            <BlogCard key={post.id} post={post} />
                        ))}
                    </div>
                ) : (
                    <div className="empty-state">
                        <div className="empty-icon">{'</>'}</div>
                        <h3>No posts found</h3>
                        <p>Try adjusting your search or filter criteria</p>
                        <button
                            className="btn btn-secondary"
                            onClick={clearFilters}
                        >
                            Clear filters
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
