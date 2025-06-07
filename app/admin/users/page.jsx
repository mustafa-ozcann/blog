'use client'
import { useState, useEffect } from 'react'
import { adminService } from '../../../services/admin'
import { authService } from '../../../services/auth'
import { useRouter } from 'next/navigation'

export default function AdminUsersPage() {
    const [users, setUsers] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [actionLoading, setActionLoading] = useState({})
    const [showModal, setShowModal] = useState(null)
    const [modalData, setModalData] = useState({})
    const router = useRouter()

    useEffect(() => {
        checkAuth()
        loadUsers()
    }, [])

    const checkAuth = () => {
        const user = authService.getCurrentUser()
        if (!user || user.role !== 'admin') {
            router.push('/login')
            return
        }
    }

    const loadUsers = async () => {
        try {
            setLoading(true)
            const response = await adminService.getUsers()
            setUsers(response.users)
        } catch (error) {
            setError(error.message)
        } finally {
            setLoading(false)
        }
    }

    const handleTimeout = async (userId, hours, reason) => {
        try {
            setActionLoading(prev => ({ ...prev, [userId]: 'timeout' }))
            await adminService.timeoutUser(userId, hours, reason)
            await loadUsers()
            setShowModal(null)
            setModalData({})
        } catch (error) {
            setError(error.message)
        } finally {
            setActionLoading(prev => ({ ...prev, [userId]: false }))
        }
    }

    const handleBan = async (userId, reason) => {
        try {
            setActionLoading(prev => ({ ...prev, [userId]: 'ban' }))
            await adminService.banUser(userId, reason)
            await loadUsers()
            setShowModal(null)
            setModalData({})
        } catch (error) {
            setError(error.message)
        } finally {
            setActionLoading(prev => ({ ...prev, [userId]: false }))
        }
    }

    const handleUnban = async (userId) => {
        try {
            setActionLoading(prev => ({ ...prev, [userId]: 'unban' }))
            await adminService.unbanUser(userId)
            await loadUsers()
        } catch (error) {
            setError(error.message)
        } finally {
            setActionLoading(prev => ({ ...prev, [userId]: false }))
        }
    }

    const handleDelete = async (userId) => {
        if (!confirm('Bu kullanıcıyı kalıcı olarak silmek istediğinizden emin misiniz?')) {
            return
        }

        try {
            setActionLoading(prev => ({ ...prev, [userId]: 'delete' }))
            await adminService.deleteUser(userId)
            await loadUsers()
        } catch (error) {
            setError(error.message)
        } finally {
            setActionLoading(prev => ({ ...prev, [userId]: false }))
        }
    }

    const handleRoleChange = async (userId, newRole) => {
        try {
            setActionLoading(prev => ({ ...prev, [userId]: 'role' }))
            await adminService.changeUserRole(userId, newRole)
            await loadUsers()
            setShowModal(null)
            setModalData({})
        } catch (error) {
            setError(error.message)
        } finally {
            setActionLoading(prev => ({ ...prev, [userId]: false }))
        }
    }

    const getStatusBadge = (user) => {
        const now = new Date()

        if (user.status === 'banned') {
            return <span className="px-2 py-1 bg-red-900 text-red-200 rounded-full text-xs">Yasaklı</span>
        }

        if (user.status === 'suspended' && user.timeoutUntil) {
            const timeoutEnd = new Date(user.timeoutUntil)
            if (timeoutEnd > now) {
                return <span className="px-2 py-1 bg-yellow-900 text-yellow-200 rounded-full text-xs">Geçici Yasaklı</span>
            }
        }

        return <span className="px-2 py-1 bg-green-900 text-green-200 rounded-full text-xs">Aktif</span>
    }

    const formatDate = (dateString) => {
        if (!dateString) return '-'
        return new Date(dateString).toLocaleString('tr-TR')
    }

    const isUserActive = (user) => {
        if (user.status === 'banned') return false
        if (user.status === 'suspended' && user.timeoutUntil) {
            const timeoutEnd = new Date(user.timeoutUntil)
            return timeoutEnd <= new Date()
        }
        return user.status === 'active'
    }

    const TimeoutModal = () => (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-gray-800 p-6 rounded-lg w-96">
                <h3 className="text-lg font-semibold text-white mb-4">Geçici Engelleme</h3>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            Engelleme Süresi (Saat)
                        </label>
                        <select
                            value={modalData.hours || ''}
                            onChange={(e) => setModalData(prev => ({ ...prev, hours: e.target.value }))}
                            className="w-full p-2 bg-gray-700 border border-gray-600 rounded text-white"
                        >
                            <option value="">Süre seçin</option>
                            <option value="1">1 Saat</option>
                            <option value="6">6 Saat</option>
                            <option value="12">12 Saat</option>
                            <option value="24">1 Gün</option>
                            <option value="72">3 Gün</option>
                            <option value="168">1 Hafta</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            Sebep (İsteğe bağlı)
                        </label>
                        <textarea
                            value={modalData.reason || ''}
                            onChange={(e) => setModalData(prev => ({ ...prev, reason: e.target.value }))}
                            className="w-full p-2 bg-gray-700 border border-gray-600 rounded text-white"
                            rows={3}
                            placeholder="Engelleme sebebini yazın..."
                        />
                    </div>
                </div>
                <div className="flex justify-end space-x-2 mt-6">
                    <button
                        onClick={() => setShowModal(null)}
                        className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
                    >
                        İptal
                    </button>
                    <button
                        onClick={() => handleTimeout(modalData.userId, modalData.hours, modalData.reason)}
                        disabled={!modalData.hours}
                        className="px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700 disabled:opacity-50"
                    >
                        Engelle
                    </button>
                </div>
            </div>
        </div>
    )

    const BanModal = () => (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-gray-800 p-6 rounded-lg w-96">
                <h3 className="text-lg font-semibold text-white mb-4">Kalıcı Engelleme</h3>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            Sebep (İsteğe bağlı)
                        </label>
                        <textarea
                            value={modalData.reason || ''}
                            onChange={(e) => setModalData(prev => ({ ...prev, reason: e.target.value }))}
                            className="w-full p-2 bg-gray-700 border border-gray-600 rounded text-white"
                            rows={3}
                            placeholder="Engelleme sebebini yazın..."
                        />
                    </div>
                    <div className="bg-red-900 border border-red-700 p-3 rounded">
                        <p className="text-red-200 text-sm">
                            ⚠️ Bu işlem kullanıcının siteye erişimini kalıcı olarak engelleyecektir.
                        </p>
                    </div>
                </div>
                <div className="flex justify-end space-x-2 mt-6">
                    <button
                        onClick={() => setShowModal(null)}
                        className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
                    >
                        İptal
                    </button>
                    <button
                        onClick={() => handleBan(modalData.userId, modalData.reason)}
                        className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                    >
                        Kalıcı Engelle
                    </button>
                </div>
            </div>
        </div>
    )

    const RoleModal = () => (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-gray-800 p-6 rounded-lg w-96">
                <h3 className="text-lg font-semibold text-white mb-4">Kullanıcı Rolü Değiştir</h3>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            Yeni Rol
                        </label>
                        <select
                            value={modalData.role || ''}
                            onChange={(e) => setModalData(prev => ({ ...prev, role: e.target.value }))}
                            className="w-full p-2 bg-gray-700 border border-gray-600 rounded text-white"
                        >
                            <option value="">Rol seçin</option>
                            <option value="user">Kullanıcı</option>
                            <option value="moderator">Moderatör</option>
                            <option value="admin">Admin</option>
                        </select>
                    </div>
                    <div className="bg-blue-900 border border-blue-700 p-3 rounded">
                        <p className="text-blue-200 text-sm">
                            <strong>Roller:</strong><br />
                            • <strong>Kullanıcı:</strong> Normal kullanıcı yetkisi<br />
                            • <strong>Moderatör:</strong> İçerik moderasyon yetkisi<br />
                            • <strong>Admin:</strong> Tam yönetici yetkisi
                        </p>
                    </div>
                </div>
                <div className="flex justify-end space-x-2 mt-6">
                    <button
                        onClick={() => setShowModal(null)}
                        className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
                    >
                        İptal
                    </button>
                    <button
                        onClick={() => handleRoleChange(modalData.userId, modalData.role)}
                        disabled={!modalData.role}
                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                    >
                        Rolü Değiştir
                    </button>
                </div>
            </div>
        </div>
    )

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-900 p-8">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
                        <p className="text-gray-400 mt-4">Kullanıcılar yükleniyor...</p>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-900 p-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-white mb-2">Kullanıcı Yönetimi</h1>
                    <p className="text-gray-400">Tüm kullanıcıları yönetin ve gerektiğinde işlem yapın</p>
                </div>

                {/* Error Alert */}
                {error && (
                    <div className="mb-6 p-4 bg-red-900 border border-red-700 text-red-300 rounded-lg">
                        {error}
                        <button
                            onClick={() => setError('')}
                            className="float-right text-red-400 hover:text-red-300"
                        >
                            ✕
                        </button>
                    </div>
                )}

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <div className="bg-gray-800 p-6 rounded-lg">
                        <h3 className="text-lg font-semibold text-white mb-2">Toplam Kullanıcı</h3>
                        <p className="text-3xl font-bold text-blue-400">{users.length}</p>
                    </div>
                    <div className="bg-gray-800 p-6 rounded-lg">
                        <h3 className="text-lg font-semibold text-white mb-2">Aktif</h3>
                        <p className="text-3xl font-bold text-green-400">
                            {users.filter(user => isUserActive(user)).length}
                        </p>
                    </div>
                    <div className="bg-gray-800 p-6 rounded-lg">
                        <h3 className="text-lg font-semibold text-white mb-2">Geçici Yasaklı</h3>
                        <p className="text-3xl font-bold text-yellow-400">
                            {users.filter(user => user.status === 'suspended' && user.timeoutUntil && new Date(user.timeoutUntil) > new Date()).length}
                        </p>
                    </div>
                    <div className="bg-gray-800 p-6 rounded-lg">
                        <h3 className="text-lg font-semibold text-white mb-2">Yasaklı</h3>
                        <p className="text-3xl font-bold text-red-400">
                            {users.filter(user => user.status === 'banned').length}
                        </p>
                    </div>
                </div>

                {/* Users Table */}
                <div className="bg-gray-800 rounded-lg overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-700">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                        Kullanıcı
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                        Durum
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                        Post Sayısı
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                        Kayıt Tarihi
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                        Son Giriş
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">
                                        İşlemler
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-700">
                                {users.map((user) => (
                                    <tr key={user.id} className="hover:bg-gray-700">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="flex-shrink-0 h-10 w-10">
                                                    <div className="h-10 w-10 rounded-full bg-gray-600 flex items-center justify-center">
                                                        <span className="text-sm font-medium text-gray-300">
                                                            {user.name.charAt(0).toUpperCase()}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="ml-4">
                                                    <div className="text-sm font-medium text-white">{user.name}</div>
                                                    <div className="text-sm text-gray-400">{user.email}</div>
                                                    <div className="mt-1">
                                                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${user.role === 'admin'
                                                            ? 'bg-red-900 text-red-200'
                                                            : user.role === 'moderator'
                                                                ? 'bg-purple-900 text-purple-200'
                                                                : 'bg-blue-900 text-blue-200'
                                                            }`}>
                                                            {user.role === 'admin' ? 'Admin' :
                                                                user.role === 'moderator' ? 'Moderatör' : 'Kullanıcı'}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex flex-col space-y-1">
                                                {getStatusBadge(user)}
                                                {user.bannedReason && (
                                                    <div className="text-xs text-gray-400 max-w-xs truncate">
                                                        {user.bannedReason}
                                                    </div>
                                                )}
                                                {user.timeoutUntil && new Date(user.timeoutUntil) > new Date() && (
                                                    <div className="text-xs text-gray-400">
                                                        Bitiş: {formatDate(user.timeoutUntil)}
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                                            {user._count.posts}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                                            {formatDate(user.createdAt)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                                            {formatDate(user.lastLoginAt)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <div className="flex justify-end space-x-1">
                                                {/* Rol değiştir butonu - herkese görünür */}
                                                <button
                                                    onClick={() => {
                                                        setModalData({ userId: user.id, currentRole: user.role })
                                                        setShowModal('role')
                                                    }}
                                                    disabled={actionLoading[user.id]}
                                                    className="px-2 py-1 bg-purple-600 text-white rounded text-xs hover:bg-purple-700 disabled:opacity-50"
                                                    title="Rol Değiştir"
                                                >
                                                    {actionLoading[user.id] === 'role' ? '...' : 'Rol'}
                                                </button>

                                                {/* Diğer işlemler - sadece admin olmayanlara */}
                                                {user.role !== 'admin' && (
                                                    <>
                                                        {isUserActive(user) ? (
                                                            <>
                                                                <button
                                                                    onClick={() => {
                                                                        setModalData({ userId: user.id })
                                                                        setShowModal('timeout')
                                                                    }}
                                                                    disabled={actionLoading[user.id]}
                                                                    className="px-2 py-1 bg-yellow-600 text-white rounded text-xs hover:bg-yellow-700 disabled:opacity-50"
                                                                    title="Geçici Engelle"
                                                                >
                                                                    {actionLoading[user.id] === 'timeout' ? '...' : 'T'}
                                                                </button>
                                                                <button
                                                                    onClick={() => {
                                                                        setModalData({ userId: user.id })
                                                                        setShowModal('ban')
                                                                    }}
                                                                    disabled={actionLoading[user.id]}
                                                                    className="px-2 py-1 bg-red-600 text-white rounded text-xs hover:bg-red-700 disabled:opacity-50"
                                                                    title="Kalıcı Engelle"
                                                                >
                                                                    {actionLoading[user.id] === 'ban' ? '...' : 'B'}
                                                                </button>
                                                            </>
                                                        ) : (
                                                            <button
                                                                onClick={() => handleUnban(user.id)}
                                                                disabled={actionLoading[user.id]}
                                                                className="px-2 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700 disabled:opacity-50"
                                                                title="Yasağı Kaldır"
                                                            >
                                                                {actionLoading[user.id] === 'unban' ? '...' : 'U'}
                                                            </button>
                                                        )}
                                                        <button
                                                            onClick={() => handleDelete(user.id)}
                                                            disabled={actionLoading[user.id]}
                                                            className="px-2 py-1 bg-gray-600 text-white rounded text-xs hover:bg-gray-700 disabled:opacity-50"
                                                            title="Kullanıcıyı Sil"
                                                        >
                                                            {actionLoading[user.id] === 'delete' ? '...' : 'S'}
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {users.length === 0 && (
                        <div className="text-center py-12">
                            <p className="text-gray-400">Henüz kullanıcı bulunmuyor.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Modals */}
            {showModal === 'timeout' && <TimeoutModal />}
            {showModal === 'ban' && <BanModal />}
            {showModal === 'role' && <RoleModal />}
        </div>
    )
} 