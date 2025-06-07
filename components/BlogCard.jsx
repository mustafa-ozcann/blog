import Link from 'next/link'

export default function BlogCard({ blog, showAuthor = true }) {
    // Tarih formatını ayarla
    const formatDate = (dateString) => {
        const date = new Date(dateString)
        return date.toLocaleDateString('tr-TR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        })
    }

    // İçeriği kısalt
    const truncateContent = (content, maxLength = 150) => {
        if (content.length <= maxLength) return content
        return content.substring(0, maxLength) + '...'
    }

    return (
        <article className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden hover:border-gray-600 transition-all duration-200 group">
            {/* Blog Header */}
            <div className="p-6">
                {/* Kategori ve Tarih */}
                <div className="flex items-center justify-between mb-3">
                    {blog.category && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-900 text-blue-300">
                            {blog.category.name}
                        </span>
                    )}
                    <time className="text-sm text-gray-400">
                        {formatDate(blog.createdAt)}
                    </time>
                </div>

                {/* Blog Başlığı */}
                <h2 className="text-xl font-semibold text-white mb-3 group-hover:text-blue-400 transition-colors">
                    <Link href={`/blog/${blog.id}`} className="hover:underline">
                        {blog.title}
                    </Link>
                </h2>

                {/* Blog İçeriği Önizleme */}
                <p className="text-gray-300 mb-4 leading-relaxed">
                    {truncateContent(blog.content)}
                </p>

                {/* Yazar Bilgileri */}
                <div className="flex items-center justify-between">
                    {showAuthor ? (
                        <div className="flex items-center space-x-3">
                            {/* Yazar Avatar */}
                            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                                <span className="text-white text-sm font-medium">
                                    {blog.user.name.charAt(0).toUpperCase()}
                                </span>
                            </div>

                            {/* Yazar Adı */}
                            <div>
                                <p className="text-sm font-medium text-gray-300">
                                    {blog.user.name}
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div></div>
                    )}

                    {/* Devamını Oku Butonu */}
                    <Link
                        href={`/blog/${blog.id}`}
                        className="inline-flex items-center text-sm text-blue-400 hover:text-blue-300 font-medium transition-colors"
                    >
                        Devamını oku
                        <svg className="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </Link>
                </div>
            </div>
        </article>
    )
} 