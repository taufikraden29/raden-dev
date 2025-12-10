import '@/app/globals.css';
import { AuthProvider } from '@/contexts/authContext';
import QueryProvider from '@/lib/QueryProvider';
import { Toaster } from 'sonner';

export const metadata = {
    title: 'Personal Dev Docs',
    description: 'Documentation & Tutorials for developers',
};

export default function RootLayout({ children }) {
    return (
        <html lang="en" data-scroll-behavior="smooth">
            <body>
                <QueryProvider>
                    <AuthProvider>
                        {children}
                        <Toaster
                            position="top-right"
                            toastOptions={{
                                duration: 3000,
                                style: {
                                    background: 'var(--color-bg-card)',
                                    color: 'var(--color-text-primary)',
                                    border: '1px solid var(--color-border)',
                                },
                            }}
                        />
                    </AuthProvider>
                </QueryProvider>
            </body>
        </html>
    );
}

