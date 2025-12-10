'use client';

import BlogCard from '@/components/ui/BlogCard';
import MarkdownRenderer from '@/components/ui/MarkdownRenderer';
import TableOfContents from '@/components/ui/TableOfContents';
import { usePost } from '@/hooks/useData';
import '@/_legacy/public/BlogDetailPage.css';
import { getPublishedPosts } from '@/services/blogService';
import { format } from 'date-fns';
import { ArrowLeft, Calendar, Clock, Tag, User } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { use, useEffect, useState } from 'react';

export default function BlogDetailPage({ params }) {
    const { slug } = use(params);
    const router = useRouter();
    const { post, loading } = usePost(slug);
    const [relatedPosts, setRelatedPosts] = useState([]);

    useEffect(() => {
        const loadRelatedPosts = async () => {
            if (post) {
                const allPosts = await getPublishedPosts();
                const related = allPosts
                    .filter(p => p.id !== post.id && p.category === post.category)
                    .slice(0, 2);
                setRelatedPosts(related);
            }
        };
        loadRelatedPosts();
    }, [post]);

    if (loading) {
        return <div className="loading-container">Loading...</div>;
    }

    if (!post) {
        return (
            <div className="not-found container">
                <div className="not-found-content">
                    <h1>404</h1>
                    <p>Post not found</p>
                    <Link href="/blog" className="btn btn-primary">
                        Back to Blog
                    </Link>
                </div>
            </div>
        );
    }

    const readingTime = Math.ceil((post.content || '').split(' ').length / 200);

    return (
        <div className="blog-detail-page">
            <article className="article container">
                {/* Back Button */}
                <button
                    onClick={() => router.back()}
                    className="back-btn"
                >
                    <ArrowLeft size={18} />
                    <span>Back</span>
                </button>

                {/* Article Header */}
                <header className="article-header">
                    {post.category && (
                        <Link
                            href={`/blog?category=${post.category}`}
                            className="badge badge-primary article-category"
                        >
                            {post.category}
                        </Link>
                    )}

                    <h1 className="article-title">{post.title}</h1>

                    <p className="article-excerpt">{post.excerpt}</p>

                    <div className="article-meta">
                        <span className="meta-item">
                            <User size={16} />
                            {post.author || 'Admin'}
                        </span>
                        <span className="meta-divider">•</span>
                        <span className="meta-item">
                            <Calendar size={16} />
                            {post.created_at && format(new Date(post.created_at), 'MMMM d, yyyy')}
                        </span>
                        <span className="meta-divider">•</span>
                        <span className="meta-item">
                            <Clock size={16} />
                            {readingTime} min read
                        </span>
                    </div>
                </header>

                {/* Featured Image */}
                {post.featured_image && (
                    <div className="article-image">
                        <img src={post.featured_image} alt={post.title} />
                    </div>
                )}

                {/* Article Body with TOC */}
                <div className="article-body">
                    {/* Table of Contents - Sidebar */}
                    <aside className="article-sidebar">
                        {post.content && <TableOfContents content={post.content} />}
                    </aside>

                    {/* Article Content */}
                    <div className="article-content">
                        <MarkdownRenderer content={post.content || ''} />
                    </div>
                </div>

                {/* Tags */}
                {post.tags && post.tags.length > 0 && (
                    <div className="article-tags">
                        <Tag size={16} />
                        <div className="tags-list">
                            {post.tags.map(tag => (
                                <Link
                                    key={tag}
                                    href={`/blog?search=${tag}`}
                                    className="tag"
                                >
                                    #{tag}
                                </Link>
                            ))}
                        </div>
                    </div>
                )}
            </article>

            {/* Related Posts */}
            {relatedPosts.length > 0 && (
                <section className="related-posts container">
                    <h2 className="section-title">Related Posts</h2>
                    <div className="related-grid">
                        {relatedPosts.map(relatedPost => (
                            <BlogCard key={relatedPost.id} post={relatedPost} />
                        ))}
                    </div>
                </section>
            )}
        </div>
    );
}
