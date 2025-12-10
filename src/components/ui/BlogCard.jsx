'use client';

import '@/components/ui/BlogCard.css';
import { format } from 'date-fns';
import { Calendar, Tag } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { memo, useMemo } from 'react';

const BlogCard = memo(function BlogCard({ post, featured = false }) {
    const formattedDate = useMemo(() => {
        return post.created_at
            ? format(new Date(post.created_at), 'MMM d, yyyy')
            : '';
    }, [post.created_at]);

    return (
        <article className={`blog-card card ${featured ? 'featured' : ''}`}>
            {post.featured_image && (
                <div className="card-image">
                    <img
                        src={post.featured_image}
                        alt={post.title}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        loading="lazy"
                        onError={(e) => e.target.style.display = 'none'}
                    />
                </div>
            )}

            <div className="card-content">
                {post.category && (
                    <Link
                        href={`/blog?category=${post.category}`}
                        className="badge badge-primary card-category"
                    >
                        {post.category}
                    </Link>
                )}

                <Link href={`/blog/${post.slug}`}>
                    <h3 className="card-title">{post.title}</h3>
                </Link>

                <p className="card-excerpt">{post.excerpt}</p>

                <div className="card-meta">
                    <span className="meta-item">
                        <Calendar size={14} />
                        {formattedDate}
                    </span>

                    {post.tags && post.tags.length > 0 && (
                        <span className="meta-item">
                            <Tag size={14} />
                            {post.tags.slice(0, 2).join(', ')}
                        </span>
                    )}
                </div>
            </div>
        </article>
    );
});

export default BlogCard;
