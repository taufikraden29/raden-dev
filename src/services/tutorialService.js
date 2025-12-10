// Tutorial/Guide Service - Supabase based
import { handleSupabaseError, supabase } from '@/lib/supabaseClient';

// Get all tutorials (for dashboard)
export const getAllTutorials = async () => {
    try {
        const { data, error } = await supabase
            .from('tutorials')
            .select(`
                *,
                tutorial_steps (
                    id,
                    step_order,
                    title,
                    content,
                    youtube_url
                )
            `)
            .order('created_at', { ascending: false });

        handleSupabaseError(error);

        // Transform data to match old format
        return (data || []).map(tutorial => ({
            ...tutorial,
            steps: (tutorial.tutorial_steps || []).sort((a, b) => a.step_order - b.step_order)
        }));
    } catch (error) {
        console.error('Error fetching tutorials:', error);
        return [];
    }
};

// Get published tutorials only
export const getPublishedTutorials = async () => {
    try {
        const { data, error } = await supabase
            .from('tutorials')
            .select(`
                *,
                tutorial_steps (
                    id,
                    step_order,
                    title,
                    content,
                    youtube_url
                )
            `)
            .eq('published', true)
            .order('created_at', { ascending: false });

        handleSupabaseError(error);

        return (data || []).map(tutorial => ({
            ...tutorial,
            steps: (tutorial.tutorial_steps || []).sort((a, b) => a.step_order - b.step_order)
        }));
    } catch (error) {
        console.error('Error fetching published tutorials:', error);
        return [];
    }
};

// Get tutorial by ID
export const getTutorialById = async (id) => {
    try {
        const { data, error } = await supabase
            .from('tutorials')
            .select(`
                *,
                tutorial_steps (
                    id,
                    step_order,
                    title,
                    content,
                    youtube_url
                )
            `)
            .eq('id', id)
            .single();

        if (error && error.code !== 'PGRST116') {
            handleSupabaseError(error);
        }

        if (data) {
            data.steps = (data.tutorial_steps || []).sort((a, b) => a.step_order - b.step_order);
            delete data.tutorial_steps;
        }

        return data;
    } catch (error) {
        console.error('Error fetching tutorial by ID:', error);
        return null;
    }
};

// Get tutorial by slug
export const getTutorialBySlug = async (slug) => {
    try {
        const { data, error } = await supabase
            .from('tutorials')
            .select(`
                *,
                tutorial_steps (
                    id,
                    step_order,
                    title,
                    content,
                    youtube_url
                )
            `)
            .eq('slug', slug)
            .single();

        if (error && error.code !== 'PGRST116') {
            handleSupabaseError(error);
        }

        if (data) {
            data.steps = (data.tutorial_steps || []).sort((a, b) => a.step_order - b.step_order);
            delete data.tutorial_steps;
        }

        return data;
    } catch (error) {
        console.error('Error fetching tutorial by slug:', error);
        return null;
    }
};

