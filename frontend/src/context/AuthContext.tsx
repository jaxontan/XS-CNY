'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, authApi } from '@/lib/api';

interface AuthContextType {
    user: User | null;
    loading: boolean;
    login: (email: string, password: string) => Promise<void>;
    register: (name: string, email: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check if user is logged in on mount
        authApi.getMe()
            .then(setUser)
            .catch(() => setUser(null))
            .finally(() => setLoading(false));
    }, []);

    const login = async (email: string, password: string) => {
        const user = await authApi.login({ email, password });
        setUser(user);
    };

    const register = async (name: string, email: string, password: string) => {
        const user = await authApi.register({ name, email, password });
        setUser(user);
    };

    const logout = async () => {
        await authApi.logout();
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
