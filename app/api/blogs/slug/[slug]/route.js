import { NextResponse } from 'next/server'
import { prisma } from '../../../../../lib/prisma'

export async function GET(request, { params }) {
    try {
        const { slug } = params

        const blog = await prisma.post.findUnique({
            where: {
                slug: slug,
                status: 'approved' // Sadece onaylanmış blogları döndür
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

        if (!blog) {
            return NextResponse.json(
                { error: 'Blog bulunamadı' },
                { status: 404 }
            )
        }

        return NextResponse.json({
            success: true,
            blog
        })

    } catch (error) {
        console.error('Get blog by slug error:', error)
        return NextResponse.json(
            { error: 'Blog getirilemedi' },
            { status: 500 }
        )
    }
} 