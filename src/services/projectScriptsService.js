'use client';

// Project Scripts Service - Supabase CRUD operations
import { handleSupabaseError, supabase } from '@/lib/supabaseClient';

// Get all projects
export const getAllProjects = async () => {
  try {
    const { data, error } = await supabase
      .from('project_scripts')
      .select('*')
      .order('created_at', { ascending: false });

    handleSupabaseError(error);
    return data || [];
  } catch (error) {
    console.error('Error fetching projects:', error);
    return [];
  }
};

// Get single project by ID
export const getProjectById = async (id) => {
  try {
    const { data, error } = await supabase
      .from('project_scripts')
      .select('*')
      .eq('id', id)
      .single();

    if (error && error.code !== 'PGRST116') {
      handleSupabaseError(error);
    }
    return data;
  } catch (error) {
    console.error('Error fetching project:', error);
    return null;
  }
};

// Create new project
export const createProject = async (projectData) => {
  try {
    const { data, error } = await supabase
      .from('project_scripts')
      .insert([{
        name: projectData.name,
        description: projectData.description || '',
        path: projectData.path || '',
        scripts: projectData.scripts || [],
        tags: projectData.tags || []
      }])
      .select()
      .single();

    handleSupabaseError(error);
    return data;
  } catch (error) {
    console.error('Error creating project:', error);
    throw error;
  }
};

// Update project
export const updateProject = async (id, projectData) => {
  try {
    const { data, error } = await supabase
      .from('project_scripts')
      .update({
        name: projectData.name,
        description: projectData.description || '',
        path: projectData.path || '',
        scripts: projectData.scripts || [],
        tags: projectData.tags || [],
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    handleSupabaseError(error);
    return data;
  } catch (error) {
    console.error('Error updating project:', error);
    throw error;
  }
};

// Delete project
export const deleteProject = async (id) => {
  try {
    const { error } = await supabase
      .from('project_scripts')
      .delete()
      .eq('id', id);

    handleSupabaseError(error);
    return true;
  } catch (error) {
    console.error('Error deleting project:', error);
    throw error;
  }
};

// Search projects
export const searchProjects = async (query) => {
  try {
    const lowerQuery = query.toLowerCase();
    const { data, error } = await supabase
      .from('project_scripts')
      .select('*')
      .or(`name.ilike.%${lowerQuery}%,description.ilike.%${lowerQuery}%`)
      .order('created_at', { ascending: false });

    handleSupabaseError(error);
    return data || [];
  } catch (error) {
    console.error('Error searching projects:', error);
    return [];
  }
};
