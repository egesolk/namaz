export interface PrayerTime {
  name: string;
  time: string;
  arabicName: string;
}

export interface DailyPrayerTimes {
  date: string;
  hijriDate: string;
  prayers: PrayerTime[];
}

export type PrayerCity = string;

export const cityCoordinates: Record<string, { latitude: number; longitude: number; name: string }> = {
  adana: { latitude: 37.0, longitude: 35.32, name: 'Adana' },
  adiyaman: { latitude: 37.76, longitude: 38.27, name: 'Adıyaman' },
  afyonkarahisar: { latitude: 38.75, longitude: 30.54, name: 'Afyonkarahisar' },
  agri: { latitude: 39.72, longitude: 43.05, name: 'Ağrı' },
  amasya: { latitude: 40.65, longitude: 35.83, name: 'Amasya' },
  ankara: { latitude: 39.93, longitude: 32.85, name: 'Ankara' },
  antalya: { latitude: 36.88, longitude: 30.7, name: 'Antalya' },
  artvin: { latitude: 41.18, longitude: 41.81, name: 'Artvin' },
  aydin: { latitude: 37.84, longitude: 27.84, name: 'Aydın' },
  balikesir: { latitude: 39.64, longitude: 27.88, name: 'Balıkesir' },
  bilecik: { latitude: 40.14, longitude: 29.97, name: 'Bilecik' },
  bingol: { latitude: 38.88, longitude: 40.49, name: 'Bingöl' },
  bitlis: { latitude: 38.4, longitude: 42.1, name: 'Bitlis' },
  bolu: { latitude: 40.73, longitude: 31.6, name: 'Bolu' },
  burdur: { latitude: 37.72, longitude: 30.28, name: 'Burdur' },
  bursa: { latitude: 40.18, longitude: 29.06, name: 'Bursa' },
  canakkale: { latitude: 40.15, longitude: 26.4, name: 'Çanakkale' },
  cankiri: { latitude: 40.6, longitude: 33.61, name: 'Çankırı' },
  corum: { latitude: 40.54, longitude: 34.95, name: 'Çorum' },
  denizli: { latitude: 37.77, longitude: 29.08, name: 'Denizli' },
  diyarbakir: { latitude: 37.91, longitude: 40.23, name: 'Diyarbakır' },
  edirne: { latitude: 41.67, longitude: 26.55, name: 'Edirne' },
  elazig: { latitude: 38.67, longitude: 39.22, name: 'Elazığ' },
  erzincan: { latitude: 39.74, longitude: 39.49, name: 'Erzincan' },
  erzurum: { latitude: 39.9, longitude: 41.27, name: 'Erzurum' },
  eskisehir: { latitude: 39.77, longitude: 30.52, name: 'Eskişehir' },
  gaziantep: { latitude: 37.06, longitude: 37.38, name: 'Gaziantep' },
  giresun: { latitude: 40.91, longitude: 38.38, name: 'Giresun' },
  gumushane: { latitude: 40.46, longitude: 39.47, name: 'Gümüşhane' },
  hakkari: { latitude: 37.57, longitude: 43.73, name: 'Hakkari' },
  hatay: { latitude: 36.2, longitude: 36.16, name: 'Hatay' },
  isparta: { latitude: 37.76, longitude: 30.55, name: 'Isparta' },
  mersin: { latitude: 36.81, longitude: 34.63, name: 'Mersin' },
  istanbul: { latitude: 41.0082, longitude: 28.9784, name: 'İstanbul' },
  izmir: { latitude: 38.41, longitude: 27.12, name: 'İzmir' },
  kars: { latitude: 40.6, longitude: 43.09, name: 'Kars' },
  kastamonu: { latitude: 41.37, longitude: 33.77, name: 'Kastamonu' },
  kayseri: { latitude: 38.72, longitude: 35.48, name: 'Kayseri' },
  kirklareli: { latitude: 41.73, longitude: 27.22, name: 'Kırklareli' },
  kirsehir: { latitude: 39.14, longitude: 34.16, name: 'Kırşehir' },
  kocaeli: { latitude: 40.76, longitude: 29.91, name: 'Kocaeli' },
  konya: { latitude: 37.8723, longitude: 32.4932, name: 'Konya' },
  kutahya: { latitude: 39.42, longitude: 29.98, name: 'Kütahya' },
  malatya: { latitude: 38.35, longitude: 38.31, name: 'Malatya' },
  manisa: { latitude: 38.61, longitude: 27.42, name: 'Manisa' },
  kahramanmaras: { latitude: 37.57, longitude: 36.92, name: 'Kahramanmaraş' },
  mardin: { latitude: 37.31, longitude: 40.73, name: 'Mardin' },
  mugla: { latitude: 37.21, longitude: 28.36, name: 'Muğla' },
  mus: { latitude: 38.73, longitude: 41.49, name: 'Muş' },
  nevsehir: { latitude: 38.62, longitude: 34.71, name: 'Nevşehir' },
  nigde: { latitude: 37.96, longitude: 34.67, name: 'Niğde' },
  ordu: { latitude: 40.98, longitude: 37.87, name: 'Ordu' },
  rize: { latitude: 41.02, longitude: 40.52, name: 'Rize' },
  sakarya: { latitude: 40.77, longitude: 30.4, name: 'Sakarya' },
  samsun: { latitude: 41.28, longitude: 36.33, name: 'Samsun' },
  siirt: { latitude: 37.92, longitude: 41.94, name: 'Siirt' },
  sinop: { latitude: 42.02, longitude: 35.15, name: 'Sinop' },
  sivas: { latitude: 39.74, longitude: 37.01, name: 'Sivas' },
  tekirdag: { latitude: 40.97, longitude: 27.51, name: 'Tekirdağ' },
  tokat: { latitude: 40.32, longitude: 36.55, name: 'Tokat' },
  trabzon: { latitude: 41.0, longitude: 39.71, name: 'Trabzon' },
  tunceli: { latitude: 39.1, longitude: 39.54, name: 'Tunceli' },
  sanliurfa: { latitude: 37.16, longitude: 38.79, name: 'Şanlıurfa' },
  usak: { latitude: 38.67, longitude: 29.4, name: 'Uşak' },
  van: { latitude: 38.5, longitude: 43.37, name: 'Van' },
  yozgat: { latitude: 39.81, longitude: 34.8, name: 'Yozgat' },
  zonguldak: { latitude: 41.45, longitude: 31.79, name: 'Zonguldak' },
  aksaray: { latitude: 38.36, longitude: 34.02, name: 'Aksaray' },
  bayburt: { latitude: 40.25, longitude: 40.22, name: 'Bayburt' },
  karaman: { latitude: 37.18, longitude: 33.21, name: 'Karaman' },
  kirikkale: { latitude: 39.84, longitude: 33.51, name: 'Kırıkkale' },
  batman: { latitude: 37.88, longitude: 41.13, name: 'Batman' },
  sirnak: { latitude: 37.51, longitude: 42.45, name: 'Şırnak' },
  bartin: { latitude: 41.63, longitude: 32.33, name: 'Bartın' },
  ardahan: { latitude: 41.11, longitude: 42.7, name: 'Ardahan' },
  igdir: { latitude: 39.92, longitude: 44.04, name: 'Iğdır' },
  yalova: { latitude: 40.65, longitude: 29.27, name: 'Yalova' },
  karabuk: { latitude: 41.19, longitude: 32.62, name: 'Karabük' },
  kilis: { latitude: 36.71, longitude: 37.11, name: 'Kilis' },
  osmaniye: { latitude: 37.07, longitude: 36.24, name: 'Osmaniye' },
  duzce: { latitude: 40.84, longitude: 31.16, name: 'Düzce' },
};

