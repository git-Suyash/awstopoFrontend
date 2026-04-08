import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
    id: string;
    name: string;
    email: string;
}

interface AuthContextType {
    user: User | null;
    token: string | null;
    login: (email: string, password: string) => Promise<void>;
    register: (name: string, email: string, password: string) => Promise<void>;
    logout: () => void;
    loading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function useAuth(): AuthContextType {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used within AuthProvider');
    return ctx;
}

const API_BASE = import.meta.env.VITE_API_BASE_URL || '';

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    // Hydrate from localStorage on mount
    useEffect(() => {
        const savedToken = localStorage.getItem('auth_token');
        const savedUser = localStorage.getItem('auth_user');
        if (savedToken && savedUser) {
            setToken(savedToken);
            setUser(JSON.parse(savedUser));
        }
        setLoading(false);
    }, []);

    const login = async (email: string, password: string) => {
        if (API_BASE) {
            const res = await fetch(`${API_BASE}/api/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });
            if (!res.ok) {
                const err = await res.json().catch(() => ({}));
                throw new Error(err.message || 'Login failed');
            }
            const data = await res.json();
            setToken(data.token);
            setUser(data.user);
            localStorage.setItem('auth_token', data.token);
            localStorage.setItem('auth_user', JSON.stringify(data.user));
        } else {
            // Mock login for development
            const mockUser: User = { id: '1', name: email.split('@')[0], email };
            const mockToken = 'mock-jwt-token-' + Date.now();
            setToken(mockToken);
            setUser(mockUser);
            localStorage.setItem('auth_token', mockToken);
            localStorage.setItem('auth_user', JSON.stringify(mockUser));
        }
    };

    const register = async (name: string, email: string, password: string) => {
        if (API_BASE) {
            const res = await fetch(`${API_BASE}/api/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, password }),
            });
            if (!res.ok) {
                const err = await res.json().catch(() => ({}));
                throw new Error(err.message || 'Registration failed');
            }
            const data = await res.json();
            setToken(data.token);
            setUser(data.user);
            localStorage.setItem('auth_token', data.token);
            localStorage.setItem('auth_user', JSON.stringify(data.user));
        } else {
            // Mock register
            const mockUser: User = { id: '1', name, email };
            const mockToken = 'mock-jwt-token-' + Date.now();
            setToken(mockToken);
            setUser(mockUser);
            localStorage.setItem('auth_token', mockToken);
            localStorage.setItem('auth_user', JSON.stringify(mockUser));
        }
    };

    const logout = () => {
        setToken(null);
        setUser(null);
        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth_user');
    };

    return (
        <AuthContext.Provider value={{ user, token, login, register, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
}
