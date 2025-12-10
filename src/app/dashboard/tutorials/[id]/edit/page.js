'use client';

import { use } from 'react';
import TutorialEditorPage from '../../new/page';

export default function EditTutorialPage({ params }) {
    // In Next.js 15, params is a Promise for dynamic routes
    const resolvedParams = use(params);
    return <TutorialEditorPage params={{ id: resolvedParams.id }} />;
}
