import { NextResponse } from 'next/server'
import { prisma } from '../../../lib/prisma'

export async function GET(request) {
    try {
        // Get most popular posts by views and engagement
        const popularPosts = await prisma.post.findMany({
            where: {
                status: 'approved'
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true
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
                        likes: true,
                        comments: true,
                        views: true
                    }
                }
            },
            orderBy: [
                { viewsCount: 'desc' },
                { likesCount: 'desc' }
            ],
            take: 10
        })

        // Transform to match the expected format
        const topics = popularPosts.map(post => ({
            id: post.id,
            slug: post.slug,
            title: post.title,
            views: post.viewsCount || 0,
            replies: post._count.comments || 0,
            likes: post._count.likes || 0,
            category: post.category?.name || 'Genel',
            author: post.user.name
        }))

        return NextResponse.json({ topics })

    } catch (error) {
        console.error('Get popular topics error:', error)
        return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 })
    }
} 