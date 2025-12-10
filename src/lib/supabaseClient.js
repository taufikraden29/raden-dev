import { createBrowserClient } from '@supabase/ssr';

let supabaseClient = null;

export function createClient() {
    if (supabaseClient) return supabaseClient;

    supabaseClient = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );

    return supabaseClient;
}

// For backward compatibility with existing services
export const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

// Helper function to handle Supabase errors
export const handleSupabaseError = (error) => {
    if (error) {
        console.error('Supabase error details:', JSON.stringify(error, null, 2));
        console.error('Supabase error object:', error);
        throw new Error(error.message || 'An error occurred with the database');
    }
};

// Helper function to upload image to Supabase Storage
export const uploadImage = async (file, folder = 'posts') => {
    try {
        const fileExt = file.name.split('.').pop();
        const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

        const { data, error } = await supabase.storage
            .from('blog-images')
            .upload(fileName, file, {
                cacheControl: '3600',
                upsert: false
            });

        if (error) throw error;

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
            .from('blog-images')
            .getPublicUrl(data.path);

        return publicUrl;
    } catch (error) {
        console.error('Error uploading image:', error);
        throw error;
    }
};

// Helper function to delete image from Supabase Storage
export const deleteImage = async (imageUrl) => {
    try {
        // Extract path from URL
        const urlParts = imageUrl.split('/blog-images/');
        if (urlParts.length < 2) return;

        const filePath = urlParts[1];

        const { error } = await supabase.storage
            .from('blog-images')
            .remove([filePath]);

        if (error) throw error;
    } catch (error) {
        console.error('Error deleting image:', error);
        // Don't throw error for image deletion failures
    }
};

export default supabase;
