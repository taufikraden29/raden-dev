-- ============================================
-- SUPABASE SETUP SQL - SIMPLIFIED (NO AUTH)
-- Personal Blog Database Schema
-- ============================================
-- Run this entire script in your Supabase SQL Editor
-- This creates all tables with PUBLIC access (no authentication required)
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- DROP EXISTING TABLES (if re-running)
-- ============================================
DROP TABLE IF EXISTS tutorial_unlocks CASCADE;
DROP TABLE IF EXISTS tutorial_steps CASCADE;
DROP TABLE IF EXISTS tutorials CASCADE;
DROP TABLE IF EXISTS social_links CASCADE;
DROP TABLE IF EXISTS settings CASCADE;
DROP TABLE IF EXISTS blog_posts CASCADE;

-- ============================================
-- CREATE TABLES
-- ============================================

-- 1. Blog Posts Table
CREATE TABLE blog_posts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    excerpt TEXT,
    content TEXT NOT NULL,
    category TEXT,
    tags TEXT[] DEFAULT '{}',
    featured_image TEXT,
    author TEXT DEFAULT 'Admin',
    published BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for better performance
CREATE INDEX idx_blog_posts_slug ON blog_posts(slug);
CREATE INDEX idx_blog_posts_published ON blog_posts(published);
CREATE INDEX idx_blog_posts_category ON blog_posts(category);
CREATE INDEX idx_blog_posts_created_at ON blog_posts(created_at DESC);

-- 2. Tutorials Table
CREATE TABLE tutorials (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    category TEXT,
    difficulty TEXT CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
    estimated_time TEXT,
    thumbnail TEXT,
    is_premium BOOLEAN DEFAULT false,
    unlock_code TEXT,
    published BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_tutorials_slug ON tutorials(slug);
CREATE INDEX idx_tutorials_published ON tutorials(published);
CREATE INDEX idx_tutorials_category ON tutorials(category);

-- 3. Tutorial Steps Table
CREATE TABLE tutorial_steps (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tutorial_id UUID NOT NULL REFERENCES tutorials(id) ON DELETE CASCADE,
    step_order INTEGER NOT NULL,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(tutorial_id, step_order)
);

CREATE INDEX idx_tutorial_steps_tutorial_id ON tutorial_steps(tutorial_id);
CREATE INDEX idx_tutorial_steps_order ON tutorial_steps(tutorial_id, step_order);

-- 4. Settings Table (stores JSON configuration)
CREATE TABLE settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    section TEXT UNIQUE NOT NULL,
    data JSONB NOT NULL DEFAULT '{}',
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_settings_section ON settings(section);

-- 5. Social Links Table
CREATE TABLE social_links (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    platform TEXT NOT NULL,
    url TEXT NOT NULL,
    icon TEXT NOT NULL,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_social_links_order ON social_links(display_order);

-- 6. Tutorial Unlocks Table
CREATE TABLE tutorial_unlocks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tutorial_id UUID NOT NULL REFERENCES tutorials(id) ON DELETE CASCADE,
    user_identifier TEXT NOT NULL,
    unlocked_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(tutorial_id, user_identifier)
);

CREATE INDEX idx_tutorial_unlocks_tutorial_id ON tutorial_unlocks(tutorial_id);
CREATE INDEX idx_tutorial_unlocks_user ON tutorial_unlocks(user_identifier);

-- ============================================
-- AUTO-UPDATE TIMESTAMP FUNCTION
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply triggers
CREATE TRIGGER update_blog_posts_updated_at BEFORE UPDATE ON blog_posts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tutorials_updated_at BEFORE UPDATE ON tutorials
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_settings_updated_at BEFORE UPDATE ON settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- DISABLE RLS (No Authentication Required)
-- ============================================

ALTER TABLE blog_posts DISABLE ROW LEVEL SECURITY;
ALTER TABLE tutorials DISABLE ROW LEVEL SECURITY;
ALTER TABLE tutorial_steps DISABLE ROW LEVEL SECURITY;
ALTER TABLE settings DISABLE ROW LEVEL SECURITY;
ALTER TABLE social_links DISABLE ROW LEVEL SECURITY;
ALTER TABLE tutorial_unlocks DISABLE ROW LEVEL SECURITY;

-- ============================================
-- GRANT PUBLIC ACCESS
-- ============================================

GRANT ALL ON blog_posts TO anon, authenticated;
GRANT ALL ON tutorials TO anon, authenticated;
GRANT ALL ON tutorial_steps TO anon, authenticated;
GRANT ALL ON settings TO anon, authenticated;
GRANT ALL ON social_links TO anon, authenticated;
GRANT ALL ON tutorial_unlocks TO anon, authenticated;

-- Grant sequence permissions
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;

-- ============================================
-- STORAGE BUCKET FOR IMAGES
-- ============================================

-- Create storage bucket for blog images
INSERT INTO storage.buckets (id, name, public)
VALUES ('blog-images', 'blog-images', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Public Upload" ON storage.objects;
DROP POLICY IF EXISTS "Public Update" ON storage.objects;
DROP POLICY IF EXISTS "Public Delete" ON storage.objects;

-- Create storage policies for public access
CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'blog-images');
CREATE POLICY "Public Upload" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'blog-images');
CREATE POLICY "Public Update" ON storage.objects FOR UPDATE USING (bucket_id = 'blog-images');
CREATE POLICY "Public Delete" ON storage.objects FOR DELETE USING (bucket_id = 'blog-images');

