import Link from 'next/link'

export default function Footer() {
    const currentYear = new Date().getFullYear()

    return (
        <footer className="bg-gray-900 border-t border-gray-700">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                    {/* Logo ve Açıklama */}
                    <div className="col-span-1 md:col-span-2">
                        <div className="flex items-center space-x-3 mb-2">
                            <img
                                src="/herbokolog2.png"
                                alt="HERBOKOLOG"
                                className="h-30 w-30 object-contain"
                            />
                        </div>
                        <p className="text-gray-400 text-xs leading-relaxed max-w-md">
                            Her boktan anlayanların yazıları.
                        </p>
                        <div className="flex space-x-3 mt-3">
                            <a href="https://pbs.twimg.com/media/EPbmpnbWAAAnQ3u.jpg" className="text-gray-400 hover:text-orange-400 transition-colors">
                                <span className="sr-only">Facebook</span>
                                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                                    <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                                </svg>
                            </a>
                            <a href="https://pbs.twimg.com/media/GpZy8lRWQAAAjXL.jpg" className="text-gray-400 hover:text-orange-400 transition-colors">
                                <span className="sr-only">Instagram</span>
                                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                                    <path fillRule="evenodd" d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 6.621 5.367 11.988 11.988 11.988s11.987-5.367 11.987-11.988C24.004 5.367 18.637.001 12.017.001zM8.449 16.988c-1.297 0-2.448-.596-3.205-1.529L12.017 8.2l6.772 7.259c-.757.933-1.908 1.529-3.205 1.529H8.449z" clipRule="evenodd" />
                                </svg>
                            </a>
                            <a href="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS8jf8ABYtHqzFaTHAeeZNvVBeT9qJRQe7jSg&s" className="text-gray-400 hover:text-orange-400 transition-colors">
                                <span className="sr-only">Twitter</span>
                                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                                </svg>
                            </a>
                        </div>
                    </div>

                    {/* Hızlı Linkler */}
                    <div>
                        <h3 className="text-white font-semibold mb-2 text-sm">Hızlı Linkler</h3>
                        <ul className="space-y-1 text-xs">
                            <li>
                                <Link href="/" className="text-gray-400 hover:text-orange-400 transition-colors">
                                    Ana Sayfa
                                </Link>
                            </li>
                            <li>
                                <Link href="/" className="text-gray-400 hover:text-orange-400 transition-colors">
                                    Hakkımızda
                                </Link>
                            </li>
                            <li>
                                <Link href="/" className="text-gray-400 hover:text-orange-400 transition-colors">
                                    İletişim
                                </Link>
                            </li>
                            <li>
                                <Link href="/" className="text-gray-400 hover:text-orange-400 transition-colors">
                                    Gizlilik Politikası
                                </Link>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Alt kısım */}
                <div className="border-t border-gray-800 mt-4 pt-3">
                    <div className="flex flex-col md:flex-row justify-between items-center">
                        <div className="text-gray-400 text-xs">
                            © {currentYear} HERBOKOLOG. Tüm hakları saklıdır.
                        </div>
                        <div className="text-gray-400 text-xs mt-2 md:mt-0">
                            <span className="text-orange-400">Hiçbir boktan anlamıyoruz, sadece yazıyoruz. 🌱</span>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    )
} 