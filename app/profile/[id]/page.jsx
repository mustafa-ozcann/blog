'use client'
import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { profileService } from '../../../services/profile'
import { authService } from '../../../services/auth'
import ProfileCard from '../../../components/ProfileCard'
import BlogCard from '../../../components/BlogCard'

export default function ProfilePage() {
    const params = useParams()
    const [profile, setProfile] = useState(null)
    const [posts, setPosts] = useState([])
    const [loading, setLoading] = useState(true)
    const [postsLoading, setPostsLoading] = useState(false)
    const [error, setError] = useState('')
    const [currentUser, setCurrentUser] = useState(null)

    useEffect(() => {
        const user = authService.getCurrentUser()
        setCurrentUser(user)
        loadProfile()
        loadPosts()
    }, [params.id])

    const loadProfile = async () => {
        try {
            setLoading(true)
            const response = await profileService.getProfile(params.id)
            setProfile(response.user)
        } catch (error) {
            setError(error.message)
        } finally {
            setLoading(false)
        }
    }

    const loadPosts = async () => {
        try {
            setPostsLoading(true)
            const response = await profileService.getUserPosts(params.id, 20, 0)
            setPosts(response.posts || [])
        } catch (error) {
            console.error('Posts loading error:', error)
        } finally {
            setPostsLoading(false)
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-900 p-8">
                <div className="max-w-4xl mx-auto">
                    <div className="animate-pulse">
                        <div className="bg-gray-800 rounded-lg p-6 mb-8">
                            <div className="flex items-center space-x-4">
                                <div className="h-16 w-16 bg-gray-700 rounded-full"></div>
                                <div className="flex-1">
                                    <div className="h-6 bg-gray-700 rounded w-1/3 mb-2"></div>
                                    <div className="h-4 bg-gray-700 rounded w-1/2"></div>
                                </div>
                            </div>
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
                        <h2 className="text-xl font-semibold mb-2">Profil Yüklenemedi</h2>
                        <p>{error}</p>
                        <button
                            onClick={loadProfile}
                            className="mt-4 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded transition-colors"
                        >
                            Tekrar Dene
                        </button>
                    </div>
                </div>
            </div>
        )
    }

    const isOwnProfile = currentUser && currentUser.id === parseInt(params.id)
    const canEdit = isOwnProfile || (currentUser && currentUser.role === 'admin')

    return (
        <div className="min-h-screen bg-gray-900 p-8">
            <div className="max-w-4xl mx-auto">
                {/* Profile Section */}
                <div className="mb-8">
                    <ProfileCard
                        user={profile}
                        showActions={!isOwnProfile}
                    />

                    {canEdit && (
                        <div className="mt-4 flex justify-center">
                            <button
                                onClick={() => window.location.href = '/profile/edit'}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
                            >
                                Profili Düzenle
                            </button>
                        </div>
                    )}
                </div>

                {/* Posts Section */}
                <div className="bg-gray-800 rounded-lg p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-bold text-white">
                            Yazıları ({profile?.stats?.postsCount || 0})
                        </h2>

                        {/* Filter options */}
                        <div className="flex space-x-2">
                            <select className="bg-gray-700 border border-gray-600 rounded px-3 py-1 text-white text-sm">
                                <option value="newest">En Yeni</option>
                                <option value="oldest">En Eski</option>
                                <option value="popular">En Popüler</option>
                            </select>
                        </div>
                    </div>

                    {postsLoading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {[...Array(4)].map((_, i) => (
                                <div key={i} className="animate-pulse bg-gray-700 rounded-lg p-4">
                                    <div className="h-4 bg-gray-600 rounded w-3/4 mb-2"></div>
                                    <div className="h-3 bg-gray-600 rounded w-1/2 mb-3"></div>
                                    <div className="h-3 bg-gray-600 rounded w-full mb-1"></div>
                                    <div className="h-3 bg-gray-600 rounded w-2/3"></div>
                                </div>
                            ))}
                        </div>
                    ) : posts.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {posts.map((post) => (
                                <BlogCard
                                    key={post.id}
                                    blog={post}
                                    showAuthor={false}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12 text-gray-400">
                            <svg className="w-16 h-16 mx-auto mb-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <h3 className="text-lg font-medium mb-2">Henüz yazı yok</h3>
                            <p className="text-sm">
                                {isOwnProfile
                                    ? 'İlk yazınızı oluşturmak için blog yazın!'
                                    : 'Bu kullanıcı henüz hiç yazı paylaşmamış.'
                                }
                            </p>
                            {isOwnProfile && (
                                <button
                                    onClick={() => window.location.href = '/create-blog'}
                                    className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
                                >
                                    İlk Yazını Yaz
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
} 