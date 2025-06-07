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

        // Get client IP
        const forwarded = request.headers.get('x-forwarded-for')
        const ip = forwarded ? forwarded.split(',')[0] : request.headers.get('x-real-ip') || 'unknown'

        // Check if user is authenticated
        const token = request.headers.get('authorization')?.replace('Bearer ', '')
        let userId = null

        if (token) {
            const decoded = verifyToken(token)
            if (decoded && decoded.id) {
                userId = decoded.id
            }
        }

        // Blog exists check
        const blog = await prisma.post.findUnique({
            where: { id: blogId }
        })

        if (!blog) {
            return NextResponse.json({ error: 'Blog bulunamadı' }, { status: 404 })
        }

        // Check if view already exists
        let existingView = null

        if (userId) {
            // Check by user ID for authenticated users
            existingView = await prisma.view.findUnique({
                where: {
                    userId_postId: {
                        userId: userId,
                        postId: blogId
                    }
                }
            })
        } else {
            // Check by IP for anonymous users (within last hour)
            const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000)
            existingView = await prisma.view.findFirst({
                where: {
                    postId: blogId,
                    ipAddress: ip,
                    userId: null,
                    createdAt: {
                        gte: oneHourAgo
                    }
                }
            })
        }

        if (!existingView) {
            // Create new view
            await prisma.view.create({
                data: {
                    postId: blogId,
                    userId: userId,
                    ipAddress: userId ? null : ip
                }
            })

            // Update post views count
            await prisma.post.update({
                where: { id: blogId },
                data: {
                    viewsCount: {
                        increment: 1
                    }
                }
            })

            return NextResponse.json({
                success: true,
                message: 'Görüntülenme kaydedildi'
            })
        }

        return NextResponse.json({
            success: true,
            message: 'Görüntülenme zaten mevcut'
        })

    } catch (error) {
        console.error('View tracking error:', error)
        return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 })
    }
} 