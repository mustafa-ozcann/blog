'use client'
import { useState, useEffect } from 'react'
import BlogCard from './BlogCard'
import { blogService } from '../services/blog'

export default function BlogList({ limit = 6 }) {
    const [blogs, setBlogs] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [hasMore, setHasMore] = useState(false)

    useEffect(() => {
        fetchBlogs()
    }, [])

    const fetchBlogs = async () => {
        try {
            setLoading(true)
            const response = await blogService.getAllBlogs(limit, 0)
            setBlogs(response.blogs)
            setHasMore(response.pagination.hasMore)
        } catch (error) {
            setError(error.message)
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return (
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-white">Son Bloglar</h2>
                </div>

                {/* Loading Skeleton */}
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[...Array(6)].map((_, index) => (
                        <div key={index} className="bg-gray-800 rounded-lg border border-gray-700 p-6 animate-pulse">
                            <div className="flex items-center justify-between mb-3">
                                <div className="h-5 bg-gray-700 rounded w-20"></div>
                                <div className="h-4 bg-gray-700 rounded w-16"></div>
                            </div>
                            <div className="h-6 bg-gray-700 rounded w-3/4 mb-3"></div>
                            <div className="space-y-2 mb-4">
                                <div className="h-4 bg-gray-700 rounded"></div>
                                <div className="h-4 bg-gray-700 rounded"></div>
                                <div className="h-4 bg-gray-700 rounded w-2/3"></div>
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                    <div className="w-8 h-8 bg-gray-700 rounded-full"></div>
                                    <div className="h-4 bg-gray-700 rounded w-20"></div>
                                </div>
                                <div className="h-4 bg-gray-700 rounded w-16"></div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="text-center py-12">
                <div className="w-16 h-16 bg-red-900 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                </div>
                <h3 className="text-lg font-medium text-white mb-2">Bloglar Yüklenemedi</h3>
                <p className="text-gray-400 mb-4">{error}</p>
                <button
                    onClick={fetchBlogs}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                >
                    Tekrar Dene
                </button>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-white">Son Bloglar</h2>
                {hasMore && (
                    <a
                        href="/blogs"
                        className="text-blue-400 hover:text-blue-300 font-medium transition-colors"
                    >
                        Tümünü gör →
                    </a>
                )}
            </div>

            {/* Blog Grid */}
            {blogs.length > 0 ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {blogs.map((blog) => (
                        <BlogCard key={blog.id} blog={blog} />
                    ))}
                </div>
            ) : (
                <div className="text-center py-12">
                    <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                    </div>
                    <h3 className="text-lg font-medium text-white mb-2">Henüz Blog Yok</h3>
                    <p className="text-gray-400 mb-4">
                        İlk blog yazısını siz yazabilirsiniz!
                    </p>
                    <a
                        href="/create-blog"
                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors inline-block"
                    >
                        Blog Yaz
                    </a>
                </div>
            )}
        </div>
    )
} 