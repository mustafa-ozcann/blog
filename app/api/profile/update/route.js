import { NextResponse } from 'next/server'
import { prisma } from '../../../../lib/prisma'
import { verifyToken } from '../../../../lib/auth'

export async function PUT(request) {
    try {
        const token = request.headers.get('authorization')?.replace('Bearer ', '')
        if (!token) {
            return NextResponse.json({ error: 'Token gerekli' }, { status: 401 })
        }

        const decoded = verifyToken(token)
        if (!decoded) {
            return NextResponse.json({ error: 'Geçersiz token' }, { status: 401 })
        }

        const {
            name,
            bio,
            title,
            location,
            website,
            twitter,
            linkedin,
            github
        } = await request.json()

        // Validation
        if (!name || name.trim().length === 0) {
            return NextResponse.json({ error: 'İsim boş olamaz' }, { status: 400 })
        }

        // Update user profile
        const updatedUser = await prisma.user.update({
            where: { id: decoded.id },
            data: {
                name: name.trim(),
                bio: bio?.trim() || null,
                title: title?.trim() || null,
                location: location?.trim() || null,
                website: website?.trim() || null,
                twitter: twitter?.trim() || null,
                linkedin: linkedin?.trim() || null,
                github: github?.trim() || null,
                updatedAt: new Date()
            },
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
                role: true,
                updatedAt: true
            }
        })

        return NextResponse.json({
            message: 'Profil başarıyla güncellendi',
            user: updatedUser
        })

    } catch (error) {
        console.error('Update profile error:', error)
        return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 })
    }
} 