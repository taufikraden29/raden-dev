'use client';

// Custom React hooks for data fetching with TanStack Query
import * as blogService from '@/services/blogService';
import * as tutorialService from '@/services/tutorialService';
import { useQuery } from '@tanstack/react-query';

// ===== Blog Hooks =====

// Hook for fetching blog posts
export const usePosts = (publishedOnly = false) => {
    const { data: posts = [], isLoading: loading, error, refetch } = useQuery({
        queryKey: ['posts', { publishedOnly }],
        queryFn: () => publishedOnly
            ? blogService.getPublishedPosts()
            : blogService.getAllPosts(),
    });

    return { posts, loading, error: error?.message || null, refetch };
};

// Hook for fetching single post
export const usePost = (slugOrId, bySlug = true) => {
    const { data: post = null, isLoading: loading, error } = useQuery({
        queryKey: ['post', slugOrId, { bySlug }],
        queryFn: () => bySlug
            ? blogService.getPostBySlug(slugOrId)
            : blogService.getPostById(slugOrId),
        enabled: Boolean(slugOrId),
    });

    return { post, loading, error: error?.message || null };
};

// Hook for fetching categories
export const useCategories = () => {
    const { data: categories = [], isLoading: loading } = useQuery({
        queryKey: ['categories'],
        queryFn: () => blogService.getAllCategories(),
        staleTime: 10 * 60 * 1000, // Categories change rarely, cache for 10 min
    });

    return { categories, loading };
};

// Hook for blog stats
export const useBlogStats = () => {
    const { data: stats, isLoading: loading, refetch } = useQuery({
        queryKey: ['blogStats'],
        queryFn: () => blogService.getStats(),
        // Use placeholderData instead of initialData to allow proper fetching
        placeholderData: {
            totalPosts: 0,
            publishedPosts: 0,
            draftPosts: 0,
            categories: 0
        },
        staleTime: 0, // Always refetch on mount
    });

    return { stats, loading, refetch };
};

// ===== Tutorial Hooks =====

// Hook for fetching tutorials
export const useTutorials = (publishedOnly = false) => {
    const { data: tutorials = [], isLoading: loading, error } = useQuery({
        queryKey: ['tutorials', { publishedOnly }],
        queryFn: () => publishedOnly
            ? tutorialService.getPublishedTutorials()
            : tutorialService.getAllTutorials(),
    });

    return { tutorials, loading, error: error?.message || null };
};

// Hook for fetching single tutorial
export const useTutorial = (slugOrId, bySlug = true) => {
    const { data: tutorial = null, isLoading: loading, error } = useQuery({
        queryKey: ['tutorial', slugOrId, { bySlug }],
        queryFn: () => bySlug
            ? tutorialService.getTutorialBySlug(slugOrId)
            : tutorialService.getTutorialById(slugOrId),
        enabled: Boolean(slugOrId),
    });

    return { tutorial, loading, error: error?.message || null, refetch };
};

// ===== Project Scripts Hooks =====

// Hook for fetching project scripts
import * as projectScriptsService from '@/services/projectScriptsService';

export const useProjectScripts = () => {
    const { data: projects = [], isLoading: loading, error, refetch } = useQuery({
        queryKey: ['projectScripts'],
        queryFn: () => projectScriptsService.getAllProjects(),
    });

    return { projects, loading, error: error?.message || null, refetch };
};

export const useProjectScript = (id) => {
    const { data: project = null, isLoading: loading, error, refetch } = useQuery({
        queryKey: ['projectScript', id],
        queryFn: () => projectScriptsService.getProjectById(id),
        enabled: Boolean(id),
    });

    return { project, loading, error: error?.message || null, refetch };
};
