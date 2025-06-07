'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { authService } from '../services/auth'

export default function CreateBlogButton({ className = "" }) {
    const [isAuthenticated, setIsAuthenticated] = useState(false)

    useEffect(() => {
        setIsAuthenticated(authService.isAuthenticated())

        // Storage değişikliklerini dinle
        const handleStorageChange = () => {
            setIsAuthenticated(authService.isAuthenticated())
        }

        window.addEventListener('storage', handleStorageChange)
        return () => window.removeEventListener('storage', handleStorageChange)
    }, [])

    if (!isAuthenticated) {
        return (
            <Link
                href="/login"
                className={`inline-flex items-center bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900 ${className}`}
            >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Blog Yazmaya Başla
            </Link>
        )
    }

    return (
        <Link
            href="/create-blog"
            className={`inline-flex items-center bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-gray-900 ${className}`}
        >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Yeni Blog Yaz
        </Link>
    )
} 