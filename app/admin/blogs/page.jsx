'use client'
import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { adminService } from '../../../services/admin'
import { authService } from '../../../services/auth'

function AdminBlogsContent() {
    const [blogs, setBlogs] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [actionLoading, setActionLoading] = useState(null)
    const [statusFilter, setStatusFilter] = useState('all')
    const [authChecked, setAuthChecked] = useState(false)
    const searchParams = useSearchParams()
    const router = useRouter()

    useEffect(() => {
        // Authentication kontrolü
        const checkAuthAndAdmin = () => {
            const isAuthenticated = authService.isAuthenticated()
            const user = authService.getCurrentUser()

            if (!isAuthenticated) {
                router.push('/login')
                return false
            }

            if (!user || user.role !== 'admin') {
                router.push('/')
                return false
            }

            setAuthChecked(true)
            return true
        }

        if (checkAuthAndAdmin()) {
            const status = searchParams.get('status') || 'all'
            setStatusFilter(status)
            fetchBlogs(status)
        }
    }, [searchParams, router])

    const fetchBlogs = async (status = 'all') => {
        try {
            setLoading(true)
            const response = await adminService.getAllBlogsAdmin(50, 0, status)
            setBlogs(response.blogs)
        } catch (error) {
            setError(error.message)
        } finally {
            setLoading(false)
        }
    }

    const handleApprove = async (blogId) => {
        try {
            setActionLoading(blogId)
            await adminService.approveBlog(blogId)

            // Blog listesini güncelle
            setBlogs(blogs.map(blog =>
                blog.id === blogId ? { ...blog, status: 'approved' } : blog
            ))
        } catch (error) {
            setError(error.message)
        } finally {
            setActionLoading(null)
        }
    }

    const handleReject = async (blogId) => {
        try {
            setActionLoading(blogId)
            await adminService.rejectBlog(blogId)

            // Blog listesini güncelle
            setBlogs(blogs.map(blog =>
                blog.id === blogId ? { ...blog, status: 'rejected' } : blog
            ))
        } catch (error) {
            setError(error.message)
        } finally {
            setActionLoading(null)
        }
    }

    const handleDelete = async (blogId) => {
        if (!confirm('Bu blogu silmek istediğinizden emin misiniz?')) {
            return
        }

        try {
            setActionLoading(blogId)
            await adminService.deleteBlogAdmin(blogId)

            // Blog listesinden kaldır
            setBlogs(blogs.filter(blog => blog.id !== blogId))
        } catch (error) {
            setError(error.message)
        } finally {
            setActionLoading(null)
        }
    }

    const getStatusBadge = (status) => {
        const statusConfig = {
            pending: { color: 'bg-yellow-900 text-yellow-300 border-yellow-700', text: 'Bekliyor' },
            approved: { color: 'bg-green-900 text-green-300 border-green-700', text: 'Onaylandı' },
            rejected: { color: 'bg-red-900 text-red-300 border-red-700', text: 'Reddedildi' }
        }

        const config = statusConfig[status] || statusConfig.pending
        return (
            <span className={`px-2 py-1 text-xs font-medium rounded border ${config.color}`}>
                {config.text}
            </span>
        )
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

    if (!authChecked || loading) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="animate-pulse">
                    <div className="h-8 bg-gray-700 rounded w-1/4 mb-8"></div>
                    <div className="space-y-4">
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className="bg-gray-800 p-6 rounded-lg">
                                <div className="h-4 bg-gray-700 rounded w-3/4 mb-2"></div>
                                <div className="h-3 bg-gray-700 rounded w-1/2 mb-4"></div>
                                <div className="h-3 bg-gray-700 rounded w-full"></div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-white mb-2">Blog Yönetimi</h1>
                    <p className="text-gray-400">Blogları görüntüle, onayla, reddet veya sil</p>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="mb-6 p-4 bg-red-900 border border-red-700 text-red-300 rounded-lg">
                        {error}
                    </div>
                )}

                {/* Filter Tabs */}
                <div className="mb-6">
                    <div className="border-b border-gray-700">
                        <nav className="-mb-px flex space-x-8">
                            {[
                                { key: 'all', label: 'Tümü' },
                                { key: 'pending', label: 'Bekleyen' },
                                { key: 'approved', label: 'Onaylanan' },
                                { key: 'rejected', label: 'Reddedilen' }
                            ].map((tab) => (
                                <button
                                    key={tab.key}
                                    onClick={() => {
                                        setStatusFilter(tab.key)
                                        fetchBlogs(tab.key)
                                    }}
                                    className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${statusFilter === tab.key
                                        ? 'border-blue-500 text-blue-400'
                                        : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-300'
                                        }`}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </nav>
                    </div>
                </div>

                {/* Blog List */}
                {blogs.length > 0 ? (
                    <div className="space-y-6">
                        {blogs.map((blog) => (
                            <div key={blog.id} className="bg-gray-800 border border-gray-700 rounded-lg p-6">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <h3 className="text-xl font-semibold text-white">{blog.title}</h3>
                                            {getStatusBadge(blog.status)}
                                        </div>

                                        <div className="flex items-center text-sm text-gray-400 mb-3">
                                            <span>By {blog.user.name}</span>
                                            <span className="mx-2">•</span>
                                            <span>{formatDate(blog.createdAt)}</span>
                                            {blog.category && (
                                                <>
                                                    <span className="mx-2">•</span>
                                                    <span className="text-blue-400">{blog.category.name}</span>
                                                </>
                                            )}
                                        </div>

                                        <p className="text-gray-300 line-clamp-3 mb-4">
                                            {blog.content.substring(0, 200)}...
                                        </p>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex items-center justify-between pt-4 border-t border-gray-700">
                                    <div className="flex items-center space-x-2">
                                        <span className="text-sm text-gray-400">Yazar: {blog.user.email}</span>
                                    </div>

                                    <div className="flex items-center space-x-3">
                                        {blog.status === 'pending' && (
                                            <>
                                                <button
                                                    onClick={() => handleApprove(blog.id)}
                                                    disabled={actionLoading === blog.id}
                                                    className="bg-green-600 hover:bg-green-700 disabled:bg-green-800 text-white px-4 py-2 rounded text-sm font-medium transition-colors"
                                                >
                                                    {actionLoading === blog.id ? 'İşleniyor...' : 'Onayla'}
                                                </button>
                                                <button
                                                    onClick={() => handleReject(blog.id)}
                                                    disabled={actionLoading === blog.id}
                                                    className="bg-red-600 hover:bg-red-700 disabled:bg-red-800 text-white px-4 py-2 rounded text-sm font-medium transition-colors"
                                                >
                                                    {actionLoading === blog.id ? 'İşleniyor...' : 'Reddet'}
                                                </button>
                                            </>
                                        )}

                                        {blog.status === 'approved' && (
                                            <button
                                                onClick={() => handleReject(blog.id)}
                                                disabled={actionLoading === blog.id}
                                                className="bg-yellow-600 hover:bg-yellow-700 disabled:bg-yellow-800 text-white px-4 py-2 rounded text-sm font-medium transition-colors"
                                            >
                                                {actionLoading === blog.id ? 'İşleniyor...' : 'Geri Al'}
                                            </button>
                                        )}

                                        {blog.status === 'rejected' && (
                                            <button
                                                onClick={() => handleApprove(blog.id)}
                                                disabled={actionLoading === blog.id}
                                                className="bg-green-600 hover:bg-green-700 disabled:bg-green-800 text-white px-4 py-2 rounded text-sm font-medium transition-colors"
                                            >
                                                {actionLoading === blog.id ? 'İşleniyor...' : 'Onayla'}
                                            </button>
                                        )}

                                        <button
                                            onClick={() => handleDelete(blog.id)}
                                            disabled={actionLoading === blog.id}
                                            className="bg-gray-600 hover:bg-gray-700 disabled:bg-gray-800 text-white px-4 py-2 rounded text-sm font-medium transition-colors"
                                        >
                                            {actionLoading === blog.id ? 'Siliniyor...' : 'Sil'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12">
                        <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-medium text-white mb-2">Blog Bulunamadı</h3>
                        <p className="text-gray-400">
                            {statusFilter === 'all' ? 'Henüz hiç blog yok.' : `${statusFilter} durumunda blog yok.`}
                        </p>
                    </div>
                )}
            </div>
        </div>
    )
}

// Loading component for Suspense
function AdminBlogsLoading() {
    return (
        <div className="container mx-auto px-4 py-8">
            <div className="animate-pulse">
                <div className="h-8 bg-gray-700 rounded w-1/4 mb-8"></div>
                <div className="space-y-4">
                    {[...Array(5)].map((_, i) => (
                        <div key={i} className="bg-gray-800 p-6 rounded-lg">
                            <div className="h-4 bg-gray-700 rounded w-3/4 mb-2"></div>
                            <div className="h-3 bg-gray-700 rounded w-1/2 mb-4"></div>
                            <div className="h-3 bg-gray-700 rounded w-full"></div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

// Main component with Suspense wrapper
export default function AdminBlogs() {
    return (
        <Suspense fallback={<AdminBlogsLoading />}>
            <AdminBlogsContent />
        </Suspense>
    )
} 