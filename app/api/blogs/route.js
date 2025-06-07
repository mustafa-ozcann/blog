import { NextResponse } from 'next/server'
import { prisma } from '../../../lib/prisma'
import { verifyToken, getTokenFromHeader } from '../../../lib/auth'
import { createUniqueSlug, checkBlogSlugExists } from '../../../lib/utils'

// GET - Blogları listele
export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url)
        const limit = parseInt(searchParams.get('limit') || '10')
        const offset = parseInt(searchParams.get('offset') || '0')
        const categoryId = searchParams.get('categoryId')

        // Query filters
        const where = {
            status: 'approved' // Sadece onaylanmış blogları göster
        }

        if (categoryId) {
            where.categoryId = parseInt(categoryId)
        }

        // Blogları getir
        const blogs = await prisma.post.findMany({
            where,
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        image: true
                    }
                },
                category: {
                    select: {
                        id: true,
                        name: true
                    }
                },
                _count: {
                    select: {
                        likes: true,
                        comments: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            },
            take: limit,
            skip: offset
        })

        // Toplam blog sayısını al
        const total = await prisma.post.count({ where })

        return NextResponse.json({
            success: true,
            blogs,
            pagination: {
                total,
                limit,
                offset,
                hasMore: offset + limit < total
            }
        })

    } catch (error) {
        console.error('Get blogs error:', error)
        return NextResponse.json(
            { error: 'Bloglar getirilemedi' },
            { status: 500 }
        )
    }
}

// POST - Yeni blog oluştur
export async function POST(request) {
    try {
        // Auth kontrolü
        const authHeader = request.headers.get('Authorization')
        const token = getTokenFromHeader(authHeader)

        if (!token) {
            return NextResponse.json(
                { error: 'Giriş yapmanız gerekiyor' },
                { status: 401 }
            )
        }

        const payload = verifyToken(token)
        if (!payload) {
            return NextResponse.json(
                { error: 'Geçersiz token' },
                { status: 401 }
            )
        }

        const { title, content, categoryId } = await request.json()

        // Input validation
        if (!title || !content) {
            return NextResponse.json(
                { error: 'Başlık ve içerik gereklidir' },
                { status: 400 }
            )
        }

        if (title.length < 5) {
            return NextResponse.json(
                { error: 'Başlık en az 5 karakter olmalıdır' },
                { status: 400 }
            )
        }

        if (content.length < 50) {
            return NextResponse.json(
                { error: 'İçerik en az 50 karakter olmalıdır' },
                { status: 400 }
            )
        }

        // Kategori kontrolü (varsa)
        if (categoryId) {
            const category = await prisma.category.findUnique({
                where: { id: parseInt(categoryId) }
            })

            if (!category) {
                return NextResponse.json(
                    { error: 'Geçersiz kategori' },
                    { status: 400 }
                )
            }
        }

        // Slug oluştur
        const slug = await createUniqueSlug(
            title.trim(),
            (slug) => checkBlogSlugExists(slug, prisma)
        )

        // Blog oluştur
        const blog = await prisma.post.create({
            data: {
                title: title.trim(),
                slug: slug,
                content: content.trim(),
                userId: payload.id,
                categoryId: categoryId ? parseInt(categoryId) : null,
                status: 'pending' // Yeni bloglar pending durumunda
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        image: true
                    }
                },
                category: {
                    select: {
                        id: true,
                        name: true
                    }
                }
            }
        })

        return NextResponse.json({
            success: true,
            message: 'Blog başarıyla oluşturuldu ve onay bekliyor',
            blog
        }, { status: 201 })

    } catch (error) {
        console.error('Create blog error:', error)
        return NextResponse.json(
            { error: 'Blog oluşturulamadı' },
            { status: 500 }
        )
    }
} 