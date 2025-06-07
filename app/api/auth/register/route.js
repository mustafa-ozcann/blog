import { NextResponse } from 'next/server'
import { prisma } from '../../../../lib/prisma'
import { hashPassword, generateToken } from '../../../../lib/auth'

export const runtime = 'nodejs'

export async function POST(request) {
    try {
        const { name, email, password } = await request.json()

        // Input validation
        if (!name || !email || !password) {
            return NextResponse.json(
                { error: 'İsim, e-posta ve şifre gereklidir' },
                { status: 400 }
            )
        }

        if (password.length < 6) {
            return NextResponse.json(
                { error: 'Şifre en az 6 karakter olmalıdır' },
                { status: 400 }
            )
        }

        // E-posta format kontrolü
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(email)) {
            return NextResponse.json(
                { error: 'Geçerli bir e-posta adresi giriniz' },
                { status: 400 }
            )
        }

        // E-posta benzersizlik kontrolü
        const existingUser = await prisma.user.findUnique({
            where: { email: email.toLowerCase() }
        })

        if (existingUser) {
            return NextResponse.json(
                { error: 'Bu e-posta adresi zaten kullanılıyor' },
                { status: 409 }
            )
        }

        // Şifreyi hashle
        const hashedPassword = await hashPassword(password)

        // Yeni kullanıcı oluştur
        const user = await prisma.user.create({
            data: {
                name: name.trim(),
                email: email.toLowerCase(),
                password: hashedPassword,
                role: 'user' // Varsayılan rol
            }
        })

        // JWT token oluştur
        const token = generateToken({
            id: user.id,
            email: user.email,
            role: user.role
        })

        // Kullanıcı bilgilerini döndür (şifre hariç)
        const { password: _, ...userWithoutPassword } = user

        return NextResponse.json({
            success: true,
            message: 'Hesap başarıyla oluşturuldu',
            token,
            user: userWithoutPassword
        }, { status: 201 })

    } catch (error) {
        console.error('Register error:', error)

        // Prisma unique constraint hatası
        if (error.code === 'P2002') {
            return NextResponse.json(
                { error: 'Bu e-posta adresi zaten kullanılıyor' },
                { status: 409 }
            )
        }

        return NextResponse.json(
            { error: 'Sunucu hatası' },
            { status: 500 }
        )
    }
} 