import { collection, addDoc, query, orderBy, limit, getDocs, serverTimestamp, Timestamp, where, onSnapshot } from 'firebase/firestore';
import { db } from './firebase';

// Browser/Device Info türleri
export type BrowserType = 'Chrome' | 'Firefox' | 'Safari' | 'Edge' | 'Opera' | 'Unknown';
export type OSType = 'Windows' | 'macOS' | 'Linux' | 'iOS' | 'Android' | 'Unknown';
export type DeviceType = 'Desktop' | 'Mobile' | 'Tablet' | 'Unknown';
export type ActivityType = 'login' | 'logout' | 'prayer_tracked' | 'settings_changed' | 'failed_login';

export interface DeviceInfo {
  browser: BrowserType;
  browserVersion?: string;
  os: OSType;
  osVersion?: string;
  deviceType: DeviceType;
  screenWidth?: number;
  screenHeight?: number;
  timezone?: string;
}

export interface SessionInfo {
  loginTime: string;
  logoutTime?: string;
  firstActivityTime?: string;
  lastActivityTime?: string;
  sessionDuration?: number; // milliseconds
}

export interface SecurityInfo {
  failedAttempts: number;
  ipChanged: boolean;
  lastIpAddress?: string;
}

export interface Activity {
  type: ActivityType;
  timestamp: string;
  details?: string;
}

export interface LoginLogEntry {
  email: string;
  datetime: string;
  ip: string;
  country?: string;
  region?: string;
  city?: string;
  isp?: string;
  deviceInfo?: DeviceInfo;
  sessionInfo?: SessionInfo;
  securityInfo?: SecurityInfo;
  activities?: Activity[];
  failedLoginAttempts?: number;
  userId?: string; // opsiyonel, ileride auth ile konumlandırma
  id?: string;
  status?: 'success' | 'failed'; // giriş başarılı mı başarısız mı
  attemptReason?: string; // başarısız denemesi sebebi
}

const COLLECTION_NAME = 'loginLogs';

export async function getLoginLogs(email?: string): Promise<LoginLogEntry[]> {
  try {
    console.log('getLoginLogs çağrıldı, email:', email);
    const conditions = [orderBy('datetime', 'desc'), limit(200)] as any[];
    const coll = collection(db, COLLECTION_NAME);

    const q = email
      ? query(coll, where('email', '==', email), ...conditions)
      : query(coll, ...conditions);

    console.log('Query oluşturuldu:', email ? 'kullanıcı bazlı' : 'tüm loglar');
    const snapshot = await getDocs(q);
    console.log('Snapshot alındı, doküman sayısı:', snapshot.docs.length);
    const logs: LoginLogEntry[] = [];

    snapshot.forEach((doc) => {
      const data = doc.data();
      logs.push({
        id: doc.id,
        email: data.email,
        datetime: data.datetime instanceof Timestamp
          ? data.datetime.toDate().toISOString()
          : data.datetime,
        ip: 'hidden',
        country: data.country,
        region: data.region,
        city: data.city,
        isp: data.isp,
        deviceInfo: data.deviceInfo,
        sessionInfo: data.sessionInfo,
        securityInfo: data.securityInfo,
        activities: data.activities || [],
        failedLoginAttempts: data.failedLoginAttempts,
        userId: data.userId,
      });
    });

    console.log('Toplam log sayısı:', logs.length);
    return logs;
  } catch (error) {
    console.error('Login log okuma hatası:', error);
    return [];
  }
}

