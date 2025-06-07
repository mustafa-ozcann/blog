// Slug oluşturma fonksiyonu
export function createSlug(text) {
    return text
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '') // Özel karakterleri kaldır
        .replace(/\s+/g, '-') // Boşlukları tire ile değiştir
        .replace(/-+/g, '-') // Birden fazla tireyi tek tire yap
        .trim('-') // Başlangıç ve sondaki tireleri kaldır
}

// Unique slug oluşturma fonksiyonu
export async function createUniqueSlug(text, checkFunction, suffix = '') {
    let slug = createSlug(text) + suffix
    let counter = 1

    while (await checkFunction(slug)) {
        slug = createSlug(text) + '-' + counter + suffix
        counter++
    }

    return slug
}

// Blog slug'ını kontrol etme fonksiyonu
export async function checkBlogSlugExists(slug, prisma) {
    const existing = await prisma.post.findUnique({
        where: { slug }
    })
    return !!existing
}

// Kategori slug'ını kontrol etme fonksiyonu  
export async function checkCategorySlugExists(slug, prisma) {
    const existing = await prisma.category.findUnique({
        where: { slug }
    })
    return !!existing
} 