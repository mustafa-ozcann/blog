const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
    console.log('🌱 Seeding database...')

    // Kategorileri oluştur
    const categories = await Promise.all([
        prisma.category.upsert({
            where: { id: 1 },
            update: {},
            create: {
                id: 1,
                name: 'Teknoloji'
            }
        }),
        prisma.category.upsert({
            where: { id: 2 },
            update: {},
            create: {
                id: 2,
                name: 'Yaşam'
            }
        }),
        prisma.category.upsert({
            where: { id: 3 },
            update: {},
            create: {
                id: 3,
                name: 'Seyahat'
            }
        }),
        prisma.category.upsert({
            where: { id: 4 },
            update: {},
            create: {
                id: 4,
                name: 'Eğitim'
            }
        })
    ])

    console.log('✅ Categories created:', categories.length)

    console.log('🎉 Seeding completed!')
}

main()
    .catch((e) => {
        console.error('❌ Seeding failed:', e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
