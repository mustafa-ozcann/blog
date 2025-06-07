'use client'
import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { authService } from '../../../services/auth'
import { adminService } from '../../../services/admin'
import { blogService } from '../../../services/blog'
import ProfileCard from '../../../components/ProfileCard'
import Link from 'next/link'

export default function BlogDetailPage() {
    const params = useParams()
    const router = useRouter()
    const [blog, setBlog] = useState(null)
    const [comments, setComments] = useState([])
    const [newComment, setNewComment] = useState('')
    const [loading, setLoading] = useState(true)
    const [commentsLoading, setCommentsLoading] = useState(false)
    const [error, setError] = useState('')
    const [currentUser, setCurrentUser] = useState(null)
    const [actionLoading, setActionLoading] = useState({})

    useEffect(() => {
        const user = authService.getCurrentUser()
        setCurrentUser(user)
        loadBlog()
    }, [params.id])

    const loadBlog = async () => {
        try {
            setLoading(true)
            const response = await blogService.getBlogDetail(params.id)
            setBlog(response.blog)

            // Track view after loading blog
            blogService.trackView(params.id)

            // Load comments
            loadComments()
        } catch (error) {
            setError(error.message)
        } finally {
            setLoading(false)
        }
    }

    const loadComments = async () => {
        try {
            setCommentsLoading(true)
            const response = await blogService.getComments(params.id)
            setComments(response.comments)
        } catch (error) {
            console.error('Comments loading error:', error)
        } finally {
            setCommentsLoading(false)
        }
    }

    const handleCommentSubmit = async (e) => {
        e.preventDefault()

        if (!currentUser) {
            router.push('/login')
            return
        }

        if (!newComment.trim()) {
            return
        }

        try {
            setActionLoading(prev => ({ ...prev, comment: true }))
            const response = await blogService.addComment(params.id, newComment.trim())

            // Add new comment to the beginning of the list
            setComments(prev => [response.comment, ...prev])
            setNewComment('')

            // Update comment count in blog
            setBlog(prev => ({
                ...prev,
                commentsCount: (prev.commentsCount || 0) + 1
            }))
        } catch (error) {
            setError(error.message)
        } finally {
            setActionLoading(prev => ({ ...prev, comment: false }))
        }
    }

    const handleApprove = async () => {
        try {
            setActionLoading(prev => ({ ...prev, approve: true }))
            await adminService.approveBlog(blog.id)
            await loadBlog()
        } catch (error) {
            setError(error.message)
        } finally {
            setActionLoading(prev => ({ ...prev, approve: false }))
        }
    }

    const handleReject = async () => {
        if (!confirm('Bu blogu reddetmek istediğinizden emin misiniz?')) {
            return
        }

        try {
            setActionLoading(prev => ({ ...prev, reject: true }))
            await adminService.rejectBlog(blog.id)
            router.push('/admin/blogs')
        } catch (error) {
            setError(error.message)
            setActionLoading(prev => ({ ...prev, reject: false }))
        }
    }

    const handleDelete = async () => {
        if (!confirm('Bu blogu kalıcı olarak silmek istediğinizden emin misiniz?')) {
            return
        }

        try {
            setActionLoading(prev => ({ ...prev, delete: true }))
            await adminService.deleteBlog(blog.id)
            router.push('/admin/blogs')
        } catch (error) {
            setError(error.message)
            setActionLoading(prev => ({ ...prev, delete: false }))
        }
    }

    const handleLike = async () => {
        if (!currentUser) {
            router.push('/login')
            return
        }

        try {
            setActionLoading(prev => ({ ...prev, like: true }))
            await blogService.toggleLike(blog.id)

            // Update blog state
            setBlog(prev => ({
                ...prev,
                isLiked: !prev.isLiked,
                likesCount: prev.isLiked ? prev.likesCount - 1 : prev.likesCount + 1
            }))
        } catch (error) {
            setError(error.message)
        } finally {
            setActionLoading(prev => ({ ...prev, like: false }))
        }
    }

    const handleShare = async () => {
        const url = window.location.href

        if (navigator.share) {
            try {
                await navigator.share({
                    title: blog.title,
                    text: blog.title,
                    url: url
                })
            } catch (error) {
                console.log('Share cancelled')
            }
        } else {
            try {
                await navigator.clipboard.writeText(url)
                alert('Link kopyalandı!')
            } catch (error) {
                console.error('Copy failed:', error)
            }
        }
    }

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('tr-TR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    const getStatusBadge = (status) => {
        switch (status) {
            case 'approved':
                return <span className="px-3 py-1 bg-green-900 text-green-200 rounded-full text-sm">Yayında</span>
            case 'pending':
                return <span className="px-3 py-1 bg-yellow-900 text-yellow-200 rounded-full text-sm">Onay Bekliyor</span>
            case 'rejected':
                return <span className="px-3 py-1 bg-red-900 text-red-200 rounded-full text-sm">Reddedildi</span>
            default:
                return null
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-900 p-8">
                <div className="max-w-4xl mx-auto">
                    <div className="animate-pulse">
                        <div className="h-8 bg-gray-700 rounded w-3/4 mb-4"></div>
                        <div className="h-4 bg-gray-700 rounded w-1/2 mb-8"></div>
                        <div className="bg-gray-800 rounded-lg p-6 mb-8">
                            <div className="h-4 bg-gray-700 rounded w-full mb-2"></div>
                            <div className="h-4 bg-gray-700 rounded w-full mb-2"></div>
                            <div className="h-4 bg-gray-700 rounded w-3/4"></div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-900 p-8">
                <div className="max-w-4xl mx-auto">
                    <div className="bg-red-900 border border-red-700 text-red-300 rounded-lg p-6 text-center">
                        <h2 className="text-xl font-semibold mb-2">Hata</h2>
                        <p>{error}</p>
                        <button
                            onClick={() => router.back()}
                            className="mt-4 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded transition-colors"
                        >
                            Geri Dön
                        </button>
                    </div>
                </div>
            </div>
        )
    }

    const isAdmin = currentUser && currentUser.role === 'admin'
    const isAuthor = currentUser && currentUser.id === blog?.user?.id

    return (
        <div className="min-h-screen bg-gray-900 p-8">
            <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Main Content */}
                <div className="lg:col-span-3">
                    {/* Header */}
                    <div className="mb-8">
                        <div className="flex items-center space-x-4 mb-4">
                            <button
                                onClick={() => router.back()}
                                className="p-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
                            >
                                <svg className="w-5 h-5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                                </svg>
                            </button>
                            <div className="flex-1">
                                <h1 className="text-3xl font-bold text-white mb-2">{blog.title}</h1>
                                <div className="flex items-center space-x-4 text-sm text-gray-400">
                                    <span>{formatDate(blog.createdAt)}</span>
                                    {blog.category && (
                                        <Link
                                            href={`/?categoryId=${blog.category.id}`}
                                            className="px-2 py-1 bg-blue-900 text-blue-200 hover:bg-blue-800 rounded text-xs transition-colors"
                                        >
                                            {blog.category.name}
                                        </Link>
                                    )}
                                    {getStatusBadge(blog.status)}
                                </div>
                            </div>
                        </div>

                        {/* Admin Actions */}
                        {isAdmin && blog.status === 'pending' && (
                            <div className="bg-yellow-900 border border-yellow-700 rounded-lg p-4 mb-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h3 className="text-yellow-200 font-medium mb-1">Admin İşlemleri</h3>
                                        <p className="text-yellow-300 text-sm">Bu blog onay bekliyor. İşlem yapmanız gerekiyor.</p>
                                    </div>
                                    <div className="flex space-x-2">
                                        <button
                                            onClick={handleApprove}
                                            disabled={actionLoading.approve}
                                            className="bg-green-600 hover:bg-green-700 disabled:bg-green-800 text-white px-4 py-2 rounded transition-colors"
                                        >
                                            {actionLoading.approve ? 'Onaylanıyor...' : 'Onayla'}
                                        </button>
                                        <button
                                            onClick={handleReject}
                                            disabled={actionLoading.reject}
                                            className="bg-red-600 hover:bg-red-700 disabled:bg-red-800 text-white px-4 py-2 rounded transition-colors"
                                        >
                                            {actionLoading.reject ? 'Reddediliyor...' : 'Reddet'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Admin Delete Action */}
                        {isAdmin && (
                            <div className="mb-6">
                                <button
                                    onClick={handleDelete}
                                    disabled={actionLoading.delete}
                                    className="bg-red-600 hover:bg-red-700 disabled:bg-red-800 text-white px-4 py-2 rounded transition-colors"
                                >
                                    {actionLoading.delete ? 'Siliniyor...' : 'Blogu Sil'}
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Blog Content */}
                    <div className="bg-gray-800 rounded-lg p-8 mb-8">
                        <div className="prose prose-invert max-w-none">
                            {blog.content.split('\n').map((paragraph, index) => (
                                paragraph.trim() ? (
                                    <p key={index} className="text-gray-300 leading-relaxed mb-4">
                                        {paragraph}
                                    </p>
                                ) : (
                                    <br key={index} />
                                )
                            ))}
                        </div>
                    </div>

                    {/* Stats and Actions */}
                    <div className="bg-gray-800 rounded-lg p-6 mb-8">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-6 text-gray-400">
                                <div className="flex items-center space-x-2">
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                        <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                                        <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                                    </svg>
                                    <span>{blog.viewsCount || 0} görüntülenme</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
                                    </svg>
                                    <span>{blog.commentsCount || 0} yorum</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <svg className={`w-5 h-5 ${blog.isLiked ? 'text-red-500' : ''}`} fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                                    </svg>
                                    <span>{blog.likesCount || 0} beğeni</span>
                                </div>
                            </div>

                            <div className="flex items-center space-x-3">
                                <button
                                    onClick={handleLike}
                                    disabled={actionLoading.like}
                                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${blog.isLiked
                                        ? 'bg-red-600 hover:bg-red-700 text-white'
                                        : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                                        }`}
                                >
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                                    </svg>
                                    <span>{blog.isLiked ? 'Beğenildi' : 'Beğen'}</span>
                                </button>

                                <button
                                    onClick={handleShare}
                                    className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                                    </svg>
                                    <span>Paylaş</span>
                                </button>
                            </div>
                        </div>
                    </div>



                    {/* Comments Section */}
                    <div className="bg-gray-800 rounded-lg p-6">
                        <h3 className="text-xl font-semibold text-white mb-6">
                            Yorumlar ({comments.length})
                        </h3>

                        {/* Comment Form */}
                        {currentUser ? (
                            <form onSubmit={handleCommentSubmit} className="mb-8">
                                <textarea
                                    value={newComment}
                                    onChange={(e) => setNewComment(e.target.value)}
                                    placeholder="Yorumunuzu yazın..."
                                    className="w-full bg-gray-700 text-white rounded-lg p-4 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    rows={3}
                                />
                                <div className="flex justify-end mt-3">
                                    <button
                                        type="submit"
                                        disabled={actionLoading.comment || !newComment.trim()}
                                        className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white px-6 py-2 rounded-lg transition-colors"
                                    >
                                        {actionLoading.comment ? 'Gönderiliyor...' : 'Yorum Yap'}
                                    </button>
                                </div>
                            </form>
                        ) : (
                            <div className="bg-gray-700 rounded-lg p-4 mb-8 text-center">
                                <p className="text-gray-300 mb-3">Yorum yapmak için giriş yapmanız gerekiyor</p>
                                <Link
                                    href="/login"
                                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors inline-block"
                                >
                                    Giriş Yap
                                </Link>
                            </div>
                        )}

                        {/* Comments List */}
                        {commentsLoading ? (
                            <div className="animate-pulse space-y-4">
                                {[...Array(3)].map((_, i) => (
                                    <div key={i} className="bg-gray-700 rounded-lg p-4">
                                        <div className="h-4 bg-gray-600 rounded w-1/4 mb-2"></div>
                                        <div className="h-4 bg-gray-600 rounded w-3/4"></div>
                                    </div>
                                ))}
                            </div>
                        ) : comments.length > 0 ? (
                            <div className="space-y-4">
                                {comments.map((comment) => (
                                    <div key={comment.id} className="bg-gray-700 rounded-lg p-4">
                                        <div className="flex items-center space-x-3 mb-3">
                                            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                                                {comment.user.image ? (
                                                    <img
                                                        src={comment.user.image}
                                                        alt={comment.user.name}
                                                        className="w-full h-full rounded-full object-cover"
                                                    />
                                                ) : (
                                                    <span className="text-white text-sm font-medium">
                                                        {comment.user.name.charAt(0).toUpperCase()}
                                                    </span>
                                                )}
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center space-x-2">
                                                    <span className="text-white font-medium">{comment.user.name}</span>
                                                    {comment.user.role === 'admin' && (
                                                        <span className="px-2 py-1 bg-red-900 text-red-200 rounded text-xs">
                                                            Admin
                                                        </span>
                                                    )}
                                                    <span className="text-gray-400 text-sm">
                                                        {formatDate(comment.createdAt)}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <p className="text-gray-300 leading-relaxed">
                                            {comment.content}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8">
                                <p className="text-gray-400">Henüz yorum yapılmamış. İlk yorumu siz yapın!</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Sidebar */}
                <div className="lg:col-span-1">
                    {/* Author Info Card */}
                    {blog.user && (
                        <div className="bg-gray-800 rounded-lg p-6 mb-6">
                            <h3 className="text-lg font-semibold text-white mb-4">Yazar Hakkında</h3>
                            <div className="text-center">
                                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-3">
                                    {blog.user.image ? (
                                        <img
                                            src={blog.user.image}
                                            alt={blog.user.name}
                                            className="w-full h-full rounded-full object-cover"
                                        />
                                    ) : (
                                        <span className="text-white text-xl font-medium">
                                            {blog.user.name.charAt(0).toUpperCase()}
                                        </span>
                                    )}
                                </div>

                                <h4 className="text-white font-medium mb-2">{blog.user.name}</h4>

                                {blog.user.role === 'admin' && (
                                    <span className="inline-block px-2 py-1 bg-red-900 text-red-200 rounded text-xs mb-3">
                                        Admin
                                    </span>
                                )}

                                {blog.user.title && (
                                    <p className="text-blue-400 text-sm mb-2">{blog.user.title}</p>
                                )}

                                {blog.user.bio && (
                                    <p className="text-gray-400 text-sm mb-4">{blog.user.bio}</p>
                                )}

                                <div className="flex justify-center space-x-4 text-sm text-gray-400 mb-4">
                                    <div className="text-center">
                                        <div className="text-white font-medium">{blog.user.stats?.postsCount || 0}</div>
                                        <div>Yazı</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-white font-medium">{blog.user.likesCount || 0}</div>
                                        <div>Beğeni</div>
                                    </div>
                                </div>

                                <Link
                                    href={`/profile/${blog.user.id}`}
                                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm transition-colors block text-center"
                                >
                                    Profili Görüntüle
                                </Link>
                            </div>
                        </div>
                    )}

                    {/* Related Posts */}
                    <div className="bg-gray-800 rounded-lg p-6">
                        <h3 className="text-lg font-semibold text-white mb-4">İlgili Yazılar</h3>
                        <div className="space-y-3">
                            {/* This would be populated with actual related posts */}
                            <div className="text-center py-8">
                                <p className="text-gray-400 text-sm">İlgili yazılar yükleniyor...</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
} 