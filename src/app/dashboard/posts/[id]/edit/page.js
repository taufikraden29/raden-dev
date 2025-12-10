'use client';

import { use } from 'react';
import PostEditorPage from '../../new/page';

export default function EditPostPage({ params }) {
    // In Next.js 15, params is a Promise for dynamic routes
    const resolvedParams = use(params);
    return <PostEditorPage params={{ id: resolvedParams.id }} />;
}
