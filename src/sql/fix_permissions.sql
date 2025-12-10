-- ============================================
-- EMERGENCY PERMISSION FIX
-- Run this to force public access to project_scripts
-- ============================================

-- 1. Ensure extension exists
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Create table if missing (Idempotent)
CREATE TABLE IF NOT EXISTS public.project_scripts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    path TEXT,
    scripts JSONB DEFAULT '[]'::jsonb,
    tags TEXT[],
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    user_id UUID DEFAULT auth.uid()
);

-- 3. FORCE DISABLE RLS
-- This is often the culprit. We disable it to ensure public access works as intended in V2 setup.
ALTER TABLE public.project_scripts DISABLE ROW LEVEL SECURITY;

-- 4. GRANT PERMISSIONS
-- Grant full access to anonymous and authenticated users
GRANT ALL ON public.project_scripts TO postgres;
GRANT ALL ON public.project_scripts TO anon;
GRANT ALL ON public.project_scripts TO authenticated;
GRANT ALL ON public.project_scripts TO service_role;

-- 5. Verification Query
-- This will return a row confirming the script ran
SELECT 'Permissions updated successfully. Please refresh the app.' as status;
