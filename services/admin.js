const API_BASE_URL = '/api/admin'

export const adminService = {
    // Onay bekleyen blogları getir
    async getPendingBlogs(limit = 10, offset = 0) {
        const token = localStorage.getItem('token')
        const response = await fetch(`${API_BASE_URL}/blogs/pending?limit=${limit}&offset=${offset}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })

        if (!response.ok) {
            throw new Error('Onay bekleyen bloglar getirilemedi')
        }

        return response.json()
    },

    // Tüm blogları getir (admin için)
    async getAllBlogsAdmin(limit = 10, offset = 0, status = 'all') {
        const token = localStorage.getItem('token')
        const response = await fetch(`${API_BASE_URL}/blogs?limit=${limit}&offset=${offset}&status=${status}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })

        if (!response.ok) {
            throw new Error('Bloglar getirilemedi')
        }

        return response.json()
    },

    // Blog onayla
    async approveBlog(blogId) {
        const token = localStorage.getItem('token')
        const response = await fetch(`${API_BASE_URL}/blogs/${blogId}/approve`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })

        const data = await response.json()

        if (!response.ok) {
            throw new Error(data.error || 'Blog onaylanamadı')
        }

        return data
    },

    // Blog reddet
    async rejectBlog(blogId) {
        const token = localStorage.getItem('token')
        const response = await fetch(`${API_BASE_URL}/blogs/${blogId}/reject`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })

        const data = await response.json()

        if (!response.ok) {
            throw new Error(data.error || 'Blog reddedilemedi')
        }

        return data
    },

    // Blog sil (admin)
    async deleteBlogAdmin(blogId) {
        const token = localStorage.getItem('token')
        const response = await fetch(`${API_BASE_URL}/blogs/${blogId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })

        if (!response.ok) {
            const data = await response.json()
            throw new Error(data.error || 'Blog silinemedi')
        }

        return { success: true }
    },

    // Kullanıcıları getir
    async getUsers(limit = 10, offset = 0) {
        const token = localStorage.getItem('token')
        const response = await fetch(`${API_BASE_URL}/users?limit=${limit}&offset=${offset}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })

        if (!response.ok) {
            throw new Error('Kullanıcılar getirilemedi')
        }

        return response.json()
    },

    // Kullanıcı rolünü güncelle
    async updateUserRole(userId, role) {
        const token = localStorage.getItem('token')
        const response = await fetch(`${API_BASE_URL}/users/${userId}/role`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ role })
        })

        const data = await response.json()

        if (!response.ok) {
            throw new Error(data.error || 'Kullanıcı rolü güncellenemedi')
        }

        return data
    },

    // İstatistikleri getir
    async getStats() {
        const token = localStorage.getItem('token')
        const response = await fetch(`${API_BASE_URL}/stats`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })

        if (!response.ok) {
            throw new Error('İstatistikler getirilemedi')
        }

        return response.json()
    },

    // Kullanıcıyı geçici engelle (timeout)
    async timeoutUser(userId, hours, reason) {
        const token = localStorage.getItem('token')
        const response = await fetch(`${API_BASE_URL}/users/${userId}/timeout`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ hours, reason })
        })

        const data = await response.json()

        if (!response.ok) {
            throw new Error(data.error || 'Kullanıcı engellenemedi')
        }

        return data
    },

    // Kullanıcıyı kalıcı engelle (ban)
    async banUser(userId, reason) {
        const token = localStorage.getItem('token')
        const response = await fetch(`${API_BASE_URL}/users/${userId}/ban`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ reason })
        })

        const data = await response.json()

        if (!response.ok) {
            throw new Error(data.error || 'Kullanıcı engellenemedi')
        }

        return data
    },

    // Kullanıcı engelini kaldır
    async unbanUser(userId) {
        const token = localStorage.getItem('token')
        const response = await fetch(`${API_BASE_URL}/users/${userId}/unban`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })

        const data = await response.json()

        if (!response.ok) {
            throw new Error(data.error || 'Kullanıcı engeli kaldırılamadı')
        }

        return data
    },

    // Kullanıcıyı sil
    async deleteUser(userId) {
        const token = localStorage.getItem('token')
        const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })

        if (!response.ok) {
            const data = await response.json()
            throw new Error(data.error || 'Kullanıcı silinemedi')
        }

        return { success: true }
    },

    // Kullanıcı rolünü değiştir
    async changeUserRole(userId, newRole) {
        const token = localStorage.getItem('token')
        const response = await fetch(`${API_BASE_URL}/users/${userId}/role`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ role: newRole })
        })

        const data = await response.json()

        if (!response.ok) {
            throw new Error(data.error || 'Kullanıcı rolü değiştirilemedi')
        }

        return data
    }
} 