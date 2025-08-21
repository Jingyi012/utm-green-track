"use client";

import { createContext, useContext, useEffect, useState } from "react";

type User = {
    id: string;
    userName: string;
    email: string;
    roles: string[];
    jwToken: string;
} | null;

interface AuthContextType {
    user: User;
    roles: string[];
    login: (data: User) => void;
    logout: () => void;
    hasRole: (role: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User>(null);

    useEffect(() => {
        const storedUser = localStorage.getItem("currentUser");
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
    }, []);

    const login = (data: User) => {
        if (data) {
            localStorage.setItem("currentUser", JSON.stringify(data));
            setUser(data);
        }
    };

    const logout = () => {
        localStorage.removeItem("currentUser");
        setUser(null);
    };

    const hasRole = (role: string) => {
        return user?.roles?.includes(role) ?? false;
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                roles: user?.roles ?? [],
                login,
                logout,
                hasRole,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error("useAuth must be used within AuthProvider");
    return ctx;
};
