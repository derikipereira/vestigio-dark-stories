import React, { createContext, useState, useContext, useEffect, ReactNode, useCallback } from 'react';
import axios from 'axios';

export interface User {
    id: number;
    name: string;
    email: string;
}

interface AuthContextType {
    user: User | null;
    token: string | null;
    isLoading: boolean;
    login: (email: string, password: string) => Promise<boolean>;
    register: (name: string, email: string, password: string) => Promise<boolean>;
    logout: () => void;
}

interface AuthProviderProps {
    children: ReactNode;
}

const API_BASE_URL = 'http://localhost:8080';

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
        const [user, setUser] = useState<User | null>(null);
        const [token, setToken] = useState<string | null>(localStorage.getItem('jwt_token'));
        const [isLoading, setIsLoading] = useState<boolean>(true); 

        const fetchUser = useCallback(async () => {
                if (axios.defaults.headers.common['Authorization']) {
                        try {
                                const response = await axios.get<User>(`${API_BASE_URL}/api/v1/users/me`);
                                setUser(response.data);
                        } catch (error) {
                                console.error("Token inválido ou sessão expirada. Fazendo logout.");
                                logout();
                        }
                }
        }, []);

        useEffect(() => {
                const initializeAuth = async () => {
                        if (token) {
                                axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
                                await fetchUser();
                        }
                        setIsLoading(false);
                };
                initializeAuth();
        }, [token, fetchUser]);

        const login = async (email: string, password: string): Promise<boolean> => {
                try {
                        const response = await axios.post<{ token: string }>(`${API_BASE_URL}/api/v1/auth/authenticate`, { email, password });
                        const newToken = response.data.token;
                        localStorage.setItem('jwt_token', newToken);
                        setToken(newToken);
                        return true;
                } catch (error) {
                        console.error("Erro no login:", error);
                        return false;
                }
        };

        const register = async (name: string, email: string, password: string): Promise<boolean> => {
                try {
                        const response = await axios.post<{ token: string }>(`${API_BASE_URL}/api/v1/auth/register`, { name, email, password });
                        const newToken = response.data.token;
                        localStorage.setItem('jwt_token', newToken);
                        setToken(newToken);
                        return true;
                } catch (error) {
                        console.error("Erro no registro:", error);
                        return false;
                }
        };

        const logout = () => {
                localStorage.removeItem('jwt_token');
                setToken(null);
                setUser(null);
                delete axios.defaults.headers.common['Authorization'];
        };

        const value: AuthContextType = { user, token, isLoading, login, register, logout };

        if (isLoading) {
                return <div>Carregando...</div>;
        }

        return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
        const context = useContext(AuthContext);
        if (!context) {
                throw new Error('useAuth deve ser usado dentro de um AuthProvider');
        }
        return context;
};