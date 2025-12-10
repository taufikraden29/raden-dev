import { Skeleton } from '@/components/ui/Skeleton';
import { useProjectScripts } from '@/hooks/useData';
import { createProject, deleteProject, updateProject } from '@/services/projectScriptsService';
import { Check, Copy, Edit, ExternalLink, Filter, FolderCode, Plus, Search, Tag, Terminal, Trash2, X } from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';
import './ProjectScriptsPage.css';

const ProjectScriptsSkeleton = () => (
  <div className="project-scripts-page">
    <header className="page-header">
      <div className="header-left">
        <Skeleton width="48px" height="48px" borderRadius="var(--radius-md)" />
        <div>
          <Skeleton width="180px" height="1.75rem" className="mb-xs" />
          <Skeleton width="280px" height="1rem" />
        </div>
      </div>
      <Skeleton width="130px" height="40px" borderRadius="var(--radius-md)" />
    </header>
    <div className="stats-row">
      {[1, 2, 3, 4].map(i => (
        <div key={i} className="stat-card">
          <Skeleton width="40px" height="1.75rem" className="mb-xs" />
          <Skeleton width="60px" height="0.875rem" />
        </div>
      ))}
    </div>
    <div className="scripts-grid">
      {[1, 2, 3, 4, 5, 6].map(i => (
        <div key={i} className="project-card card simple-card">
          <Skeleton width="60%" height="1.5rem" className="mb-sm" />
          <Skeleton width="100%" height="3.5rem" />
        </div>
      ))}
    </div>
  </div>
);

