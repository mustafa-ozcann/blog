const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

function createSlug(text) {
    return text
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '') // Özel karakterleri kaldır
        .replace(/\s+/g, '-') // Boşlukları tire ile değiştir
        .replace(/-+/g, '-') // Birden fazla tireyi tek tire yap
        .trim('-') // Başlangıç ve sondaki tireleri kaldır
}

async function addSlugs() {
    try {
        console.log('Slug ekleme başlıyor...')

        // Kategorilere slug ekle
        const categories = await prisma.category.findMany({
            where: {
                slug: null
            }
        })

        for (const category of categories) {
            const slug = createSlug(category.name)
            await prisma.category.update({
                where: { id: category.id },
                data: { slug }
            })
            console.log(`Kategori "${category.name}" için slug eklendi: ${slug}`)
        }

        // Postlara slug ekle
        const posts = await prisma.post.findMany({
            where: {
                slug: null
            }
        })

        for (const post of posts) {
            let slug = createSlug(post.title)
            let counter = 1

            // Unique slug sağla
            while (await prisma.post.findUnique({ where: { slug } })) {
                slug = createSlug(post.title) + '-' + counter
                counter++
            }

            await prisma.post.update({
                where: { id: post.id },
                data: { slug }
            })
            console.log(`Post "${post.title}" için slug eklendi: ${slug}`)
        }

        console.log('Slug ekleme tamamlandı!')

    } catch (error) {
        console.error('Hata:', error)
    } finally {
        await prisma.$disconnect()
    }
}

addSlugs() 