// Real-time subscription - tüm giriş denemelerini (başarılı/başarısız) canlı olarak dinle
export function subscribeToLoginLogs(email: string | undefined, callback: (logs: LoginLogEntry[]) => void): () => void {
  try {
    const conditions = [orderBy('datetime', 'desc'), limit(500)] as any[];
    const coll = collection(db, COLLECTION_NAME);

    const q = email
      ? query(coll, where('email', '==', email), ...conditions)
      : query(coll, ...conditions);

    console.log('🔍 [subscribeToLoginLogs] Subscription kurulmaya başlıyor, email:', email);

    // Real-time listener kurma
    const unsubscribe = onSnapshot(q, (snapshot) => {
      console.log('📊 [subscribeToLoginLogs] Snapshot alındı, toplam doküman:', snapshot.docs.length);
      const logs: LoginLogEntry[] = [];

      snapshot.forEach((doc) => {
        const data = doc.data();
        logs.push({
          id: doc.id,
          email: data.email,
          datetime: data.datetime instanceof Timestamp
            ? data.datetime.toDate().toISOString()
            : data.datetime,
          ip: 'hidden',
          country: data.country,
          region: data.region,
          city: data.city,
          isp: data.isp,
          deviceInfo: data.deviceInfo,
          sessionInfo: data.sessionInfo,
          securityInfo: data.securityInfo,
          activities: data.activities || [],
          failedLoginAttempts: data.failedLoginAttempts,
          userId: data.userId,
          status: data.status || 'success',
          attemptReason: data.attemptReason,
        });
      });

      console.log('🔄 [subscribeToLoginLogs] Callback çağrılıyor, log sayısı:', logs.length);
      callback(logs);
    }, (error) => {
      console.error('[subscribeToLoginLogs] Real-time log subscription hatası:', error);
    });

    return unsubscribe;
  } catch (error) {
    console.error('[subscribeToLoginLogs] Real-time subscription kurulurken hata:', error);
    return () => { };
  }
}

// Device bilgilerini al
function getDeviceInfo(): DeviceInfo {
  const userAgent = navigator.userAgent;
  let browser: BrowserType = 'Unknown';
  let browserVersion = '';
  let os: OSType = 'Unknown';
  let osVersion = '';
  let deviceType: DeviceType = 'Unknown';

  // Browser algılama
  if (userAgent.includes('Chrome')) {
    browser = 'Chrome';
    browserVersion = userAgent.match(/Chrome\/(\S+)/)?.[1] || '';
  } else if (userAgent.includes('Firefox')) {
    browser = 'Firefox';
    browserVersion = userAgent.match(/Firefox\/(\S+)/)?.[1] || '';
  } else if (userAgent.includes('Safari')) {
    browser = 'Safari';
    browserVersion = userAgent.match(/Version\/(\S+)/)?.[1] || '';
  } else if (userAgent.includes('Edge')) {
    browser = 'Edge';
    browserVersion = userAgent.match(/Edg\/(\S+)/)?.[1] || '';
  } else if (userAgent.includes('Opera')) {
    browser = 'Opera';
    browserVersion = userAgent.match(/Opera\/(\S+)/)?.[1] || '';
  }

  // OS algılama
  if (userAgent.includes('Windows')) {
    os = 'Windows';
    osVersion = userAgent.match(/Windows NT ([\d.]+)/)?.[1] || '';
  } else if (userAgent.includes('Mac')) {
    os = 'macOS';
    osVersion = userAgent.match(/Mac OS X ([\d._]+)/)?.[1]?.replace(/_/g, '.') || '';
  } else if (userAgent.includes('Linux')) {
    os = 'Linux';
  } else if (userAgent.includes('Android')) {
    os = 'Android';
    osVersion = userAgent.match(/Android ([\d.]+)/)?.[1] || '';
  } else if (userAgent.includes('iPhone') || userAgent.includes('iPad')) {
    os = 'iOS';
    osVersion = userAgent.match(/OS ([\d_]+)/)?.[1]?.replace(/_/g, '.') || '';
  }

  // Device türü algılama
  if (userAgent.includes('Mobile') || userAgent.includes('Android')) {
    deviceType = 'Mobile';
  } else if (userAgent.includes('Tablet') || userAgent.includes('iPad')) {
    deviceType = 'Tablet';
  } else if (os !== 'Unknown') {
    deviceType = 'Desktop';
  }

  const result: DeviceInfo & { [key: string]: any } = {
    browser,
    os,
    deviceType,
    screenWidth: window.screen.width,
    screenHeight: window.screen.height,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  };

  // Undefined değerleri ekleme
  if (browserVersion) result.browserVersion = browserVersion;
  if (osVersion) result.osVersion = osVersion;

  return result as DeviceInfo;
}

