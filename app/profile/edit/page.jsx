'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { profileService } from '../../../services/profile'
import { authService } from '../../../services/auth'

export default function EditProfilePage() {
    const router = useRouter()
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')

    const [formData, setFormData] = useState({
        name: '',
        bio: '',
        title: '',
        location: '',
        website: '',
        twitter: '',
        linkedin: '',
        github: ''
    })

    useEffect(() => {
        checkAuth()
        loadProfile()
    }, [])

    const checkAuth = () => {
        const user = authService.getCurrentUser()
        if (!user) {
            router.push('/login')
            return
        }
    }

    const loadProfile = async () => {
        try {
            setLoading(true)
            const response = await profileService.getMyProfile()
            const user = response.user

            setFormData({
                name: user.name || '',
                bio: user.bio || '',
                title: user.title || '',
                location: user.location || '',
                website: user.website || '',
                twitter: user.twitter || '',
                linkedin: user.linkedin || '',
                github: user.github || ''
            })
        } catch (error) {
            setError('Profil yüklenemedi: ' + error.message)
        } finally {
            setLoading(false)
        }
    }

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: value
        }))

        // Clear messages when user starts typing
        if (error) setError('')
        if (success) setSuccess('')
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        try {
            setSaving(true)
            setError('')
            setSuccess('')

            await profileService.updateProfile(formData)
            setSuccess('Profil başarıyla güncellendi!')

            // Redirect after 2 seconds
            setTimeout(() => {
                const user = authService.getCurrentUser()
                router.push(`/profile/${user.id}`)
            }, 2000)

        } catch (error) {
            setError(error.message)
        } finally {
            setSaving(false)
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-900 p-8">
                <div className="max-w-2xl mx-auto">
                    <div className="animate-pulse bg-gray-800 rounded-lg p-6">
                        <div className="h-8 bg-gray-700 rounded w-1/3 mb-6"></div>
                        <div className="space-y-4">
                            {[...Array(8)].map((_, i) => (
                                <div key={i}>
                                    <div className="h-4 bg-gray-700 rounded w-1/4 mb-2"></div>
                                    <div className="h-10 bg-gray-700 rounded"></div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-900 p-8">
            <div className="max-w-2xl mx-auto">
                <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                    {/* Header */}
                    <div className="mb-6">
                        <h1 className="text-2xl font-bold text-white mb-2">Profili Düzenle</h1>
                        <p className="text-gray-400">Profil bilgilerinizi güncelleyin</p>
                    </div>

                    {/* Messages */}
                    {error && (
                        <div className="mb-6 p-4 bg-red-900 border border-red-700 text-red-300 rounded-lg">
                            {error}
                        </div>
                    )}

                    {success && (
                        <div className="mb-6 p-4 bg-green-900 border border-green-700 text-green-300 rounded-lg">
                            {success}
                        </div>
                    )}

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Basic Info */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    İsim <span className="text-red-400">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="Adınız ve soyadınız"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Ünvan
                                </label>
                                <input
                                    type="text"
                                    name="title"
                                    value={formData.title}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="ör: Senior Developer, Content Creator"
                                />
                            </div>
                        </div>

                        {/* Bio */}
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Hakkında
                            </label>
                            <textarea
                                name="bio"
                                value={formData.bio}
                                onChange={handleChange}
                                rows={4}
                                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="Kendiniz hakkında kısa bir açıklama yazın..."
                            />
                        </div>

                        {/* Location & Website */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Konum
                                </label>
                                <input
                                    type="text"
                                    name="location"
                                    value={formData.location}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="ör: İstanbul, Türkiye"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Web Sitesi
                                </label>
                                <input
                                    type="url"
                                    name="website"
                                    value={formData.website}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="https://example.com"
                                />
                            </div>
                        </div>

                        {/* Social Media */}
                        <div>
                            <h3 className="text-lg font-medium text-white mb-4">Sosyal Medya</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                        Twitter
                                    </label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">@</span>
                                        <input
                                            type="text"
                                            name="twitter"
                                            value={formData.twitter}
                                            onChange={handleChange}
                                            className="w-full pl-8 pr-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            placeholder="kullaniciadi"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                        GitHub
                                    </label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">@</span>
                                        <input
                                            type="text"
                                            name="github"
                                            value={formData.github}
                                            onChange={handleChange}
                                            className="w-full pl-8 pr-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            placeholder="kullaniciadi"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                        LinkedIn
                                    </label>
                                    <input
                                        type="url"
                                        name="linkedin"
                                        value={formData.linkedin}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="LinkedIn profil URL"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center justify-between pt-6 border-t border-gray-700">
                            <button
                                type="button"
                                onClick={() => router.back()}
                                className="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
                            >
                                İptal
                            </button>

                            <button
                                type="submit"
                                disabled={saving}
                                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white rounded-lg transition-colors flex items-center"
                            >
                                {saving ? (
                                    <>
                                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Kaydediliyor...
                                    </>
                                ) : (
                                    'Profili Güncelle'
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
} 