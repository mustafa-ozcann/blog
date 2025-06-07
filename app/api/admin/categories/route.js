import { NextResponse } from 'next/server'
import { prisma } from '../../../../lib/prisma'
import { verifyToken } from '../../../../lib/auth'

export const runtime = 'nodejs'

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
        console.log('POST /api/admin/categories - Starting request')

        const token = request.headers.get('authorization')?.replace('Bearer ', '')
        console.log('Token exists:', !!token)

        if (!token) {
            console.log('No token provided')
            return NextResponse.json({ error: 'Token gerekli' }, { status: 401 })
        }

        const decoded = verifyToken(token)
        console.log('Token decoded:', decoded ? 'success' : 'failed')

        if (!decoded || !decoded.id || decoded.role !== 'admin') {
            console.log('Authorization failed:', decoded)
            return NextResponse.json({ error: 'Admin yetkisi gerekli' }, { status: 403 })
        }

        const requestBody = await request.json()
        console.log('Request body:', requestBody)

        const { name, description } = requestBody

        if (!name || name.trim().length < 2) {
            console.log('Validation failed: name too short')
            return NextResponse.json({ error: 'Kategori adı en az 2 karakter olmalıdır' }, { status: 400 })
        }

        console.log('Checking existing category...')
        // Check if category already exists (case-insensitive check for SQLite)
        const allCategories = await prisma.category.findMany({
            select: { id: true, name: true }
        })

        const existingCategory = allCategories.find(cat =>
            cat.name.toLowerCase() === name.trim().toLowerCase()
        )

        if (existingCategory) {
            console.log('Category already exists')
            return NextResponse.json({ error: 'Bu kategori zaten mevcut' }, { status: 409 })
        }

        console.log('Creating new category...')
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

        console.log('Category created successfully:', category)
        return NextResponse.json({
            success: true,
            message: 'Kategori başarıyla oluşturuldu',
            category
        }, { status: 201 })

    } catch (error) {
        console.error('Create category error:', error)
        console.error('Error stack:', error.stack)
        return NextResponse.json({
            error: 'Sunucu hatası',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        }, { status: 500 })
    }
} 