-- ============================================
-- INSERT DEFAULT SETTINGS DATA
-- ============================================

-- Hero Section Settings
INSERT INTO settings (section, data) VALUES
('hero', '{
    "badge": "Welcome to My Blog",
    "title": "Hi, I am",
    "titleHighlight": "Your Name",
    "titleSuffix": "Full Stack Developer",
    "description": "I build modern web applications with React, Node.js, and more. Sharing my journey and knowledge through tutorials and blog posts.",
    "primaryButtonText": "View My Work",
    "secondaryButtonText": "Read Blog"
}'::jsonb)
ON CONFLICT (section) DO NOTHING;

-- Stats Section Settings
INSERT INTO settings (section, data) VALUES
('stats', '{
    "showStats": true,
    "stat1Value": "50+",
    "stat1Label": "Projects",
    "stat2Value": "100+",
    "stat2Label": "Blog Posts",
    "stat3Value": "1000+",
    "stat3Label": "Happy Readers"
}'::jsonb)
ON CONFLICT (section) DO NOTHING;

-- Features Section Settings
INSERT INTO settings (section, data) VALUES
('features', '[
    {
        "icon": "Code",
        "title": "Clean Code",
        "description": "Writing maintainable and scalable code following best practices"
    },
    {
        "icon": "BookOpen",
        "title": "Tutorials",
        "description": "Step-by-step guides to help you learn new technologies"
    },
    {
        "icon": "Zap",
        "title": "Performance",
        "description": "Building fast and optimized web applications"
    }
]'::jsonb)
ON CONFLICT (section) DO NOTHING;

-- CTA Section Settings
INSERT INTO settings (section, data) VALUES
('cta', '{
    "title": "Ready to Start Your Journey?",
    "description": "Join me in exploring the world of web development. Subscribe to get the latest tutorials and articles.",
    "buttonText": "Get Started"
}'::jsonb)
ON CONFLICT (section) DO NOTHING;

-- Profile Settings
INSERT INTO settings (section, data) VALUES
('profile', '{
    "name": "Your Name",
    "role": "Full Stack Developer",
    "location": "Your Location",
    "bio": "Passionate developer with expertise in modern web technologies. I love building scalable applications and sharing knowledge with the community.",
    "skills": [
        {
            "category": "Frontend",
            "items": ["React", "Vue.js", "TypeScript", "Tailwind CSS"]
        },
        {
            "category": "Backend",
            "items": ["Node.js", "Express", "PostgreSQL", "MongoDB"]
        },
        {
            "category": "Tools",
            "items": ["Git", "Docker", "VS Code", "Figma"]
        }
    ]
}'::jsonb)
ON CONFLICT (section) DO NOTHING;

-- Site Settings
INSERT INTO settings (section, data) VALUES
('site', '{
    "logoText": "MyBlog",
    "footerDescription": "A personal blog about web development, tutorials, and tech insights.",
    "aboutBlogTitle": "About This Blog",
    "aboutBlogDescription": "This blog is dedicated to sharing knowledge about web development, programming tutorials, and technology insights. Whether you are a beginner or an experienced developer, you will find valuable content here."
}'::jsonb)
ON CONFLICT (section) DO NOTHING;

