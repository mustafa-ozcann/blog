'use client'
import { useState, useEffect } from 'react'
import { profileService } from '../services/profile'
import ProfileCard from './ProfileCard'
import Link from 'next/link'

export default function ProfilePreview({ isOpen, onClose }) {
    const [profile, setProfile] = useState(null)
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        if (isOpen && !profile) {
            loadProfile()
        }
    }, [isOpen])

    const loadProfile = async () => {
        try {
            setLoading(true)
            const response = await profileService.getMyProfile()
            setProfile(response.user)
        } catch (error) {
            console.error('Profile load error:', error)
        } finally {
            setLoading(false)
        }
    }

    if (!isOpen) return null

    return (
        <div className="absolute right-0 mt-2 w-80 bg-gray-800 rounded-lg shadow-xl border border-gray-700 z-50">
            <div className="p-4">
                {loading ? (
                    <div className="animate-pulse">
                        <div className="flex items-center space-x-3 mb-4">
                            <div className="h-12 w-12 bg-gray-700 rounded-full"></div>
                            <div className="flex-1">
                                <div className="h-4 bg-gray-700 rounded w-2/3 mb-2"></div>
                                <div className="h-3 bg-gray-700 rounded w-1/2"></div>
                            </div>
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                            <div className="text-center">
                                <div className="h-6 bg-gray-700 rounded mb-1"></div>
                                <div className="h-3 bg-gray-700 rounded"></div>
                            </div>
                            <div className="text-center">
                                <div className="h-6 bg-gray-700 rounded mb-1"></div>
                                <div className="h-3 bg-gray-700 rounded"></div>
                            </div>
                            <div className="text-center">
                                <div className="h-6 bg-gray-700 rounded mb-1"></div>
                                <div className="h-3 bg-gray-700 rounded"></div>
                            </div>
                        </div>
                    </div>
                ) : profile ? (
                    <>
                        <ProfileCard user={profile} isPreview={true} />

                        <div className="mt-4 space-y-2">
                            <Link
                                href={`/profile/${profile.id}`}
                                className="block w-full bg-blue-600 hover:bg-blue-700 text-white text-center py-2 px-4 rounded-lg transition-colors text-sm"
                                onClick={onClose}
                            >
                                Profilimi Görüntüle
                            </Link>
                            <Link
                                href="/profile/edit"
                                className="block w-full bg-gray-700 hover:bg-gray-600 text-white text-center py-2 px-4 rounded-lg transition-colors text-sm"
                                onClick={onClose}
                            >
                                Profili Düzenle
                            </Link>
                        </div>
                    </>
                ) : (
                    <div className="text-center py-6 text-gray-400">
                        <p>Profil yüklenemedi</p>
                        <button
                            onClick={loadProfile}
                            className="mt-2 text-blue-400 hover:text-blue-300 text-sm"
                        >
                            Tekrar Dene
                        </button>
                    </div>
                )}
            </div>
        </div>
    )
} 