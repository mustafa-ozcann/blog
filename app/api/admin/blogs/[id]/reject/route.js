import { NextResponse } from 'next/server'
import { prisma } from '../../../../../../lib/prisma'
import { verifyToken, getTokenFromHeader } from '../../../../../../lib/auth'

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

// POST - Blog reddet
export async function POST(request, { params }) {
    try {
        const authResult = checkAdminAuth(request)
        if (authResult.error) {
            return NextResponse.json(
                { error: authResult.error },
                { status: authResult.status }
            )
        }

        const blogId = parseInt(params.id)

        // Blog var mı kontrol et
        const blog = await prisma.post.findUnique({
            where: { id: blogId }
        })

        if (!blog) {
            return NextResponse.json(
                { error: 'Blog bulunamadı' },
                { status: 404 }
            )
        }

        // Blog durumunu güncelle
        const updatedBlog = await prisma.post.update({
            where: { id: blogId },
            data: { status: 'rejected' },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                }
            }
        })

        return NextResponse.json({
            success: true,
            message: 'Blog reddedildi',
            blog: updatedBlog
        })

    } catch (error) {
        console.error('Reject blog error:', error)
        return NextResponse.json(
            { error: 'Blog reddedilirken hata oluştu' },
            { status: 500 }
        )
    }
} 