-- Portfolio Settings
INSERT INTO settings (section, data) VALUES
('portfolio', '{
    "title": "My Portfolio",
    "subtitle": "Check out my recent projects and work",
    "projects": [
        {
            "id": "1",
            "title": "E-Commerce Platform",
            "description": "A full-stack e-commerce solution with React and Node.js",
            "image": "https://images.unsplash.com/photo-1557821552-17105176677c?w=600",
            "tags": ["React", "Node.js", "MongoDB"],
            "liveUrl": "https://example.com",
            "githubUrl": "https://github.com",
            "featured": true
        },
        {
            "id": "2",
            "title": "Task Management App",
            "description": "A productivity app for managing tasks and projects",
            "image": "https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=600",
            "tags": ["Vue.js", "Firebase", "Tailwind"],
            "liveUrl": "https://example.com",
            "githubUrl": "https://github.com",
            "featured": false
        }
    ]
}'::jsonb)
ON CONFLICT (section) DO NOTHING;

-- ============================================
-- INSERT DEFAULT SOCIAL LINKS
-- ============================================

INSERT INTO social_links (platform, url, icon, display_order) VALUES
('GitHub', 'https://github.com/yourusername', 'Github', 1),
('Twitter', 'https://twitter.com/yourusername', 'Twitter', 2),
('LinkedIn', 'https://linkedin.com/in/yourusername', 'Linkedin', 3),
('Email', 'mailto:your.email@example.com', 'Mail', 4)
ON CONFLICT DO NOTHING;

-- ============================================
-- INSERT SAMPLE BLOG POST
-- ============================================

INSERT INTO blog_posts (title, slug, excerpt, content, category, tags, published) VALUES
(
    'Getting Started with React',
    'getting-started-with-react',
    'Learn the basics of React and start building modern web applications.',
    '# Getting Started with React

React is a popular JavaScript library for building user interfaces. In this tutorial, we will cover the basics.

## What is React?

React is a declarative, efficient, and flexible JavaScript library for building user interfaces.

## Installation

```bash
npx create-react-app my-app
cd my-app
npm start
```

## Your First Component

```jsx
function Welcome() {
  return <h1>Hello, React!</h1>;
}
```

Happy coding!',
    'React',
    ARRAY['React', 'JavaScript', 'Tutorial'],
    true
)
ON CONFLICT (slug) DO NOTHING;

-- ============================================
-- INSERT SAMPLE TUTORIAL
-- ============================================

INSERT INTO tutorials (title, slug, description, category, difficulty, estimated_time, published) VALUES
(
    'Build a Todo App with React',
    'build-todo-app-react',
    'Learn how to build a complete todo application using React hooks',
    'React',
    'beginner',
    '30 minutes',
    true
)
ON CONFLICT (slug) DO NOTHING;

-- Insert tutorial steps
INSERT INTO tutorial_steps (tutorial_id, step_order, title, content)
SELECT
    t.id,
    1,
    'Setup Project',
    'Create a new React project using Create React App'
FROM tutorials t WHERE t.slug = 'build-todo-app-react'
ON CONFLICT (tutorial_id, step_order) DO NOTHING;

INSERT INTO tutorial_steps (tutorial_id, step_order, title, content)
SELECT
    t.id,
    2,
    'Create Components',
    'Build the TodoList and TodoItem components'
FROM tutorials t WHERE t.slug = 'build-todo-app-react'
ON CONFLICT (tutorial_id, step_order) DO NOTHING;

INSERT INTO tutorial_steps (tutorial_id, step_order, title, content)
SELECT
    t.id,
    3,
    'Add State Management',
    'Use useState hook to manage todo items'
FROM tutorials t WHERE t.slug = 'build-todo-app-react'
ON CONFLICT (tutorial_id, step_order) DO NOTHING;

-- ============================================
-- VERIFICATION
-- ============================================

-- Check if all tables were created
SELECT
    'Tables created successfully!' as status,
    COUNT(*) as table_count
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('blog_posts', 'tutorials', 'tutorial_steps', 'settings', 'social_links', 'tutorial_unlocks');

-- Show sample data counts
SELECT 'blog_posts' as table_name, COUNT(*) as count FROM blog_posts
UNION ALL
SELECT 'tutorials', COUNT(*) FROM tutorials
UNION ALL
SELECT 'tutorial_steps', COUNT(*) FROM tutorial_steps
UNION ALL
SELECT 'settings', COUNT(*) FROM settings
UNION ALL
SELECT 'social_links', COUNT(*) FROM social_links;

-- ============================================
-- SETUP COMPLETE!
-- ============================================
-- Your database is now ready to use.
-- All tables have public access (no authentication required).
-- You can now start using your application!
-- ============================================
