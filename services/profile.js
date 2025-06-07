const API_BASE_URL = '/api'

export const profileService = {
    // Kullanıcı profilini getir
    async getProfile(userId) {
        const response = await fetch(`${API_BASE_URL}/profile/${userId}`)

        if (!response.ok) {
            throw new Error('Profil getirilemedi')
        }

        return response.json()
    },

    // Kendi profilini getir
    async getMyProfile() {
        const token = localStorage.getItem('token')

        if (!token) {
            throw new Error('Token bulunamadı - lütfen tekrar giriş yapın')
        }

        const response = await fetch(`${API_BASE_URL}/profile/me`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })

        if (response.status === 401) {
            // Token geçersiz - logout yap
            localStorage.removeItem('token')
            localStorage.removeItem('user')
            document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'
            window.location.href = '/login'
            throw new Error('Oturum süresi doldu - tekrar giriş yapın')
        }

        if (!response.ok) {
            throw new Error('Profil getirilemedi')
        }

        return response.json()
    },

    // Profili güncelle
    async updateProfile(profileData) {
        const token = localStorage.getItem('token')
        const response = await fetch(`${API_BASE_URL}/profile/update`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(profileData)
        })

        const data = await response.json()

        if (!response.ok) {
            throw new Error(data.error || 'Profil güncellenemedi')
        }

        return data
    },

    // Profil fotoğrafını güncelle
    async updateProfileImage(imageUrl) {
        const token = localStorage.getItem('token')
        const response = await fetch(`${API_BASE_URL}/profile/image`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ image: imageUrl })
        })

        const data = await response.json()

        if (!response.ok) {
            throw new Error(data.error || 'Profil fotoğrafı güncellenemedi')
        }

        return data
    },

    // Kullanıcı istatistiklerini getir
    async getUserStats(userId) {
        const response = await fetch(`${API_BASE_URL}/profile/${userId}/stats`)

        if (!response.ok) {
            throw new Error('İstatistikler getirilemedi')
        }

        return response.json()
    },

    // Kullanıcının postlarını getir
    async getUserPosts(userId, limit = 10, offset = 0) {
        const response = await fetch(`${API_BASE_URL}/profile/${userId}/posts?limit=${limit}&offset=${offset}`)

        if (!response.ok) {
            throw new Error('Kullanıcı postları getirilemedi')
        }

        return response.json()
    }
} 