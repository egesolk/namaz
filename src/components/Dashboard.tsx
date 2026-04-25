import { useState, useEffect } from 'react';
import { LogOut, Calendar, History, User, Clock, BarChart3, Bell, X, TrendingUp } from 'lucide-react';
import { getCurrentUser, logout, getUserDisplayName, getProfilePicture, setProfilePicture, setCurrentUser } from '../lib/auth';
import { getPrayerTimesForDate, cityCoordinates } from '../lib/prayerTimes';
import {
  getPrayerDayDate,
  getDateString,
  subscribeToDayRecord,
  togglePrayer,
  DayRecord,
} from '../lib/prayerTracker';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { PrayerCard } from './PrayerCard';
import { HistoryView } from './HistoryView';

// Placeholder image URL until the local asset is available
const hagiaSophiaImg = "https://images.unsplash.com/photo-1541432901042-2d8bd64b4a9b?q=80&w=2000";


interface DashboardProps {
  onLogout: () => void;
}

export function Dashboard({ onLogout }: DashboardProps) {
  const [currentDate, setCurrentDate] = useState<Date>(() => getPrayerDayDate());
  const [prayerTimes, setPrayerTimes] = useState<any>(null);
  const [dayRecord, setDayRecord] = useState<DayRecord | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showStats, setShowStats] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission | null>(null);
  const [currentAlarmId, setCurrentAlarmId] = useState<number | null>(null);
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  const [surpriseSeen, setSurpriseSeen] = useState(false);
  const [partnerName, setPartnerName] = useState<string | null>(null);

  const userData = getCurrentUser()!;
  const [profilePic, setProfilePic] = useState<string | null>(null);
  const selectedCityName = userData.city.charAt(0).toUpperCase() + userData.city.slice(1);
  const dateString = getDateString(currentDate);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Grup bilgilerini ve partner ismini çek
  useEffect(() => {
    const fetchGroupData = async () => {
      const groupRef = doc(db, 'prayerGroups', userData.groupId);
      const snap = await getDoc(groupRef);

      if (snap.exists()) {
        const data = snap.data();
        const isMember1 = data.member1Key === userData.displayName.toLowerCase().replace(/\s+/g, '');
        setPartnerName(isMember1 ? data.member2Name : data.member1Name);
      } else {
        // Grup yoksa oluştur (kendisi için)
        await setDoc(groupRef, {
          member1Name: userData.displayName,
          member1Key: userData.displayName.toLowerCase().replace(/\s+/g, ''),
          city: userData.city,
          createdAt: new Date().toISOString()
        });
      }
    };

    fetchGroupData();
  }, [userData.groupId]);

  useEffect(() => {
    const checkPrayerDayChange = () => {
      const today = getPrayerDayDate();
      if (today.getTime() !== currentDate.getTime()) {
        setCurrentDate(today);
      }
    };

    const intervalId = setInterval(checkPrayerDayChange, 60 * 1000);
    checkPrayerDayChange();

    return () => clearInterval(intervalId);
  }, [currentDate]);

  useEffect(() => {
    const saved = getProfilePicture(userData.displayName);
    if (saved) setProfilePic(saved);
  }, [userData]);

  useEffect(() => {
    getPrayerTimesForDate(currentDate, userData.city)
      .then((times) => {
        console.log('Namaz vakitleri yüklendi:', times);
        setPrayerTimes(times);
      })
      .catch((error) => {
        console.error('Namaz vakitleri yüklenirken hata:', error);
      });
  }, [currentDate, userData.city]);

  useEffect(() => {
    const unsubscribe = subscribeToDayRecord(dateString, userData.groupId, setDayRecord);
    return () => unsubscribe();
  }, [dateString, userData.groupId]);

  // Bildirim İzni Kontrolü
  useEffect(() => {
    if ('Notification' in window) {
      const notifPerm = Notification.permission;
      setNotificationPermission(notifPerm);
    }
  }, [userData]);

  // Namaz Bildirimleri Sistemi
  useEffect(() => {
    if (!prayerTimes || notificationPermission !== 'granted') return;

    const setupNotifications = () => {
      prayerTimes.prayers.forEach((prayer: any) => {
        const [hours, minutes] = prayer.time.split(':').map(Number);
        const prayerTime = new Date();
        prayerTime.setHours(hours, minutes, 0);

        // 3 dakika öncesi için timer
        const notificationTime = new Date(prayerTime.getTime() - 3 * 60000);
        const now = new Date();
        let timeUntilNotification = notificationTime.getTime() - now.getTime();

        if (timeUntilNotification < 0) {
          timeUntilNotification += 24 * 60 * 60 * 1000; // Yarın için
        }

        const timeout = setTimeout(() => {
          showPrayerNotification(prayer.name, prayer.arabicName, prayer.time);
        }, timeUntilNotification);

        return () => clearTimeout(timeout);
      });
    };

    setupNotifications();
  }, [prayerTimes, notificationPermission]);

  const handleTogglePrayer = async (prayerName: string) => {
    await togglePrayer(dateString, prayerName, userData.displayName, userData.groupId);
  };

  const handleLogout = async () => {
    await logout();
    onLogout();
  };

  // Ezan Sesi Üretme Fonksiyonu
  const playAdhanSound = () => {
    if (currentAlarmId !== null) return; // Zaten çalınıyorsa çalma

    const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    setAudioContext(audioCtx);

    // Basit ezan sesi tonu - 200ms Turkish call pattern
    const notes = [
      { freq: 440, duration: 400 }, // A4
      { freq: 880, duration: 300 },
      { freq: 660, duration: 500 },
      { freq: 880, duration: 400 },
      { freq: 440, duration: 600 },
    ];

    let currentTime = audioCtx.currentTime;
    const alarmId = Math.random();
    setCurrentAlarmId(alarmId as any);

    const playNotes = () => {
      if (currentAlarmId !== alarmId) return; // Stop eğer başka alarm başladıysa

      const now = audioCtx.currentTime;
      notes.forEach(({ freq, duration }) => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();

        osc.connect(gain);
        gain.connect(audioCtx.destination);

        osc.frequency.value = freq;
        osc.type = 'sine';

        gain.gain.setValueAtTime(0.3, now + currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, now + currentTime + duration / 1000);

        osc.start(now + currentTime);
        osc.stop(now + currentTime + duration / 1000);

        currentTime += duration / 1000 + 0.1;
      });

      // 5 kez tekrarla
      if (currentTime < 5) {
        setTimeout(playNotes, 3000);
      }
    };

    playNotes();
  };

  const stopAdhanSound = () => {
    setCurrentAlarmId(null);
    if (audioContext) {
      audioContext.close();
      setAudioContext(null);
    }
  };

  const showPrayerNotification = (prayerName: string, arabicName: string, time: string) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      const notification = new Notification(`${prayerName} Namazı yaklaşıyor!`, {
        body: `${arabicName} - ${time}\n3 dakika içinde namaz vakti gelecek`,
        icon: '🕌',
        tag: `prayer-${prayerName}`,
        requireInteraction: true,
      });

      playAdhanSound();

      notification.onclick = () => {
        window.focus();
        notification.close();
        stopAdhanSound();
      };

      // 30 saniye sonra otomatik kapat
      setTimeout(() => {
        notification.close();
      }, 30000);
    }
  };

  const requestNotificationPermission = async () => {
    if (!('Notification' in window)) {
      alert('Bu tarayıcı bildirimleri desteklemiyor');
      return;
    }

    try {
      const permission = await Notification.requestPermission();
      setNotificationPermission(permission);

      if (permission === 'granted') {
        new Notification('Bildirimler Aktif!', {
          body: 'Namaz hatırlatmaları açık halde.',
          icon: '✅',
        });
      }
    } catch (error) {
      console.error('Bildirim izni hatası:', error);
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('tr-TR', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('tr-TR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      weekday: 'long',
    });
  };

  const formatRemainingTime = (ms: number) => {
    if (ms <= 0) return '00:00:00';
    const totalSeconds = Math.max(0, Math.floor(ms / 1000));
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  };

  const getNextPrayer = () => {
    if (!prayerTimes || !prayerTimes.prayers?.length) return null;

    const now = new Date(currentTime);
    const validPrayers = prayerTimes.prayers.filter((p: any) => p.name !== 'Güneş');

    const prayerDateTimes = validPrayers.map((p: any) => {
      const [hour, minute] = (p.time || '00:00').split(':').map(Number);
      const d = new Date(now);
      d.setHours(hour, minute, 0, 0);
      return { ...p, date: d };
    });

    let next = prayerDateTimes.find((p: any) => p.date.getTime() > now.getTime());

    if (!next) {
      // Ertesi günün ilk namazı
      const firstPrayer = prayerDateTimes[0];
      if (!firstPrayer) return null;
      const nextDate = new Date(firstPrayer.date);
      nextDate.setDate(nextDate.getDate() + 1);
      next = { ...firstPrayer, date: nextDate };
    }

    const remainingMs = next.date.getTime() - now.getTime();

    return {
      name: next.name,
      time: next.time,
      remaining: formatRemainingTime(remainingMs),
      remainingMs,
    };
  };

  const nextPrayer = getNextPrayer();

  const calculateStats = () => {
    if (!dayRecord) return null;

    const prayers = ['Sabah', 'Öğle', 'İkindi', 'Akşam', 'Yatsı'];
    const userKey = userData.displayName.toLowerCase().replace(/\s+/g, '');

    const completedToday = prayers.filter(prayer =>
      (dayRecord.prayers[prayer as keyof typeof dayRecord.prayers] as any)[userKey]
    ).length;

    const totalPrayers = prayers.length;
    const todayPercentage = Math.round((completedToday / totalPrayers) * 100);

    return {
      completedToday,
      totalPrayers,
      todayPercentage,
      prayers: prayers.map(prayer => ({
        name: prayer,
        completed: dayRecord.prayers[prayer as keyof typeof dayRecord.prayers][userKey],
        time: prayerTimes?.prayers.find((p: any) => p.name === prayer)?.time || '--:--'
      }))
    };
  };

  if (showHistory) {
    return <HistoryView onBack={() => setShowHistory(false)} />;
  }

  return (
    <div
      className="min-h-screen text-white relative overflow-hidden"
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
        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg">
          <div className="container mx-auto px-4 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <label htmlFor="avatarInput" className="cursor-pointer">
                  <div className={`w-12 h-12 rounded-full border-2 border-emerald-300 bg-emerald-100 flex items-center justify-center shadow-inner overflow-hidden relative`}>
                    {profilePic ? (
                      <img src={profilePic} alt="Profil" className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-8 h-8 text-slate-700" />
                    )}
                  </div>
                </label>
                <input
                  id="avatarInput"
                  type="file"
                  accept="image/*"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    const reader = new FileReader();
                    reader.onload = async () => {
                      if (typeof reader.result === 'string') {
                        await setProfilePicture(userData.displayName, reader.result);
                        setProfilePic(reader.result);
                      }
                    };
                    reader.readAsDataURL(file);
                  }}
                  className="hidden"
                />
                <div>
                  <p className="text-white font-semibold">
                    {getUserDisplayName(userData)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 md:gap-3">
                {currentAlarmId !== null && (
                  <button
                    onClick={stopAdhanSound}
                    className="flex items-center gap-1.5 md:gap-2 bg-red-500 hover:bg-red-600 px-3 md:px-4 py-1.5 md:py-2 rounded-lg transition font-semibold text-sm md:text-base"
                  >
                    <X className="w-5 md:w-5 h-5 md:h-5" />
                    <span className="hidden md:inline">Durdur</span>
                  </button>
                )}
                {notificationPermission !== 'granted' && (
                  <button
                    onClick={requestNotificationPermission}
                    className="flex items-center gap-1.5 md:gap-2 bg-white/20 hover:bg-white/30 px-3 md:px-4 py-1.5 md:py-2 rounded-lg transition text-sm md:text-base"
                  >
                    <Bell className="w-5 md:w-5 h-5 md:h-5" />
                    <span className="hidden md:inline">Bildirimleri Aç</span>
                  </button>
                )}
                {notificationPermission === 'granted' && (
                  <div className="flex items-center gap-1.5 md:gap-2 bg-white/20 px-3 md:px-4 py-1.5 md:py-2 rounded-lg text-sm md:text-base">
                    <Bell className="w-5 md:w-5 h-5 md:h-5 text-emerald-300" />
                    <span className="hidden md:inline">Aktif</span>
                  </div>
                )}
                <button
                  onClick={() => handleLogout()}
                  className="flex items-center gap-1.5 md:gap-2 bg-white/20 hover:bg-white/30 px-3 md:px-4 py-1.5 md:py-2 rounded-lg transition text-sm md:text-base"
                >
                  <LogOut className="w-5 md:w-5 h-5 md:h-5" />
                  <span className="hidden md:inline">Çıkış</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl shadow-xl p-6 mb-8">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-3">
                <Calendar className="w-6 h-6 text-emerald-400" />
                <div>
                  <p className="text-2xl font-bold text-white">{formatDate(currentDate)}</p>
                  <p className="text-slate-300">{selectedCityName}</p>
                </div>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-2 justify-end">
                  <Clock className="w-6 h-6 text-emerald-400" />
                  <p className="text-3xl font-bold text-emerald-400">{formatTime(currentTime)}</p>
                </div>
                {nextPrayer && (
                  <div className="mt-2 text-right">

                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex justify-end mb-6">
            <div className="grid grid-cols-2 gap-3 w-full md:w-auto">
              <button
                onClick={() => {
                  setShowStats(true);
                }}
                className="flex items-center gap-2 bg-slate-800/50 hover:bg-slate-700/50 px-6 py-3 rounded-lg shadow-md transition border border-slate-600"
              >
                <TrendingUp className="w-5 h-5 text-emerald-400" />
                <span className="font-semibold text-white">İstatistikler</span>
              </button>
              <button
                onClick={() => setShowHistory(true)}
                className="flex items-center gap-2 bg-slate-800/50 hover:bg-slate-700/50 px-6 py-3 rounded-lg shadow-md transition border border-slate-600"
              >
                <History className="w-5 h-5 text-emerald-400" />
                <span className="font-semibold text-white">Geçmiş</span>
              </button>
            </div>
          </div>

          {prayerTimes && dayRecord && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {prayerTimes.prayers.map((prayer: any) => (
                <PrayerCard
                  key={prayer.name}
                  name={prayer.name}
                  time={prayer.time}
                  status={dayRecord.prayers[prayer.name as keyof typeof dayRecord.prayers]}
                  currentUserName={userData.displayName}
                  partnerName={partnerName}
                  onToggle={() => handleTogglePrayer(prayer.name)}
                />
              ))}
            </div>
          ) || (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-emerald-400 border-t-transparent"></div>
                <p className="mt-4 text-slate-300">Namaz vakitleri yükleniyor...</p>
              </div>
            )}

          <div className="mt-12 bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-slate-600">
            <p className="text-center text-white italic leading-relaxed">
              "Namaz, müminin miracıdır." - Hz. Muhammed (S.A.V)
            </p>
          </div>
        </div>

        {/* İstatistikler Modal */}
        {showStats && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-slate-800/95 backdrop-blur-xl rounded-2xl shadow-2xl max-w-md w-full border border-slate-600">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                    <BarChart3 className="w-6 h-6 text-emerald-400" />
                    Günlük İstatistikler
                  </h2>
                  <button
                    onClick={() => setShowStats(false)}
                    className="text-slate-400 hover:text-white transition"
                  >
                    ✕
                  </button>
                </div>

                {(() => {
                  const stats = calculateStats();
                  if (!stats) return <p className="text-slate-300">Veri yükleniyor...</p>;

                  return (
                    <div className="space-y-6">
                      <div className="text-center">
                        <div className="text-4xl font-bold text-emerald-400 mb-2">
                          {stats.completedToday}/{stats.totalPrayers}
                        </div>
                        <p className="text-slate-300">Bugünkü Namazlar</p>
                        <div className="w-full bg-slate-700 rounded-full h-3 mt-3">
                          <div
                            className="bg-emerald-400 h-3 rounded-full transition-all duration-500"
                            style={{ width: `${stats.todayPercentage}%` }}
                          />
                        </div>
                        <p className="text-sm text-slate-400 mt-2">{stats.todayPercentage}% Tamamlandı</p>
                      </div>

                      <div className="space-y-3">
                        <h3 className="text-lg font-semibold text-white">Namaz Detayları</h3>
                        {stats.prayers.map((prayer) => (
                          <div key={prayer.name} className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg">
                            <div>
                              <span className="font-medium text-white">{prayer.name}</span>
                              <span className="text-sm text-slate-400 ml-2">{prayer.time}</span>
                            </div>
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center ${prayer.completed ? 'bg-emerald-500' : 'bg-slate-600'
                              }`}>
                              {prayer.completed && <span className="text-white text-sm">✓</span>}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}