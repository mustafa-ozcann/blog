import { NextResponse } from 'next/server'
import { prisma } from '../../../../lib/prisma'
import { verifyToken, getTokenFromHeader } from '../../../../lib/auth'

// Admin authentication check
function checkAdminAuth(request) {
    const authHeader = request.headers.get('Authorization')
    const token = getTokenFromHeader(authHeader)

    if (!token) {
        return { error: 'Giriş yapmanız gerekiyor', status: 401 }
    }

    const payload = verifyToken(token)
    if (!payload || payload.role !== 'admin') {
        return { error: 'Admin yetkisi gerekiyor', status: 403 }
    }

    return { payload }
}

// GET - Kullanıcıları listele
export async function GET(request) {
    try {
        const authResult = checkAdminAuth(request)
        if (authResult.error) {
            return NextResponse.json(
                { error: authResult.error },
                { status: authResult.status }
            )
        }

        const { searchParams } = new URL(request.url)
        const limit = parseInt(searchParams.get('limit') || '10')
        const offset = parseInt(searchParams.get('offset') || '0')

        // Kullanıcıları getir
        const users = await prisma.user.findMany({
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                bio: true,
                image: true,
                status: true,
                timeoutUntil: true,
                bannedAt: true,
                bannedReason: true,
                lastLoginAt: true,
                createdAt: true,
                updatedAt: true,
                _count: {
                    select: {
                        posts: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            },
            take: limit,
            skip: offset
        })

        // Toplam kullanıcı sayısını al
        const total = await prisma.user.count()

        return NextResponse.json({
            success: true,
            users,
            pagination: {
                total,
                limit,
                offset,
                hasMore: offset + limit < total
            }
        })

    } catch (error) {
        console.error('Get users error:', error)
        return NextResponse.json(
            { error: 'Kullanıcılar getirilemedi' },
            { status: 500 }
        )
    }
} 