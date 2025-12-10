'use client';

import MarkdownRenderer from '@/components/ui/MarkdownRenderer';
import '@/_legacy/dashboard/TutorialEditorPage.css';
import { createTutorial, generateUnlockCode, getTutorialById, updateTutorial } from '@/services/tutorialService';
import { useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Copy, GripVertical, Image as ImageIcon, Lock, Plus, RefreshCw, Save, X, Youtube } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

const getYouTubeId = (url) => {
    if (!url) return null;
    const patterns = [
        /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
        /youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/
    ];
    for (const pattern of patterns) {
        const match = url.match(pattern);
        if (match) return match[1];
    }
    return null;
};

export default function TutorialEditorPage({ params }) {
    const id = params?.id;
    const router = useRouter();
    const queryClient = useQueryClient();
    const isEditing = Boolean(id);

    const [formData, setFormData] = useState({
        title: '', description: '', thumbnail: '', category: '', difficulty: 'beginner',
        estimated_time: '10 min', published: false, is_premium: false, unlock_code: '',
        steps: [{ title: '', content: '', youtube_url: '' }]
    });

    const [activeStep, setActiveStep] = useState(0);
    const [previewMode, setPreviewMode] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        const loadTutorial = async () => {
            if (isEditing) {
                setIsLoading(true);
                try {
                    const tutorial = await getTutorialById(id);
                    if (tutorial) {
                        setFormData({
                            title: tutorial.title || '',
                            description: tutorial.description || '',
                            thumbnail: tutorial.thumbnail || '',
                            category: tutorial.category || '',
                            difficulty: tutorial.difficulty || 'beginner',
                            estimated_time: tutorial.estimated_time || '10 min',
                            published: tutorial.published || false,
                            is_premium: tutorial.is_premium || false,
                            unlock_code: tutorial.unlock_code || '',
                            steps: tutorial.steps?.length > 0 ? tutorial.steps.map(step => ({
                                title: step.title || '', content: step.content || '', youtube_url: step.youtube_url || ''
                            })) : [{ title: '', content: '', youtube_url: '' }]
                        });
                    }
                } catch (error) {
                    console.error('Error loading tutorial:', error);
                    setError('Gagal memuat tutorial');
                } finally {
                    setIsLoading(false);
                }
            }
        };
        loadTutorial();
    }, [id, isEditing]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    };

    const handleStepChange = (index, field, value) => {
        const newSteps = [...formData.steps];
        newSteps[index] = { ...newSteps[index], [field]: value };
        setFormData(prev => ({ ...prev, steps: newSteps }));
    };

    const addStep = () => {
        setFormData(prev => ({ ...prev, steps: [...prev.steps, { title: '', content: '', youtube_url: '' }] }));
        setActiveStep(formData.steps.length);
    };

    const removeStep = (index) => {
        if (formData.steps.length <= 1) return;
        const newSteps = formData.steps.filter((_, i) => i !== index);
        setFormData(prev => ({ ...prev, steps: newSteps }));
        if (activeStep >= newSteps.length) setActiveStep(newSteps.length - 1);
    };

    const moveStep = (fromIndex, direction) => {
        const toIndex = fromIndex + direction;
        if (toIndex < 0 || toIndex >= formData.steps.length) return;
        const newSteps = [...formData.steps];
        [newSteps[fromIndex], newSteps[toIndex]] = [newSteps[toIndex], newSteps[fromIndex]];
        setFormData(prev => ({ ...prev, steps: newSteps }));
        setActiveStep(toIndex);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        if (!formData.title.trim()) { setError('Judul tutorial wajib diisi'); return; }
        if (formData.steps.some(s => !s.title.trim() || !s.content.trim())) {
            setError('Semua langkah harus memiliki judul dan konten');
            return;
        }
        setIsSaving(true);
        try {
            if (isEditing) { await updateTutorial(id, formData); }
            else { await createTutorial(formData); }
            // Invalidate tutorials cache to refresh list immediately
            await queryClient.invalidateQueries({ queryKey: ['tutorials'] });
            router.push('/dashboard/tutorials');
        } catch (err) {
            setError('Gagal menyimpan tutorial');
        } finally {
            setIsSaving(false);
        }
    };

    const currentStep = formData.steps[activeStep] || { title: '', content: '', youtube_url: '' };
    const currentYouTubeId = getYouTubeId(currentStep.youtube_url);

    if (isLoading) return <div className="loading-container">Loading tutorial...</div>;

    return (
        <div className="tutorial-editor-page">
            <header className="editor-header">
                <div className="header-left">
                    <button onClick={() => router.push('/dashboard/tutorials')} className="back-btn"><ArrowLeft size={18} /></button>
                    <h1>{isEditing ? 'Edit Tutorial' : 'Buat Tutorial Baru'}</h1>
                </div>
                <div className="header-actions">
                    <button type="button" className={`btn ${previewMode ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setPreviewMode(!previewMode)}>
                        {previewMode ? 'Edit' : 'Preview'}
                    </button>
                    <button onClick={handleSubmit} className="btn btn-primary" disabled={isSaving}>
                        <Save size={18} /><span>{isSaving ? 'Menyimpan...' : 'Simpan'}</span>
                    </button>
                </div>
            </header>

            {error && <div className="error-banner">{error}</div>}

            <div className="editor-layout">
                <div className="info-panel">
                    <h3>Informasi Tutorial</h3>
                    <div className="form-group">
                        <label className="form-label">Judul <span className="required">*</span></label>
                        <input type="text" name="title" className="form-input" placeholder="Judul tutorial" value={formData.title} onChange={handleChange} />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Deskripsi</label>
                        <textarea name="description" className="form-textarea" placeholder="Deskripsi singkat" value={formData.description} onChange={handleChange} rows={2} />
                    </div>
                    <div className="form-group">
                        <label className="form-label thumbnail-label"><ImageIcon size={14} /> Thumbnail URL</label>
                        <input type="url" name="thumbnail" className="form-input" placeholder="https://example.com/image.jpg" value={formData.thumbnail} onChange={handleChange} />
                        {formData.thumbnail && <div className="thumbnail-preview"><img src={formData.thumbnail} alt="Thumbnail preview" /></div>}
                    </div>
                    <div className="form-row">
                        <div className="form-group">
                            <label className="form-label">Kategori</label>
                            <input type="text" name="category" className="form-input" placeholder="e.g. React, DevOps" value={formData.category} onChange={handleChange} />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Waktu</label>
                            <input type="text" name="estimated_time" className="form-input" placeholder="e.g. 15 min" value={formData.estimated_time} onChange={handleChange} />
                        </div>
                    </div>
                    <div className="form-group">
                        <label className="form-label">Level</label>
                        <select name="difficulty" className="form-select" value={formData.difficulty} onChange={handleChange}>
                            <option value="beginner">Pemula</option>
                            <option value="intermediate">Menengah</option>
                            <option value="advanced">Lanjutan</option>
                        </select>
                    </div>
                    <div className="form-group">
                        <label className="toggle-label"><input type="checkbox" name="published" checked={formData.published} onChange={handleChange} /><span>Publish Tutorial</span></label>
                    </div>
                    <div className="premium-section">
                        <div className="form-group">
                            <label className="toggle-label premium-toggle"><input type="checkbox" name="is_premium" checked={formData.is_premium} onChange={handleChange} /><Lock size={14} /><span>Premium Tutorial</span></label>
                        </div>
                        {formData.is_premium && (
                            <div className="unlock-code-section">
                                <label className="form-label">Unlock Code</label>
                                <div className="code-input-group">
                                    <input type="text" className="form-input code-input" value={formData.unlock_code} readOnly placeholder="Generate kode..." />
                                    <button type="button" className="btn btn-secondary code-btn" onClick={() => setFormData(prev => ({ ...prev, unlock_code: generateUnlockCode() }))} title="Generate kode baru"><RefreshCw size={16} /></button>
                                    {formData.unlock_code && <button type="button" className="btn btn-secondary code-btn" onClick={() => navigator.clipboard.writeText(formData.unlock_code)} title="Copy kode"><Copy size={16} /></button>}
                                </div>
                                <p className="code-hint">Bagikan kode ini ke pembeli tutorial</p>
                            </div>
                        )}
                    </div>
                </div>

                <div className="steps-panel">
                    <div className="steps-sidebar">
                        <div className="steps-header"><h3>Langkah ({formData.steps.length})</h3><button className="btn-icon-sm" onClick={addStep} title="Tambah langkah"><Plus size={16} /></button></div>
                        <ul className="steps-list">
                            {formData.steps.map((step, index) => (
                                <li key={index} className={`step-item ${activeStep === index ? 'active' : ''}`} onClick={() => setActiveStep(index)}>
                                    <span className="step-grip"><GripVertical size={14} /></span>
                                    <span className="step-num">{index + 1}</span>
                                    <span className="step-name">{step.title || `Langkah ${index + 1}`}</span>
                                    {formData.steps.length > 1 && <button className="step-delete" onClick={(e) => { e.stopPropagation(); removeStep(index); }}><X size={14} /></button>}
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="step-editor">
                        {previewMode ? (
                            <div className="step-preview">
                                <h2>{currentStep.title || 'Judul Langkah'}</h2>
                                {currentYouTubeId && (
                                    <div className="youtube-preview">
                                        <iframe src={`https://www.youtube.com/embed/${currentYouTubeId}`} title="YouTube video" frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
                                    </div>
                                )}
                                <MarkdownRenderer content={currentStep.content || '*Belum ada konten*'} />
                            </div>
                        ) : (
                            <>
                                <div className="form-group">
                                    <label className="form-label">Judul Langkah {activeStep + 1} <span className="required">*</span></label>
                                    <input type="text" className="form-input" placeholder="e.g. Install Dependencies" value={currentStep.title} onChange={(e) => handleStepChange(activeStep, 'title', e.target.value)} />
                                </div>
                                <div className="form-group">
                                    <label className="form-label youtube-label"><Youtube size={16} /> Link Video YouTube (opsional)</label>
                                    <input type="url" className="form-input youtube-input" placeholder="https://www.youtube.com/watch?v=..." value={currentStep.youtube_url || ''} onChange={(e) => handleStepChange(activeStep, 'youtube_url', e.target.value)} />
                                    {currentYouTubeId && <div className="youtube-preview-small"><img src={`https://img.youtube.com/vi/${currentYouTubeId}/mqdefault.jpg`} alt="Video thumbnail" /><span className="preview-badge">✓ Video terdeteksi</span></div>}
                                </div>
                                <div className="form-group flex-1">
                                    <label className="form-label">Konten (Markdown) <span className="required">*</span></label>
                                    <textarea className="form-textarea step-content-input" placeholder="Tulis instruksi dengan Markdown..." value={currentStep.content} onChange={(e) => handleStepChange(activeStep, 'content', e.target.value)} />
                                </div>
                                <div className="step-nav-buttons">
                                    <button className="btn btn-secondary" onClick={() => moveStep(activeStep, -1)} disabled={activeStep === 0}>↑ Pindah Atas</button>
                                    <button className="btn btn-secondary" onClick={() => moveStep(activeStep, 1)} disabled={activeStep === formData.steps.length - 1}>↓ Pindah Bawah</button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
