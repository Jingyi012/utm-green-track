'use client'
import { createContext, useContext, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { logout as firebaseLogout, refreshIdToken } from '@/lib/services/user.service';

type User = {
    id: string
    name: string
    email: string
    role?: string
} | null

type AuthContextType = {
    user: User
    token: string | null
    isAuthenticated: boolean
    isLoading: boolean
    login: (token: string, userData: User) => Promise<void>
    logout: () => Promise<void>
    refreshAuth: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User>(null)
    const [token, setToken] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const router = useRouter()

    // Initialize authentication state
    useEffect(() => {
        const initializeAuth = async () => {
            const storedToken = localStorage.getItem('token')
            const storedUser = localStorage.getItem('user')

            if (storedToken && storedUser) {
                try {
                    // Verify token with backend in production
                    setToken(storedToken)
                    setUser(JSON.parse(storedUser))
                } catch (error) {
                    clearAuth()
                }
            }
            setIsLoading(false)
        }

        initializeAuth()
    }, [])

    const clearAuth = () => {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        setToken(null)
        setUser(null)
    }

    const login = async (newToken: string, userData: User) => {
        localStorage.setItem('token', newToken)
        localStorage.setItem('user', JSON.stringify(userData))
        setToken(newToken)
        setUser(userData)
        router.push('/dashboard')
    }

    const logout = async () => {
        // Add API call to invalidate token in production
        await firebaseLogout();
        clearAuth()
        router.push('/auth/login')
    }

    const refreshAuth = async () => {
        try {
            const newToken = await refreshIdToken();
            const storedUser = JSON.parse(localStorage.getItem('user') || 'null');

            if (storedUser) {
                setUser(storedUser);
            }

            setToken(newToken);
            localStorage.setItem('token', newToken);
        } catch (error) {
            console.error('Failed to refresh token:', error);
            await logout();
        }
    };

    return (
        <AuthContext.Provider value={{
            user,
            token,
            isAuthenticated: !!token,
            isLoading,
            login,
            logout,
            refreshAuth
        }}>
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => {
    const context = useContext(AuthContext)
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider')
    }
    return context
}