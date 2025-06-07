const bcrypt = require('bcryptjs')
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function createTestUsers() {
    try {
        console.log('🧪 Test kullanıcıları oluşturuluyor...')

        const testUsers = [
            {
                name: 'Test Kullanıcı 1',
                email: 'test1@blog.com',
                password: 'test123'
            },
            {
                name: 'Test Kullanıcı 2',
                email: 'test2@blog.com',
                password: 'test123'
            },
            {
                name: 'Test Kullanıcı 3',
                email: 'test3@blog.com',
                password: 'test123'
            },
            {
                name: 'İçerik Editörü',
                email: 'editor@blog.com',
                password: 'editor123'
            },
            {
                name: 'Yazar Ali Veli',
                email: 'ali@blog.com',
                password: 'writer123'
            }
        ]

        for (const userData of testUsers) {
            // Check if user already exists
            const existingUser = await prisma.user.findUnique({
                where: { email: userData.email }
            })

            if (existingUser) {
                console.log(`✅ Kullanıcı zaten mevcut: ${userData.email}`)
                continue
            }

            // Hash password
            const hashedPassword = await bcrypt.hash(userData.password, 10)

            // Create user
            const user = await prisma.user.create({
                data: {
                    name: userData.name,
                    email: userData.email,
                    password: hashedPassword,
                    status: 'active'
                }
            })

            console.log(`✅ Test kullanıcısı oluşturuldu: ${user.email}`)
        }

        console.log('🎉 Test kullanıcıları başarıyla oluşturuldu!')
        console.log('\n📝 Test kullanıcı bilgileri:')
        console.log('test1@blog.com / test123')
        console.log('test2@blog.com / test123')
        console.log('test3@blog.com / test123')
        console.log('editor@blog.com / editor123')
        console.log('ali@blog.com / writer123')

    } catch (error) {
        console.error('❌ Test kullanıcıları oluşturulurken hata:', error)
    } finally {
        await prisma.$disconnect()
    }
}

createTestUsers() 