"use client";

import React, { createContext, useState, useContext, ReactNode } from "react";

interface User {
    username: string;
    roleId?: number;
}

interface AuthContextType {
    isAuthenticated: boolean;
    user: User | null;
    login: (username: string, roleId?: number) => void;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [user, setUser] = useState<User | null>(null);

    const login = (username: string, roleId?: number) => {
        setIsAuthenticated(true);
        setUser({ username, roleId });
    };

    const logout = () => {
        setIsAuthenticated(false);
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ isAuthenticated, user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};