// Create new tutorial
export const createTutorial = async (tutorialData) => {
    try {
        const slug = tutorialData.title.toLowerCase()
            .replace(/[^a-z0-9\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-');

        // Insert tutorial
        const { data: tutorial, error: tutorialError } = await supabase
            .from('tutorials')
            .insert([{
                title: tutorialData.title,
                slug: slug,
                description: tutorialData.description,
                category: tutorialData.category,
                difficulty: tutorialData.difficulty,
                estimated_time: tutorialData.estimated_time || tutorialData.estimatedTime,
                is_premium: tutorialData.is_premium || tutorialData.isPremium || false,
                unlock_code: tutorialData.unlock_code || tutorialData.unlockCode || null,
                published: tutorialData.published !== undefined ? tutorialData.published : true
            }])
            .select()
            .single();

        handleSupabaseError(tutorialError);

        // Insert steps if provided
        if (tutorialData.steps && tutorialData.steps.length > 0) {
            const stepsData = tutorialData.steps.map((step, index) => ({
                tutorial_id: tutorial.id,
                step_order: index + 1,
                title: step.title,
                content: step.content,
                youtube_url: step.youtube_url || null
            }));

            const { error: stepsError } = await supabase
                .from('tutorial_steps')
                .insert(stepsData);

            handleSupabaseError(stepsError);
        }

        return await getTutorialById(tutorial.id);
    } catch (error) {
        console.error('Error creating tutorial:', error);
        throw error;
    }
};

// Update tutorial
export const updateTutorial = async (id, tutorialData) => {
    try {
        // Update tutorial
        const { data: tutorial, error: tutorialError } = await supabase
            .from('tutorials')
            .update({
                title: tutorialData.title,
                description: tutorialData.description,
                category: tutorialData.category,
                difficulty: tutorialData.difficulty,
                estimated_time: tutorialData.estimated_time || tutorialData.estimatedTime,
                is_premium: tutorialData.is_premium ?? tutorialData.isPremium,
                unlock_code: tutorialData.unlock_code ?? tutorialData.unlockCode,
                published: tutorialData.published
            })
            .eq('id', id)
            .select()
            .single();

        handleSupabaseError(tutorialError);

        // Update steps if provided
        if (tutorialData.steps) {
            // Delete existing steps
            await supabase
                .from('tutorial_steps')
                .delete()
                .eq('tutorial_id', id);

            // Insert new steps
            if (tutorialData.steps.length > 0) {
                const stepsData = tutorialData.steps.map((step, index) => ({
                    tutorial_id: id,
                    step_order: index + 1,
                    title: step.title,
                    content: step.content,
                    youtube_url: step.youtube_url || null
                }));

                const { error: stepsError } = await supabase
                    .from('tutorial_steps')
                    .insert(stepsData);

                handleSupabaseError(stepsError);
            }
        }

        return await getTutorialById(id);
    } catch (error) {
        console.error('Error updating tutorial:', error);
        throw error;
    }
};

// Delete tutorial
export const deleteTutorial = async (id) => {
    try {
        // Steps will be deleted automatically due to CASCADE
        const { error } = await supabase
            .from('tutorials')
            .delete()
            .eq('id', id);

        handleSupabaseError(error);
        return true;
    } catch (error) {
        console.error('Error deleting tutorial:', error);
        throw error;
    }
};

// Get all categories
export const getTutorialCategories = async () => {
    try {
        const { data, error } = await supabase
            .from('tutorials')
            .select('category')
            .not('category', 'is', null);

        handleSupabaseError(error);

        return [...new Set((data || []).map(t => t.category).filter(Boolean))];
    } catch (error) {
        console.error('Error fetching tutorial categories:', error);
        return [];
    }
};

// ===== Premium Unlock System =====

// Generate random unlock code
export const generateUnlockCode = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 12; i++) {
        if (i > 0 && i % 4 === 0) code += '-';
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
};

// Get unlocked tutorials for current user (using localStorage for user identifier)
const getUserIdentifier = () => {
    let userId = localStorage.getItem('user_identifier');
    if (!userId) {
        userId = `user_${Date.now()}_${Math.random().toString(36).substring(7)}`;
        localStorage.setItem('user_identifier', userId);
    }
    return userId;
};

// Get all unlocked tutorial IDs for current user
export const getUnlockedTutorials = async () => {
    try {
        const userIdentifier = getUserIdentifier();

        const { data, error } = await supabase
            .from('tutorial_unlocks')
            .select('tutorial_id')
            .eq('user_identifier', userIdentifier);

        handleSupabaseError(error);

        return (data || []).map(item => item.tutorial_id);
    } catch (error) {
        console.error('Error fetching unlocked tutorials:', error);
        return [];
    }
};

// Check if tutorial is unlocked
export const isTutorialUnlocked = async (tutorialId) => {
    try {
        const tutorial = await getTutorialById(tutorialId);
        if (!tutorial || !tutorial.is_premium) return true;

        const unlocked = await getUnlockedTutorials();
        return unlocked.includes(tutorialId);
    } catch (error) {
        console.error('Error checking tutorial unlock status:', error);
        return false;
    }
};

// Attempt to unlock tutorial with code
export const unlockTutorial = async (tutorialId, code) => {
    try {
        const tutorial = await getTutorialById(tutorialId);
        if (!tutorial || !tutorial.is_premium) {
            return { success: false, message: 'Tutorial tidak ditemukan' };
        }

        if (!tutorial.unlock_code) {
            return { success: false, message: 'Tutorial ini tidak memiliki kode akses' };
        }

        // Compare codes (case insensitive, remove dashes)
        const cleanInput = code.replace(/-/g, '').toUpperCase();
        const cleanCode = tutorial.unlock_code.replace(/-/g, '').toUpperCase();

        if (cleanInput !== cleanCode) {
            return { success: false, message: 'Kode tidak valid' };
        }

        // Save to database
        const userIdentifier = getUserIdentifier();

        const { error } = await supabase
            .from('tutorial_unlocks')
            .insert([{
                tutorial_id: tutorialId,
                user_identifier: userIdentifier
            }]);

        // Ignore duplicate key error
        if (error && error.code !== '23505') {
            handleSupabaseError(error);
        }

        return { success: true, message: 'Tutorial berhasil dibuka!' };
    } catch (error) {
        console.error('Error unlocking tutorial:', error);
        return { success: false, message: 'Terjadi kesalahan' };
    }
};

// Remove unlock (for admin/testing)
export const lockTutorial = async (tutorialId) => {
    try {
        const userIdentifier = getUserIdentifier();

        const { error } = await supabase
            .from('tutorial_unlocks')
            .delete()
            .eq('tutorial_id', tutorialId)
            .eq('user_identifier', userIdentifier);

        handleSupabaseError(error);
    } catch (error) {
        console.error('Error locking tutorial:', error);
    }
};