export async function getPrayerTimesForDate(
  date: Date,
  city: PrayerCity = 'istanbul'
): Promise<DailyPrayerTimes> {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  const cityName = cityCoordinates[city]?.name || 'Istanbul';
  const dateStringYMD = `${year}-${month}-${day}`;
  const cacheKey = `prayerTimes_${city}_${dateStringYMD}`;

  // Çevrimdışı kullanım için önbellek (cache) kontrolü
  try {
    const cachedData = localStorage.getItem(cacheKey);
    if (cachedData) {
      return JSON.parse(cachedData);
    }
  } catch (e) {
    console.warn('Önbellek okuma hatası:', e);
  }

  try {
    // 1. ÖNCELİK: Sabah.com.tr ile Birebir Aynı Olan Gerçek Diyanet API'si
    // vakit.vercel.app doğrudan resmi Diyanet verilerini sağlar.
    const diyanetResponse = await fetch(`https://vakit.vercel.app/api/timesFromPlace?country=Turkey&region=${cityName}&city=${cityName}`);

    if (diyanetResponse.ok) {
      const diyanetData = await diyanetResponse.json();
      const times = diyanetData.times[dateStringYMD];

      if (times && times.length >= 6) {
        const result = {
          date: `${day}.${month}.${year}`,
          hijriDate: 'Diyanet Takvimi',
          prayers: [
            { name: 'Sabah', arabicName: 'الفجر', time: times[0] },
            { name: 'Güneş', arabicName: 'الشروق', time: times[1] },
            { name: 'Öğle', arabicName: 'الظهر', time: times[2] },
            { name: 'İkindi', arabicName: 'العصر', time: times[3] },
            { name: 'Akşam', arabicName: 'المغرب', time: times[4] },
            { name: 'Yatsı', arabicName: 'العشاء', time: times[5] },
          ],
        };
        localStorage.setItem(cacheKey, JSON.stringify(result));
        return result;
      }
    }
  } catch (err) {
    console.warn('Diyanet API yanıt vermedi, Sabah.com.tr proxy scraping deneniyor...', err);
  }

  try {
    // 2. ÖNCELİK: Doğrudan Sabah.com.tr üzerinden web scraping (CORS engeline karşı allorigins proxy)
    const sabahResponse = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(`https://www.sabah.com.tr/${city}-namaz-vakitleri`)}`);

    if (sabahResponse.ok) {
      const sabahData = await sabahResponse.json();
      const html = sabahData.contents;

      // Sabah HTML'sindeki saat etiketlerini Regex ile yakala (> 05:43 < formatı)
      const timeMatches = html.match(/>\s*([01][0-9]|2[0-3]):([0-5][0-9])\s*</g);
      if (timeMatches && timeMatches.length >= 6) {
        const cleanTimes = timeMatches.map((t: string) => t.replace(/[><\s]/g, ''));
        const result = {
          date: `${day}.${month}.${year}`,
          hijriDate: 'Sabah Takvimi',
          prayers: [
            { name: 'Sabah', arabicName: 'الفجر', time: cleanTimes[0] },
            { name: 'Güneş', arabicName: 'الشروق', time: cleanTimes[1] },
            { name: 'Öğle', arabicName: 'الظهر', time: cleanTimes[2] },
            { name: 'İkindi', arabicName: 'العصر', time: cleanTimes[3] },
            { name: 'Akşam', arabicName: 'المغرب', time: cleanTimes[4] },
            { name: 'Yatsı', arabicName: 'العشاء', time: cleanTimes[5] },
          ],
        };
        localStorage.setItem(cacheKey, JSON.stringify(result));
        return result;
      }
    }
  } catch (err) {
    console.warn('Sabah.com.tr proxy scraping başarısız, Aladhan API (Diyanet Metodu) fallback yapılıyor...', err);
  }

  try {
    // 3. YEDEK (Fallback): Aladhan API
    const dateString = `${day}-${month}-${year}`;
    const response = await fetch(
      `https://api.aladhan.com/v1/timingsByCity/${dateString}` +
      `?city=${encodeURIComponent(cityName)}` +
      `&country=Turkey` +
      `&method=13`
    );

    if (!response.ok) {
      throw new Error('Failed to fetch prayer times');
    }

    const data = await response.json();
    const timings = data.data.timings;

    const hijriDate = data.data.date.hijri.date;
    const result = {
      date: `${day}.${month}.${year}`,
      hijriDate,
      prayers: [
        { name: 'Sabah', arabicName: 'الفجر', time: timings.Fajr },
        { name: 'Güneş', arabicName: 'الشروق', time: timings.Sunrise },
        { name: 'Öğle', arabicName: 'الظهر', time: timings.Dhuhr },
        { name: 'İkindi', arabicName: 'العصر', time: timings.Asr },
        { name: 'Akşam', arabicName: 'المغرب', time: timings.Maghrib },
        { name: 'Yatsı', arabicName: 'العشاء', time: timings.Isha },
      ],
    };
    localStorage.setItem(cacheKey, JSON.stringify(result));
    return result;
  } catch (error) {
    console.error('Error fetching prayer times:', error);
    const unknownTime = '--:--';
    return {
      date: `${day}.${month}.${year}`,
      hijriDate: '??.??.????',
      prayers: [
        { name: 'Sabah', arabicName: 'الفجر', time: unknownTime },
        { name: 'Güneş', arabicName: 'الشروق', time: unknownTime },
        { name: 'Öğle', arabicName: 'الظهر', time: unknownTime },
        { name: 'İkindi', arabicName: 'العصر', time: unknownTime },
        { name: 'Akşam', arabicName: 'المغرب', time: unknownTime },
        { name: 'Yatsı', arabicName: 'العشاء', time: unknownTime },
      ],
    };
  }
}