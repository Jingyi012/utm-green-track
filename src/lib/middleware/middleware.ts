// middleware.ts
import { NextRequest, NextResponse } from 'next/server';
import { authAdmin } from '../firebase/firebaseAdmin';

export async function middleware(req: NextRequest) {
    const token = req.headers.get('authorization')?.split('Bearer ')[1];

    if (!token) {
        return NextResponse.redirect(new URL('/auth/login', req.url));
    }

    try {
        const decodedToken = await authAdmin.verifyIdToken(token);
        const { role } = decodedToken;

        // Optional: Protect routes by role
        // const pathname = req.nextUrl.pathname;
        // if (pathname.startsWith('/admin') && role !== 'admin') {
        //     return NextResponse.redirect(new URL('/unauthorized', req.url));
        // }

        // Pass user info to request
        const requestHeaders = new Headers(req.headers);
        requestHeaders.set('x-user-id', decodedToken.uid);
        requestHeaders.set('x-user-role', role || '');

        return NextResponse.next({
            request: {
                headers: requestHeaders,
            },
        });
    } catch (err) {
        return NextResponse.redirect(new URL('/auth/login', req.url));
    }
}
