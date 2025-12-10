'use client';

import MarkdownRenderer from '@/components/ui/MarkdownRenderer';
import '@/pages/public/TutorialDetailPage.css';
import { getTutorialBySlug, isTutorialUnlocked, unlockTutorial } from '@/services/tutorialService';
import {
    ArrowLeft, BookOpen, CheckCircle, ChevronLeft, ChevronRight,
    Clock, Keyboard, List, Lock, MessageSquare, Play, Save, Sparkles, X, Zap
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { use, useCallback, useEffect, useState } from 'react';

// Extract YouTube video ID
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

// Estimate reading time
const estimateReadingTime = (text) => {
    if (!text) return 1;
    const wordsPerMinute = 200;
    const words = text.trim().split(/\s+/).length;
    return Math.max(1, Math.ceil(words / wordsPerMinute));
};

// Generate confetti
const createConfetti = () => {
    if (typeof document === 'undefined') return;
    const colors = ['#00d4ff', '#22c55e', '#f59e0b', '#ef4444', '#a855f7'];
    const container = document.createElement('div');
    container.className = 'confetti-container';
    document.body.appendChild(container);

    for (let i = 0; i < 50; i++) {
        const confetti = document.createElement('div');
        confetti.className = 'confetti';
        confetti.style.left = Math.random() * 100 + '%';
        confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        confetti.style.animationDelay = Math.random() * 0.5 + 's';
        confetti.style.animationDuration = (Math.random() * 2 + 2) + 's';
        container.appendChild(confetti);
    }

    setTimeout(() => container.remove(), 4000);
};

export default function TutorialDetailPage({ params }) {
    const { slug } = use(params);
    const router = useRouter();
    const [tutorial, setTutorial] = useState(null);
    const [loading, setLoading] = useState(true);

    // State with localStorage persistence
    const storageKey = `tutorial_${slug}`;
    const [currentStep, setCurrentStep] = useState(0);
    const [completedSteps, setCompletedSteps] = useState([]);
    const [notes, setNotes] = useState({});

    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [notesOpen, setNotesOpen] = useState(false);
    const [showShortcuts, setShowShortcuts] = useState(false);
    const [celebrated, setCelebrated] = useState(false);

    // Premium unlock state
    const [isUnlocked, setIsUnlocked] = useState(false);
    const [unlockCode, setUnlockCode] = useState('');
    const [unlockError, setUnlockError] = useState('');

    // Load from localStorage on mount
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem(storageKey);
            if (saved) {
                const parsed = JSON.parse(saved);
                setCurrentStep(parsed.currentStep || 0);
                setCompletedSteps(parsed.completedSteps || []);
                setNotes(parsed.notes || {});
            }
        }
    }, [storageKey]);

    // Load tutorial data
    useEffect(() => {
        const loadTutorial = async () => {
            setLoading(true);
            try {
                const data = await getTutorialBySlug(slug);
                setTutorial(data);
            } catch (error) {
                console.error('Error loading tutorial:', error);
            } finally {
                setLoading(false);
            }
        };
        loadTutorial();
    }, [slug]);

    // Check premium status
    useEffect(() => {
        const checkPremiumStatus = async () => {
            if (tutorial) {
                if (tutorial.is_premium) {
                    const unlocked = await isTutorialUnlocked(tutorial.id);
                    setIsUnlocked(unlocked);
                } else {
                    setIsUnlocked(true);
                }
            }
        };
        checkPremiumStatus();
    }, [tutorial]);

    // Save progress to localStorage
    useEffect(() => {
        if (slug && typeof window !== 'undefined') {
            localStorage.setItem(storageKey, JSON.stringify({
                currentStep,
                completedSteps,
                notes,
                lastVisited: new Date().toISOString()
            }));
        }
    }, [currentStep, completedSteps, notes, slug, storageKey]);

    // Check for completion celebration
    useEffect(() => {
        const steps = tutorial?.steps || [];
        if (steps.length > 0 && completedSteps.length === steps.length && !celebrated) {
            createConfetti();
            setCelebrated(true);
        }
    }, [completedSteps, tutorial?.steps, celebrated]);

    const toggleComplete = useCallback((index) => {
        if (completedSteps.includes(index)) {
            setCompletedSteps(completedSteps.filter(i => i !== index));
        } else {
            setCompletedSteps([...completedSteps, index]);
        }
    }, [completedSteps]);

    // Keyboard shortcuts
    const handleKeyDown = useCallback((e) => {
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

        const steps = tutorial?.steps || [];
        const totalSteps = steps.length;

        switch (e.key) {
            case 'ArrowRight':
            case 'l':
                if (currentStep < totalSteps - 1) {
                    setCurrentStep(prev => prev + 1);
                    setSidebarOpen(false);
                }
                break;
            case 'ArrowLeft':
            case 'h':
                if (currentStep > 0) {
                    setCurrentStep(prev => prev - 1);
                    setSidebarOpen(false);
                }
                break;
            case ' ':
                e.preventDefault();
                toggleComplete(currentStep);
                break;
            case 'n':
                setNotesOpen(prev => !prev);
                break;
            case '?':
                setShowShortcuts(prev => !prev);
                break;
            case 'Escape':
                setSidebarOpen(false);
                setNotesOpen(false);
                setShowShortcuts(false);
                break;
            default:
                break;
        }
    }, [currentStep, tutorial?.steps, toggleComplete]);

    useEffect(() => {
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handleKeyDown]);

    if (loading) {
        return (
            <div className="tutorial-detail-page">
                <div className="loading-container">Loading tutorial...</div>
            </div>
        );
    }

    if (!tutorial) {
        return (
            <div className="tutorial-detail-page">
                <div className="not-found container">
                    <div className="not-found-content">
                        <h1>404</h1>
                        <p>Tutorial tidak ditemukan</p>
                        <Link href="/tutorials" className="btn btn-primary">
                            Kembali ke Tutorials
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    const steps = tutorial.steps || [];
    const totalSteps = steps.length;
    const progress = totalSteps > 0 ? ((completedSteps.length / totalSteps) * 100) : 0;

    const handleUnlock = async () => {
        setUnlockError('');
        const result = await unlockTutorial(tutorial.id, unlockCode);
        if (result.success) {
            setIsUnlocked(true);
            setUnlockCode('');
        } else {
            setUnlockError(result.message);
        }
    };

    const isPremiumLocked = tutorial.is_premium && !isUnlocked;

    const goToStep = (index) => {
        if (index >= 0 && index < totalSteps) {
            setCurrentStep(index);
            setSidebarOpen(false);
        }
    };

    const updateNote = (stepIndex, value) => {
        setNotes(prev => ({ ...prev, [stepIndex]: value }));
    };

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

    const currentStepData = steps[currentStep];
    const currentYouTubeId = currentStepData ? getYouTubeId(currentStepData.youtube_url) : null;
    const isLastStep = currentStep === totalSteps - 1;
    const isFirstStep = currentStep === 0;
    const readingTime = estimateReadingTime(currentStepData?.content);
    const currentNote = notes[currentStep] || '';

    return (
        <div className="tutorial-detail-page course-layout">
            {/* Top Bar */}
            <div className="course-topbar">
                <button onClick={() => router.back()} className="back-btn">
                    <ArrowLeft size={18} />
                    <span>Kembali</span>
                </button>

                <div className="course-info">
                    <h1>{tutorial.title}</h1>
                </div>

                <div className="topbar-actions">
                    <button
                        className="icon-btn"
                        onClick={() => setShowShortcuts(true)}
                        title="Keyboard Shortcuts (?)"
                    >
                        <Keyboard size={18} />
                    </button>
                    <button
                        className={`icon-btn ${notesOpen ? 'active' : ''}`}
                        onClick={() => setNotesOpen(!notesOpen)}
                        title="Personal Notes (N)"
                    >
                        <MessageSquare size={18} />
                        {currentNote && <span className="has-note" />}
                    </button>
                    <button
                        className="sidebar-toggle"
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                    >
                        <List size={20} />
                        <span>{currentStep + 1}/{totalSteps}</span>
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className="course-container">
                <div className="course-main">
                    {/* Video Player */}
                    {currentYouTubeId ? (
                        <div className="video-player">
                            <iframe
                                src={`https://www.youtube.com/embed/${currentYouTubeId}?rel=0`}
                                title={currentStepData?.title}
                                frameBorder="0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                            />
                        </div>
                    ) : (
                        <div className="video-placeholder">
                            <BookOpen size={48} />
                            <span>Langkah ini berupa teks - baca di bawah</span>
                        </div>
                    )}

                    {/* Step Content */}
                    <div className="course-content">
                        <div className="content-header">
                            <div className="step-info">
                                <div className="step-meta">
                                    <span className="step-label">Langkah {currentStep + 1}/{totalSteps}</span>
                                    <span className="reading-time">
                                        <Clock size={14} /> ~{readingTime} menit baca
                                    </span>
                                </div>
                                <h2>{currentStepData?.title}</h2>
                            </div>
                            <button
                                className={`complete-btn ${completedSteps.includes(currentStep) ? 'completed' : ''}`}
                                onClick={() => toggleComplete(currentStep)}
                            >
                                <CheckCircle size={20} />
                                {completedSteps.includes(currentStep) ? 'Selesai ✓' : 'Tandai Selesai'}
                            </button>
                        </div>

                        {/* Notes Panel */}
                        {notesOpen && (
                            <div className="notes-panel">
                                <div className="notes-header">
                                    <h4><MessageSquare size={16} /> Catatan Pribadi</h4>
                                    <span className="auto-save"><Save size={12} /> Auto-save</span>
                                </div>
                                <textarea
                                    placeholder="Tulis catatanmu untuk langkah ini..."
                                    value={currentNote}
                                    onChange={(e) => updateNote(currentStep, e.target.value)}
                                />
                            </div>
                        )}

                        <div className="content-body">
                            <MarkdownRenderer content={currentStepData?.content || ''} />
                        </div>

                        {/* Navigation */}
                        <div className="content-nav">
                            <button
                                className="nav-btn prev"
                                onClick={() => goToStep(currentStep - 1)}
                                disabled={isFirstStep}
                            >
                                <ChevronLeft size={20} />
                                <span>Sebelumnya</span>
                            </button>

                            {isLastStep ? (
                                <Link href="/tutorials" className="nav-btn next finish">
                                    <Sparkles size={20} />
                                    <span>Tutorial Selesai!</span>
                                </Link>
                            ) : (
                                <button
                                    className="nav-btn next"
                                    onClick={() => goToStep(currentStep + 1)}
                                >
                                    <span>Selanjutnya</span>
                                    <ChevronRight size={20} />
                                </button>
                            )}
                        </div>

                        <div className="keyboard-hint">
                            <span>💡 Tekan <kbd>?</kbd> untuk melihat keyboard shortcuts</span>
                        </div>
                    </div>
                </div>

                {/* Sidebar */}
                <aside className={`course-sidebar ${sidebarOpen ? 'open' : ''}`}>
                    <div className="sidebar-header">
                        <h3>Konten Tutorial</h3>
                        <button className="close-sidebar" onClick={() => setSidebarOpen(false)}>
                            <X size={20} />
                        </button>
                    </div>

                    <div className="sidebar-progress">
                        <div className="progress-info">
                            <span>{completedSteps.length}/{totalSteps} selesai</span>
                            <span className={progress === 100 ? 'complete' : ''}>
                                {progress === 100 ? '🎉 ' : ''}{Math.round(progress)}%
                            </span>
                        </div>
                        <div className="progress-bar">
                            <div className="progress-fill" style={{ width: `${progress}%` }} />
                        </div>
                    </div>

                    <div className="sidebar-meta">
                        <span className={`badge ${getDifficultyColor(tutorial.difficulty)}`}>
                            <Zap size={12} /> {getDifficultyLabel(tutorial.difficulty)}
                        </span>
                        <span><Clock size={14} /> {tutorial.estimated_time || '10 min'}</span>
                    </div>

                    <div className="sidebar-steps">
                        {steps.map((step, index) => (
                            <button
                                key={index}
                                className={`step-item ${currentStep === index ? 'active' : ''} ${completedSteps.includes(index) ? 'completed' : ''}`}
                                onClick={() => goToStep(index)}
                            >
                                <span className="step-num">
                                    {completedSteps.includes(index) ? <CheckCircle size={16} /> : index + 1}
                                </span>
                                <span className="step-title">{step.title}</span>
                                <div className="step-icons">
                                    {notes[index] && <MessageSquare size={12} className="has-note-icon" />}
                                    {step.youtube_url && <Play size={12} className="has-video" />}
                                </div>
                            </button>
                        ))}
                    </div>
                </aside>

                {sidebarOpen && <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />}
            </div>

            {/* Keyboard Shortcuts Modal */}
            {showShortcuts && (
                <div className="modal-overlay" onClick={() => setShowShortcuts(false)}>
                    <div className="shortcuts-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3><Keyboard size={20} /> Keyboard Shortcuts</h3>
                            <button onClick={() => setShowShortcuts(false)}>
                                <X size={20} />
                            </button>
                        </div>
                        <div className="shortcuts-list">
                            <div className="shortcut"><kbd>→</kbd> atau <kbd>L</kbd><span>Langkah selanjutnya</span></div>
                            <div className="shortcut"><kbd>←</kbd> atau <kbd>H</kbd><span>Langkah sebelumnya</span></div>
                            <div className="shortcut"><kbd>Space</kbd><span>Tandai selesai/belum</span></div>
                            <div className="shortcut"><kbd>N</kbd><span>Buka/tutup catatan</span></div>
                            <div className="shortcut"><kbd>?</kbd><span>Tampilkan shortcuts</span></div>
                            <div className="shortcut"><kbd>Esc</kbd><span>Tutup panel/modal</span></div>
                        </div>
                    </div>
                </div>
            )}

            {/* Premium Unlock Modal */}
            {isPremiumLocked && (
                <div className="premium-lock-overlay">
                    <div className="premium-lock-content">
                        <div className="lock-icon"><Lock size={48} /></div>
                        <h2>Tutorial Premium</h2>
                        <p>Masukkan kode akses untuk membuka tutorial ini</p>
                        <div className="unlock-form">
                            <input
                                type="text"
                                className="unlock-input"
                                placeholder="Masukkan kode (XXXX-XXXX-XXXX)"
                                value={unlockCode}
                                onChange={(e) => setUnlockCode(e.target.value.toUpperCase())}
                                onKeyDown={(e) => e.key === 'Enter' && handleUnlock()}
                            />
                            {unlockError && <p className="unlock-error">{unlockError}</p>}
                            <button className="btn btn-primary unlock-btn" onClick={handleUnlock}>
                                <Lock size={16} /> Buka Tutorial
                            </button>
                        </div>
                        <Link href="/tutorials" className="back-link">
                            <ArrowLeft size={16} /> Kembali ke Tutorial List
                        </Link>
                    </div>
                </div>
            )}
        </div>
    );
}
