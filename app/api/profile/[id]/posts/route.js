import { NextResponse } from 'next/server'
import { prisma } from '../../../../../lib/prisma'

export async function GET(request, { params }) {
    try {
        const { id } = await params
        const userId = parseInt(id)
        const { searchParams } = new URL(request.url)
        const limit = parseInt(searchParams.get('limit') || '10')
        const offset = parseInt(searchParams.get('offset') || '0')

        // Check if user exists
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { id: true }
        })

        if (!user) {
            return NextResponse.json({ error: 'Kullanıcı bulunamadı' }, { status: 404 })
        }

        // Get user's posts (only approved ones for public viewing)
        const posts = await prisma.post.findMany({
            where: {
                userId: userId,
                status: 'approved'
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        image: true,
                        title: true
                    }
                },
                category: {
                    select: {
                        id: true,
                        name: true
                    }
                },
                _count: {
                    select: {
                        likes: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            },
            take: limit,
            skip: offset
        })

        // Format posts
        const formattedPosts = posts.map(post => ({
            ...post,
            likesCount: post._count.likes
        }))

        // Get total count
        const totalPosts = await prisma.post.count({
            where: {
                userId: userId,
                status: 'approved'
            }
        })

        return NextResponse.json({
            posts: formattedPosts,
            pagination: {
                total: totalPosts,
                limit,
                offset,
                hasMore: offset + limit < totalPosts
            }
        })

    } catch (error) {
        console.error('Get user posts error:', error)
        return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 })
    }
} 