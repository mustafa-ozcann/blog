'use client'
import { useState } from 'react'
import Link from 'next/link'

export default function ProfileCard({ user, showActions = false, isPreview = false }) {
    const [imageError, setImageError] = useState(false)

    const formatDate = (dateString) => {
        if (!dateString) return '-'
        return new Date(dateString).toLocaleDateString('tr-TR')
    }

    const getInitials = (name) => {
        if (!name) return 'U'
        return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    }

    const getRoleColor = (role) => {
        switch (role) {
            case 'admin':
                return 'bg-red-900 text-red-200 border-red-700'
            case 'moderator':
                return 'bg-purple-900 text-purple-200 border-purple-700'
            default:
                return 'bg-blue-900 text-blue-200 border-blue-700'
        }
    }

    const getStatusColor = (status) => {
        switch (status) {
            case 'active':
                return 'bg-green-900 text-green-200'
            case 'suspended':
                return 'bg-yellow-900 text-yellow-200'
            case 'banned':
                return 'bg-red-900 text-red-200'
            default:
                return 'bg-gray-900 text-gray-200'
        }
    }

    if (!user) {
        return (
            <div className="bg-gray-800 rounded-lg p-6 animate-pulse">
                <div className="flex items-center space-x-4">
                    <div className="h-16 w-16 bg-gray-700 rounded-full"></div>
                    <div className="flex-1">
                        <div className="h-4 bg-gray-700 rounded w-1/2 mb-2"></div>
                        <div className="h-3 bg-gray-700 rounded w-1/3"></div>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className={`bg-gray-800 rounded-lg ${isPreview ? 'p-4' : 'p-6'} border border-gray-700`}>
            {/* Header */}
            <div className="flex items-center space-x-4 mb-4">
                {/* Profile Image */}
                <div className="relative">
                    {user.image && !imageError ? (
                        <img
                            src={user.image}
                            alt={user.name}
                            className={`${isPreview ? 'h-12 w-12' : 'h-16 w-16'} rounded-full object-cover border-2 border-gray-600`}
                            onError={() => setImageError(true)}
                        />
                    ) : (
                        <div className={`${isPreview ? 'h-12 w-12' : 'h-16 w-16'} rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center border-2 border-gray-600`}>
                            <span className={`${isPreview ? 'text-sm' : 'text-xl'} font-bold text-white`}>
                                {getInitials(user.name)}
                            </span>
                        </div>
                    )}

                    {/* Status indicator */}
                    <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-gray-800 ${getStatusColor(user.status)}`}></div>
                </div>

                {/* Basic Info */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                        <h3 className={`${isPreview ? 'text-lg' : 'text-xl'} font-semibold text-white truncate`}>
                            {user.name}
                        </h3>
                        {user.role !== 'user' && (
                            <span className={`px-2 py-1 text-xs font-semibold rounded-full border ${getRoleColor(user.role)}`}>
                                {user.role === 'admin' ? 'Admin' : 'Moderatör'}
                            </span>
                        )}
                    </div>

                    {user.title && (
                        <p className="text-sm text-gray-400 mb-1">{user.title}</p>
                    )}

                    <div className="flex items-center space-x-4 text-xs text-gray-500">
                        {user.location && (
                            <span className="flex items-center">
                                <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                                {user.location}
                            </span>
                        )}
                        <span>Üye: {formatDate(user.createdAt)}</span>
                    </div>
                </div>
            </div>

            {/* Bio */}
            {user.bio && !isPreview && (
                <div className="mb-4">
                    <p className="text-gray-300 text-sm leading-relaxed">{user.bio}</p>
                </div>
            )}

            {/* Stats */}
            {user.stats && (
                <div className="grid grid-cols-3 gap-4 mb-4">
                    <div className="text-center">
                        <div className="text-lg font-bold text-white">{user.stats.postsCount}</div>
                        <div className="text-xs text-gray-400">Yazı</div>
                    </div>
                    <div className="text-center">
                        <div className="text-lg font-bold text-white">{user.stats.messagesCount}</div>
                        <div className="text-xs text-gray-400">Mesaj</div>
                    </div>
                    <div className="text-center">
                        <div className="text-lg font-bold text-white">{user.stats.likesReceived}</div>
                        <div className="text-xs text-gray-400">Beğeni</div>
                    </div>
                </div>
            )}

            {/* Social Links */}
            {!isPreview && (user.website || user.twitter || user.linkedin || user.github) && (
                <div className="flex space-x-3 mb-4">
                    {user.website && (
                        <a
                            href={user.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
                        >
                            <svg className="w-4 h-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                            </svg>
                        </a>
                    )}
                    {user.twitter && (
                        <a
                            href={`https://twitter.com/${user.twitter}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
                        >
                            <svg className="w-4 h-4 text-gray-300" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                            </svg>
                        </a>
                    )}
                    {user.linkedin && (
                        <a
                            href={user.linkedin}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
                        >
                            <svg className="w-4 h-4 text-gray-300" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                            </svg>
                        </a>
                    )}
                    {user.github && (
                        <a
                            href={`https://github.com/${user.github}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
                        >
                            <svg className="w-4 h-4 text-gray-300" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                            </svg>
                        </a>
                    )}
                </div>
            )}

            {/* Actions */}
            {showActions && !isPreview && (
                <div className="flex space-x-2 pt-4 border-t border-gray-700">
                    <Link
                        href={`/profile/${user.id}`}
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-center py-2 px-4 rounded-lg transition-colors text-sm"
                    >
                        Profili Görüntüle
                    </Link>
                    <button className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-2 px-4 rounded-lg transition-colors text-sm">
                        Mesaj Gönder
                    </button>
                </div>
            )}
        </div>
    )
} 