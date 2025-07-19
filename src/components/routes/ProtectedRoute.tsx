'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { Spin } from 'antd'

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
    const { data: session, status } = useSession()
    const router = useRouter()

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/auth/login?callback=' + encodeURIComponent(window.location.pathname))
        }
    }, [status, router])

    if (status === 'loading') {
        return (
            <div className="flex justify-center items-center h-screen">
                <Spin size="large" />
            </div>
        )
    }

    return <>{children}</>
}
