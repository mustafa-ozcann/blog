'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { adminService } from '../../services/admin'
import { authService } from '../../services/auth'

export default function AdminDashboard() {
    const [stats, setStats] = useState({
        totalUsers: 0,
        totalBlogs: 0,
        pendingBlogs: 0,
        approvedBlogs: 0
    })
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [authChecked, setAuthChecked] = useState(false)
    const router = useRouter()

    useEffect(() => {
        // Authentication kontrolü
        const checkAuthAndAdmin = () => {
            const isAuthenticated = authService.isAuthenticated()
            const user = authService.getCurrentUser()

            console.log('Auth check - Authenticated:', isAuthenticated)
            console.log('Auth check - User:', user)

            if (!isAuthenticated) {
                console.log('Not authenticated, redirecting to login')
                router.push('/login')
                return false
            }

            if (!user || user.role !== 'admin') {
                console.log('Not admin role, redirecting to home')
                router.push('/')
                return false
            }

            console.log('Admin access granted')
            setAuthChecked(true)
            return true
        }

        if (checkAuthAndAdmin()) {
            fetchStats()
        }
    }, [router])

    const fetchStats = async () => {
        try {
            setLoading(true)
            // Manual olarak istatistikleri hesapla
            const [blogs, users] = await Promise.all([
                adminService.getAllBlogsAdmin(1000, 0), // Tüm blogları al
                adminService.getUsers(1000, 0) // Tüm kullanıcıları al
            ])

            const blogStats = blogs.blogs.reduce((acc, blog) => {
                acc.total++
                if (blog.status === 'pending') acc.pending++
                if (blog.status === 'approved') acc.approved++
                return acc
            }, { total: 0, pending: 0, approved: 0 })

            setStats({
                totalUsers: users.pagination.total,
                totalBlogs: blogStats.total,
                pendingBlogs: blogStats.pending,
                approvedBlogs: blogStats.approved
            })
        } catch (error) {
            setError(error.message)
        } finally {
            setLoading(false)
        }
    }

    if (!authChecked || loading) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="animate-pulse">
                    <div className="h-8 bg-gray-700 rounded w-1/4 mb-8"></div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        {[...Array(4)].map((_, i) => (
                            <div key={i} className="bg-gray-800 p-6 rounded-lg">
                                <div className="h-4 bg-gray-700 rounded w-1/2 mb-2"></div>
                                <div className="h-8 bg-gray-700 rounded w-1/3"></div>
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
                    <h1 className="text-3xl font-bold text-white mb-2">Admin Dashboard</h1>
                    <p className="text-gray-400">Blog sitesi yönetim paneli</p>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="mb-6 p-4 bg-red-900 border border-red-700 text-red-300 rounded-lg">
                        {error}
                    </div>
                )}

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
                        <div className="flex items-center">
                            <div className="p-3 bg-blue-600 rounded-full">
                                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                                </svg>
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-400">Toplam Kullanıcı</p>
                                <p className="text-2xl font-bold text-white">{stats.totalUsers}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
                        <div className="flex items-center">
                            <div className="p-3 bg-green-600 rounded-full">
                                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-400">Toplam Blog</p>
                                <p className="text-2xl font-bold text-white">{stats.totalBlogs}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
                        <div className="flex items-center">
                            <div className="p-3 bg-yellow-600 rounded-full">
                                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-400">Onay Bekleyen</p>
                                <p className="text-2xl font-bold text-white">{stats.pendingBlogs}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
                        <div className="flex items-center">
                            <div className="p-3 bg-emerald-600 rounded-full">
                                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-400">Onaylanmış</p>
                                <p className="text-2xl font-bold text-white">{stats.approvedBlogs}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <Link href="/admin/blogs"
                        className="block bg-gray-800 border border-gray-700 hover:border-gray-600 rounded-lg p-6 transition-all duration-200 group">
                        <div className="flex items-center mb-4">
                            <div className="p-3 bg-blue-600 rounded-full group-hover:bg-blue-700 transition-colors">
                                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                            </div>
                            <h3 className="ml-4 text-xl font-semibold text-white group-hover:text-blue-400 transition-colors">
                                Blog Yönetimi
                            </h3>
                        </div>
                        <p className="text-gray-400 group-hover:text-gray-300 transition-colors">
                            Blogları görüntüle, onayla, reddet veya düzenle
                        </p>
                    </Link>

                    <Link href="/admin/categories"
                        className="block bg-gray-800 border border-gray-700 hover:border-gray-600 rounded-lg p-6 transition-all duration-200 group">
                        <div className="flex items-center mb-4">
                            <div className="p-3 bg-purple-600 rounded-full group-hover:bg-purple-700 transition-colors">
                                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                                </svg>
                            </div>
                            <h3 className="ml-4 text-xl font-semibold text-white group-hover:text-purple-400 transition-colors">
                                Kategori Yönetimi
                            </h3>
                        </div>
                        <p className="text-gray-400 group-hover:text-gray-300 transition-colors">
                            Blog kategorilerini oluştur, düzenle ve yönet
                        </p>
                    </Link>

                    <Link href="/admin/users"
                        className="block bg-gray-800 border border-gray-700 hover:border-gray-600 rounded-lg p-6 transition-all duration-200 group">
                        <div className="flex items-center mb-4">
                            <div className="p-3 bg-green-600 rounded-full group-hover:bg-green-700 transition-colors">
                                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                                </svg>
                            </div>
                            <h3 className="ml-4 text-xl font-semibold text-white group-hover:text-green-400 transition-colors">
                                Kullanıcı Yönetimi
                            </h3>
                        </div>
                        <p className="text-gray-400 group-hover:text-gray-300 transition-colors">
                            Kullanıcıları görüntüle ve rollerini yönet
                        </p>
                    </Link>

                    <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
                        <div className="flex items-center mb-4">
                            <div className="p-3 bg-purple-600 rounded-full">
                                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                </svg>
                            </div>
                            <h3 className="ml-4 text-xl font-semibold text-white">İstatistikler</h3>
                        </div>
                        <p className="text-gray-400">
                            Detaylı analiz ve raporlar (yakında)
                        </p>
                    </div>
                </div>

                {/* Recent Activity */}
                {stats.pendingBlogs > 0 && (
                    <div className="mt-8 bg-yellow-900 border border-yellow-700 rounded-lg p-6">
                        <div className="flex items-center">
                            <svg className="w-6 h-6 text-yellow-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                            </svg>
                            <div>
                                <h3 className="text-yellow-300 font-medium">Dikkat Gerekli</h3>
                                <p className="text-yellow-200">
                                    {stats.pendingBlogs} blog onay bekliyor.
                                    <Link href="/admin/blogs?status=pending" className="ml-2 underline hover:no-underline">
                                        Şimdi incele →
                                    </Link>
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
} 