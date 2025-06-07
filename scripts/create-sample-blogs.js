const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function createSampleBlogs() {
    try {
        console.log('📝 Örnek bloglar oluşturuluyor...')

        // Get users and categories
        const users = await prisma.user.findMany({
            select: { id: true, name: true }
        })

        const categories = await prisma.category.findMany({
            select: { id: true, name: true }
        })

        if (users.length === 0 || categories.length === 0) {
            console.log('❌ Kullanıcı veya kategori bulunamadı. Önce kullanıcı ve kategori oluşturun.')
            return
        }

        const sampleBlogs = [
            {
                title: "Next.js ile Modern Web Geliştirme",
                content: `Next.js, React tabanlı modern web uygulamaları geliştirmek için güçlü bir framework'tür. 

Bu yazıda Next.js'in temel özelliklerini keşfedeceğiz:

• Server-Side Rendering (SSR)
• Static Site Generation (SSG) 
• API Routes
• File-based routing
• Automatic code splitting

Next.js, performanslı ve SEO dostu web uygulamaları oluşturmak için ideal bir seçimdir. Modern JavaScript ekosisteminde önemli bir yere sahiptir.

Özellikle e-ticaret siteleri, bloglar ve kurumsal web siteleri için mükemmel çözümler sunar. React bilginiz varsa, Next.js öğrenmek çok kolay olacaktır.`,
                categoryId: categories.find(c => c.name === 'Teknoloji')?.id || categories[0].id,
                userId: users[Math.floor(Math.random() * users.length)].id,
                status: 'approved'
            },
            {
                title: "Uzaktan Çalışmanın Avantajları ve Zorlukları",
                content: `Pandemi sonrası dünyada uzaktan çalışma artık yeni normal haline geldi. Bu çalışma modelinin hem avantajları hem de zorlukları bulunuyor.

AVANTAJLAR:
- Esnek çalışma saatleri
- Ev konforunda çalışma
- Ulaşım masraflarından tasarruf
- Daha iyi iş-yaşam dengesi
- Daha az stres

ZORLUKLAR:
- İletişim eksiklikleri
- Motivasyon sorunları
- Ev ortamında dikkat dağınıklığı
- Takım çalışmasında zorluklar
- Sosyal izolasyon

Uzaktan çalışmada başarılı olmak için disiplin, iyi iletişim becerileri ve doğru araçları kullanmak gerekiyor. Şirketlerin de bu süreci destekleyici politikalar geliştirmesi önemli.`,
                categoryId: categories.find(c => c.name === 'Yaşam')?.id || categories[0].id,
                userId: users[Math.floor(Math.random() * users.length)].id,
                status: 'approved'
            },
            {
                title: "İstanbul'un Gizli Köşeleri",
                content: `İstanbul, turistik yerlerinin yanında keşfedilmeyi bekleyen birçok gizli köşeye sahip. Bu yazıda şehrin az bilinen ama görülmeye değer yerlerini keşfedeceğiz.

BALAT SOKAKLARI:
Rengarenk evleri ve dar sokakları ile büyüleyici bir mahalle. Antik kitap dükkânları, butik kafeler ve sanat galerileri bulabilirsiniz.

BÜYÜKADA ÇIKMAZI:
Adanın en sessiz ve huzurlu noktalarından biri. Doğa yürüyüşü ve fotoğraf çekimi için ideal.

GALATA KULESİ ÇEVRESI:
Sadece kule değil, çevresindeki eski Ceneviz sokakları da görülmeye değer. Tarihi atmosfer ve muhteşem manzaralar.

FENERİ BOSTAN:
Boğaz'ın en güzel manzaralarından birini sunan, sakin bir semt. Balık lokantaları ve sahil yürüyüşleri.

Bu yerler İstanbul'un ruhunu hissetmek isteyenler için mükemmel seçenekler.`,
                categoryId: categories.find(c => c.name === 'Seyahat')?.id || categories[0].id,
                userId: users[Math.floor(Math.random() * users.length)].id,
                status: 'approved'
            },
            {
                title: "Python ile Veri Analizi Temelleri",
                content: `Veri analizi, günümüzün en popüler alanlarından biri. Python, bu alanda kullanılan en güçlü araçlardan. Bu yazıda Python ile veri analizine giriş yapacağız.

GEREKLİ KÜTÜPHANELER:
- Pandas: Veri manipülasyonu
- NumPy: Sayısal hesaplamalar  
- Matplotlib: Veri görselleştirme
- Seaborn: İleri düzey grafikler
- Jupyter Notebook: Etkileşimli geliştirme

TEMEL ADIMLAR:
1. Veri setini yükleme
2. Veri temizleme
3. Keşifsel veri analizi
4. Görselleştirme
5. Sonuçları yorumlama

Python'un syntax'ı öğrenmesi kolay olduğu için veri analizi için mükemmel bir başlangıç noktası. Machine learning ve deep learning için de güçlü bir temel oluşturur.

Veri analisti olmak isteyenler için Python öğrenmek artık zorunluluk haline geldi.`,
                categoryId: categories.find(c => c.name === 'Eğitim')?.id || categories[0].id,
                userId: users[Math.floor(Math.random() * users.length)].id,
                status: 'pending'
            },
            {
                title: "Dijital Minimalizm ve Yaşam Kalitesi",
                content: `Sürekli bildirimler, sosyal medya bağımlılığı ve dijital gürültü modern yaşamın en büyük sorunlarından. Dijital minimalizm bu sorunlara çözüm önerir.

DİJİTAL MİNİMALİZM NEDİR?
Teknoloji kullanımımızı bilinçli olarak sınırlayarak, sadece gerçekten değer katan dijital araçları kullanma felsefesi.

UYGULAMA YÖNTEMLERİ:
- Telefonda gereksiz uygulamaları silmek
- Sosyal medya kullanımını sınırlamak
- Bildirimları kapatmak
- Dijital detoks periyotları
- Tek seferde tek işe odaklanmak

FAYDALAR:
- Daha iyi konsantrasyon
- Azalan stres seviyesi
- Daha kaliteli uyku
- Gerçek ilişkilere daha çok zaman
- Artan yaratıcılık

Dijital minimalizm, teknoloji karşıtlığı değil, bilinçli teknoloji kullanımıdır. Amaç, teknolojiye değil yaşama odaklanmaktır.`,
                categoryId: categories.find(c => c.name === 'Yaşam')?.id || categories[0].id,
                userId: users[Math.floor(Math.random() * users.length)].id,
                status: 'approved'
            }
        ]

        // Create blogs
        for (const blogData of sampleBlogs) {
            const existingBlog = await prisma.post.findFirst({
                where: { title: blogData.title }
            })

            if (existingBlog) {
                console.log(`✅ Blog zaten mevcut: ${blogData.title}`)
                continue
            }

            const blog = await prisma.post.create({
                data: blogData
            })

            console.log(`✅ Blog oluşturuldu: ${blog.title}`)
        }

        console.log('🎉 Örnek bloglar başarıyla oluşturuldu!')

    } catch (error) {
        console.error('❌ Blog oluşturulurken hata:', error)
    } finally {
        await prisma.$disconnect()
    }
}

createSampleBlogs() 