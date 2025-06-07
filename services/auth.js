const API_BASE_URL = '/api/auth'

export const authService = {
    // Login işlemi
    async login(email, password) {
        const response = await fetch(`${API_BASE_URL}/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password }),
        })

        const data = await response.json()

        if (!response.ok) {
            throw new Error(data.error || 'Giriş işlemi başarısız')
        }

        // Token'ı localStorage ve cookie'ye kaydet
        if (data.token) {
            localStorage.setItem('token', data.token)
            localStorage.setItem('user', JSON.stringify(data.user))

            // Cookie'ye de kaydet (middleware için)
            document.cookie = `token=${data.token}; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=strict`

            // Trigger auth change event
            window.dispatchEvent(new CustomEvent('authChange'))
        }

        return data
    },

    // Register işlemi
    async register(name, email, password) {
        const response = await fetch(`${API_BASE_URL}/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ name, email, password }),
        })

        const data = await response.json()

        if (!response.ok) {
            throw new Error(data.error || 'Kayıt işlemi başarısız')
        }

        // Token'ı localStorage ve cookie'ye kaydet
        if (data.token) {
            localStorage.setItem('token', data.token)
            localStorage.setItem('user', JSON.stringify(data.user))

            // Cookie'ye de kaydet (middleware için)
            document.cookie = `token=${data.token}; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=strict`

            // Trigger auth change event
            window.dispatchEvent(new CustomEvent('authChange'))
        }

        return data
    },

    // Çıkış işlemi
    logout() {
        localStorage.removeItem('token')
        localStorage.removeItem('user')

        // Cookie'yi de temizle
        document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'

        // Trigger auth change event
        window.dispatchEvent(new CustomEvent('authChange'))

        window.location.href = '/login'
    },

    // Kullanıcının giriş durumunu kontrol et
    isAuthenticated() {
        const token = localStorage.getItem('token')
        return !!token
    },

    // Mevcut kullanıcı bilgilerini al
    getCurrentUser() {
        const userStr = localStorage.getItem('user')
        return userStr ? JSON.parse(userStr) : null
    },

    // Token'ı al
    getToken() {
        return localStorage.getItem('token')
    },

    // API istekleri için header'ları al
    getAuthHeaders() {
        const token = this.getToken()
        return {
            'Content-Type': 'application/json',
            ...(token && { Authorization: `Bearer ${token}` }),
        }
    },

    // Mevcut localStorage token'ını cookie'ye kopyala (geçiş için)
    syncTokenToCookie() {
        const token = localStorage.getItem('token')
        if (token) {
            document.cookie = `token=${token}; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=strict`
        }
    }
} 