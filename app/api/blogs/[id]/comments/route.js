import { NextResponse } from 'next/server'
import { prisma } from '../../../../../lib/prisma'
import { verifyToken } from '../../../../../lib/auth'

// GET - Blog yorumlarını getir
export async function GET(request, { params }) {
    try {
        const { id } = await params
        const blogId = parseInt(id)

        if (!blogId || isNaN(blogId)) {
            return NextResponse.json({ error: 'Geçerli bir blog ID\'si gerekli' }, { status: 400 })
        }

        const { searchParams } = new URL(request.url)
        const limit = parseInt(searchParams.get('limit') || '20')
        const offset = parseInt(searchParams.get('offset') || '0')

        const comments = await prisma.comment.findMany({
            where: {
                postId: blogId
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        image: true,
                        role: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            },
            skip: offset,
            take: limit
        })

        const total = await prisma.comment.count({
            where: { postId: blogId }
        })

        return NextResponse.json({
            comments,
            pagination: {
                total,
                limit,
                offset,
                hasMore: offset + limit < total
            }
        })

    } catch (error) {
        console.error('Get comments error:', error)
        return NextResponse.json({ error: 'Yorumlar getirilemedi' }, { status: 500 })
    }
}

// POST - Yeni yorum ekle
export async function POST(request, { params }) {
    try {
        const { id } = await params
        const blogId = parseInt(id)

        if (!blogId || isNaN(blogId)) {
            return NextResponse.json({ error: 'Geçerli bir blog ID\'si gerekli' }, { status: 400 })
        }

        const token = request.headers.get('authorization')?.replace('Bearer ', '')

        if (!token) {
            return NextResponse.json({ error: 'Giriş yapmanız gerekiyor' }, { status: 401 })
        }

        const decoded = verifyToken(token)

        if (!decoded || !decoded.id) {
            return NextResponse.json({ error: 'Geçersiz token' }, { status: 401 })
        }

        const { content } = await request.json()

        if (!content || content.trim().length < 3) {
            return NextResponse.json({ error: 'Yorum en az 3 karakter olmalıdır' }, { status: 400 })
        }

        // Blog exists check
        const blog = await prisma.post.findUnique({
            where: { id: blogId }
        })

        if (!blog) {
            return NextResponse.json({ error: 'Blog bulunamadı' }, { status: 404 })
        }

        // Create comment
        const comment = await prisma.comment.create({
            data: {
                content: content.trim(),
                userId: decoded.id,
                postId: blogId
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        image: true,
                        role: true
                    }
                }
            }
        })

        return NextResponse.json({
            success: true,
            message: 'Yorum başarıyla eklendi',
            comment
        }, { status: 201 })

    } catch (error) {
        console.error('Create comment error:', error)
        return NextResponse.json({ error: 'Yorum eklenemedi' }, { status: 500 })
    }
} 