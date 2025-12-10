'use client';

import { createContext, useContext, useEffect, useState } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Check session on mount
        const session = sessionStorage.getItem('blog_auth');
        if (session === 'authenticated') {
            setIsAuthenticated(true);
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
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
