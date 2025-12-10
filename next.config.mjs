/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: '**.supabase.co',
            },
            {
                protocol: 'https',
                hostname: '**.supabase.in',
            },
            {
                protocol: 'https',
                hostname: 'cdn.prod.website-files.com',
            },
            {
                protocol: 'https',
                hostname: '**.unsplash.com',
            },
            {
                protocol: 'https',
                hostname: '**.githubusercontent.com',
            },
            {
                protocol: 'https',
                hostname: '**.cloudinary.com',
            },
            {
                protocol: 'https',
                hostname: '**.imgix.net',
            },
        ],
        // Allow any domain for development flexibility
        // Remove this in production if you want strict control
        unoptimized: false,
    },
};

export default nextConfig;

