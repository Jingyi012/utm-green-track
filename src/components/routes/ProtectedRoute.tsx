'use client'

import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { Spin } from 'antd'

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
    const { isAuthenticated, isLoading } = useAuth()
    const router = useRouter()

    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            router.push('/auth/login?callback=' + encodeURIComponent(window.location.pathname))
        }
    }, [isAuthenticated, isLoading, router])

    if (isLoading || !isAuthenticated) {
        return (
            <div className="flex justify-center items-center h-screen">
                <Spin size="large" />
                <div className="ml-4 text-lg">Loading...</div>
            </div>
        )
    }

    return <>{children}</>
}