import { NextResponse } from 'next/server'
import { prisma } from '../../../../lib/prisma'
import { verifyPassword, generateToken } from '../../../../lib/auth'

export async function POST(request) {
    try {
        const { email, password } = await request.json()

        // Input validation
        if (!email || !password) {
            return NextResponse.json(
                { error: 'E-posta ve şifre gereklidir' },
                { status: 400 }
            )
        }

        // Kullanıcıyı e-posta ile bul
        const user = await prisma.user.findUnique({
            where: { email: email.toLowerCase() }
        })

        if (!user) {
            return NextResponse.json(
                { error: 'Geçersiz e-posta veya şifre' },
                { status: 401 }
            )
        }

        // Şifre doğrulama
        const isPasswordValid = await verifyPassword(password, user.password)

        if (!isPasswordValid) {
            return NextResponse.json(
                { error: 'Geçersiz e-posta veya şifre' },
                { status: 401 }
            )
        }

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
            message: 'Giriş başarılı',
            token,
            user: userWithoutPassword
        })

    } catch (error) {
        console.error('Login error:', error)
        return NextResponse.json(
            { error: 'Sunucu hatası' },
            { status: 500 }
        )
    }
} 