import { NextResponse } from 'next/server'
import { prisma } from '../../../../lib/prisma'

export async function GET(request, { params }) {
    try {
        const { id } = await params
        const userId = parseInt(id)

        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                name: true,
                email: true,
                bio: true,
                image: true,
                title: true,
                location: true,
                website: true,
                twitter: true,
                linkedin: true,
                github: true,
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
        })

        if (!user) {
            return NextResponse.json({ error: 'Kullanıcı bulunamadı' }, { status: 404 })
        }

        // Calculate total message count
        const totalMessages = user._count.messagesSent + user._count.messagesReceived

        return NextResponse.json({
            user: {
                ...user,
                stats: {
                    postsCount: user._count.posts,
                    messagesCount: totalMessages,
                    likesGiven: user._count.likes,
                    likesReceived: user.likesCount
                }
            }
        })

    } catch (error) {
        console.error('Get profile error:', error)
        return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 })
    }
} 