const ProjectScriptsPage = () => {
  const { projects, loading, refetch } = useProjectScripts();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [deleteModal, setDeleteModal] = useState(null);
  const [copiedId, setCopiedId] = useState(null);

  // Initial form state
  const initialFormState = {
    name: '',
    command: '',
    description: '',
    docLink: '',
    tags: []
  };
  const [formData, setFormData] = useState(initialFormState);
  const [tagInput, setTagInput] = useState('');

  // Get all unique tags
  const allTags = useMemo(() => {
    if (!projects) return [];
    const tags = projects.flatMap(p => p.tags || []);
    return [...new Set(tags)].sort();
  }, [projects]);

  // Calculate stats
  const stats = useMemo(() => ({
    total: (projects || []).length,
    withDocs: (projects || []).filter(p => p.path).length,
    totalTags: allTags.length,
    totalCommands: (projects || []).reduce((acc, p) => acc + (p.scripts?.length || 1), 0)
  }), [projects, allTags]);

  // Filter projects
  const filteredProjects = useMemo(() => {
    if (!projects) return [];
    let result = projects;

    // Filter by search query
    if (searchQuery) {
      const lowerQuery = searchQuery.toLowerCase();
      result = result.filter(p =>
        p.name.toLowerCase().includes(lowerQuery) ||
        (p.scripts?.[0]?.command || '').toLowerCase().includes(lowerQuery) ||
        (p.description || '').toLowerCase().includes(lowerQuery) ||
        (p.tags || []).some(t => t.toLowerCase().includes(lowerQuery))
      );
    }

    // Filter by tag
    if (selectedTag) {
      result = result.filter(p => (p.tags || []).includes(selectedTag));
    }

    return result;
  }, [projects, searchQuery, selectedTag]);

  // Handlers
  const handleEdit = useCallback((project) => {
    setEditingProject(project);
    setFormData({
      name: project.name,
      command: project.scripts?.[0]?.command || '',
      description: project.description || '',
      docLink: project.path || '',
      tags: project.tags || []
    });
    setTagInput('');
    setModalOpen(true);
  }, []);

  const handleCreate = () => {
    setEditingProject(null);
    setFormData(initialFormState);
    setTagInput('');
    setModalOpen(true);
  };

  const handleDelete = async (id) => {
    await deleteProject(id);
    setDeleteModal(null);
    refetch();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const projectData = {
      name: formData.name,
      description: formData.description,
      path: formData.docLink,
      scripts: [{ label: 'Run', command: formData.command }],
      tags: formData.tags
    };

    if (editingProject) {
      await updateProject(editingProject.id, projectData);
    } else {
      await createProject(projectData);
    }

    setModalOpen(false);
    refetch();
  };

  const handleAddTag = () => {
    const tag = tagInput.trim().toLowerCase();
    if (tag && !formData.tags.includes(tag)) {
      setFormData({ ...formData, tags: [...formData.tags, tag] });
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter(t => t !== tagToRemove)
    });
  };

  const handleTagKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  const copyToClipboard = async (text, id, e) => {
    e.stopPropagation();
    await navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedTag('');
  };

  if (loading) return <ProjectScriptsSkeleton />;

  return (
    <div className="project-scripts-page">
      {/* Header */}
      <header className="page-header">
        <div className="header-left">
          <div className="header-icon">
            <Terminal size={24} />
          </div>
          <div>
            <h1>Project Scripts</h1>
            <p>Simpan dan kelola command & script development Anda</p>
          </div>
        </div>
        <div className="header-actions">
          <button className="btn btn-primary" onClick={handleCreate}>
            <Plus size={18} /><span>Tambah Script</span>
          </button>
        </div>
      </header>

      {/* Stats Row */}
      <div className="stats-row">
        <div className="stat-card">
          <span className="stat-value">{stats.total}</span>
          <span className="stat-label">Total Script</span>
        </div>
        <div className="stat-card">
          <span className="stat-value with-docs">{stats.withDocs}</span>
          <span className="stat-label">Dengan Docs</span>
        </div>
        <div className="stat-card">
          <span className="stat-value tags">{stats.totalTags}</span>
          <span className="stat-label">Tags</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">{stats.totalCommands}</span>
          <span className="stat-label">Commands</span>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="filters-section">
        <div className="search-bar">
          <Search size={20} className="search-icon" />
          <input
            type="text"
            placeholder="Cari script, command, atau tag..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button className="clear-search" onClick={() => setSearchQuery('')}>
              <X size={16} />
            </button>
          )}
        </div>

        {allTags.length > 0 && (
          <div className="tag-filters">
            <Filter size={16} className="filter-icon" />
            <div className="tag-pills">
              <button
                className={`tag-pill ${!selectedTag ? 'active' : ''}`}
                onClick={() => setSelectedTag('')}
              >
                Semua
              </button>
              {allTags.map(tag => (
                <button
                  key={tag}
                  className={`tag-pill ${selectedTag === tag ? 'active' : ''}`}
                  onClick={() => setSelectedTag(tag)}
                >
                  <Tag size={12} />
                  {tag}
                </button>
              ))}
            </div>
          </div>
        )}

        {(searchQuery || selectedTag) && (
          <div className="filter-info">
            <span>{filteredProjects.length} script ditemukan</span>
            <button className="clear-filters" onClick={clearFilters}>
              <X size={14} /> Reset Filter
            </button>
          </div>
        )}
      </div>

      {/* Scripts Grid */}
      {filteredProjects.length === 0 ? (
        <div className="empty-state">
          <FolderCode size={48} />
          <h3>{searchQuery || selectedTag ? 'Tidak ada script ditemukan' : 'Belum ada script'}</h3>
          <p>{searchQuery || selectedTag ? 'Coba kata kunci atau filter lain' : 'Tambahkan script pertama Anda'}</p>
          {!(searchQuery || selectedTag) && (
            <button className="btn btn-primary" onClick={handleCreate}>
              <Plus size={18} /> Tambah Script
            </button>
          )}
        </div>
      ) : (
        <div className="scripts-grid">
          {filteredProjects.map(project => {
            const command = project.scripts?.[0]?.command || '';
            const isCopied = copiedId === project.id;

            return (
              <div key={project.id} className="project-card card simple-card">
                {/* Card Header */}
                <div className="project-header">
                  <div className="project-title-row">
                    <div className="project-title">
                      <h3>{project.name}</h3>
                    </div>
                    <div className="header-links">
                      {project.path && (
                        <a
                          href={project.path}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="doc-link-btn"
                          title="Buka Dokumentasi"
                        >
                          <ExternalLink size={16} />
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Tags */}
                  {project.tags && project.tags.length > 0 && (
                    <div className="card-tags">
                      {project.tags.slice(0, 3).map(tag => (
                        <span key={tag} className="card-tag" onClick={() => setSelectedTag(tag)}>
                          {tag}
                        </span>
                      ))}
                      {project.tags.length > 3 && (
                        <span className="card-tag more">+{project.tags.length - 3}</span>
                      )}
                    </div>
                  )}
                </div>

                {/* Description */}
                {project.description && (
                  <p className="project-description">{project.description}</p>
                )}

                {/* Command Block */}
                <div className="script-display">
                  <code className="script-command-block" title={command}>{command}</code>
                  <button
                    className={`copy-btn-large ${isCopied ? 'copied' : ''}`}
                    onClick={(e) => copyToClipboard(command, project.id, e)}
                    title="Copy command"
                  >
                    {isCopied ? (
                      <><Check size={18} /> Copied!</>
                    ) : (
                      <><Copy size={18} /> Copy</>
                    )}
                  </button>
                </div>

                {/* Card Actions */}
                <div className="card-actions">
                  <button className="btn-action edit" onClick={() => handleEdit(project)} title="Edit">
                    <Edit size={16} />
                  </button>
                  <button className="btn-action delete" onClick={() => setDeleteModal(project)} title="Hapus">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Edit/Create Modal */}
      {modalOpen && (
        <div className="modal-overlay" onClick={() => setModalOpen(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingProject ? 'Edit Script' : 'Script Baru'}</h2>
              <button className="close-btn" onClick={() => setModalOpen(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Nama Script *</label>
                <input
                  required
                  type="text"
                  className="form-input"
                  placeholder="Contoh: Running Project Vite"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Deskripsi (Opsional)</label>
                <textarea
                  className="form-textarea"
                  rows={2}
                  placeholder="Deskripsi singkat tentang script ini..."
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Link Dokumentasi (Opsional)</label>
                <input
                  type="url"
                  className="form-input"
                  placeholder="https://vitejs.dev/guide/"
                  value={formData.docLink}
                  onChange={e => setFormData({ ...formData, docLink: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Script Command *</label>
                <textarea
                  required
                  className="form-textarea code-input"
                  rows={3}
                  placeholder="Contoh: npm create vite@latest my-project"
                  value={formData.command}
                  onChange={e => setFormData({ ...formData, command: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Tags</label>
                <div className="tag-input-wrapper">
                  <input
                    type="text"
                    className="form-input tag-input"
                    placeholder="Ketik tag lalu tekan Enter..."
                    value={tagInput}
                    onChange={e => setTagInput(e.target.value)}
                    onKeyDown={handleTagKeyDown}
                  />
                  <button type="button" className="add-tag-btn" onClick={handleAddTag}>
                    <Plus size={16} />
                  </button>
                </div>
                {formData.tags.length > 0 && (
                  <div className="form-tags">
                    {formData.tags.map(tag => (
                      <span key={tag} className="form-tag">
                        {tag}
                        <button type="button" onClick={() => handleRemoveTag(tag)}>
                          <X size={12} />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setModalOpen(false)}>Batal</button>
                <button type="submit" className="btn btn-primary">Simpan</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {deleteModal && (
        <div className="modal-overlay" onClick={() => setDeleteModal(null)}>
          <div className="modal delete-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-icon"><Trash2 size={32} /></div>
            <h3>Hapus Script?</h3>
            <p>Yakin ingin menghapus "<strong>{deleteModal.name}</strong>"?</p>
            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={() => setDeleteModal(null)}>Batal</button>
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

export default ProjectScriptsPage;
