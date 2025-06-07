import { NextResponse } from 'next/server'
import { prisma } from '../../../../lib/prisma'

export async function GET(request, { params }) {
    try {
        const { id } = await params
        const blogId = parseInt(id)

        if (!blogId || isNaN(blogId)) {
            return NextResponse.json({ error: 'Geçerli bir blog ID\'si gerekli' }, { status: 400 })
        }

        // Check if user is authenticated
        const token = request.headers.get('authorization')?.replace('Bearer ', '')
        let currentUserId = null

        if (token) {
            const { verifyToken } = await import('../../../../lib/auth')
            const decoded = verifyToken(token)
            if (decoded && decoded.id) {
                currentUserId = decoded.id
            }
        }

        const blog = await prisma.post.findUnique({
            where: { id: blogId },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        image: true,
                        title: true,
                        bio: true,
                        likesCount: true,
                        role: true,
                        status: true,
                        createdAt: true,
                        _count: {
                            select: {
                                posts: true,
                                messagesSent: true,
                                messagesReceived: true,
                                likes: true
                            }
                        }
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
                        comments: true
                    }
                }
            }
        })

        if (!blog) {
            return NextResponse.json({ error: 'Blog bulunamadı' }, { status: 404 })
        }

        // Check if current user liked this blog
        let isLiked = false
        if (currentUserId) {
            const like = await prisma.like.findUnique({
                where: {
                    userId_postId: {
                        userId: currentUserId,
                        postId: blogId
                    }
                }
            })
            isLiked = !!like
        }

        // Format user stats
        const userStats = {
            postsCount: blog.user._count.posts,
            messagesCount: blog.user._count.messagesSent + blog.user._count.messagesReceived,
            likesGiven: blog.user._count.likes,
            likesReceived: blog.user.likesCount
        }

        const formattedBlog = {
            ...blog,
            likesCount: blog._count.likes,
            commentsCount: blog._count.comments,
            isLiked,
            user: {
                ...blog.user,
                stats: userStats
            }
        }

        return NextResponse.json({
            blog: formattedBlog
        })

    } catch (error) {
        console.error('Get blog detail error:', error)
        return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 })
    }
} 