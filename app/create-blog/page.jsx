'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { authService } from '../../services/auth'
import { blogService } from '../../services/blog'

export default function CreateBlogPage() {
    const [formData, setFormData] = useState({
        title: '',
        content: '',
        categoryId: ''
    })
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState('')
    const [isAuthenticated, setIsAuthenticated] = useState(false)
    const [checkingAuth, setCheckingAuth] = useState(true)
    const router = useRouter()

    useEffect(() => {
        // Authentication kontrolü
        const checkAuth = () => {
            const authenticated = authService.isAuthenticated()
            setIsAuthenticated(authenticated)
            setCheckingAuth(false)

            if (!authenticated) {
                router.push('/login')
            }
        }

        checkAuth()
    }, [router])

    const handleInputChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: value
        }))

        // Clear error when user starts typing
        if (error) {
            setError('')
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        if (!isAuthenticated) {
            setError('Giriş yapmanız gerekiyor')
            return
        }

        // Validation
        if (!formData.title.trim()) {
            setError('Başlık gereklidir')
            return
        }

        if (formData.title.length < 5) {
            setError('Başlık en az 5 karakter olmalıdır')
            return
        }

        if (!formData.content.trim()) {
            setError('İçerik gereklidir')
            return
        }

        if (formData.content.length < 50) {
            setError('İçerik en az 50 karakter olmalıdır')
            return
        }

        setIsLoading(true)
        setError('')

        try {
            const token = authService.getToken()
            const result = await blogService.createBlog(formData, token)

            // Başarılı - anasayfaya yönlendir
            router.push('/')

        } catch (error) {
            setError(error.message)
        } finally {
            setIsLoading(false)
        }
    }

    if (checkingAuth) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
        )
    }

    if (!isAuthenticated) {
        return null // Redirect will happen in useEffect
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="max-w-3xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-white mb-2">Yeni Blog Yazısı</h1>
                    <p className="text-gray-400">
                        Düşüncelerinizi paylaşın ve toplulukla buluşturun
                    </p>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="mb-6 p-4 bg-red-900 border border-red-700 text-red-300 rounded-lg">
                        {error}
                    </div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Blog Title */}
                    <div>
                        <label htmlFor="title" className="block text-sm font-medium text-gray-300 mb-2">
                            Blog Başlığı *
                        </label>
                        <input
                            id="title"
                            name="title"
                            type="text"
                            value={formData.title}
                            onChange={handleInputChange}
                            required
                            className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                            placeholder="Blog başlığınızı giriniz..."
                        />
                        <p className="mt-1 text-sm text-gray-400">
                            En az 5 karakter olmalıdır
                        </p>
                    </div>

                    {/* Category (Optional) */}
                    <div>
                        <label htmlFor="categoryId" className="block text-sm font-medium text-gray-300 mb-2">
                            Kategori (İsteğe bağlı)
                        </label>
                        <select
                            id="categoryId"
                            name="categoryId"
                            value={formData.categoryId}
                            onChange={handleInputChange}
                            className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                        >
                            <option value="">Kategori seçiniz</option>
                            <option value="1">Teknoloji</option>
                            <option value="2">Yaşam</option>
                            <option value="3">Seyahat</option>
                            <option value="4">Eğitim</option>
                        </select>
                    </div>

                    {/* Blog Content */}
                    <div>
                        <label htmlFor="content" className="block text-sm font-medium text-gray-300 mb-2">
                            Blog İçeriği *
                        </label>
                        <textarea
                            id="content"
                            name="content"
                            value={formData.content}
                            onChange={handleInputChange}
                            required
                            rows={12}
                            className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none"
                            placeholder="Blog içeriğinizi buraya yazınız... Düşüncelerinizi, deneyimlerinizi veya bilgilerinizi paylaşın."
                        />
                        <p className="mt-1 text-sm text-gray-400">
                            En az 50 karakter olmalıdır ({formData.content.length}/50)
                        </p>
                    </div>

                    {/* Submit Buttons */}
                    <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-700">
                        <button
                            type="button"
                            onClick={() => router.back()}
                            className="px-6 py-3 border border-gray-600 text-gray-300 rounded-lg font-medium hover:bg-gray-800 hover:border-gray-500 transition-colors"
                        >
                            İptal
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900"
                        >
                            {isLoading ? 'Yayınlanıyor...' : 'Blog Yayınla'}
                        </button>
                    </div>
                </form>

                {/* Info Box */}
                <div className="mt-8 p-4 bg-blue-900 border border-blue-700 rounded-lg">
                    <div className="flex items-start space-x-3">
                        <svg className="w-5 h-5 text-blue-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <div>
                            <h3 className="text-blue-300 font-medium mb-1">Bilgi</h3>
                            <p className="text-blue-200 text-sm">
                                Blog yazınız yayınlandıktan sonra admin onayına gönderilecektir.
                                Onaylandıktan sonra ana sayfada görünecektir.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
} 