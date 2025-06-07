'use client'
import { useState } from 'react'
import LoginComponent from '../../components/login'
import RegisterComponent from '../../components/register'

export default function LoginPage() {
    const [activeTab, setActiveTab] = useState('login')

    return (
        <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                {/* Header */}
                <div className="text-center">
                    <h1 className="text-4xl font-bold text-white mb-2">Blog Sitesi</h1>
                    <p className="text-gray-400">Hesabınıza giriş yapın veya yeni hesap oluşturun</p>
                </div>

                {/* Tab Navigation */}
                <div className="bg-gray-800 rounded-lg p-1 flex">
                    <button
                        onClick={() => setActiveTab('login')}
                        className={`flex-1 py-3 px-4 text-sm font-medium rounded-md transition-all duration-200 ${activeTab === 'login'
                            ? 'bg-blue-600 text-white shadow-lg'
                            : 'text-gray-400 hover:text-white hover:bg-gray-700'
                            }`}
                    >
                        Giriş Yap
                    </button>
                    <button
                        onClick={() => setActiveTab('register')}
                        className={`flex-1 py-3 px-4 text-sm font-medium rounded-md transition-all duration-200 ${activeTab === 'register'
                            ? 'bg-green-600 text-white shadow-lg'
                            : 'text-gray-400 hover:text-white hover:bg-gray-700'
                            }`}
                    >
                        Kayıt Ol
                    </button>
                </div>

                {/* Content Area */}
                <div className="bg-gray-800 rounded-lg p-8 shadow-xl border border-gray-700">
                    <div className="mb-6">
                        <h2 className="text-2xl font-semibold text-white text-center">
                            {activeTab === 'login' ? 'Hesabınıza Giriş Yapın' : 'Yeni Hesap Oluşturun'}
                        </h2>
                        <p className="text-gray-400 text-center mt-2">
                            {activeTab === 'login'
                                ? 'Blog yazılarınıza erişmek için giriş yapın'
                                : 'Blog yazıları yazmaya başlamak için kayıt olun'}
                        </p>
                    </div>

                    {/* Tab Content */}
                    <div className="transition-all duration-300">
                        {activeTab === 'login' ? <LoginComponent /> : <RegisterComponent />}
                    </div>
                </div>

                {/* Footer */}
                <div className="text-center text-gray-400">
                    <p className="text-sm">
                        {activeTab === 'login' ? 'Hesabınız yok mu?' : 'Zaten hesabınız var mı?'}
                        {' '}
                        <button
                            onClick={() => setActiveTab(activeTab === 'login' ? 'register' : 'login')}
                            className="text-blue-400 hover:text-blue-300 font-medium transition-colors duration-200"
                        >
                            {activeTab === 'login' ? 'Kayıt olun' : 'Giriş yapın'}
                        </button>
                    </p>
                </div>
            </div>
        </div>
    )
}