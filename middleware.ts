import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

// Add all routes that need protection
const protectedRoutes = ['/dashboard', '/data-entry', '/waste-info', '/api', '/settings']

export async function middleware(req: NextRequest) {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })

    const { pathname } = req.nextUrl

    const isProtected = protectedRoutes.some((route) =>
        pathname.startsWith(route)
    )

    if (isProtected && !token) {
        const loginUrl = new URL('/login', req.url)
        loginUrl.searchParams.set('callbackUrl', req.url)
        return NextResponse.redirect(loginUrl)
    }

    return NextResponse.next()
}

export const config = {
    matcher: [
        '/dashboard/:path*',
        '/data-entry/:path*',
        '/waste-info/:path*',
        '/api/:path*',
        '/settings/:path*'
    ],
}