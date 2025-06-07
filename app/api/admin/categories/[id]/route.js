import { NextResponse } from 'next/server'
import { prisma } from '../../../../../lib/prisma'
import { verifyToken } from '../../../../../lib/auth'

export const runtime = 'nodejs'

// PUT - Kategori güncelle
export async function PUT(request, { params }) {
    try {
        const { id } = await params
        const categoryId = parseInt(id)

        if (!categoryId || isNaN(categoryId)) {
            return NextResponse.json({ error: 'Geçerli bir kategori ID\'si gerekli' }, { status: 400 })
        }

        const token = request.headers.get('authorization')?.replace('Bearer ', '')

        if (!token) {
            return NextResponse.json({ error: 'Token gerekli' }, { status: 401 })
        }

        const decoded = verifyToken(token)

        if (!decoded || !decoded.id || decoded.role !== 'admin') {
            return NextResponse.json({ error: 'Admin yetkisi gerekli' }, { status: 403 })
        }

        const { name, description } = await request.json()

        if (!name || name.trim().length < 2) {
            return NextResponse.json({ error: 'Kategori adı en az 2 karakter olmalıdır' }, { status: 400 })
        }

        // Check if category exists
        const existingCategory = await prisma.category.findUnique({
            where: { id: categoryId }
        })

        if (!existingCategory) {
            return NextResponse.json({ error: 'Kategori bulunamadı' }, { status: 404 })
        }

        // Check if name already exists (excluding current category)
        const allCategories = await prisma.category.findMany({
            select: { id: true, name: true },
            where: {
                id: {
                    not: categoryId
                }
            }
        })

        const nameConflict = allCategories.find(cat =>
            cat.name.toLowerCase() === name.trim().toLowerCase()
        )

        if (nameConflict) {
            return NextResponse.json({ error: 'Bu kategori adı zaten kullanılıyor' }, { status: 409 })
        }

        const category = await prisma.category.update({
            where: { id: categoryId },
            data: {
                name: name.trim(),
                description: description?.trim() || null
            },
            include: {
                _count: {
                    select: {
                        posts: true
                    }
                }
            }
        })

        return NextResponse.json({
            success: true,
            message: 'Kategori başarıyla güncellendi',
            category
        })

    } catch (error) {
        console.error('Update category error:', error)
        return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 })
    }
}

// DELETE - Kategori sil
export async function DELETE(request, { params }) {
    try {
        const { id } = await params
        const categoryId = parseInt(id)

        if (!categoryId || isNaN(categoryId)) {
            return NextResponse.json({ error: 'Geçerli bir kategori ID\'si gerekli' }, { status: 400 })
        }

        const token = request.headers.get('authorization')?.replace('Bearer ', '')

        if (!token) {
            return NextResponse.json({ error: 'Token gerekli' }, { status: 401 })
        }

        const decoded = verifyToken(token)

        if (!decoded || !decoded.id || decoded.role !== 'admin') {
            return NextResponse.json({ error: 'Admin yetkisi gerekli' }, { status: 403 })
        }

        // Check if category exists
        const existingCategory = await prisma.category.findUnique({
            where: { id: categoryId },
            include: {
                _count: {
                    select: {
                        posts: true
                    }
                }
            }
        })

        if (!existingCategory) {
            return NextResponse.json({ error: 'Kategori bulunamadı' }, { status: 404 })
        }

        // Check if category has posts
        if (existingCategory._count.posts > 0) {
            return NextResponse.json({
                error: 'Bu kategoriye ait blog yazıları bulunuyor. Önce bu yazıları silin veya başka kategoriye taşıyın.'
            }, { status: 409 })
        }

        await prisma.category.delete({
            where: { id: categoryId }
        })

        return NextResponse.json({
            success: true,
            message: 'Kategori başarıyla silindi'
        })

    } catch (error) {
        console.error('Delete category error:', error)
        return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 })
    }
} 