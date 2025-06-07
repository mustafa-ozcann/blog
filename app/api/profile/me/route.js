import { NextResponse } from 'next/server'
import { prisma } from '../../../../lib/prisma'
import { verifyToken } from '../../../../lib/auth'

export async function GET(request) {
    try {
        const token = request.headers.get('authorization')?.replace('Bearer ', '')

        if (!token) {
            return NextResponse.json({ error: 'Token gerekli' }, { status: 401 })
        }

        const decoded = verifyToken(token)

        if (!decoded || !decoded.id) {
            return NextResponse.json({ error: 'Geçersiz token' }, { status: 401 })
        }

        const user = await prisma.user.findUnique({
            where: { id: decoded.id },
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
        console.error('Get my profile error:', error)
        return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 })
    }
} 