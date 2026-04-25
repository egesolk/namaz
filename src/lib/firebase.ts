import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAnalytics } from 'firebase/analytics';

// Firebase yapılandırması ortam değişkenlerinden alınır (.env dosyası)
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

// Geçersiz çerez domain hatasını engellemek için analytics'i yalnızca desteklenen hostlarda başlatıyoruz.
const isCookieSafeHost = typeof window !== 'undefined' && [
  'localhost',
  '127.0.0.1',
  'namaz-iota-ten.vercel.app',
  'namaz-37f55.firebaseapp.com'
].includes(window.location.hostname);

let analyticsInstance: ReturnType<typeof getAnalytics> | null = null;

if (typeof window !== 'undefined' && isCookieSafeHost) {
  try {
    analyticsInstance = getAnalytics(app);

    // GA çerez alanı için net bir değer gönderebiliriz.
    (window as any).dataLayer = (window as any).dataLayer || [];
    const gtag = (...args: any[]) => {
      (window as any).dataLayer.push(args);
    };
    (window as any).gtag = gtag;

    gtag('js', new Date());
    gtag('config', firebaseConfig.measurementId, { cookie_domain: 'none' });

    console.info('Analytics başlatıldı (cookie_domain: none).');
  } catch (error) {
    console.warn('Analytics başlatılamadı, çerez hatası engellendi:', error);
    analyticsInstance = null;
  }
}

export const analytics = analyticsInstance;
