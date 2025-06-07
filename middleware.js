import { NextResponse } from 'next/server'
import { verifyToken } from './lib/auth'

export function middleware(request) {
    // Geçici olarak middleware'i devre dışı bırak
    // Admin sayfaları kendi authentication kontrolünü yapacak
    return NextResponse.next()
}

export const config = {
    matcher: ['/admin/:path*'],
    unstable_allowDynamic: [
        '/lib/auth.js',
    ],
} 