// Başarısız giriş denemelerini kontrol et
async function getFailedLoginAttempts(email: string): Promise<number> {
  try {
    const q = query(
      collection(db, 'failedLogins'),
      where('email', '==', email),
      where('timestamp', '>', new Date(Date.now() - 24 * 60 * 60 * 1000)) // Son 24 saat
    );
    const snapshot = await getDocs(q);
    return snapshot.size;
  } catch (error) {
    console.error('Başarısız giriş sayısı alınırken hata:', error);
    return 0;
  }
}

// İstatistikleri hesapla
export async function getLoginStatistics(email?: string) {
  try {
    const coll = collection(db, COLLECTION_NAME);
    const q = query(coll, orderBy('datetime', 'desc'), limit(200));
    const snapshot = await getDocs(q);
    let logs: any[] = snapshot.docs.map(doc => ({
      ...doc.data(),
      datetime: doc.data().datetime instanceof Timestamp
        ? doc.data().datetime.toDate()
        : new Date(doc.data().datetime)
    }));

    if (email) {
      const normalizedEmail = email.toLowerCase().trim();
      logs = logs.filter((log: any) => log.email === normalizedEmail);
    }

    const stats = {
      totalLogins: logs.length,
      uniqueEmails: new Set(logs.map((l: any) => l.email)).size,
      uniqueIPs: new Set(logs.map((l: any) => l.ip)).size,
      uniqueDevices: new Set(logs.map((l: any) => `${l.deviceInfo?.os}-${l.deviceInfo?.browser}`)).size,
      mostFrequentHour: getMostFrequentHour(logs),
      mostUsedBrowser: getMostUsedBrowser(logs),
      mostUsedOS: getMostUsedOS(logs),
      mostUsedDevice: getMostUsedDevice(logs),
      dailyLogins: getDailyLoginCounts(logs),
      weeklyLogins: getWeeklyLoginCounts(logs),
    };

    return stats;
  } catch (error) {
    console.error('İstatistikler hesaplanırken hata:', error);
    return null;
  }
}

function getMostFrequentHour(logs: any[]): string {
  const hours = logs.map(log => {
    const date = log.datetime instanceof Timestamp
      ? log.datetime.toDate()
      : new Date(log.datetime);
    return date.getHours();
  });

  const hourCounts = hours.reduce((acc, hour) => {
    acc[hour] = (acc[hour] || 0) + 1;
    return acc;
  }, {} as Record<number, number>);

  const mostFrequent = Object.entries(hourCounts).sort(([, a]: [string, any], [, b]: [string, any]) => (b as number) - (a as number))[0];
  return mostFrequent ? `${mostFrequent[0]}:00` : 'Bilinmiyor';
}

