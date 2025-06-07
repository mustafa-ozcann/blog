import { NextResponse } from 'next/server'
import { prisma } from '../../../../lib/prisma'
import { verifyToken, getTokenFromHeader } from '../../../../lib/auth'

export const runtime = 'nodejs'

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

// GET - Tüm blogları getir (admin için)
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
        const status = searchParams.get('status') || 'all'

        // Status filtreleme
        let where = {}
        if (status !== 'all') {
            where.status = status
        }

        // Blogları getir
        const blogs = await prisma.post.findMany({
            where,
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        image: true
                    }
                },
                category: {
                    select: {
                        id: true,
                        name: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            },
            take: limit,
            skip: offset
        })

        // Toplam blog sayısını al
        const total = await prisma.post.count({ where })

        return NextResponse.json({
            success: true,
            blogs,
            pagination: {
                total,
                limit,
                offset,
                hasMore: offset + limit < total
            }
        })

    } catch (error) {
        console.error('Admin get blogs error:', error)
        return NextResponse.json(
            { error: 'Bloglar getirilemedi' },
            { status: 500 }
        )
    }
} 