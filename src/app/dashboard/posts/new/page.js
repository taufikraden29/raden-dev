'use client';

import MarkdownRenderer from '@/components/ui/MarkdownRenderer';
import '@/_legacy/dashboard/PostEditorPage.css';
import { formatContentWithAI, generatePostWithAI } from '@/services/aiService';
import { createPost, getAllCategories, getPostById, updatePost } from '@/services/blogService';
import {
    AlertCircle,
    ArrowLeft,
    Bold,
    CheckCircle2,
    ChevronDown,
    Clipboard,
    Clock,
    Code,
    Columns,
    Eye,
    FileText,
    Heading1,
    Heading2,
    Heading3,
    HelpCircle,
    Image as ImageIcon,
    Italic,
    Lightbulb,
    Link as LinkIcon,
    List,
    ListOrdered,
    Minus,
    Quote,
    Save,
    Sparkles,
    Table,
    Terminal,
    Type,
    Wand2,
    X
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { use, useCallback, useEffect, useRef, useState } from 'react';
import toast, { Toaster } from 'react-hot-toast';

const AUTOSAVE_KEY = 'blog_post_draft';
const AUTOSAVE_INTERVAL = 30000;

const LANGUAGES = [
    { value: 'javascript', label: 'JavaScript' },
    { value: 'typescript', label: 'TypeScript' },
    { value: 'jsx', label: 'React JSX' },
    { value: 'python', label: 'Python' },
    { value: 'css', label: 'CSS' },
    { value: 'html', label: 'HTML' },
    { value: 'json', label: 'JSON' },
    { value: 'sql', label: 'SQL' },
    { value: 'bash', label: 'Bash/Shell' },
    { value: 'php', label: 'PHP' },
    { value: 'java', label: 'Java' },
    { value: 'csharp', label: 'C#' },
    { value: 'go', label: 'Go' },
    { value: 'rust', label: 'Rust' },
    { value: 'markdown', label: 'Markdown' },
    { value: 'plaintext', label: 'Plain Text' },
];

export default function PostEditorPage({ params }) {
    const id = params?.id;
    const router = useRouter();
    const isEditing = Boolean(id);
    const textareaRef = useRef(null);

    const [formData, setFormData] = useState({
        title: '', excerpt: '', content: '', category: '', tags: '', featuredImage: '', published: false
    });
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState('split');
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState('');
    const [showCheatSheet, setShowCheatSheet] = useState(false);
    const [autoSaveStatus, setAutoSaveStatus] = useState('');

    // Code paste modal state
    const [showCodePasteModal, setShowCodePasteModal] = useState(false);
    const [codeToPaste, setCodeToPaste] = useState('');
    const [selectedLanguage, setSelectedLanguage] = useState('javascript');
    const [showLangDropdown, setShowLangDropdown] = useState(false);
    const [showTutorial, setShowTutorial] = useState(false);

    // AI Generate Post Modal state
    const [showAiGenerateModal, setShowAiGenerateModal] = useState(false);
    const [aiGeneratePrompt, setAiGeneratePrompt] = useState('');
    const [isAiGenerating, setIsAiGenerating] = useState(false);
    const [aiEndpoint, setAiEndpoint] = useState('coding'); // 'coding' or 'general'

    // Load tutorial preference from localStorage
    useEffect(() => {
        if (typeof window !== 'undefined') {
            setShowTutorial(localStorage.getItem('hide_editor_tutorial') !== 'true');
        }
    }, []);

    const wordCount = formData.content.trim() ? formData.content.trim().split(/\s+/).length : 0;
    const charCount = formData.content.length;
    const readingTime = Math.max(1, Math.ceil(wordCount / 200));

    const suggestLanguage = (text) => {
        const t = text.trim();
        if (/^(const|let|var|function|import|export)\s/.test(t) || /console\.log/.test(t)) return 'javascript';
        if (/<[A-Z]\w+/.test(t) || /className=/.test(t) || /useState/.test(t)) return 'jsx';
        if (/:\s*(string|number|boolean|any)\b/.test(t) || /interface\s+\w+/.test(t)) return 'typescript';
        if (/^def\s+\w+.*:/m.test(t) || /^class\s+\w+.*:/m.test(t) || /print\(/.test(t)) return 'python';
        if (/^[.#][\w-]+\s*\{/m.test(t) || /^\s*[\w-]+\s*:.*;/m.test(t)) return 'css';
        if (/^<!DOCTYPE|<html|<div/i.test(t)) return 'html';
        if (/^\s*\{.*".*":/.test(t) || /^\s*\[.*\{/.test(t)) return 'json';
        if (/^(SELECT|INSERT|UPDATE|DELETE|CREATE)\s/im.test(t)) return 'sql';
        if (/^#!/.test(t) || /^\s*(npm|yarn|git|docker)\s/.test(t)) return 'bash';
        return 'javascript';
    };

    useEffect(() => {
        const handleKeyDown = async (e) => {
            if (e.ctrlKey && e.shiftKey && e.key === 'V') {
                e.preventDefault();
                try {
                    const text = await navigator.clipboard.readText();
                    if (text) {
                        setCodeToPaste(text);
                        setSelectedLanguage(suggestLanguage(text));
                        setShowCodePasteModal(true);
                    }
                } catch (err) {
                    console.error('Failed to read clipboard:', err);
                }
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, []);

    const insertCodeBlock = () => {
        if (!codeToPaste.trim()) return;

        const textarea = textareaRef.current;
        const start = textarea?.selectionStart || formData.content.length;
        const end = textarea?.selectionEnd || formData.content.length;

        const codeBlock = `\n\`\`\`${selectedLanguage}\n${codeToPaste.trim()}\n\`\`\`\n`;
        const newContent = formData.content.substring(0, start) + codeBlock + formData.content.substring(end);

        setFormData(prev => ({ ...prev, content: newContent }));
        setShowCodePasteModal(false);
        setCodeToPaste('');

        setTimeout(() => {
            if (textarea) {
                textarea.focus();
                const newPos = start + codeBlock.length;
                textarea.setSelectionRange(newPos, newPos);
            }
        }, 0);
    };

    const handlePasteAsCode = async () => {
        try {
            const text = await navigator.clipboard.readText();
            if (text) {
                setCodeToPaste(text);
                setSelectedLanguage(suggestLanguage(text));
                setShowCodePasteModal(true);
            }
        } catch (err) {
            setCodeToPaste('');
            setSelectedLanguage('javascript');
            setShowCodePasteModal(true);
        }
    };

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            try {
                const cats = await getAllCategories();
                setCategories(cats);

                if (isEditing) {
                    const post = await getPostById(id);
                    if (post) {
                        setFormData({
                            title: post.title,
                            excerpt: post.excerpt,
                            content: post.content,
                            category: post.category || '',
                            tags: post.tags?.join(', ') || '',
                            featuredImage: post.featured_image || '',
                            published: post.published
                        });
                    } else {
                        router.push('/dashboard/posts');
                    }
                } else {
                    if (typeof window !== 'undefined') {
                        const draft = localStorage.getItem(AUTOSAVE_KEY);
                        if (draft) {
                            try {
                                const parsed = JSON.parse(draft);
                                if (parsed.title || parsed.content) {
                                    setFormData(parsed);
                                    setAutoSaveStatus('Draft loaded');
                                    setTimeout(() => setAutoSaveStatus(''), 2000);
                                }
                            } catch (e) {
                                console.error('Failed to load draft:', e);
                            }
                        }
                    }
                }
            } catch (err) {
                console.error('Error loading post editor data:', err);
                setError(`Failed to load data: ${err.message || 'Unknown error'}.`);
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, [id, isEditing, router]);

    const saveDraft = useCallback(() => {
        if (!isEditing && (formData.title || formData.content) && typeof window !== 'undefined') {
            try {
                localStorage.setItem(AUTOSAVE_KEY, JSON.stringify(formData));
                setAutoSaveStatus('saved');
                setTimeout(() => setAutoSaveStatus(''), 2000);
            } catch (e) { setAutoSaveStatus('error'); }
        }
    }, [isEditing, formData]);

    useEffect(() => {
        if (!isEditing) {
            const interval = setInterval(saveDraft, AUTOSAVE_INTERVAL);
            return () => clearInterval(interval);
        }
    }, [isEditing, saveDraft]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    };

    const insertMarkdown = (syntax, placeholder = '') => {
        const textarea = textareaRef.current;
        if (!textarea) return;

        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const scrollTop = textarea.scrollTop;
        const selectedText = formData.content.substring(start, end);
        const text = selectedText || placeholder;

        let newText, cursorOffset;
        switch (syntax) {
            case 'bold': newText = `**${text}**`; cursorOffset = 2; break;
            case 'italic': newText = `*${text}*`; cursorOffset = 1; break;
            case 'h1': newText = `# ${text}`; cursorOffset = 2; break;
            case 'h2': newText = `## ${text}`; cursorOffset = 3; break;
            case 'h3': newText = `### ${text}`; cursorOffset = 4; break;
            case 'link': newText = `[${text}](url)`; cursorOffset = 1; break;
            case 'list': newText = `- ${text}`; cursorOffset = 2; break;
            case 'ordered-list': newText = `1. ${text}`; cursorOffset = 3; break;
            case 'quote': newText = `> ${text}`; cursorOffset = 2; break;
            case 'hr': newText = '\n---\n'; cursorOffset = 5; break;
            case 'code': newText = `\`\`\`javascript\n${text}\n\`\`\``; cursorOffset = 14; break;
            case 'inline-code': newText = `\`${text}\``; cursorOffset = 1; break;
            case 'image': newText = `![${text}](image-url)`; cursorOffset = 2; break;
            case 'table': newText = '\n| Header 1 | Header 2 |\n|----------|----------|\n| Cell 1   | Cell 2   |\n'; cursorOffset = 3; break;
            default: newText = text; cursorOffset = 0;
        }

        const newContent = formData.content.substring(0, start) + newText + formData.content.substring(end);
        setFormData(prev => ({ ...prev, content: newContent }));

        requestAnimationFrame(() => {
            textarea.focus();
            const newCursorPos = selectedText ? start + newText.length : start + cursorOffset;
            textarea.setSelectionRange(newCursorPos, newCursorPos);
            textarea.scrollTop = scrollTop;
        });
    };

    const [aiPreview, setAiPreview] = useState(null); // { type: 'content' | 'title', original: string, generated: string, selectionStart?: number, selectionEnd?: number }

    const clearDraft = () => {
        if (typeof window !== 'undefined') {
            localStorage.removeItem(AUTOSAVE_KEY);
        }
    };

    const handleFormatWithAI = async () => {
        const textarea = textareaRef.current;
        if (!textarea) return;

        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const selectedText = formData.content.substring(start, end);

        // Logic: 
        // 1. If text selected or content exists -> REWRITE mode
        // 2. If content empty but title exists -> GENERATE mode

        const hasContent = formData.content.trim().length > 0;
        const hasTitle = formData.title.trim().length > 0;

        if (!hasContent && !hasTitle) {
            toast.error('Please enter a title first to generate content.');
            return;
        }

        let instruction = null;
        let textToProcess = "";

        if (selectedText || hasContent) {
            // Rewrite Mode
            textToProcess = selectedText || formData.content;
            // Use default rewrite prompt in API
        } else if (hasTitle) {
            // Generate Mode
            textToProcess = `Title: ${formData.title}`;
            instruction = `You are an expert technical blog writer. Generate a comprehensive, structured, and engaging blog post based on the title: "${formData.title}". Include an introduction, main body with headings, and conclusion. Use Markdown.`;
        }

        const toastId = toast.loading('AI is working on your content...');

        try {
            // 1. Open Preview Modal IMMEDIATELY with empty state
            setAiPreview({
                type: 'content',
                original: selectedText || (hasContent ? formData.content : ''),
                generated: '', // Start empty for streaming
                selectionStart: start,
                selectionEnd: end,
                isSelection: !!selectedText,
                isStreaming: true // Add flag to show loading indicator if needed
            });

            // 2. Start Streaming
            const resultText = await formatContentWithAI(textToProcess, instruction, (chunk) => {
                setAiPreview(prev => {
                    if (!prev) return null; // Safety check
                    return {
                        ...prev,
                        generated: (prev.generated || '') + chunk // Append chunk
                    };
                });
            });

            // 3. Mark as done
            setAiPreview(prev => prev ? ({ ...prev, isStreaming: false }) : null);

            console.log('AI Streaming Complete'); // Debugging

            toast.dismiss(toastId);
        } catch (error) {
            console.error('AI Error:', error);
            toast.error(`Failed: ${error.message}`, { id: toastId });
        }
    };

    const handleGenerateTitle = async () => {
        const hasContent = formData.content.trim().length > 0;
        const hasTitle = formData.title.trim().length > 0;

        if (!hasContent && !hasTitle) {
            toast.error('Please write some content first to generate a title.');
            return;
        }

        const toastId = toast.loading('Generating perfect title...');
        let textToProcess = "";
        let instruction = "";

        if (hasTitle) {
            // Optimize existing title
            textToProcess = formData.title;
            instruction = `The user has written the title: "${formData.title}". Rewrite this title to be more engaging, clickable, and SEO-friendly for a technical blog post. Keep the original meaning but make it better. Return ONLY the new title text, no quotes.`;
        } else {
            // Generate from content
            textToProcess = formData.content.substring(0, 2000); // Send first 2000 chars context
            instruction = "Generate a catchy, concise, and SEO-friendly title for a blog post based on this content. Return ONLY the title text, no quotes.";
        }

        try {
            const newTitle = await formatContentWithAI(textToProcess, instruction);
            // Remove any surrounding quotes if AI adds them
            const cleanTitle = newTitle.replace(/^["']|["']$/g, '');

            // Open Preview Modal
            setAiPreview({
                type: 'title',
                original: formData.title,
                generated: cleanTitle
            });

            toast.dismiss(toastId);
        } catch (error) {
            console.error('AI Title Error:', error);
            toast.error(`Failed: ${error.message}`, { id: toastId });
        }
    };

    const applyAiChanges = () => {
        if (!aiPreview) return;

        if (aiPreview.type === 'content') {
            let newContent;
            if (aiPreview.isSelection) {
                newContent = formData.content.substring(0, aiPreview.selectionStart) + aiPreview.generated + formData.content.substring(aiPreview.selectionEnd);
            } else {
                newContent = aiPreview.generated;
            }
            setFormData(prev => ({ ...prev, content: newContent }));
            toast.success('Content updated!');
        } else if (aiPreview.type === 'title') {
            setFormData(prev => ({ ...prev, title: aiPreview.generated }));
            toast.success('Title updated!');
        }

        setAiPreview(null);
    };

    // AI Generate Complete Post
    const handleGeneratePostWithAI = async () => {
        if (!aiGeneratePrompt.trim()) {
            toast.error('Masukkan deskripsi post yang ingin dibuat');
            return;
        }

        setIsAiGenerating(true);
        const toastId = toast.loading('AI sedang membuat blog post...');

        try {
            const post = await generatePostWithAI(aiGeneratePrompt, aiEndpoint);

            // Populate all form fields
            setFormData({
                title: post.title || '',
                excerpt: post.excerpt || '',
                content: post.content || '',
                category: post.category || '',
                tags: post.tags || '',
                featuredImage: post.featuredImage || '',
                published: false
            });

            setShowAiGenerateModal(false);
            setAiGeneratePrompt('');
            toast.dismiss(toastId);
            toast.success('Blog post berhasil di-generate! Silakan review dan edit.', { duration: 5000 });
        } catch (err) {
            console.error('AI Post Generation Error:', err);
            toast.error(`Gagal: ${err.message}`, { id: toastId });
        } finally {
            setIsAiGenerating(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        if (!formData.title.trim() || !formData.content.trim()) {
            setError('Title and content are required');
            return;
        }
        setIsSaving(true);
        try {
            const postData = {
                ...formData,
                tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean),
                author: 'Admin'
            };
            if (isEditing) {
                await updatePost(id, postData);
            } else {
                await createPost(postData);
                clearDraft();
            }
            router.push('/dashboard/posts');
        } catch (err) {
            setError('Failed to save post');
        } finally {
            setIsSaving(false);
        }
    };

    const markdownShortcuts = [
        { name: 'Bold', syntax: '**text**' },
        { name: 'Italic', syntax: '*text*' },
        { name: 'Heading', syntax: '# / ## / ###' },
        { name: 'Link', syntax: '[text](url)' },
        { name: 'Image', syntax: '![alt](url)' },
        { name: 'Code Block', syntax: '```lang\\ncode\\n```' },
        { name: 'Quote', syntax: '> quote' },
        { name: 'List', syntax: '- item' },
    ];

    if (loading) {
        return <div className="loading-container">Loading...</div>;
    }

    return (
        <div className="post-editor-page">
            <header className="editor-header">
                <div className="header-left">
                    <button type="button" onClick={() => router.push('/dashboard/posts')} className="back-btn">
                        <ArrowLeft size={18} /><span>Back</span>
                    </button>
                    <div className="header-title">
                        <h1>{isEditing ? 'Edit Post' : 'New Post'}</h1>
                        {autoSaveStatus && (
                            <span className={`autosave-status ${autoSaveStatus}`}>
                                {autoSaveStatus === 'saved' && <><CheckCircle2 size={14} /> Draft saved</>}
                                {autoSaveStatus === 'error' && <><AlertCircle size={14} /> Save failed</>}
                                {autoSaveStatus === 'Draft loaded' && <><Clock size={14} /> Draft loaded</>}
                            </span>
                        )}
                    </div>
                </div>
                <div className="header-actions">
                    <div className="view-toggle">
                        <button type="button" className={`toggle-btn ${viewMode === 'editor' ? 'active' : ''}`}
                            onClick={() => setViewMode('editor')} title="Editor"><FileText size={16} /></button>
                        <button type="button" className={`toggle-btn ${viewMode === 'split' ? 'active' : ''}`}
                            onClick={() => setViewMode('split')} title="Split"><Columns size={16} /></button>
                        <button type="button" className={`toggle-btn ${viewMode === 'preview' ? 'active' : ''}`}
                            onClick={() => setViewMode('preview')} title="Preview"><Eye size={16} /></button>
                    </div>
                    {!isEditing && (
                        <button type="button" className="btn btn-ai" onClick={() => setShowAiGenerateModal(true)}>
                            <Wand2 size={18} /><span>Generate with AI</span>
                        </button>
                    )}
                    <button type="button" className="btn btn-secondary" onClick={() => setShowCheatSheet(true)}>
                        <HelpCircle size={18} /><span>Markdown</span>
                    </button>
                    <button type="submit" form="post-form" className="btn btn-primary" disabled={isSaving}>
                        {isSaving ? <span className="loading-spinner" /> : <Save size={18} />}
                        <span>{isSaving ? 'Saving...' : 'Save Post'}</span>
                    </button>
                </div>
            </header>

            {error && <div className="error-banner"><AlertCircle size={18} />{error}</div>}

            {/* AI Generate Section - Prominent */}
            {!isEditing && (
                <div className="ai-generate-section">
                    <div className="ai-section-header">
                        <Wand2 size={20} />
                        <h3>Generate Blog Post dengan AI</h3>
                    </div>
                    <div className="ai-endpoint-row">
                        <span className="endpoint-label">Endpoint:</span>
                        <div className="endpoint-toggle">
                            <button
                                className={`endpoint-btn ${aiEndpoint === 'coding' ? 'active' : ''}`}
                                onClick={() => setAiEndpoint('coding')}
                                disabled={isAiGenerating}
                            >
                                <Code size={14} /> Coding
                            </button>
                            <button
                                className={`endpoint-btn ${aiEndpoint === 'general' ? 'active' : ''}`}
                                onClick={() => setAiEndpoint('general')}
                                disabled={isAiGenerating}
                            >
                                <Sparkles size={14} /> General
                            </button>
                        </div>
                    </div>
                    <div className="ai-prompt-row">
                        <input
                            type="text"
                            className="ai-prompt-input"
                            placeholder="Jelaskan topik blog post, misal: 'Tutorial React Hooks untuk pemula'"
                            value={aiGeneratePrompt}
                            onChange={(e) => setAiGeneratePrompt(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleGeneratePostWithAI()}
                            disabled={isAiGenerating}
                        />
                        <button
                            className="ai-generate-btn"
                            onClick={handleGeneratePostWithAI}
                            disabled={isAiGenerating || !aiGeneratePrompt.trim()}
                        >
                            {isAiGenerating ? (
                                <><span className="spinner-small" /> Generating...</>
                            ) : (
                                <><Sparkles size={18} /> Generate</>
                            )}
                        </button>
                    </div>
                </div>
            )}

            {showTutorial && (
                <div className="tutorial-section">
                    <div className="tutorial-header" onClick={() => setShowTutorial(false)}>
                        <div className="tutorial-title">
                            <Lightbulb size={18} />
                            <span>Tips: Cara Menggunakan Editor</span>
                        </div>
                        <button className="tutorial-close" onClick={(e) => {
                            e.stopPropagation();
                            setShowTutorial(false);
                            if (typeof window !== 'undefined') {
                                localStorage.setItem('hide_editor_tutorial', 'true');
                            }
                        }}>
                            <X size={16} />
                        </button>
                    </div>
                    <div className="tutorial-content">
                        <div className="tutorial-step"><div className="step-number">1</div><div className="step-content"><strong>Tulis Judul & Deskripsi</strong><p>Isi judul menarik dan excerpt singkat untuk SEO</p></div></div>
                        <div className="tutorial-step"><div className="step-number">2</div><div className="step-content"><strong>Tulis Konten dengan Markdown</strong><p>Gunakan toolbar atau ketik langsung</p></div></div>
                        <div className="tutorial-step"><div className="step-number">3</div><div className="step-content"><strong>Paste Kode dengan Mudah</strong><p>Klik Paste Code atau tekan Ctrl+Shift+V</p></div></div>
                        <div className="tutorial-step"><div className="step-number">4</div><div className="step-content"><strong>Preview & Publish</strong><p>Gunakan Split View untuk melihat hasil</p></div></div>
                    </div>
                </div>
            )}

            <div className={`editor-layout ${viewMode}`}>
                {(viewMode === 'editor' || viewMode === 'split') && (
                    <div className="editor-panel">
                        <form id="post-form" onSubmit={handleSubmit}>
                            <div className="form-section">
                                <div className="form-group">
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                        <label className="form-label" htmlFor="title" style={{ marginBottom: 0 }}>Title <span className="required">*</span></label>
                                        <button
                                            type="button"
                                            onClick={handleGenerateTitle}
                                            className="ai-gen-btn"
                                            title="Generate Title with AI"
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '4px',
                                                background: 'none',
                                                border: '1px solid #e2e8f0',
                                                padding: '4px 8px',
                                                borderRadius: '20px',
                                                fontSize: '0.75rem',
                                                color: '#64748b',
                                                cursor: 'pointer',
                                                transition: 'all 0.2s'
                                            }}
                                            onMouseOver={(e) => { e.currentTarget.style.color = '#6366f1'; e.currentTarget.style.borderColor = '#6366f1'; }}
                                            onMouseOut={(e) => { e.currentTarget.style.color = '#64748b'; e.currentTarget.style.borderColor = '#e2e8f0'; }}
                                        >
                                            <Sparkles size={14} />
                                            <span>AI Gen</span>
                                        </button>
                                    </div>
                                    <input id="title" name="title" type="text" className="form-input title-input"
                                        placeholder="Enter post title" value={formData.title} onChange={handleChange} required />
                                </div>
                                <div className="form-group">
                                    <label className="form-label" htmlFor="excerpt">Excerpt</label>
                                    <textarea id="excerpt" name="excerpt" className="form-textarea"
                                        placeholder="Brief description" value={formData.excerpt} onChange={handleChange} rows={2} />
                                </div>
                            </div>

                            <div className="form-section">
                                <div className="form-group">
                                    <label className="form-label" htmlFor="featuredImage">Featured Image URL</label>
                                    <input id="featuredImage" name="featuredImage" type="url" className="form-input"
                                        placeholder="https://example.com/image.jpg" value={formData.featuredImage} onChange={handleChange} />
                                </div>
                                {formData.featuredImage && (
                                    <div className="image-preview">
                                        <img src={formData.featuredImage} alt="Preview" onError={(e) => e.target.style.display = 'none'} />
                                    </div>
                                )}
                            </div>

                            <div className="form-section content-section">
                                <div className="editor-toolbar">
                                    <div className="toolbar-group">
                                        <button type="button" onMouseDown={(e) => { e.preventDefault(); insertMarkdown('h1', 'Heading'); }} title="H1">H1</button>
                                        <button type="button" onMouseDown={(e) => { e.preventDefault(); insertMarkdown('h2', 'Heading'); }} title="H2">H2</button>
                                        <button type="button" onMouseDown={(e) => { e.preventDefault(); insertMarkdown('h3', 'Heading'); }} title="H3">H3</button>
                                    </div>
                                    <div className="toolbar-divider" />
                                    <div className="toolbar-group">
                                        <button type="button" onMouseDown={(e) => { e.preventDefault(); insertMarkdown('bold', 'bold'); }} title="Bold"><Bold size={16} /></button>
                                        <button type="button" onMouseDown={(e) => { e.preventDefault(); insertMarkdown('italic', 'italic'); }} title="Italic"><Italic size={16} /></button>
                                    </div>
                                    <div className="toolbar-divider" />
                                    <div className="toolbar-group">
                                        <button type="button" onMouseDown={(e) => { e.preventDefault(); insertMarkdown('link', 'link'); }} title="Link"><LinkIcon size={16} /></button>
                                        <button type="button" onMouseDown={(e) => { e.preventDefault(); insertMarkdown('image', 'alt'); }} title="Image"><ImageIcon size={16} /></button>
                                    </div>
                                    <div className="toolbar-divider" />
                                    <div className="toolbar-group">
                                        <button type="button" onMouseDown={(e) => { e.preventDefault(); insertMarkdown('list', 'item'); }} title="List"><List size={16} /></button>
                                        <button type="button" onMouseDown={(e) => { e.preventDefault(); insertMarkdown('ordered-list', 'item'); }} title="Numbered"><ListOrdered size={16} /></button>
                                        <button type="button" onMouseDown={(e) => { e.preventDefault(); insertMarkdown('quote', 'quote'); }} title="Quote"><Quote size={16} /></button>
                                    </div>
                                    <div className="toolbar-divider" />
                                    <div className="toolbar-group">
                                        <button type="button" onMouseDown={(e) => { e.preventDefault(); insertMarkdown('inline-code', 'code'); }} title="Inline Code" className="code-inline-btn">{`<>`}</button>
                                        <button type="button" onMouseDown={(e) => { e.preventDefault(); insertMarkdown('code', '// code'); }} title="Code Block"><Code size={16} /></button>
                                        <button type="button" onMouseDown={(e) => { e.preventDefault(); insertMarkdown('table'); }} title="Table"><Table size={16} /></button>
                                        <button type="button" onMouseDown={(e) => { e.preventDefault(); insertMarkdown('hr'); }} title="Line"><Minus size={16} /></button>
                                    </div>
                                    <div className="toolbar-divider" />
                                    <button type="button" className="paste-code-btn" onClick={handlePasteAsCode} title="Paste as Code (Ctrl+Shift+V)">
                                        <Clipboard size={16} /><span>Paste Code</span>
                                    </button>
                                    <div className="toolbar-divider" />
                                    <button
                                        type="button"
                                        className="ai-format-btn"
                                        onClick={handleFormatWithAI}
                                        title="Rewrite with AI"
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '6px',
                                            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                                            color: 'white',
                                            border: 'none',
                                            padding: '6px 12px',
                                            borderRadius: '6px',
                                            fontSize: '0.85rem',
                                            fontWeight: 500,
                                            cursor: 'pointer'
                                        }}
                                    >
                                        <Wand2 size={16} />
                                        <span>AI Rewrite</span>
                                    </button>
                                </div>
                                <textarea ref={textareaRef} id="content" name="content" className="form-textarea content-textarea"
                                    placeholder="Write your post in Markdown..."
                                    value={formData.content} onChange={handleChange} required />
                                <div className="content-stats">
                                    <span><Type size={14} /> {charCount} chars</span>
                                    <span><FileText size={14} /> {wordCount} words</span>
                                    <span><Clock size={14} /> {readingTime} min read</span>
                                </div>
                            </div>

                            <div className="form-section meta-section">
                                <h3 className="section-title">Post Settings</h3>
                                <div className="meta-grid">
                                    <div className="form-group">
                                        <label className="form-label" htmlFor="category">Category</label>
                                        <input id="category" name="category" type="text" className="form-input"
                                            placeholder="e.g., React, CSS" value={formData.category} onChange={handleChange} list="categories" />
                                        <datalist id="categories">{categories.map(c => <option key={c} value={c} />)}</datalist>
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label" htmlFor="tags">Tags</label>
                                        <input id="tags" name="tags" type="text" className="form-input"
                                            placeholder="react, hooks" value={formData.tags} onChange={handleChange} />
                                        <span className="form-hint">Comma separated</span>
                                    </div>
                                </div>
                                <div className="form-group publish-toggle">
                                    <label className="form-checkbox">
                                        <input type="checkbox" name="published" checked={formData.published} onChange={handleChange} />
                                        <span>Publish immediately</span>
                                    </label>
                                </div>
                            </div>
                        </form>
                    </div>
                )}

                {(viewMode === 'preview' || viewMode === 'split') && (
                    <div className="preview-panel">
                        <div className="preview-header-bar"><Eye size={16} /> Preview</div>
                        <div className="preview-content">
                            {formData.featuredImage && <img src={formData.featuredImage} alt="" className="preview-featured-image" />}
                            <h1 className="preview-title">{formData.title || 'Untitled'}</h1>
                            {formData.excerpt && <p className="preview-excerpt">{formData.excerpt}</p>}
                            {formData.tags && (
                                <div className="preview-tags">
                                    {formData.tags.split(',').map((t, i) => t.trim() && <span key={i} className="preview-tag">{t.trim()}</span>)}
                                </div>
                            )}
                            <div className="preview-body">
                                <MarkdownRenderer content={formData.content || '*Start writing...*'} />
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {showCheatSheet && (
                <div className="modal-overlay" onClick={() => setShowCheatSheet(false)}>
                    <div className="modal cheat-sheet-modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>Markdown Cheat Sheet</h3>
                            <button className="modal-close" onClick={() => setShowCheatSheet(false)}><X size={20} /></button>
                        </div>
                        <div className="cheat-sheet-content">
                            {markdownShortcuts.map(({ name, syntax }) => (
                                <div key={name} className="cheat-sheet-item">
                                    <span className="cheat-name">{name}</span>
                                    <code className="cheat-syntax">{syntax}</code>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {showCodePasteModal && (
                <div className="modal-overlay" onClick={() => setShowCodePasteModal(false)}>
                    <div className="modal code-paste-modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>Paste as Code</h3>
                            <button className="modal-close" onClick={() => setShowCodePasteModal(false)}><X size={20} /></button>
                        </div>
                        <div className="code-paste-content">
                            <div className="language-selector">
                                <label>Language:</label>
                                <div className="custom-select" onClick={() => setShowLangDropdown(!showLangDropdown)}>
                                    <span>{LANGUAGES.find(l => l.value === selectedLanguage)?.label}</span>
                                    <ChevronDown size={16} />
                                    {showLangDropdown && (
                                        <div className="select-dropdown">
                                            {LANGUAGES.map(lang => (
                                                <div key={lang.value} className={`select-option ${selectedLanguage === lang.value ? 'active' : ''}`}
                                                    onClick={(e) => { e.stopPropagation(); setSelectedLanguage(lang.value); setShowLangDropdown(false); }}>
                                                    {lang.label}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                            <textarea
                                className="code-input"
                                placeholder="Paste your code here..."
                                value={codeToPaste}
                                onChange={(e) => setCodeToPaste(e.target.value)}
                                rows={12}
                            />
                            <div className="modal-actions">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowCodePasteModal(false)}>Cancel</button>
                                <button type="button" className="btn btn-primary" onClick={insertCodeBlock} disabled={!codeToPaste.trim()}>
                                    <Code size={16} /> Insert Code Block
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {aiPreview && (
                <div className="modal-overlay" onClick={() => setAiPreview(null)}>
                    <div className="modal ai-preview-modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3><Sparkles size={18} /> AI Generated Result</h3>
                            <button className="modal-close" onClick={() => setAiPreview(null)}><X size={20} /></button>
                        </div>
                        <div className="ai-preview-content">
                            <div className="preview-split">
                                <div className="preview-column original">
                                    <h4>Original</h4>
                                    <pre>{aiPreview.original || '(Empty)'}</pre>
                                </div>
                                <div className="preview-column generated">
                                    <h4>AI Result</h4>
                                    <div className="markdown-preview">
                                        {/* Simple render for preview - actual markdown rendering might require component */}
                                        {aiPreview.type === 'title' ? (
                                            <div className="title-preview">{aiPreview.generated}</div>
                                        ) : (
                                            <MarkdownRenderer content={aiPreview.generated || '*Waiting for content...*'} />
                                        )}
                                    </div>
                                </div>
                            </div>
                            <div className="modal-actions">
                                <button type="button" className="btn btn-secondary" onClick={() => setAiPreview(null)}>Discard</button>
                                <button type="button" className="btn btn-primary" onClick={applyAiChanges}>
                                    <CheckCircle2 size={16} /> Apply Changes
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Floating Action Bar */}
            <div className="floating-action-bar">
                <div className="floating-bar-info">
                    <span className="word-count"><FileText size={14} /> {wordCount} words</span>
                    <span className="reading-time"><Clock size={14} /> {readingTime} min</span>
                    {autoSaveStatus === 'saved' && (
                        <span className="autosave-badge"><CheckCircle2 size={14} /> Draft saved</span>
                    )}
                </div>
                <label className="form-checkbox publish-checkbox">
                    <input type="checkbox" name="published" checked={formData.published} onChange={handleChange} />
                    <span>Publish</span>
                </label>
                <button
                    type="submit"
                    form="post-form"
                    className="btn btn-primary"
                    disabled={isSaving}
                >
                    {isSaving ? <span className="spinner-small" /> : <Save size={18} />}
                    <span>{isSaving ? 'Saving...' : 'Save Post'}</span>
                </button>
            </div>

            {/* AI Generate Post Modal */}
            {showAiGenerateModal && (
                <div className="ai-modal-overlay" onClick={() => setShowAiGenerateModal(false)}>
                    <div className="ai-generate-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="ai-modal-header">
                            <h2><Wand2 size={24} /> Generate Blog Post dengan AI</h2>
                            <button className="ai-modal-close" onClick={() => setShowAiGenerateModal(false)}>
                                <X size={20} />
                            </button>
                        </div>
                        <div className="ai-modal-body">
                            <p className="ai-modal-desc">
                                Jelaskan topik blog post yang ingin dibuat. AI akan menghasilkan judul, excerpt, konten, kategori, tags, dan featured image.
                            </p>
                            <textarea
                                className="ai-prompt-textarea"
                                placeholder="Contoh: Tutorial lengkap tentang React Hooks untuk pemula, mencakup useState, useEffect, dan custom hooks dengan contoh kode praktis"
                                value={aiGeneratePrompt}
                                onChange={(e) => setAiGeneratePrompt(e.target.value)}
                                rows={4}
                                disabled={isAiGenerating}
                            />
                        </div>
                        <div className="ai-modal-footer">
                            <button
                                className="btn btn-secondary"
                                onClick={() => setShowAiGenerateModal(false)}
                                disabled={isAiGenerating}
                            >
                                Batal
                            </button>
                            <button
                                className="btn btn-ai"
                                onClick={handleGeneratePostWithAI}
                                disabled={isAiGenerating || !aiGeneratePrompt.trim()}
                            >
                                {isAiGenerating ? (
                                    <><span className="spinner-small" /> Generating...</>
                                ) : (
                                    <><Sparkles size={18} /> Generate Post</>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
