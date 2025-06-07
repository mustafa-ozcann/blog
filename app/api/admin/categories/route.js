import { NextResponse } from 'next/server'
import { prisma } from '../../../../lib/prisma'
import { verifyToken } from '../../../../lib/auth'

// GET - Kategorileri listele
export async function GET(request) {
    try {
        const token = request.headers.get('authorization')?.replace('Bearer ', '')

        if (!token) {
            return NextResponse.json({ error: 'Token gerekli' }, { status: 401 })
        }

        const decoded = verifyToken(token)

        if (!decoded || !decoded.id || decoded.role !== 'admin') {
            return NextResponse.json({ error: 'Admin yetkisi gerekli' }, { status: 403 })
        }

        const categories = await prisma.category.findMany({
            include: {
                _count: {
                    select: {
                        posts: true
                    }
                }
            },
            orderBy: {
                name: 'asc'
            }
        })

        return NextResponse.json({
            categories
        })

    } catch (error) {
        console.error('Get categories error:', error)
        return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 })
    }
}

// POST - Yeni kategori oluştur
export async function POST(request) {
    try {
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

        // Check if category already exists
        const existingCategory = await prisma.category.findFirst({
            where: {
                name: {
                    equals: name.trim(),
                    mode: 'insensitive'
                }
            }
        })

        if (existingCategory) {
            return NextResponse.json({ error: 'Bu kategori zaten mevcut' }, { status: 409 })
        }

        const category = await prisma.category.create({
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
            message: 'Kategori başarıyla oluşturuldu',
            category
        }, { status: 201 })

    } catch (error) {
        console.error('Create category error:', error)
        return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 })
    }
} 