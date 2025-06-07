import { NextResponse } from 'next/server'
import { prisma } from '../../../lib/prisma'

export async function GET(request) {
    try {
        const categories = await prisma.category.findMany({
            include: {
                _count: {
                    select: {
                        posts: {
                            where: {
                                status: 'approved'
                            }
                        }
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