'use client'
import { useParams } from 'next/navigation'
import { useEffect } from 'react'

export default function BlogSlugPage() {
    const params = useParams()

    useEffect(() => {
        // Slug ile blog ID'sini bul ve yönlendir
        const findAndRedirect = async () => {
            try {
                const response = await fetch(`/api/blogs/slug/${params.slug}`)
                if (response.ok) {
                    const data = await response.json()
                    // Blog detay sayfasına yönlendir
                    window.location.href = `/blog/${data.blog.id}`
                } else {
                    // 404 sayfasına yönlendir
                    window.location.href = '/404'
                }
            } catch (error) {
                console.error('Blog slug error:', error)
                window.location.href = '/404'
            }
        }

        if (params.slug) {
            findAndRedirect()
        }
    }, [params.slug])

    return (
        <div className="min-h-screen bg-gray-900 flex items-center justify-center">
            <div className="text-white text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
                <p>Yönlendiriliyor...</p>
            </div>
        </div>
    )
} 