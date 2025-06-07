'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { authService } from '../services/auth'
import ProfilePreview from './ProfilePreview'

export default function Header() {
    const [isAuthenticated, setIsAuthenticated] = useState(false)
    const [user, setUser] = useState(null)
    const [searchQuery, setSearchQuery] = useState('')
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
    const [isProfilePreviewOpen, setIsProfilePreviewOpen] = useState(false)
    const router = useRouter()

    useEffect(() => {
        // Authentication durumunu kontrol et
        const checkAuth = () => {
            const authenticated = authService.isAuthenticated()
            const currentUser = authService.getCurrentUser()

            setIsAuthenticated(authenticated)
            setUser(currentUser)

            // Token'ı cookie'ye sync et (middleware için)
            if (authenticated) {
                authService.syncTokenToCookie()
            }
        }

        checkAuth()

        // Storage değişikliklerini dinle (farklı sekmeler için)
        const handleStorageChange = () => {
            checkAuth()
        }

        // Auth değişikliklerini dinle (aynı sekme için)
        const handleAuthChange = () => {
            checkAuth()
        }

        window.addEventListener('storage', handleStorageChange)
        window.addEventListener('authChange', handleAuthChange)

        return () => {
            window.removeEventListener('storage', handleStorageChange)
            window.removeEventListener('authChange', handleAuthChange)
        }
    }, [])

    const handleSearch = (e) => {
        e.preventDefault()
        if (searchQuery.trim()) {
            router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`)
            setSearchQuery('')
        }
    }

    const handleLogout = () => {
        authService.logout()
        setIsAuthenticated(false)
        setUser(null)
        setIsUserMenuOpen(false)
    }

    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen)
    }

    const toggleUserMenu = () => {
        setIsUserMenuOpen(!isUserMenuOpen)
        setIsProfilePreviewOpen(false)
    }

    const toggleProfilePreview = () => {
        setIsProfilePreviewOpen(!isProfilePreviewOpen)
        setIsUserMenuOpen(false)
    }

    return (
        <header className="bg-gray-900 border-b border-gray-700 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <div className="flex-shrink-0">
                        <Link
                            href="/"
                            className="flex items-center space-x-2 hover:opacity-80 transition-opacity"
                            onClick={() => {
                                // Ana sayfaya dönerken URL'yi temizle ve navigation event'i tetikle
                                setTimeout(() => {
                                    if (window.location.pathname === '/') {
                                        window.history.replaceState({}, '', '/')
                                        window.dispatchEvent(new Event('navigationChange'))
                                    }
                                }, 100)
                            }}
                        >
                            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                                <span className="text-white font-bold text-lg">B</span>
                            </div>
                            <span className="text-white font-bold text-xl hidden sm:block">Blog Sitesi</span>
                        </Link>
                    </div>

                    {/* Desktop Navigation */}
                    <div className="hidden md:block">
                        <div className="ml-10 flex items-baseline space-x-8">
                            {isAuthenticated && user?.role === 'admin' && (
                                <Link
                                    href="/admin"
                                    className="text-orange-300 hover:text-orange-200 px-3 py-2 rounded-md text-sm font-medium transition-colors border border-orange-600 hover:border-orange-500"
                                >
                                    Admin Panel
                                </Link>
                            )}
                        </div>
                    </div>

                    {/* Search Bar */}
                    <div className="flex-1 max-w-lg mx-4">
                        <form onSubmit={handleSearch} className="relative">
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Blog ara..."
                                className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-2 pl-10 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                            />
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </div>
                        </form>
                    </div>

                    {/* User Area */}
                    <div className="flex items-center space-x-4">
                        {isAuthenticated ? (
                            <div className="relative">
                                <div className="flex items-center space-x-2">
                                    {/* Profile Image - Click for preview */}
                                    <button
                                        onClick={toggleProfilePreview}
                                        className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center hover:bg-blue-700 transition-colors"
                                    >
                                        <span className="text-white text-sm font-medium">
                                            {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                                        </span>
                                    </button>

                                    {/* Name and dropdown arrow */}
                                    <button
                                        onClick={toggleUserMenu}
                                        className="flex items-center space-x-1 text-gray-300 hover:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-md px-2 py-2 transition-colors"
                                    >
                                        <span className="hidden sm:block text-sm font-medium">{user?.name}</span>
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </button>
                                </div>

                                {/* Profile Preview */}
                                <ProfilePreview
                                    isOpen={isProfilePreviewOpen}
                                    onClose={() => setIsProfilePreviewOpen(false)}
                                />

                                {/* User Dropdown */}
                                {isUserMenuOpen && (
                                    <div className="absolute right-0 mt-2 w-48 bg-gray-800 rounded-md shadow-lg py-1 z-50 border border-gray-700">
                                        <Link
                                            href="/my-posts"
                                            className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
                                            onClick={() => setIsUserMenuOpen(false)}
                                        >
                                            Yazılarım
                                        </Link>
                                        <Link
                                            href="/settings"
                                            className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
                                            onClick={() => setIsUserMenuOpen(false)}
                                        >
                                            Ayarlar
                                        </Link>
                                        <hr className="my-1 border-gray-700" />
                                        <button
                                            onClick={handleLogout}
                                            className="block w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-gray-700 hover:text-red-300 transition-colors"
                                        >
                                            Çıkış Yap
                                        </button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <Link
                                href="/login"
                                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900"
                            >
                                Giriş Yap
                            </Link>
                        )}

                        {/* Mobile menu button */}
                        <div className="md:hidden">
                            <button
                                onClick={toggleMobileMenu}
                                className="text-gray-400 hover:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-md p-2 transition-colors"
                            >
                                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    {isMobileMenuOpen ? (
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    ) : (
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                    )}
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Mobile Navigation */}
                {isMobileMenuOpen && (
                    <div className="md:hidden">
                        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 border-t border-gray-700">
                            <Link
                                href="/blogs"
                                className="text-gray-300 hover:text-white block px-3 py-2 rounded-md text-base font-medium transition-colors"
                                onClick={() => setIsMobileMenuOpen(false)}
                            >
                                Bloglar
                            </Link>
                            <Link
                                href="/social"
                                className="text-gray-300 hover:text-white block px-3 py-2 rounded-md text-base font-medium transition-colors"
                                onClick={() => setIsMobileMenuOpen(false)}
                            >
                                Sosyal
                            </Link>

                            {isAuthenticated && user?.role === 'admin' && (
                                <>
                                    <Link
                                        href="/admin"
                                        className="text-orange-300 hover:text-orange-200 block px-3 py-2 rounded-md text-base font-medium transition-colors border border-orange-600 hover:border-orange-500 mx-3 mb-2"
                                        onClick={() => setIsMobileMenuOpen(false)}
                                    >
                                        Admin Panel
                                    </Link>
                                    <Link
                                        href="/admin/categories"
                                        className="text-gray-300 hover:text-white block px-3 py-2 rounded-md text-base font-medium transition-colors"
                                        onClick={() => setIsMobileMenuOpen(false)}
                                    >
                                        Kategoriler
                                    </Link>
                                </>
                            )}

                            {isAuthenticated && (
                                <>
                                    <hr className="my-2 border-gray-700" />
                                    <Link
                                        href="/profile"
                                        className="text-gray-300 hover:text-white block px-3 py-2 rounded-md text-base font-medium transition-colors"
                                        onClick={() => setIsMobileMenuOpen(false)}
                                    >
                                        Hesabım
                                    </Link>
                                    <Link
                                        href="/my-posts"
                                        className="text-gray-300 hover:text-white block px-3 py-2 rounded-md text-base font-medium transition-colors"
                                        onClick={() => setIsMobileMenuOpen(false)}
                                    >
                                        Yazılarım
                                    </Link>
                                    <button
                                        onClick={() => {
                                            handleLogout()
                                            setIsMobileMenuOpen(false)
                                        }}
                                        className="text-red-400 hover:text-red-300 block w-full text-left px-3 py-2 rounded-md text-base font-medium transition-colors"
                                    >
                                        Çıkış Yap
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Overlay for dropdown menus */}
            {(isUserMenuOpen || isMobileMenuOpen || isProfilePreviewOpen) && (
                <div
                    className="fixed inset-0 z-40"
                    onClick={() => {
                        setIsUserMenuOpen(false)
                        setIsMobileMenuOpen(false)
                        setIsProfilePreviewOpen(false)
                    }}
                />
            )}
        </header>
    )
} 