const API_BASE_URL = '/api/blogs'

export const blogService = {
    // Tüm blogları getir (onaylanmış)
    async getAllBlogs(limit = 10, offset = 0) {
        const response = await fetch(`${API_BASE_URL}?limit=${limit}&offset=${offset}`)

        if (!response.ok) {
            throw new Error('Bloglar getirilemedi')
        }

        return response.json()
    },

    // Blog detayını getir
    async getBlogById(id) {
        const response = await fetch(`${API_BASE_URL}/${id}`)

        if (!response.ok) {
            throw new Error('Blog bulunamadı')
        }

        return response.json()
    },

    // Kategoriye göre blogları getir
    async getBlogsByCategory(categoryId, limit = 10, offset = 0) {
        const response = await fetch(`${API_BASE_URL}?categoryId=${categoryId}&limit=${limit}&offset=${offset}`)

        if (!response.ok) {
            throw new Error('Kategoriye ait bloglar getirilemedi')
        }

        return response.json()
    },

    // Blog görüntülenmesini kaydet
    async trackView(blogId) {
        const token = localStorage.getItem('token')
        const headers = {
            'Content-Type': 'application/json'
        }

        if (token) {
            headers['Authorization'] = `Bearer ${token}`
        }

        try {
            const response = await fetch(`${API_BASE_URL}/${blogId}/view`, {
                method: 'POST',
                headers
            })

            if (!response.ok) {
                console.warn('View tracking failed')
            }
        } catch (error) {
            console.warn('View tracking error:', error)
        }
    },

    // Blog yorumlarını getir
    async getComments(blogId, limit = 20, offset = 0) {
        const response = await fetch(`${API_BASE_URL}/${blogId}/comments?limit=${limit}&offset=${offset}`)

        if (!response.ok) {
            throw new Error('Yorumlar getirilemedi')
        }

        return response.json()
    },

    // Yorum ekle
    async addComment(blogId, content) {
        const token = localStorage.getItem('token')
        const response = await fetch(`${API_BASE_URL}/${blogId}/comments`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ content })
        })

        const data = await response.json()

        if (!response.ok) {
            throw new Error(data.error || 'Yorum eklenemedi')
        }

        return data
    },

    // Kullanıcının bloglarını getir
    async getUserBlogs(userId, limit = 10, offset = 0) {
        const response = await fetch(`${API_BASE_URL}/user/${userId}?limit=${limit}&offset=${offset}`)

        if (!response.ok) {
            throw new Error('Kullanıcı blogları getirilemedi')
        }

        return response.json()
    },

    // Yeni blog oluştur
    async createBlog(blogData, token) {
        const response = await fetch(`${API_BASE_URL}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(blogData)
        })

        const data = await response.json()

        if (!response.ok) {
            throw new Error(data.error || 'Blog oluşturulamadı')
        }

        return data
    },

    // Blog güncelle
    async updateBlog(id, blogData, token) {
        const response = await fetch(`${API_BASE_URL}/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(blogData)
        })

        const data = await response.json()

        if (!response.ok) {
            throw new Error(data.error || 'Blog güncellenemedi')
        }

        return data
    },

    // Blog sil
    async deleteBlog(id, token) {
        const response = await fetch(`${API_BASE_URL}/${id}`, {
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

    // Blog ara
    async searchBlogs(query, limit = 10, offset = 0) {
        const response = await fetch(`${API_BASE_URL}/search?q=${encodeURIComponent(query)}&limit=${limit}&offset=${offset}`)

        if (!response.ok) {
            throw new Error('Arama yapılamadı')
        }

        return response.json()
    },

    // Blog beğen/beğenmekten vazgeç
    async toggleLike(blogId) {
        const token = localStorage.getItem('token')
        const response = await fetch(`${API_BASE_URL}/${blogId}/like`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        })

        const data = await response.json()

        if (!response.ok) {
            throw new Error(data.error || 'Beğeni işlemi başarısız')
        }

        return data
    },

    // Blog detayını getir (auth header ile)
    async getBlogDetail(blogId) {
        const token = localStorage.getItem('token')
        const headers = {
            'Content-Type': 'application/json'
        }

        if (token) {
            headers['Authorization'] = `Bearer ${token}`
        }

        const response = await fetch(`${API_BASE_URL}/${blogId}`, {
            headers
        })

        const data = await response.json()

        if (!response.ok) {
            throw new Error(data.error || 'Blog getirilemedi')
        }

        return data
    }
} 