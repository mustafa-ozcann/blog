import { NextResponse } from 'next/server'
import { prisma } from '../../../../../../lib/prisma'
import { verifyToken } from '../../../../../../lib/auth'

export async function PUT(request, { params }) {
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
        const { role } = await request.json()

        // Validate role
        if (!role || !['user', 'admin', 'moderator'].includes(role)) {
            return NextResponse.json({ error: 'Geçerli bir rol belirtiniz' }, { status: 400 })
        }

        const userId = parseInt(id)

        // Kendi rolünü değiştirmeye izin verme
        if (userId === decoded.id) {
            return NextResponse.json({ error: 'Kendi rolünüzü değiştiremezsiniz' }, { status: 400 })
        }

        // Check if user exists
        const existingUser = await prisma.user.findUnique({
            where: { id: userId },
            select: { id: true, role: true, email: true }
        })

        if (!existingUser) {
            return NextResponse.json({ error: 'Kullanıcı bulunamadı' }, { status: 404 })
        }

        // Update user role
        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: {
                role: role,
                updatedAt: new Date()
            },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                updatedAt: true
            }
        })

        return NextResponse.json({
            message: `Kullanıcı rolü ${role} olarak güncellendi`,
            user: updatedUser
        })

    } catch (error) {
        console.error('Change role error:', error)
        return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 })
    }
} 