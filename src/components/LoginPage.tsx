import { useState, useRef, useEffect } from 'react';
import { Moon, ChevronDown, Search } from 'lucide-react';
import { login } from '../lib/auth';
import { cityCoordinates } from '../lib/prayerTimes';

// Placeholder image URL until the local asset is available
const hagiaSophiaImg = "https://images.unsplash.com/photo-1541432901042-2d8bd64b4a9b?q=80&w=2000";

interface LoginPageProps {
  onLogin: () => void;
}

export function LoginPage({ onLogin }: LoginPageProps) {
  const [name, setName] = useState('');
  const [city, setCity] = useState('istanbul');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  const cities = Object.keys(cityCoordinates).sort();
  const filteredCities = cities.filter(c =>
    cityCoordinates[c].name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Dışarı tıklandığında menüyü kapat
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!name.trim()) {
      setError('Lütfen isminizi girin');
      setLoading(false);
      return;
    }

    try {
      const success = await login(name, city);
      if (success) {
        onLogin();
      } else {
        setError('Giriş başarısız. Lütfen bilgilerinizi kontrol edin.');
      }
    } catch (err) {
      console.error('Giriş hatası:', err);
      setError('Giriş sırasında bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 text-white relative overflow-hidden"
      style={{
        backgroundImage: `url(${hagiaSophiaImg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
        backgroundRepeat: 'no-repeat'
      }}
    >
      <div className="absolute inset-0 bg-black/55 backdrop-blur-sm"></div>
      <style>{`
        @keyframes moonFloat {
          0%, 100% {
            transform: translateY(0px) rotate(-10deg);
          }
          50% {
            transform: translateY(-15px) rotate(10deg);
          }
        }
        .moon-animate {
          animation: moonFloat 3s ease-in-out infinite;
        }
      `}</style>

      <div className="max-w-md w-full relative z-10">
        <div className="bg-slate-800/60 backdrop-blur-xl rounded-2xl shadow-2xl p-6 sm:p-8 border border-white/10">
          <div className="flex flex-col items-center mb-8">
            <div className="bg-gradient-to-br from-slate-700 to-slate-600 p-4 rounded-full mb-4 shadow-lg moon-animate">
              <Moon className="w-12 h-12 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-white">Namaz Ağacı</h1>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-white mb-2">
                Adınız ve Soyadınız
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition text-black"
                placeholder="Örn: Ahmet Yılmaz"
              />
            </div>

            <div>
              <label htmlFor="city" className="block text-sm font-medium text-white mb-2">
                Şehriniz
              </label>
              <div className="relative" ref={dropdownRef}>
                <button
                  type="button"
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white flex items-center justify-between text-black focus:ring-2 focus:ring-emerald-500 outline-none transition shadow-sm"
                >
                  <span className="truncate">{cityCoordinates[city]?.name || 'Şehir Seçin'}</span>
                  <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {isDropdownOpen && (
                  <div className="absolute top-full left-0 w-full mt-2 bg-white rounded-lg shadow-2xl z-50 border border-gray-200 overflow-hidden animate-in fade-in slide-in-from-top-2">
                    <div className="p-2 border-b border-gray-100 bg-gray-50">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          type="text"
                          placeholder="Şehir ara..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-md text-sm text-black focus:ring-2 focus:ring-emerald-500 outline-none"
                          autoFocus
                        />
                      </div>
                    </div>
                    <div className="max-h-60 overflow-y-auto">
                      {filteredCities.map((c) => (
                        <button
                          key={c}
                          type="button"
                          onClick={() => {
                            setCity(c);
                            setIsDropdownOpen(false);
                            setSearchTerm('');
                          }}
                          className={`w-full text-left px-4 py-2.5 text-sm hover:bg-emerald-50 transition-colors ${city === c ? 'bg-emerald-500 text-white font-semibold' : 'text-gray-700'
                            }`}
                        >
                          {cityCoordinates[c].name}
                        </button>
                      ))}
                      {filteredCities.length === 0 && (
                        <div className="px-4 py-6 text-sm text-gray-500 text-center italic">Şehir bulunamadı</div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-3 rounded-lg font-semibold hover:from-emerald-700 hover:to-teal-700 transition shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Giriş Yapılıyor...' : 'Giriş Yap'}
            </button>
          </form>

          <div className="mt-8 pt-6">
            <p className="text-xs text-white text-center leading-relaxed">
              "Kim bir namazı vaktinde kılarsa, onun için Allah katında büyük bir sevap vardır."
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}