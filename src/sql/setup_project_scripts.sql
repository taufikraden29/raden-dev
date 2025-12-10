-- ============================================
-- PROJECT SCRIPTS TABLE SETUP
-- Matches conventions from supabase_setup_v2.sql
-- ============================================

-- 0. Dependencies
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Create Table
CREATE TABLE IF NOT EXISTS project_scripts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    path TEXT,
    scripts JSONB DEFAULT '[]'::jsonb,
    tags TEXT[],
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    user_id UUID DEFAULT auth.uid() -- Optional reference, kept for compatibility
);

-- 2. Create Indexes
CREATE INDEX IF NOT EXISTS idx_project_scripts_created_at ON project_scripts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_project_scripts_name ON project_scripts(name);

-- 3. Auto-update Trigger (Reusing existing function)
-- Dropping trigger first to be idempotent
DROP TRIGGER IF EXISTS update_project_scripts_updated_at ON project_scripts;
CREATE TRIGGER update_project_scripts_updated_at BEFORE UPDATE ON project_scripts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 4. Disable RLS (Public Access as per reference)
ALTER TABLE project_scripts DISABLE ROW LEVEL SECURITY;

-- 5. Grant Public Access
GRANT ALL ON project_scripts TO anon, authenticated;

-- 6. Verification
SELECT 'project_scripts table setup complete!' as status;
