import { Link } from 'react-router-dom';
import { useAuth } from '../auth.jsx';
import cipherchatLogo from '../assets/images/cipherchatlogo.png';
import cipherchatHero from '../assets/images/cipherchathero.png';

export default function Landing() {
  const { unlocked } = useAuth();

  return (
    <div className="min-h-full bg-gradient-to-br from-indigo-50 to-blue-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <img src={cipherchatLogo} alt="CipherChat Logo" className="w-10 h-10 rounded-lg" />
            <span className="text-xl font-bold text-gray-900">CipherChat</span>
          </div>
          <div className="flex gap-3">
            {!unlocked ? (
              <>
                <Link to="/login" className="px-4 py-2 text-indigo-600 font-medium hover:text-indigo-700 transition">
                  Masuk
                </Link>
                <Link to="/register" className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition">
                  Daftar
                </Link>
              </>
            ) : (
              <Link to="/contacts" className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition">
                Buka Chat
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-6xl mx-auto px-4 py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <div className="flex justify-center md:justify-start">
              <img src={cipherchatLogo} alt="CipherChat Logo" className="w-32 h-32 rounded-2xl shadow-lg hover:shadow-xl transition-shadow" />
            </div>

            <div className="space-y-4">
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900">
                CipherChat
              </h1>
              <p className="text-xl text-gray-600">
                Aplikasi chat yang aman dengan enkripsi end-to-end. Percakapan Anda tetap pribadi dan terlindungi.
              </p>
            </div>

            <div className="space-y-3 pt-4">
              <div className="flex items-start gap-3 text-gray-700">
                <span className="text-indigo-600 font-bold mt-1">•</span>
                <span>Enkripsi end-to-end yang kuat</span>
              </div>
              <div className="flex items-start gap-3 text-gray-700">
                <span className="text-indigo-600 font-bold mt-1">•</span>
                <span>Pesan real-time yang cepat</span>
              </div>
              <div className="flex items-start gap-3 text-gray-700">
                <span className="text-indigo-600 font-bold mt-1">•</span>
                <span>Kelola kontak dengan mudah</span>
              </div>
              <div className="flex items-start gap-3 text-gray-700">
                <span className="text-indigo-600 font-bold mt-1">•</span>
                <span>Keamanan data terjamin</span>
              </div>
            </div>

            <div className="flex gap-4 pt-6 flex-col sm:flex-row">
              {!unlocked ? (
                <>
                  <Link to="/register" className="px-8 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition text-center">
                    Mulai Sekarang
                  </Link>
                  <Link to="/login" className="px-8 py-3 border-2 border-indigo-600 text-indigo-600 rounded-lg font-semibold hover:bg-indigo-50 transition text-center">
                    Sudah Punya Akun
                  </Link>
                </>
              ) : (
                <Link to="/contacts" className="px-8 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition text-center">
                  Buka Aplikasi
                </Link>
              )}
            </div>
          </div>

          {/* Right Side - Image Placeholder */}
          <div className="hidden md:flex justify-center">
            <div className="relative">
              {/* Main image container */}
              <div className="w-full aspect-square rounded-3xl shadow-2xl border-8 border-white overflow-hidden">
                <img src={cipherchatHero} alt="CipherChat Hero" className="w-full h-full object-cover" />
              </div>
              
              {/* Decorative elements */}
              <div className="absolute -top-4 -right-4 w-20 h-20 bg-blue-200 rounded-full opacity-50"></div>
              <div className="absolute -bottom-4 -left-4 w-24 h-24 bg-indigo-200 rounded-full opacity-50"></div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-20 bg-gray-900 text-gray-300 py-8">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <p>&copy; 2026 CipherChat. Keamanan komunikasi Anda adalah prioritas kami.</p>
        </div>
      </footer>
    </div>
  );
}
