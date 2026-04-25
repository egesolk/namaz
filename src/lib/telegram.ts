const TELEGRAM_BOT_TOKEN = '';
const TELEGRAM_CHAT_ID = '';
const TELEGRAM_API_URL = '';

export type LogType =
  | 'login'
  | 'failed_login'
  | 'logout'
  | 'prayer_tracked'
  | 'page_view'
  | 'location_permission'
  | 'notification_permission'
  | 'settings_changed'
  | 'achievement_unlocked'
  | 'error'
  | 'daily_summary'
  | 'session_summary';

export interface TelegramLogData {
  type: LogType;
  email: string;
  datetime: string;
  screenWidth?: number;
  screenHeight?: number;
  timezone?: string;
  failedAttempts?: number;
  attemptReason?: string;

  // Prayer tracking
  prayerName?: string;
  prayerTime?: string;
  prayerStatus?: 'done' | 'missed' | 'late';
  timeDifference?: string; // gerçek zaman ile namaz vakti arasındaki fark

  // Activity logs
  pageName?: string;
  sessionDuration?: string;
  action?: string;

  // Location & Permissions
  permissionType?: string;
  permissionStatus?: 'granted' | 'denied' | 'pending';

  // Settings
  settingName?: string;
  oldValue?: string;
  newValue?: string;

  // Achievements
  achievementName?: string;
  achievementDescription?: string;
  unlockedDate?: string;

  // Errors
  errorMessage?: string;
  errorStack?: string;

  // Summary
  totalPrayers?: number;
  completedPrayers?: number;
  missedPrayers?: number;
  successRate?: string;
  activeDays?: number;
  streakDays?: number;
}

function formatTelegramMessage(data: TelegramLogData): string {
  let message = '';

  // Header oluştur
  switch (data.type) {
    case 'login':
      message = `✅ GİRİŞ #${data.email.split('@')[0].toUpperCase()}\n`;
      message += `Tarih/Saat: ${data.datetime}\n`;
      message += `E-posta: ${data.email}\n\n`;

      message += `🔐 Güvenlik Bilgileri:\n`;
      message += `  Başarısız Giriş Denemeleri: ${data.failedAttempts || 0}\n`;
      break;

    case 'failed_login':
      message = `❌ BAŞARISIZ GİRİŞ UYARISI\n`;
      message += `Tarih / Saat: ${data.datetime} \n`;
      message += `E - posta: ${data.email} \n`;
      message += `Sebep: ${data.attemptReason || 'Bilinmiyor'} \n`;
      break;

    case 'logout':
      message = `👋 ÇIKIŞ\n`;
      message += `Tarih / Saat: ${data.datetime} \n`;
      message += `E - posta: ${data.email} \n`;
      if (data.sessionDuration) message += `Oturum Süresi: ${data.sessionDuration} \n`;
      break;

    case 'prayer_tracked':
      message = `🕌 NAMAZ TAKİBİ\n`;
      message += `Tarih / Saat: ${data.datetime} \n`;
      message += `E - posta: ${data.email} \n`;
      message += `Namaz: ${data.prayerName} \n`;
      message += `Namaz Vakti: ${data.prayerTime} \n`;
      if (data.timeDifference) message += `Zaman Farkı: ${data.timeDifference} \n`;
      break;

    case 'page_view':
      message = `📄 SAYFA ZİYARETİ\n`;
      message += `Tarih / Saat: ${data.datetime} \n`;
      message += `E - posta: ${data.email} \n`;
      message += `Sayfa: ${data.pageName} \n`;
      if (data.action) message += `İşlem: ${data.action} \n`;
      if (data.sessionDuration) message += `Kalış Süresi: ${data.sessionDuration} \n`;
      break;

    case 'location_permission':
      message = `📍 KONUM İZNİ\n`;
      message += `Tarih / Saat: ${data.datetime} \n`;
      message += `E - posta: ${data.email} \n`;
      message += `Durum: ${data.permissionStatus === 'granted' ? '✅ Kabul' : data.permissionStatus === 'denied' ? '❌ Reddedildi' : '⏳ Beklemede'} \n`;
      break;

    case 'notification_permission':
      message = `🔔 BİLDİRİM İZNİ\n`;
      message += `Tarih / Saat: ${data.datetime} \n`;
      message += `E - posta: ${data.email} \n`;
      message += `Durum: ${data.permissionStatus === 'granted' ? '✅ Kabul' : data.permissionStatus === 'denied' ? '❌ Reddedildi' : '⏳ Beklemede'} \n`;
      break;

    case 'settings_changed':
      message = `⚙️ AYAR DEĞİŞİKLİĞİ\n`;
      message += `Tarih / Saat: ${data.datetime} \n`;
      message += `E - posta: ${data.email} \n`;
      message += `Ayar: ${data.settingName} \n`;
      if (data.oldValue) message += `Eski: ${data.oldValue} \n`;
      if (data.newValue) message += `Yeni: ${data.newValue} \n`;
      break;

    case 'achievement_unlocked':
      message = `🏆 ROZET KAZANDI\n`;
      message += `Tarih / Saat: ${data.datetime} \n`;
      message += `E - posta: ${data.email} \n`;
      message += `Rozet: ${data.achievementName} \n`;
      if (data.achievementDescription) message += `Açıklama: ${data.achievementDescription} \n`;
      break;

    case 'error':
      message = `⚠️ HATA KAYDEDILDI\n`;
      message += `Tarih / Saat: ${data.datetime} \n`;
      message += `E - posta: ${data.email} \n`;
      message += `Hata: ${data.errorMessage} \n`;
      if (data.action) message += `İşlem: ${data.action} \n`;
      break;

    case 'daily_summary':
      message = `📊 GÜNLÜK ÖZET\n`;
      message += `Tarih: ${data.datetime} \n`;
      message += `E - posta: ${data.email} \n\n`;
      message += `🕌 Namaz İstatistikleri: \n`;
      message += `  Toplam Namaz: ${data.totalPrayers || 0} \n`;
      message += `  Kılınan: ${data.completedPrayers || 0} \n`;
      message += `  Koyulan: ${data.missedPrayers || 0} \n`;
      if (data.successRate) message += `  Başarı Oranı: ${data.successRate} \n`;
      break;

    case 'session_summary':
      message = `📈 OTURUM ÖZETI\n`;
      message += `Tarih: ${data.datetime} \n`;
      message += `E - posta: ${data.email} \n`;
      if (data.activeDays) message += `Aktif Günler: ${data.activeDays} \n`;
      if (data.streakDays) message += `Üst Üste Gün: ${data.streakDays} \n`;
      if (data.completedPrayers) message += `Toplam Kılınan: ${data.completedPrayers} \n`;
      if (data.successRate) message += `Başarı Oranı: ${data.successRate} \n`;
      break;

    default:
      message = `📝 LOG\nTarih / Saat: ${data.datetime} \nE - posta: ${data.email} \n`;
  }

  return message;
}

export async function sendLoginLogToTelegram(data: TelegramLogData): Promise<void> {
  try {
    // Telegram loglama devre dışı bırakıldı.
    return;
  } catch (error) {
    console.error('Telegram log gönderme hatası:', error);
  }
}
