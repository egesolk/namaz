# Namaz Ağacı 🕌

Namaz Ağacı, günlük namaz vakitlerini takip etmenize, kıble yönünü bulmanıza ve namazlarınızı işaretleyerek istatistik tutmanıza olanak tanıyan bir React uygulamasıdır.

## Özellikler

- 📅 **81 İl Desteği**: Türkiye'nin tüm illeri için güncel namaz vakitleri.
- 🕋 **Kıble Pusulası**: Cihaz sensörlerini kullanarak hassas kıble yönü bulma.
- ✅ **Namaz Takibi**: Kıldığınız namazları işaretleyin ve ilerlemenizi görün.
- 📊 **İstatistikler**: Günlük ve geçmişe dönük namaz verilerini analiz edin.
- 🔔 **Hatırlatıcılar**: Namaz vakitleri yaklaşınca bildirim alın.
- 🌍 **Çevrimdışı Destek**: İnternet olmasa bile son çekilen vakitlere erişin.

## Kurulum

Projeyi yerel bilgisayarınızda çalıştırmak için aşağıdaki adımları izleyin:

1. Projeyi klonlayın:
   ```bash
   git clone https://github.com/kullaniciadin/namaz-agaci.git
   cd namaz-agaci
   ```

2. Gerekli paketleri yükleyin:
   ```bash
   npm install
   ```

3. Firebase bağlantısı için `.env` dosyası oluşturun:
   Proje kök dizininde `.env` adlı bir dosya oluşturun ve içine kendi Firebase API anahtarlarınızı ekleyin:
   ```env
   VITE_FIREBASE_API_KEY=your_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id
   ```

4. Uygulamayı başlatın:
   ```bash
   npm run dev
   ```

## Lisans

Bu proje açık kaynaklıdır ve eğitim amaçlıdır.