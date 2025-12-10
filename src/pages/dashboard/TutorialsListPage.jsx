import { BookOpen, Clock, Edit, Eye, Layers, Lock, Plus, Trash2 } from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Skeleton } from '../../components/ui/Skeleton';
import { useTutorials } from '../../hooks/useData';
import { deleteTutorial } from '../../services/tutorialService';
import './TutorialsListPage.css';

// Helper functions outside component
const getDifficultyLabel = (difficulty) => {
    switch (difficulty) {
        case 'beginner': return 'Pemula';
        case 'intermediate': return 'Menengah';
        case 'advanced': return 'Lanjutan';
        default: return difficulty;
    }
};

const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
        case 'beginner': return 'badge-success';
        case 'intermediate': return 'badge-warning';
        case 'advanced': return 'badge-error';
        default: return 'badge-secondary';
    }
};

// Skeleton component
const TutorialsListSkeleton = () => (
    <div className="tutorials-list-page">
        <header className="page-header">
            <div className="header-left">
                <Skeleton width="48px" height="48px" borderRadius="var(--radius-md)" />
                <div>
                    <Skeleton width="150px" height="1.75rem" className="mb-xs" />
                    <Skeleton width="250px" height="1rem" />
                </div>
            </div>
            <Skeleton width="140px" height="40px" borderRadius="var(--radius-md)" />
        </header>
        <div className="stats-row">
            {[1, 2, 3, 4].map(i => (
                <div key={i} className="stat-card">
                    <Skeleton width="40px" height="1.5rem" className="mb-xs" />
                    <Skeleton width="60px" height="0.875rem" />
                </div>
            ))}
        </div>
        <div className="tutorials-grid">
            {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="tutorial-card">
                    <Skeleton width="100%" height="140px" />
                </div>
            ))}
        </div>
    </div>
);

const TutorialsListPage = () => {
    const { tutorials, loading, refetch } = useTutorials(false);
    const [deleteModal, setDeleteModal] = useState(null);

    // Memoize handlers
    const handleDelete = useCallback(async (id) => {
        await deleteTutorial(id);
        setDeleteModal(null);
        refetch(); // Refresh data after delete
    }, [refetch]);

    // Memoize stats
    const stats = useMemo(() => ({
        total: (tutorials || []).length,
        published: (tutorials || []).filter(t => t.published).length,
        premium: (tutorials || []).filter(t => t.is_premium).length,
        totalSteps: (tutorials || []).reduce((acc, t) => acc + (t.steps?.length || 0), 0)
    }), [tutorials]);

    if (loading) {
        return <TutorialsListSkeleton />;
    }

    const tutorialsList = tutorials || [];

    return (
        <div className="tutorials-list-page">
            {/* Header */}
            <header className="page-header">
                <div className="header-left">
                    <div className="header-icon">
                        <BookOpen size={24} />
                    </div>
                    <div>
                        <h1>Mini Tutorials</h1>
                        <p>Kelola panduan dan tutorial step-by-step</p>
                    </div>
                </div>
                <Link to="/dashboard/tutorials/new" className="btn btn-primary">
                    <Plus size={18} />
                    <span>Buat Tutorial</span>
                </Link>
            </header>

            {/* Stats */}
            <div className="stats-row">
                <div className="stat-card">
                    <span className="stat-value">{stats.total}</span>
                    <span className="stat-label">Total</span>
                </div>
                <div className="stat-card">
                    <span className="stat-value published">{stats.published}</span>
                    <span className="stat-label">Published</span>
                </div>
                <div className="stat-card">
                    <span className="stat-value premium">{stats.premium}</span>
                    <span className="stat-label">Premium</span>
                </div>
                <div className="stat-card">
                    <span className="stat-value">{stats.totalSteps}</span>
                    <span className="stat-label">Langkah</span>
                </div>
            </div>

            {/* Content */}
            {tutorialsList.length === 0 ? (
                <div className="empty-state">
                    <BookOpen size={48} />
                    <h3>Belum ada tutorial</h3>
                    <p>Buat tutorial pertama untuk membantu pembaca</p>
                    <Link to="/dashboard/tutorials/new" className="btn btn-primary">
                        <Plus size={18} /> Buat Tutorial
                    </Link>
                </div>
            ) : (
                <div className="tutorials-grid">
                    {tutorialsList.map(tutorial => (
                        <div key={tutorial.id} className="tutorial-card">
                            {/* Card Header */}
                            <div className="card-header">
                                <div className="card-badges">
                                    <span className={`badge ${getDifficultyColor(tutorial.difficulty)}`}>
                                        {getDifficultyLabel(tutorial.difficulty)}
                                    </span>
                                    {tutorial.is_premium && (
                                        <span className="badge badge-premium">
                                            <Lock size={10} /> Premium
                                        </span>
                                    )}
                                </div>
                                <span className={`status-dot ${tutorial.published ? 'published' : 'draft'}`}
                                    title={tutorial.published ? 'Published' : 'Draft'} />
                            </div>

                            {/* Card Body */}
                            <div className="card-body">
                                <h3>{tutorial.title}</h3>
                                {tutorial.description && (
                                    <p className="card-desc">{tutorial.description}</p>
                                )}

                                {/* Unlock Code Display */}
                                {tutorial.is_premium && tutorial.unlock_code && (
                                    <div className="unlock-code-display">
                                        <span className="code-label">Kode Akses:</span>
                                        <div className="code-value">
                                            <code>{tutorial.unlock_code}</code>
                                            <button
                                                className="copy-btn"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    navigator.clipboard.writeText(tutorial.unlock_code);
                                                    e.target.textContent = '✓';
                                                    setTimeout(() => e.target.textContent = 'Copy', 1500);
                                                }}
                                            >
                                                Copy
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Card Meta */}
                            <div className="card-meta">
                                {tutorial.category && (
                                    <span className="meta-item">
                                        <BookOpen size={14} />
                                        {tutorial.category}
                                    </span>
                                )}
                                <span className="meta-item">
                                    <Layers size={14} />
                                    {tutorial.steps?.length || 0} langkah
                                </span>
                                {tutorial.estimated_time && (
                                    <span className="meta-item">
                                        <Clock size={14} />
                                        {tutorial.estimated_time}
                                    </span>
                                )}
                            </div>

                            {/* Card Actions */}
                            <div className="card-actions">
                                <a
                                    href={`/tutorials/${tutorial.slug}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="btn-action"
                                    title="Preview"
                                >
                                    <Eye size={16} />
                                </a>
                                <Link
                                    to={`/dashboard/tutorials/${tutorial.id}/edit`}
                                    className="btn-action edit"
                                    title="Edit"
                                >
                                    <Edit size={16} />
                                </Link>
                                <button
                                    className="btn-action delete"
                                    onClick={() => setDeleteModal(tutorial)}
                                    title="Delete"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Delete Modal */}
            {deleteModal && (
                <div className="modal-overlay" onClick={() => setDeleteModal(null)}>
                    <div className="modal delete-modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-icon">
                            <Trash2 size={32} />
                        </div>
                        <h3>Hapus Tutorial?</h3>
                        <p>Yakin ingin menghapus "<strong>{deleteModal.title}</strong>"? Aksi ini tidak bisa dibatalkan.</p>
                        <div className="modal-actions">
                            <button className="btn btn-secondary" onClick={() => setDeleteModal(null)}>
                                Batal
                            </button>
                            <button className="btn btn-danger" onClick={() => handleDelete(deleteModal.id)}>
                                <Trash2 size={16} /> Hapus
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TutorialsListPage;
