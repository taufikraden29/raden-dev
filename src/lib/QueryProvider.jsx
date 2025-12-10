'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';

// Create a client-side QueryClient with default options
function makeQueryClient() {
    return new QueryClient({
        defaultOptions: {
            queries: {
                // Data considered fresh for 5 minutes
                staleTime: 5 * 60 * 1000,
                // Cache data for 30 minutes
                gcTime: 30 * 60 * 1000,
                // Retry failed requests once
                retry: 1,
                // Refetch on window focus
                refetchOnWindowFocus: false,
            },
        },
    });
}

let browserQueryClient = undefined;

function getQueryClient() {
    if (typeof window === 'undefined') {
        // Server: always create a new query client
        return makeQueryClient();
    } else {
        // Browser: reuse existing query client
        if (!browserQueryClient) {
            browserQueryClient = makeQueryClient();
        }
        return browserQueryClient;
    }
}

export default function QueryProvider({ children }) {
    const [queryClient] = useState(() => getQueryClient());

    return (
        <QueryClientProvider client={queryClient}>
            {children}
        </QueryClientProvider>
    );
}
