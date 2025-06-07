import { NextResponse } from 'next/server'
import { prisma } from '../../../../../lib/prisma'

export async function GET(request, { params }) {
    try {
        const { slug } = params

        const category = await prisma.category.findUnique({
            where: { slug: slug },
            include: {
                _count: {
                    select: {
                        posts: true
                    }
                }
            }
        })

        if (!category) {
            return NextResponse.json(
                { error: 'Kategori bulunamadı' },
                { status: 404 }
            )
        }

        return NextResponse.json({
            success: true,
            category
        })

    } catch (error) {
        console.error('Get category by slug error:', error)
        return NextResponse.json(
            { error: 'Kategori getirilemedi' },
            { status: 500 }
        )
    }
} 