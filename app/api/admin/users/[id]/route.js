import { NextResponse } from 'next/server'
import { prisma } from '../../../../../lib/prisma'
import { verifyToken } from '../../../../../lib/auth'

export async function DELETE(request, { params }) {
    try {
        const token = request.headers.get('authorization')?.replace('Bearer ', '')
        if (!token) {
            return NextResponse.json({ error: 'Token gerekli' }, { status: 401 })
        }

        const decoded = verifyToken(token)
        if (!decoded || decoded.role !== 'admin') {
            return NextResponse.json({ error: 'Admin yetkisi gerekli' }, { status: 403 })
        }

        const { id } = params
        const userId = parseInt(id)

        // Admin kullanıcıyı silmeye izin verme
        const userToDelete = await prisma.user.findUnique({
            where: { id: userId },
            select: { role: true, email: true }
        })

        if (!userToDelete) {
            return NextResponse.json({ error: 'Kullanıcı bulunamadı' }, { status: 404 })
        }

        if (userToDelete.role === 'admin') {
            return NextResponse.json({ error: 'Admin kullanıcı silinemez' }, { status: 400 })
        }

        // Kullanıcının mesajlarını ve postlarını sil
        await prisma.$transaction([
            // Kullanıcının gönderdiği mesajları sil
            prisma.message.deleteMany({
                where: { fromUserId: userId }
            }),
            // Kullanıcının aldığı mesajları sil
            prisma.message.deleteMany({
                where: { toUserId: userId }
            }),
            // Kullanıcının postlarını sil
            prisma.post.deleteMany({
                where: { userId: userId }
            }),
            // Kullanıcıyı sil
            prisma.user.delete({
                where: { id: userId }
            })
        ])

        return NextResponse.json({
            message: 'Kullanıcı başarıyla silindi'
        })

    } catch (error) {
        console.error('Delete user error:', error)
        return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 })
    }
} 