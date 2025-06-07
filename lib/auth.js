import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET

if (!JWT_SECRET) {
    throw new Error('JWT_SECRET environment variable is required')
}

// Şifre hashleme
export async function hashPassword(password) {
    const salt = await bcrypt.genSalt(12)
    return bcrypt.hash(password, salt)
}

// Şifre doğrulama
export async function verifyPassword(password, hashedPassword) {
    return bcrypt.compare(password, hashedPassword)
}

// JWT token oluşturma
export function generateToken(payload) {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' })
}

// JWT token doğrulama
export function verifyToken(token) {
    try {
        return jwt.verify(token, JWT_SECRET)
    } catch (error) {
        return null
    }
}

// Authorization header'dan token alma
export function getTokenFromHeader(authHeader) {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return null
    }
    return authHeader.substring(7)
} 