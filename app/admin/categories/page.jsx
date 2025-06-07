'use client'
import { useState, useEffect } from 'react'
import { authService } from '../../../services/auth'
import { useRouter } from 'next/navigation'

export default function AdminCategoriesPage() {
    const [categories, setCategories] = useState([])
    const [loading, setLoading] = useState(true)
    const [actionLoading, setActionLoading] = useState({})
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')
    const [showCreateModal, setShowCreateModal] = useState(false)
    const [editingCategory, setEditingCategory] = useState(null)
    const [formData, setFormData] = useState({
        name: '',
        description: ''
    })
    const router = useRouter()

    useEffect(() => {
        // Check if user is admin
        const user = authService.getCurrentUser()
        if (!user || user.role !== 'admin') {
            router.push('/')
            return
        }

        loadCategories()
    }, [])

    const loadCategories = async () => {
        try {
            setLoading(true)
            const token = localStorage.getItem('token')
            const response = await fetch('/api/admin/categories', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })

            if (!response.ok) {
                throw new Error('Kategoriler getirilemedi')
            }

            const data = await response.json()
            setCategories(data.categories)
        } catch (error) {
            setError(error.message)
        } finally {
            setLoading(false)
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        if (!formData.name.trim()) {
            setError('Kategori adı gereklidir')
            return
        }

        try {
            setActionLoading(prev => ({ ...prev, save: true }))
            const token = localStorage.getItem('token')

            const url = editingCategory
                ? `/api/admin/categories/${editingCategory.id}`
                : '/api/admin/categories'

            const method = editingCategory ? 'PUT' : 'POST'

            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error)
            }

            setSuccess(data.message)
            resetForm()
            await loadCategories()
        } catch (error) {
            setError(error.message)
        } finally {
            setActionLoading(prev => ({ ...prev, save: false }))
        }
    }

    const handleEdit = (category) => {
        setEditingCategory(category)
        setFormData({
            name: category.name,
            description: category.description || ''
        })
        setShowCreateModal(true)
    }

    const handleDelete = async (categoryId) => {
        if (!confirm('Bu kategoriyi silmek istediğinizden emin misiniz?')) {
            return
        }

        try {
            setActionLoading(prev => ({ ...prev, [`delete_${categoryId}`]: true }))
            const token = localStorage.getItem('token')

            const response = await fetch(`/api/admin/categories/${categoryId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error)
            }

            setSuccess(data.message)
            await loadCategories()
        } catch (error) {
            setError(error.message)
        } finally {
            setActionLoading(prev => ({ ...prev, [`delete_${categoryId}`]: false }))
        }
    }

    const resetForm = () => {
        setFormData({ name: '', description: '' })
        setEditingCategory(null)
        setShowCreateModal(false)
        setError('')
        setSuccess('')
    }

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('tr-TR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        })
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-900 p-8">
                <div className="max-w-6xl mx-auto">
                    <div className="animate-pulse">
                        <div className="h-8 bg-gray-700 rounded w-1/3 mb-8"></div>
                        <div className="bg-gray-800 rounded-lg p-6">
                            <div className="h-4 bg-gray-700 rounded w-full mb-4"></div>
                            <div className="h-4 bg-gray-700 rounded w-full mb-4"></div>
                            <div className="h-4 bg-gray-700 rounded w-3/4"></div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-900 p-8">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-white mb-2">Kategori Yönetimi</h1>
                        <p className="text-gray-400">Blog kategorilerini yönetin</p>
                    </div>
                    <button
                        onClick={() => {
                            resetForm()
                            setShowCreateModal(true)
                        }}
                        className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center space-x-2"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        <span>Yeni Kategori</span>
                    </button>
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

                {/* Categories Table */}
                <div className="bg-gray-800 rounded-lg overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-700">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                        Kategori
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                        Açıklama
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                        Blog Sayısı
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                        Oluşturma Tarihi
                                    </th>
                                    <th className="px-6 py-4 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">
                                        İşlemler
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-700">
                                {categories.map((category) => (
                                    <tr key={category.id} className="hover:bg-gray-700 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="font-medium text-white">{category.name}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-gray-300 max-w-xs">
                                                {category.description || 'Açıklama yok'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="px-2 py-1 text-xs font-medium bg-blue-900 text-blue-200 rounded-full">
                                                {category._count.posts}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-gray-300">
                                            {formatDate(category.createdAt)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <div className="flex items-center justify-end space-x-2">
                                                <button
                                                    onClick={() => handleEdit(category)}
                                                    className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm transition-colors"
                                                >
                                                    Düzenle
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(category.id)}
                                                    disabled={actionLoading[`delete_${category.id}`] || category._count.posts > 0}
                                                    className="bg-red-600 hover:bg-red-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-3 py-1 rounded text-sm transition-colors"
                                                    title={category._count.posts > 0 ? 'Bu kategoriye ait bloglar var' : ''}
                                                >
                                                    {actionLoading[`delete_${category.id}`] ? 'Siliniyor...' : 'Sil'}
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {categories.length === 0 && (
                    <div className="text-center py-12 text-gray-400">
                        <p>Henüz kategori eklenmemiş.</p>
                    </div>
                )}
            </div>

            {/* Create/Edit Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md">
                        <h3 className="text-xl font-semibold text-white mb-4">
                            {editingCategory ? 'Kategori Düzenle' : 'Yeni Kategori'}
                        </h3>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Kategori Adı *
                                </label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                    className="w-full bg-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Kategori adını giriniz"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Açıklama
                                </label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                                    className="w-full bg-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                                    rows={3}
                                    placeholder="Kategori açıklaması (isteğe bağlı)"
                                />
                            </div>

                            <div className="flex items-center justify-end space-x-3 pt-4">
                                <button
                                    type="button"
                                    onClick={resetForm}
                                    className="px-4 py-2 text-gray-300 hover:text-white transition-colors"
                                >
                                    İptal
                                </button>
                                <button
                                    type="submit"
                                    disabled={actionLoading.save}
                                    className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white px-6 py-2 rounded-lg transition-colors"
                                >
                                    {actionLoading.save ? 'Kaydediliyor...' : (editingCategory ? 'Güncelle' : 'Oluştur')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
} 