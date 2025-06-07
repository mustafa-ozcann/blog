import { NextResponse } from 'next/server'
import { prisma } from '../../../../../../lib/prisma'
import { verifyToken } from '../../../../../../lib/auth'

export async function POST(request, { params }) {
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

        const user = await prisma.user.update({
            where: { id: parseInt(id) },
            data: {
                status: 'active',
                bannedAt: null,
                bannedReason: null,
                timeoutUntil: null,
                updatedAt: new Date()
            },
            select: {
                id: true,
                name: true,
                email: true,
                status: true
            }
        })

        return NextResponse.json({
            message: 'Kullanıcı engeli kaldırıldı',
            user
        })

    } catch (error) {
        console.error('Unban error:', error)
        return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 })
    }
} 