// Placeholder image URL until the local asset is available
const hagiaSophiaImg = "https://images.unsplash.com/photo-1541432901042-2d8bd64b4a9b?q=80&w=2000";

interface LoadingScreenProps {
    type?: 'loading' | 'logout';
}

export function LoadingScreen({ type = 'loading' }: LoadingScreenProps) {
    return (
        <div
            className="min-h-screen flex items-center justify-center p-6 text-white relative overflow-hidden"
            style={{
                backgroundImage: `url(${hagiaSophiaImg})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundAttachment: 'fixed',
                backgroundRepeat: 'no-repeat'
            }}
        >
            <div className="absolute inset-0 bg-black/55 backdrop-blur-sm"></div>
            <div className="relative z-10">
                <div className="bg-white/10 backdrop-blur-xl border border-white/20 p-8 rounded-2xl shadow-lg text-center">
                    <div className="mx-auto mb-4 h-12 w-12 rounded-full border-4 border-emerald-400 border-t-emerald-600 animate-spin" />
                    <h2 className="text-2xl font-bold text-white">
                        {type === 'logout' ? 'Çıkış Yapılıyor' : 'Hesap Doğrulanıyor'}
                    </h2>
                    <p className="text-sm text-white/70 mt-2">
                        {type === 'logout'
                            ? 'Lütfen bekleyin, login sayfasına yönlendiriliyorsunuz...'
                            : 'Lütfen bekleyin, ana sayfaya yönlendiriliyorsunuz...'}
                    </p>
                </div>
            </div>
        </div>
    );
}