function getMostUsedBrowser(logs: any[]): string {
  const browsers = logs
    .map(log => log.deviceInfo?.browser)
    .filter(Boolean);

  if (!browsers.length) return 'Bilinmiyor';

  const browserCounts = browsers.reduce((acc, browser) => {
    acc[browser as string] = (acc[browser as string] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return Object.entries(browserCounts).sort(([, a]: [string, any], [, b]: [string, any]) => (b as number) - (a as number))[0]?.[0] || 'Bilinmiyor';
}

function getMostUsedOS(logs: any[]): string {
  const oss = logs
    .map(log => log.deviceInfo?.os)
    .filter(Boolean);

  if (!oss.length) return 'Bilinmiyor';

  const osCounts = oss.reduce((acc, os) => {
    acc[os as string] = (acc[os as string] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return Object.entries(osCounts).sort(([, a]: [string, any], [, b]: [string, any]) => (b as number) - (a as number))[0]?.[0] || 'Bilinmiyor';
}

function getMostUsedDevice(logs: any[]): string {
  const devices = logs
    .map(log => log.deviceInfo?.deviceType)
    .filter(Boolean);

  if (!devices.length) return 'Bilinmiyor';

  const deviceCounts = devices.reduce((acc, device) => {
    acc[device as string] = (acc[device as string] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return Object.entries(deviceCounts).sort(([, a]: [string, any], [, b]: [string, any]) => (b as number) - (a as number))[0]?.[0] || 'Bilinmiyor';
}

function getDailyLoginCounts(logs: any[]): Record<string, number> {
  const daily: Record<string, number> = {};

  logs.forEach(log => {
    const date = log.datetime instanceof Timestamp
      ? log.datetime.toDate()
      : new Date(log.datetime);
    const dateStr = date.toISOString().split('T')[0];
    daily[dateStr] = (daily[dateStr] || 0) + 1;
  });

  return daily;
}

function getWeeklyLoginCounts(logs: any[]): Record<number, number> {
  const weekly: Record<number, number> = {};

  logs.forEach(log => {
    const date = log.datetime instanceof Timestamp
      ? log.datetime.toDate()
      : new Date(log.datetime);
    const weekDay = date.getDay();
    weekly[weekDay] = (weekly[weekDay] || 0) + 1;
  });

  return weekly;
}

export async function addLoginLog(email?: string, allowFailedAttemptCheck = true): Promise<void> {
  try {
    const normalizedEmail = email?.toLowerCase().trim() || 'anonymous';
    console.log('🚀 [addLoginLog] Başarılı giriş kaydı başlanıyor:', normalizedEmail);

    const deviceInfo = getDeviceInfo();

    const failedAttempts = allowFailedAttemptCheck
      ? await getFailedLoginAttempts(normalizedEmail).catch(() => 0)
      : 0;

    // Firestore undefined değerleri desteklemez, bu yüzden cleanup gerekli
    const securityInfoObj: any = {
      failedAttempts,
      ipChanged: false,
    };

    const entry: any = {
      email: normalizedEmail,
      userId: normalizedEmail,
      datetime: serverTimestamp(),
      ip: 'hidden',
      deviceInfo,
      status: 'success',
      sessionInfo: {
        loginTime: new Date().toISOString(),
      },
      securityInfo: securityInfoObj,
      activities: [{
        type: 'login' as const,
        timestamp: new Date().toISOString(),
        details: email ? 'Giriş yapıldı' : 'Anonim sayfa ziyareti',
      }],
      failedLoginAttempts: failedAttempts,
    };

    console.log('💾 [addLoginLog] Firestore\'a yazılacak entry:', entry);
    await addDoc(collection(db, COLLECTION_NAME), entry);
    console.log('✅ [addLoginLog] Başarılı giriş Firestore\'a kaydedildi:', normalizedEmail);

    if (allowFailedAttemptCheck && normalizedEmail !== 'anonymous') {
      clearFailedLoginAttempts(normalizedEmail);
    }
  } catch (error) {
    console.error('[addLoginLog] Giriş logu eklenirken hata:', error);
  }
}

export async function addVisitLog(): Promise<void> {
  try {
    // Ziyaretçi bilgilerini türetip anonim olarak ekliyoruz
    await addLoginLog('anonymous', false);
  } catch (error) {
    console.error('Ziyaret logu eklenirken hata:', error);
  }
}

// Başarısız giriş denemesi ekle - detaylı bilgi ile
export async function addFailedLoginAttempt(email: string, ip?: string): Promise<void> {
  try {
    const deviceInfo = getDeviceInfo();
    const normalizedEmail = email.toLowerCase().trim();
    console.log('❌ [addFailedLoginAttempt] Başarısız giriş denemesi:', normalizedEmail);

    // Başarısız giriş denemesini loginLogs collection'ına kaydet
    const entry: any = {
      email: normalizedEmail,
      userId: normalizedEmail,
      datetime: serverTimestamp(),
      ip: 'hidden',
      deviceInfo,
      status: 'failed',
      attemptReason: 'Hatalı şifre veya e-posta / İzin verilmeyen kullanıcı',
      sessionInfo: {
        loginTime: new Date().toISOString(),
      },
    };

    await addDoc(collection(db, COLLECTION_NAME), entry);

  } catch (error) {
    console.error('Başarısız giriş logu eklenirken hata:', error);
  }
}

// Başarısız giriş denemelerini temizle
async function clearFailedLoginAttempts(email: string): Promise<void> {
  try {
    const q = query(
      collection(db, 'failedLogins'),
      where('email', '==', email)
    );
    const snapshot = await getDocs(q);
    snapshot.forEach(() => {
      // Document silinecek (gerçek uygulamada yapılabilir)
    });
  } catch (error) {
    console.error('Başarısız giriş temizlenirken hata:', error);
  }
}

// Aktivite ekle
export async function addActivity(email: string, type: ActivityType, details?: string): Promise<void> {
  try {
    const entry: any = {
      email,
      type,
      timestamp: serverTimestamp(),
    };

    // details sadece tanımlı ise ekle
    if (details) {
      entry.details = details;
    }

    await addDoc(collection(db, 'activities'), entry);
  } catch (error) {
    console.error('Aktivite logu eklenirken hata:', error);
  }
}

// ============= YENİ LOGGING FONKSİYONLARI =============

// Sayfa ziyareti logu
export async function logPageView(email: string, pageName: string, action?: string, sessionDuration?: string): Promise<void> {
  try {
    // İşlem logu Firestore'da tutulabilir ancak Telegram'a gönderilmez.
    return;
  } catch (error) {
    console.error('Sayfa ziyareti logu eklenirken hata:', error);
  }
}

// Namaz takip logu
export async function logPrayerTracking(
  email: string,
  prayerName: string,
  prayerTime: string,
  status: 'done' | 'missed' | 'late',
  timeDifference?: string
): Promise<void> {
  try {
    return;
  } catch (error) {
    console.error('Namaz takip logu eklenirken hata:', error);
  }
}

// İzin değişikliği logu
export async function logPermissionChange(
  email: string,
  permissionType: string,
  permissionStatus: 'granted' | 'denied' | 'pending' | 'default'
): Promise<void> {
  try {
    return;
  } catch (error) {
    console.error('İzin logu eklenirken hata:', error);
  }
}

// Ayar değişikliği logu
export async function logSettingsChange(
  email: string,
  settingName: string,
  oldValue: string,
  newValue: string
): Promise<void> {
  try {
    return;
  } catch (error) {
    console.error('Ayar değişikliği logu eklenirken hata:', error);
  }
}

// Rozet açılması logu
export async function logAchievementUnlocked(
  email: string,
  achievementName: string,
  achievementDescription?: string
): Promise<void> {
  try {
    return;
  } catch (error) {
    console.error('Rozet logu eklenirken hata:', error);
  }
}

// Hata logu
export async function logError(
  email: string,
  errorMessage: string,
  action?: string,
  errorStack?: string
): Promise<void> {
  try {
    return;
  } catch (error) {
    console.error('Hata logu eklenirken hata:', error);
  }
}

// Çıkış logu
export async function logLogout(email: string, sessionDuration?: string): Promise<void> {
  try {
    return;
  } catch (error) {
    console.error('Çıkış logu eklenirken hata:', error);
  }
}

// Günlük özet logu
export async function logDailySummary(
  email: string,
  totalPrayers: number,
  completedPrayers: number,
  missedPrayers: number,
  successRate: string
): Promise<void> {
  try {
  } catch (error) {
    console.error('Günlük özet logu eklenirken hata:', error);
  }
}

// Oturum özeti logu
export async function logSessionSummary(
  email: string,
  activeDays: number,
  streakDays: number,
  completedPrayers: number,
  successRate: string
): Promise<void> {
  try {
  } catch (error) {
    console.error('Oturum özeti logu eklenirken hata:', error);
  }
}

// Console'da debug için test fonksiyonu
export const testLoginLogs = async () => {
  console.log('🔍 LOGIN LOGS DEBUG TEST BAŞLIYOR...');

  try {
    // Mevcut logları çek
    const logs = await getLoginLogs();
    console.log('📊 Mevcut log sayısı:', logs.length);

    // Başarılı/başarısız sayıları
    const successCount = logs.filter(l => l.status === 'success' || !l.status).length;
    const failedCount = logs.filter(l => l.status === 'failed').length;

    console.log('✅ Başarılı girişler:', successCount);
    console.log('❌ Başarısız girişler:', failedCount);

    // Son 3 logu göster
    console.log('📝 Son 3 log:');
    logs.slice(0, 3).forEach((log, index) => {
      console.log(`${index + 1}. ${log.email} - ${log.status || 'success'} - ${log.datetime}`);
    });

    console.log('🔍 LOGIN LOGS DEBUG TEST TAMAMLANDI');
  } catch (error) {
    console.error('❌ Debug test hatası:', error);
  }
};

// Global window'a ekle (console'da test edebilmek için)
if (typeof window !== 'undefined') {
  (window as any).testLoginLogs = testLoginLogs;
}
