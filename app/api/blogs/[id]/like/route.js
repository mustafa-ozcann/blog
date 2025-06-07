import { NextResponse } from 'next/server'
import { prisma } from '../../../../../lib/prisma'
import { verifyToken } from '../../../../../lib/auth'

export async function POST(request, { params }) {
    try {
        const { id } = await params
        const blogId = parseInt(id)

        if (!blogId || isNaN(blogId)) {
            return NextResponse.json({ error: 'Geçerli bir blog ID\'si gerekli' }, { status: 400 })
        }

        const token = request.headers.get('authorization')?.replace('Bearer ', '')

        if (!token) {
            return NextResponse.json({ error: 'Token gerekli' }, { status: 401 })
        }

        const decoded = verifyToken(token)

        if (!decoded || !decoded.id) {
            return NextResponse.json({ error: 'Geçersiz token' }, { status: 401 })
        }

        // Blog exists check
        const blog = await prisma.post.findUnique({
            where: { id: blogId }
        })

        if (!blog) {
            return NextResponse.json({ error: 'Blog bulunamadı' }, { status: 404 })
        }

        // Check if already liked
        const existingLike = await prisma.like.findUnique({
            where: {
                userId_postId: {
                    userId: decoded.id,
                    postId: blogId
                }
            }
        })

        if (existingLike) {
            // Unlike
            await prisma.like.delete({
                where: {
                    userId_postId: {
                        userId: decoded.id,
                        postId: blogId
                    }
                }
            })

            // Update post likes count
            await prisma.post.update({
                where: { id: blogId },
                data: {
                    likesCount: {
                        decrement: 1
                    }
                }
            })

            return NextResponse.json({
                liked: false,
                message: 'Beğeni kaldırıldı'
            })
        } else {
            // Like
            await prisma.like.create({
                data: {
                    userId: decoded.id,
                    postId: blogId
                }
            })

            // Update post likes count
            await prisma.post.update({
                where: { id: blogId },
                data: {
                    likesCount: {
                        increment: 1
                    }
                }
            })

            return NextResponse.json({
                liked: true,
                message: 'Beğenildi'
            })
        }

    } catch (error) {
        console.error('Like error:', error)
        return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 })
    }
} 