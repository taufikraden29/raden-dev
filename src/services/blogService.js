// Blog Service - Supabase CRUD operations
import { deleteImage, handleSupabaseError, supabase, uploadImage } from '@/lib/supabaseClient';

// Get all posts (for dashboard)
export const getAllPosts = async () => {
  try {
    const { data, error } = await supabase
      .from('blog_posts')
      .select('*')
      .order('created_at', { ascending: false });

    handleSupabaseError(error);
    return data || [];
  } catch (error) {
    console.error('Error fetching posts:', error);
    return [];
  }
};

// Get published posts only (for public pages)
export const getPublishedPosts = async () => {
  try {
    const { data, error } = await supabase
      .from('blog_posts')
      .select('*')
      .eq('published', true)
      .order('created_at', { ascending: false });

    handleSupabaseError(error);
    return data || [];
  } catch (error) {
    console.error('Error fetching published posts:', error);
    return [];
  }
};

// Get single post by slug
export const getPostBySlug = async (slug) => {
  try {
    const { data, error } = await supabase
      .from('blog_posts')
      .select('*')
      .eq('slug', slug)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = not found
      handleSupabaseError(error);
    }
    return data;
  } catch (error) {
    console.error('Error fetching post by slug:', error);
    return null;
  }
};

// Get single post by ID
export const getPostById = async (id) => {
  try {
    const { data, error } = await supabase
      .from('blog_posts')
      .select('*')
      .eq('id', id)
      .single();

    if (error && error.code !== 'PGRST116') {
      handleSupabaseError(error);
    }
    return data;
  } catch (error) {
    console.error('Error fetching post by ID:', error);
    return null;
  }
};

// Create new post
export const createPost = async (postData) => {
  try {
    // Handle image upload if file is provided
    let featuredImage = postData.featuredImage;
    if (postData.imageFile instanceof File) {
      featuredImage = await uploadImage(postData.imageFile, 'posts');
    }

    const { data, error } = await supabase
      .from('blog_posts')
      .insert([{
        title: postData.title,
        slug: generateSlug(postData.title),
        excerpt: postData.excerpt,
        content: postData.content,
        category: postData.category,
        tags: postData.tags || [],
        featured_image: featuredImage,
        author: postData.author || 'Admin',
        published: postData.published || false
      }])
      .select()
      .single();

    handleSupabaseError(error);
    return data;
  } catch (error) {
    console.error('Error creating post:', error);
    throw error;
  }
};

// Update post
export const updatePost = async (id, postData) => {
  try {
    // Handle image upload if new file is provided
    let featuredImage = postData.featuredImage || postData.featured_image;
    if (postData.imageFile instanceof File) {
      // Delete old image if exists
      const oldPost = await getPostById(id);
      if (oldPost?.featured_image) {
        await deleteImage(oldPost.featured_image);
      }
      featuredImage = await uploadImage(postData.imageFile, 'posts');
    }

    const updateData = {
      title: postData.title,
      slug: generateSlug(postData.title),
      excerpt: postData.excerpt,
      content: postData.content,
      category: postData.category,
      tags: postData.tags || [],
      author: postData.author || 'Admin',
      published: postData.published
    };

    // Only update featured_image if it changed
    if (featuredImage !== undefined) {
      updateData.featured_image = featuredImage;
    }

    const { data, error } = await supabase
      .from('blog_posts')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    handleSupabaseError(error);
    return data;
  } catch (error) {
    console.error('Error updating post:', error);
    throw error;
  }
};

// Delete post
export const deletePost = async (id) => {
  try {
    // Delete associated image first
    const post = await getPostById(id);
    if (post?.featured_image) {
      await deleteImage(post.featured_image);
    }

    const { error } = await supabase
      .from('blog_posts')
      .delete()
      .eq('id', id);

    handleSupabaseError(error);
    return true;
  } catch (error) {
    console.error('Error deleting post:', error);
    throw error;
  }
};

// Search posts
export const searchPosts = async (query) => {
  try {
    const lowerQuery = query.toLowerCase();

    const { data, error } = await supabase
      .from('blog_posts')
      .select('*')
      .eq('published', true)
      .or(`title.ilike.%${lowerQuery}%,excerpt.ilike.%${lowerQuery}%`)
      .order('created_at', { ascending: false });

    handleSupabaseError(error);

    // Additional filtering for tags (since Supabase doesn't support array search in OR)
    const filtered = (data || []).filter(post =>
      post.title.toLowerCase().includes(lowerQuery) ||
      post.excerpt?.toLowerCase().includes(lowerQuery) ||
      post.tags?.some(tag => tag.toLowerCase().includes(lowerQuery))
    );

    return filtered;
  } catch (error) {
    console.error('Error searching posts:', error);
    return [];
  }
};

// Get posts by category
export const getPostsByCategory = async (category) => {
  try {
    const { data, error } = await supabase
      .from('blog_posts')
      .select('*')
      .eq('published', true)
      .eq('category', category)
      .order('created_at', { ascending: false });

    handleSupabaseError(error);
    return data || [];
  } catch (error) {
    console.error('Error fetching posts by category:', error);
    return [];
  }
};

// Get all categories
export const getAllCategories = async () => {
  try {
    const { data, error } = await supabase
      .from('blog_posts')
      .select('category')
      .not('category', 'is', null);

    handleSupabaseError(error);

    const categories = [...new Set((data || []).map(post => post.category))];
    return categories.filter(Boolean);
  } catch (error) {
    console.error('Error fetching categories:', error);
    return [];
  }
};

// Get all tags
export const getAllTags = async () => {
  try {
    const { data, error } = await supabase
      .from('blog_posts')
      .select('tags');

    handleSupabaseError(error);

    const tags = (data || []).flatMap(post => post.tags || []);
    return [...new Set(tags)];
  } catch (error) {
    console.error('Error fetching tags:', error);
    return [];
  }
};

// Generate slug from title
const generateSlug = (title) => {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
};

// Get stats
export const getStats = async () => {
  try {
    const { data, error } = await supabase
      .from('blog_posts')
      .select('id, published');

    handleSupabaseError(error);

    const posts = data || [];
    const categories = await getAllCategories();

    return {
      totalPosts: posts.length,
      publishedPosts: posts.filter(p => p.published).length,
      draftPosts: posts.filter(p => !p.published).length,
      categories: categories.length
    };
  } catch (error) {
    console.error('Error fetching stats:', error);
    return {
      totalPosts: 0,
      publishedPosts: 0,
      draftPosts: 0,
      categories: 0
    };
  }
};
