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
        const { hours, reason } = await request.json()

        if (!hours || hours <= 0) {
            return NextResponse.json({ error: 'Geçerli bir saat değeri giriniz' }, { status: 400 })
        }

        // Timeout bitiş tarihini hesapla
        const timeoutUntil = new Date()
        timeoutUntil.setHours(timeoutUntil.getHours() + parseInt(hours))

        const user = await prisma.user.update({
            where: { id: parseInt(id) },
            data: {
                status: 'suspended',
                timeoutUntil,
                bannedReason: reason || `Geçici engelleme - ${hours} saat`,
                updatedAt: new Date()
            },
            select: {
                id: true,
                name: true,
                email: true,
                status: true,
                timeoutUntil: true,
                bannedReason: true
            }
        })

        return NextResponse.json({
            message: 'Kullanıcı geçici olarak engellendi',
            user
        })

    } catch (error) {
        console.error('Timeout error:', error)
        return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 })
    }
} 