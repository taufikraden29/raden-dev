'use client';

import { createContext, useContext, useEffect, useState } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Check session on mount (client-side only)
        if (typeof window !== 'undefined') {
            const session = sessionStorage.getItem('blog_auth');
            if (session === 'authenticated') {
                setIsAuthenticated(true);
            }
        }
        setIsLoading(false);
    }, []);

    const login = async (username, password) => {
        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password }),
            });

            const data = await res.json();

            if (data.success) {
                sessionStorage.setItem('blog_auth', 'authenticated');
                setIsAuthenticated(true);
                return { success: true };
            }
            return { success: false, error: data.error || 'Invalid credentials' };
        } catch (error) {
            return { success: false, error: 'Login failed' };
        }
    };

    const logout = () => {
        sessionStorage.removeItem('blog_auth');
        setIsAuthenticated(false);
    };

    return (
        <AuthContext.Provider value={{ isAuthenticated, isLoading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    // Return default values for SSR/build time when not in provider
    if (!context) {
        return { isAuthenticated: false, isLoading: true, login: async () => ({ success: false }), logout: () => { } };
    }
    return context;
};
