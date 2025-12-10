import { Toaster } from 'react-hot-toast';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './contexts/authContext';

// Public Pages
import AboutPage from './pages/public/AboutPage';
import BlogDetailPage from './pages/public/BlogDetailPage';
import BlogListPage from './pages/public/BlogListPage';
import HomePage from './pages/public/HomePage';
import PortfolioPage from './pages/public/PortfolioPage';
import PublicLayout from './pages/public/PublicLayout';
import TutorialDetailPage from './pages/public/TutorialDetailPage';
import TutorialsPage from './pages/public/TutorialsPage';

// Dashboard Pages
import DashboardHome from './pages/dashboard/DashboardHome';
import DashboardLayout from './pages/dashboard/DashboardLayout';
import LoginPage from './pages/dashboard/LoginPage';
import PostEditorPage from './pages/dashboard/PostEditorPage';
import PostsPage from './pages/dashboard/PostsPage';
import SettingsPage from './pages/dashboard/SettingsPage';
import TutorialEditorPage from './pages/dashboard/TutorialEditorPage';
import TutorialsListPage from './pages/dashboard/TutorialsListPage';

import './index.css';

function App() {
  return (
    <AuthProvider>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: 'var(--color-bg-card)',
            color: 'var(--color-text-primary)',
            border: '1px solid var(--color-border)',
          },
          success: {
            iconTheme: {
              primary: 'var(--color-success)',
              secondary: 'white',
            },
          },
          error: {
            iconTheme: {
              primary: 'var(--color-error)',
              secondary: 'white',
            },
          },
        }}
      />
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<PublicLayout />}>
            <Route index element={<HomePage />} />
            <Route path="blog" element={<BlogListPage />} />
            <Route path="blog/:slug" element={<BlogDetailPage />} />
            <Route path="tutorials" element={<TutorialsPage />} />
            <Route path="tutorials/:slug" element={<TutorialDetailPage />} />
            <Route path="portfolio" element={<PortfolioPage />} />
            <Route path="about" element={<AboutPage />} />
          </Route>

          {/* Dashboard Routes */}
          <Route path="/dashboard/login" element={<LoginPage />} />
          <Route path="/dashboard" element={<DashboardLayout />}>
            <Route index element={<DashboardHome />} />
            <Route path="posts" element={<PostsPage />} />
            <Route path="posts/new" element={<PostEditorPage />} />
            <Route path="posts/:id/edit" element={<PostEditorPage />} />
            <Route path="tutorials" element={<TutorialsListPage />} />
            <Route path="tutorials/new" element={<TutorialEditorPage />} />
            <Route path="tutorials/:id/edit" element={<TutorialEditorPage />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
