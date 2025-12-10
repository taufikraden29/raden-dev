import { Skeleton } from '@/components/ui/Skeleton';
import { useProjectScripts } from '@/hooks/useData';
import { Check, Code2, Copy, ExternalLink, Search, Tag, Terminal, X } from 'lucide-react';
import React, { useMemo, useState } from 'react';
import './ScriptsPage.css';

const PublicScriptsSkeleton = () => (
  <div className="public-scripts-page container">
    <div className="scripts-hero">
      <Skeleton width="180px" height="1.5rem" className="mb-sm" />
      <Skeleton width="100%" maxWidth="600px" height="3rem" className="mb-md" />
      <Skeleton width="100%" maxWidth="500px" height="1.2rem" />
    </div>
    <div className="scripts-grid-public">
      {[1, 2, 3, 4, 5, 6].map(i => (
        <div key={i} className="script-card-public">
          <Skeleton width="50%" height="1.5rem" className="mb-sm" />
          <Skeleton width="100%" height="4rem" />
        </div>
      ))}
    </div>
  </div>
);

const ScriptsPage = () => {
  const { projects, loading } = useProjectScripts();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState('');
  const [copiedId, setCopiedId] = useState(null);

  // Get all unique tags
  const allTags = useMemo(() => {
    if (!projects) return [];
    const tags = projects.flatMap(p => p.tags || []);
    return [...new Set(tags)].sort();
  }, [projects]);

  // Filter projects
  const filteredProjects = useMemo(() => {
    if (!projects) return [];
    let result = projects;

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(p =>
        p.name.toLowerCase().includes(query) ||
        (p.scripts?.[0]?.command || '').toLowerCase().includes(query) ||
        (p.description || '').toLowerCase().includes(query) ||
        (p.tags || []).some(t => t.toLowerCase().includes(query))
      );
    }

    // Filter by tag
    if (selectedTag) {
      result = result.filter(p => (p.tags || []).includes(selectedTag));
    }

    return result;
  }, [projects, searchQuery, selectedTag]);

  const copyToClipboard = async (text, id) => {
    await navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedTag('');
  };

  if (loading) return <PublicScriptsSkeleton />;

  const totalScripts = projects?.length || 0;

  return (
    <div className="public-scripts-page container">
      {/* Hero Section */}
      <section className="scripts-hero">
        <div className="hero-badge">
          <Terminal size={16} /> <span>Dev Tools</span>
        </div>
        <h1>Project Scripts Library</h1>
        <p>Kumpulan command dan script berguna untuk mempercepat development workflow Anda.</p>

        {/* Search Bar */}
        <div className="public-search-bar">
          <Search size={20} className="search-icon" />
          <input
            type="text"
            placeholder="Cari script (npm, git, docker, dll)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button className="clear-search" onClick={() => setSearchQuery('')}>
              <X size={16} />
            </button>
          )}
        </div>

        {/* Tag Filter Pills */}
        {allTags.length > 0 && (
          <div className="public-tag-filters">
            <button
              className={`public-tag-pill ${!selectedTag ? 'active' : ''}`}
              onClick={() => setSelectedTag('')}
            >
              <Code2 size={14} />
              Semua
            </button>
            {allTags.map(tag => (
              <button
                key={tag}
                className={`public-tag-pill ${selectedTag === tag ? 'active' : ''}`}
                onClick={() => setSelectedTag(tag)}
              >
                <Tag size={12} />
                {tag}
              </button>
            ))}
          </div>
        )}
      </section>

      {/* Results Info */}
      <div className="results-header">
        <span className="results-count">
          {filteredProjects.length === totalScripts
            ? `${totalScripts} script tersedia`
            : `${filteredProjects.length} dari ${totalScripts} script`}
        </span>
        {(searchQuery || selectedTag) && (
          <button className="reset-filters" onClick={clearFilters}>
            <X size={14} /> Reset Filter
          </button>
        )}
      </div>

      {/* Scripts Grid */}
      <div className="scripts-grid-public">
        {filteredProjects.length > 0 ? (
          filteredProjects.map(project => {
            const command = project.scripts?.[0]?.command || '';
            const isCopied = copiedId === project.id;

            return (
              <div key={project.id} className="script-card-public">
                {/* Card Header */}
                <div className="card-header-public">
                  <div className="card-title-wrap">
                    <h3>{project.name}</h3>
                    {project.tags && project.tags.length > 0 && (
                      <div className="card-tags-inline">
                        {project.tags.slice(0, 2).map(tag => (
                          <span
                            key={tag}
                            className="inline-tag"
                            onClick={() => setSelectedTag(tag)}
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  {project.path && (
                    <a
                      href={project.path}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="public-doc-link"
                      title="Dokumentasi Resmi"
                    >
                      <ExternalLink size={16} />
                    </a>
                  )}
                </div>

                {/* Description */}
                {project.description && (
                  <p className="card-description">{project.description}</p>
                )}

                {/* Command Block */}
                <div
                  className="command-check-wrapper"
                  onClick={() => copyToClipboard(command, project.id)}
                >
                  <code className="public-command-block">{command}</code>
                  <button
                    className={`public-copy-btn ${isCopied ? 'copied' : ''}`}
                    title="Copy Command"
                  >
                    {isCopied ? (
                      <><Check size={16} /> Copied!</>
                    ) : (
                      <Copy size={18} />
                    )}
                  </button>
                </div>
              </div>
            );
          })
        ) : (
          <div className="empty-state">
            <Terminal size={48} className="empty-icon" />
            <h3>Tidak ada script ditemukan</h3>
            <p>Coba kata kunci atau filter lain.</p>
            {(searchQuery || selectedTag) && (
              <button className="btn btn-secondary" onClick={clearFilters}>
                Reset Filter
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ScriptsPage;
