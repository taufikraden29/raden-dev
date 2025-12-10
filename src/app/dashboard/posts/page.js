'use client';

import '@/_legacy/dashboard/PostsPage.css';
import { deletePost, getAllPosts } from '@/services/blogService';
import { format } from 'date-fns';
import { Edit, ExternalLink, Plus, Search, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';

export default function PostsPage() {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [deleteModal, setDeleteModal] = useState({ isOpen: false, post: null });

    useEffect(() => {
        loadPosts();
    }, []);

    const loadPosts = async () => {
        setLoading(true);
        const data = await getAllPosts();
        setPosts(data);
        setLoading(false);
    };

    const filteredPosts = useMemo(() => {
        if (!searchQuery.trim()) return posts;

        const query = searchQuery.toLowerCase();
        return posts.filter(post =>
            post.title.toLowerCase().includes(query) ||
            post.category?.toLowerCase().includes(query)
        );
    }, [posts, searchQuery]);

    const handleDelete = (post) => {
        setDeleteModal({ isOpen: true, post });
    };

    const confirmDelete = async () => {
        if (deleteModal.post) {
            await deletePost(deleteModal.post.id);
            await loadPosts();
        }
        setDeleteModal({ isOpen: false, post: null });
    };

    if (loading) {
        return <div className="loading-container">Loading...</div>;
    }

    return (
        <div className="posts-page">
            {/* Header */}
            <header className="page-header">
                <div>
                    <h1>Posts</h1>
                    <p>Manage your blog posts</p>
                </div>
                <Link href="/dashboard/posts/new" className="btn btn-primary">
                    <Plus size={18} />
                    New Post
                </Link>
            </header>

            {/* Filters */}
            <div className="filters-bar">
                <div className="search-box">
                    <Search size={18} className="search-icon" />
                    <input
                        type="text"
                        placeholder="Search posts..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="form-input search-input"
                    />
                </div>
                <span className="post-count">
                    {filteredPosts.length} {filteredPosts.length === 1 ? 'post' : 'posts'}
                </span>
            </div>

            {/* Posts Table */}
            <div className="card">
                <div className="table-container">
                    <table className="table posts-table">
                        <thead>
                            <tr>
                                <th>Title</th>
                                <th>Category</th>
                                <th>Status</th>
                                <th>Created</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredPosts.map(post => (
                                <tr key={post.id}>
                                    <td>
                                        <div className="post-title-cell">
                                            {post.featured_image && (
                                                <img
                                                    src={post.featured_image}
                                                    alt=""
                                                    className="post-thumbnail"
                                                />
                                            )}
                                            <div>
                                                <span className="post-title">{post.title}</span>
                                                <span className="post-excerpt">{post.excerpt}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <span className="badge">{post.category}</span>
                                    </td>
                                    <td>
                                        <span className={`badge ${post.published ? 'badge-success' : 'badge-warning'}`}>
                                            {post.published ? 'Published' : 'Draft'}
                                        </span>
                                    </td>
                                    <td className="text-muted">
                                        {format(new Date(post.created_at), 'MMM d, yyyy')}
                                    </td>
                                    <td>
                                        <div className="action-buttons">
                                            {post.published && (
                                                <Link
                                                    href={`/blog/${post.slug}`}
                                                    target="_blank"
                                                    className="btn btn-icon btn-ghost"
                                                    title="View"
                                                >
                                                    <ExternalLink size={16} />
                                                </Link>
                                            )}
                                            <Link
                                                href={`/dashboard/posts/${post.id}/edit`}
                                                className="btn btn-icon btn-ghost"
                                                title="Edit"
                                            >
                                                <Edit size={16} />
                                            </Link>
                                            <button
                                                className="btn btn-icon btn-ghost delete-btn"
                                                onClick={() => handleDelete(post)}
                                                title="Delete"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {filteredPosts.length === 0 && (
                        <div className="empty-state">
                            <p>No posts found</p>
                            <Link href="/dashboard/posts/new" className="btn btn-primary">
                                Create your first post
                            </Link>
                        </div>
                    )}
                </div>
            </div>

            {/* Delete Modal */}
            {deleteModal.isOpen && (
                <div className="modal-overlay" onClick={() => setDeleteModal({ isOpen: false, post: null })}>
                    <div className="modal" onClick={e => e.stopPropagation()}>
                        <h3>Delete Post</h3>
                        <p>Are you sure you want to delete "{deleteModal.post?.title}"? This action cannot be undone.</p>
                        <div className="modal-actions">
                            <button
                                className="btn btn-secondary"
                                onClick={() => setDeleteModal({ isOpen: false, post: null })}
                            >
                                Cancel
                            </button>
                            <button
                                className="btn btn-danger"
                                onClick={confirmDelete}
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
