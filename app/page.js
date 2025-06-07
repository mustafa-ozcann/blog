'use client'
import { useState, useEffect } from 'react'
import { blogService } from '../services/blog'
import { authService } from '../services/auth'
import Link from 'next/link'

export default function Home() {
  const [blogs, setBlogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState(null)
  const [popularTopics, setPopularTopics] = useState([])
  const [categories, setCategories] = useState([])
  const [selectedCategory, setSelectedCategory] = useState(null)

  useEffect(() => {
    const currentUser = authService.getCurrentUser()
    setUser(currentUser)
    loadCategories()
    loadBlogs()
    loadPopularTopics()
  }, [])

  useEffect(() => {
    // URL değişikliklerini dinle ve bloğları yenile
    const handleUrlChange = () => {
      const urlParams = new URLSearchParams(window.location.search)
      const categoryId = urlParams.get('categoryId')

      if (categoryId) {
        const category = categories.find(c => c.id === parseInt(categoryId))
        setSelectedCategory(category)
      } else {
        setSelectedCategory(null)
      }

      loadBlogs()
    }

    // İlk yükleme
    handleUrlChange()

    // URL değişikliklerini dinle
    window.addEventListener('popstate', handleUrlChange)

    // Sayfa navigasyonu için custom event dinle
    window.addEventListener('navigationChange', handleUrlChange)

    return () => {
      window.removeEventListener('popstate', handleUrlChange)
      window.removeEventListener('navigationChange', handleUrlChange)
    }
  }, [categories])

  const loadCategories = async () => {
    try {
      const response = await fetch('/api/categories')
      if (response.ok) {
        const data = await response.json()
        setCategories(data.categories || [])
      }
    } catch (error) {
      console.error('Kategoriler yüklenemedi:', error)
    }
  }

  const loadBlogs = async () => {
    try {
      setLoading(true)
      // URL'den categoryId'yi al
      const urlParams = new URLSearchParams(window.location.search)
      const categoryId = urlParams.get('categoryId')

      let response
      if (categoryId) {
        response = await blogService.getBlogsByCategory(categoryId, 15, 0)
      } else {
        response = await blogService.getAllBlogs(15, 0)
      }
      setBlogs(response.blogs)
    } catch (error) {
      console.error('Bloglar yüklenemedi:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadPopularTopics = async () => {
    try {
      const response = await fetch('/api/popular-topics')
      if (response.ok) {
        const data = await response.json()
        setPopularTopics(data.topics || [])
      } else {
        // Fallback to sample data if API fails
        setPopularTopics([
          { id: 1, title: 'Next.js ile Modern Web Geliştirme', views: 1250, replies: 45 },
          { id: 2, title: 'React Hooks Kullanım Rehberi', views: 980, replies: 32 },
          { id: 3, title: 'JavaScript ES6+ Özellikleri', views: 856, replies: 28 }
        ])
      }
    } catch (error) {
      console.error('Popüler konular yüklenemedi:', error)
      // Use fallback data on error
      setPopularTopics([
        { id: 1, title: 'Next.js ile Modern Web Geliştirme', views: 1250, replies: 45 },
        { id: 2, title: 'React Hooks Kullanım Rehberi', views: 980, replies: 32 },
        { id: 3, title: 'JavaScript ES6+ Özellikleri', views: 856, replies: 28 }
      ])
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatNumber = (num) => {
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'k'
    }
    return num.toString()
  }

  const getCategoryIcon = (categoryName) => {
    switch (categoryName?.toLowerCase()) {
      case 'teknoloji':
        return '💻'
      case 'yaşam':
        return '🌟'
      case 'seyahat':
        return '✈️'
      case 'eğitim':
        return '📚'
      default:
        return '📂'
    }
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              {selectedCategory ? `${selectedCategory.name} Kategorisi` : 'Yeni Konular'}
            </h1>
            <p className="text-gray-400">
              {selectedCategory
                ? `${selectedCategory.name} kategorisindeki blog yazıları`
                : 'En son paylaşılan blog yazıları'
              }
            </p>
          </div>
          {user && (
            <Link
              href="/create-blog"
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center space-x-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span>Yeni Konu</span>
            </Link>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3">
            {loading ? (
              <div className="space-y-4">
                {[...Array(6)].map((_, index) => (
                  <div key={index} className="bg-gray-800 border border-gray-700 rounded-lg p-6 animate-pulse">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gray-700 rounded-full"></div>
                      <div className="flex-1">
                        <div className="h-4 bg-gray-700 rounded w-3/4 mb-2"></div>
                        <div className="h-3 bg-gray-700 rounded w-1/2"></div>
                      </div>
                      <div className="text-right">
                        <div className="h-4 bg-gray-700 rounded w-16 mb-2"></div>
                        <div className="h-3 bg-gray-700 rounded w-12"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-1">
                {blogs.map((blog) => (
                  <div key={blog.id} className="bg-gray-800 border border-gray-700 hover:border-gray-600 transition-colors">
                    <div className="p-6">
                      <div className="flex items-center space-x-4">
                        {/* Author Avatar */}
                        <div className="flex-shrink-0">
                          <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
                            <span className="text-white font-medium">
                              {blog.user.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <Link
                                href={blog.slug ? `/${blog.slug}` : `/blog/${blog.id}`}
                                className="text-lg font-semibold text-white hover:text-blue-400 transition-colors block"
                              >
                                {blog.title}
                              </Link>
                              <div className="flex items-center space-x-4 mt-2 text-sm text-gray-400">
                                <span>{blog.user.name}</span>
                                <span>•</span>
                                <span>{formatDate(blog.createdAt)}</span>
                                {blog.category && (
                                  <>
                                    <span>•</span>
                                    <span className="px-2 py-1 bg-blue-900 text-blue-300 rounded text-xs">
                                      {blog.category.name}
                                    </span>
                                  </>
                                )}
                              </div>
                            </div>

                            {/* Stats */}
                            <div className="flex items-center space-x-6 text-sm text-gray-400 ml-4">
                              <div className="text-center">
                                <div className="text-white font-medium">{formatNumber(blog.viewsCount || 0)}</div>
                                <div>Görüntüleme</div>
                              </div>
                              <div className="text-center">
                                <div className="text-white font-medium">{blog._count?.likes || 0}</div>
                                <div>Beğeni</div>
                              </div>
                              <div className="text-center">
                                <div className="text-white font-medium">{blog._count?.comments || 0}</div>
                                <div>Yorum</div>
                              </div>
                              <div className="text-right">
                                <div className="text-xs text-gray-500">Son yanıt</div>
                                <div className="text-sm">{formatDate(blog.updatedAt || blog.createdAt)}</div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Popular Topics */}
            <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Popüler Konular</h3>
              <div className="space-y-4">
                {popularTopics.map((topic, index) => (
                  <div key={topic.id} className="flex items-start space-x-3">
                    <div className="flex-shrink-0 w-6 h-6 bg-blue-600 rounded text-white text-xs flex items-center justify-center font-medium">
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <Link
                        href={topic.slug ? `/${topic.slug}` : `/blog/${topic.id}`}
                        className="text-sm text-white hover:text-blue-400 transition-colors block font-medium line-clamp-2"
                      >
                        {topic.title}
                      </Link>
                      <div className="flex items-center space-x-3 mt-1 text-xs text-gray-400">
                        <span>{formatNumber(topic.views)} görüntüleme</span>
                        <span>•</span>
                        <span>{topic.replies} yanıt</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Stats */}
            <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-4">İstatistikler</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-400">Toplam Konu</span>
                  <span className="text-white font-medium">{blogs.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Toplam Yazar</span>
                  <span className="text-white font-medium">{new Set(blogs.map(b => b.user.id)).size}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">En Son Güncelleme</span>
                  <span className="text-white font-medium text-sm">
                    {blogs.length > 0 ? formatDate(blogs[0].createdAt) : 'Henüz yok'}
                  </span>
                </div>
              </div>
            </div>

            {/* Categories */}
            <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Kategoriler</h3>
              <div className="space-y-2">
                <Link
                  href="/"
                  className="block text-blue-400 hover:text-blue-300 text-sm transition-colors"
                  onClick={() => {
                    setTimeout(() => {
                      if (window.location.pathname === '/') {
                        window.history.replaceState({}, '', '/')
                        window.dispatchEvent(new Event('navigationChange'))
                      }
                    }, 100)
                  }}
                >
                  📝 Tüm Konular
                </Link>
                {categories.map((category) => (
                  <Link
                    key={category.id}
                    href={category.slug ? `/category/${category.slug}` : `/?categoryId=${category.id}`}
                    className="block text-blue-400 hover:text-blue-300 text-sm transition-colors"
                    onClick={() => {
                      if (!category.slug) {
                        // Direct category filter için navigation event tetikle
                        setTimeout(() => {
                          window.dispatchEvent(new Event('navigationChange'))
                        }, 100)
                      }
                    }}
                  >
                    {getCategoryIcon(category.name)} {category.name}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
