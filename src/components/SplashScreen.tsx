import { useState, useEffect } from 'react';
import { Moon } from 'lucide-react';
// Placeholder image URL until the local asset is available
const hagiaSophiaImg = "https://images.unsplash.com/photo-1541432901042-2d8bd64b4a9b?q=80&w=2000";

export function SplashScreen() {
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        const duration = 5000; // 5 saniye
        const steps = 100; // 100 adım
        const interval = duration / steps; // Her adım arası süre

        const timer = setInterval(() => {
            setProgress((prev) => {
                const next = prev + 1;
                if (next >= 100) {
                    clearInterval(timer);
                    return 100;
                }
                return next;
            });
        }, interval);

        return () => clearInterval(timer);
    }, []);

    return (
        <div
            className="min-h-screen flex items-center justify-center text-white p-6 relative overflow-hidden"
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
            <div className="space-y-4 text-center relative z-10">
                <div className="bg-gradient-to-br from-slate-700 to-slate-600 p-4 rounded-full mb-4 shadow-lg mx-auto w-fit moon-animate">
                    <Moon className="w-12 h-12 text-white" />
                </div>
                <p className="text-lg text-slate-200">Yükleniyor...</p>
                <div className="w-48 h-2 bg-white/20 rounded-full overflow-hidden mx-auto">
                    <div
                        className="h-full bg-emerald-400 transition-all duration-500 ease-out rounded-full"
                        style={{ width: `${Math.min(progress, 100)}%` }}
                    />
                </div>
                <p className="text-sm text-slate-300">{Math.min(Math.round(progress), 100)}%</p>
            </div>
        </div>
    );
}
