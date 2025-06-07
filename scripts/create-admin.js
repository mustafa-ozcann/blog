const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function createAdmin() {
    try {
        const hashedPassword = await bcrypt.hash('admin123', 12)

        const admin = await prisma.user.upsert({
            where: { email: 'admin@blog.com' },
            update: {},
            create: {
                name: 'Admin User',
                email: 'admin@blog.com',
                password: hashedPassword,
                role: 'admin'
            }
        })

        console.log('✅ Admin user created successfully!')
        console.log('Email:     ')
        console.log('Password: admin123')
        console.log('Role: admin')

    } catch (error) {
        console.error('❌ Error creating admin:', error)
    } finally {
        await prisma.$disconnect()
    }
}

createAdmin() 