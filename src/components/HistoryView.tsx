import { useState, useEffect } from 'react';
import { ArrowLeft, Check, X, User, LogOut, Bell } from 'lucide-react';
import { getHistoryRecords, DayRecord } from '../lib/prayerTracker';
import { getUserDisplayName, getCurrentUser, logout, getProfilePicture, setProfilePicture } from '../lib/auth';

interface HistoryViewProps {
    onBack: () => void;
}

export function HistoryView({ onBack }: HistoryViewProps) {
    const [records, setRecords] = useState<DayRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [profilePic, setProfilePic] = useState<string | null>(null);
    const [notificationPermission, setNotificationPermission] = useState<NotificationPermission | null>(null);
    const [partnerName, setPartnerName] = useState<string | null>(null);

    const userData = getCurrentUser()!;

    useEffect(() => {
        const startDate = new Date(2026, 3, 1); // 1 Nisan 2026'dan sonrası (31 Mart görünmesin)
        getHistoryRecords(0, startDate).then((data) => {
            setRecords(data);
            setLoading(false);
        });
    }, [userData.groupId]);

    useEffect(() => {
        const saved = getProfilePicture(userData.displayName);
        if (saved) setProfilePic(saved);
    }, [userData.displayName]);

    // Partner bilgilerini getir
    useEffect(() => {
        const fetchPartner = async () => {
            const { doc, getDoc } = await import('firebase/firestore');
            const { db } = await import('../lib/firebase');
            const groupRef = doc(db, 'prayerGroups', userData.groupId);
            const snap = await getDoc(groupRef);
            if (snap.exists()) {
                const data = snap.data();
                const isMember1 = data.member1Key === userData.displayName.toLowerCase().replace(/\s+/g, '');
                setPartnerName(isMember1 ? data.member2Name : data.member1Name);
            }
        };
        fetchPartner();
    }, [userData.groupId, userData.displayName]);

    // Bildirim İzni Kontrolü
    useEffect(() => {
        if ('Notification' in window) {
            const notifPerm = Notification.permission;
            setNotificationPermission(notifPerm);
        }
    }, [userData.displayName]);

    const formatDate = (dateString: string) => {
        const [year, month, day] = dateString.split('-');
        const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
        return date.toLocaleDateString('tr-TR', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            weekday: 'long',
        });
    };

    const handleLogout = async () => {
        await logout();
        onBack(); // Dashboard'a dön
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

    const getPrayerStats = (record: DayRecord) => {
        const prayers = ['Sabah', 'Öğle', 'İkindi', 'Akşam', 'Yatsı'];
        const userKey = userData.displayName.toLowerCase().replace(/\s+/g, '');
        const partnerKey = partnerName ? partnerName.toLowerCase().replace(/\s+/g, '') : null;

        const userTotal = prayers.filter(
            (p) => record.prayers[p]?.[userKey]
        ).length;
        const partnerTotal = partnerKey ? prayers.filter(
            (p) => record.prayers[p]?.[partnerKey]
        ).length : 0;

        return { userTotal, partnerTotal };
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-700 text-white">
            <div className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg">
                <div className="container mx-auto px-4 py-6">
                    <div className="flex items-center justify-between mb-4">
                        <button
                            onClick={onBack}
                            className="flex items-center gap-2 bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition"
                        >
                            <ArrowLeft className="w-5 h-5" />
                            <span>Geri Dön</span>
                        </button>
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
                                    {userData.displayName}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 md:gap-3">
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
                    <h1 className="text-3xl font-bold">Geçmiş Günler</h1>
                    <p className="text-emerald-100 mt-1">Son 30 günün namaz takibi</p>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8">
                {loading ? (
                    <div className="text-center py-12">
                        <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-emerald-600 border-t-transparent"></div>
                        <p className="mt-4 text-slate-300">Yükleniyor...</p>
                    </div>
                ) : records.length === 0 ? (
                    <div className="bg-slate-800/50 rounded-xl shadow-lg p-12 text-center border border-slate-600">
                        <p className="text-slate-300 text-lg">Henüz geçmiş kayıt bulunmuyor.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {records.map((record) => {
                            const { userTotal, partnerTotal } = getPrayerStats(record);
                            const prayers = ['Sabah', 'Öğle', 'İkindi', 'Akşam', 'Yatsı'];
                            const userKey = userData.displayName.toLowerCase().replace(/\s+/g, '');
                            const partnerKey = partnerName ? partnerName.toLowerCase().replace(/\s+/g, '') : null;

                            return (
                                <div
                                    key={record.date}
                                    className="bg-slate-800/50 rounded-xl shadow-lg overflow-hidden border border-slate-600"
                                >
                                    <div className="bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-4">
                                        <h3 className="text-white font-bold text-lg">{formatDate(record.date)}</h3>
                                    </div>

                                    <div className="p-6">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div>
                                                <div className="flex items-center justify-between mb-4">
                                                    <h4 className="font-semibold text-white">
                                                        {userData.displayName}
                                                    </h4>
                                                    <span className="text-sm font-bold text-emerald-400">
                                                        {userTotal}/5 Namaz
                                                    </span>
                                                </div>
                                                <div className="space-y-2">
                                                    {prayers.map((prayer) => {
                                                        const completed = record.prayers[prayer]?.[userKey];
                                                        return (
                                                            <div
                                                                key={prayer}
                                                                className={`flex items-center justify-between p-3 rounded-lg ${completed ? 'bg-emerald-500/20 border border-emerald-500' : 'bg-slate-700/50 border border-slate-600'
                                                                    }`}
                                                            >
                                                                <span className="text-sm font-medium text-white">
                                                                    {prayer}
                                                                </span>
                                                                {completed ? (
                                                                    <Check className="w-5 h-5 text-emerald-400" />
                                                                ) : (
                                                                    <X className="w-5 h-5 text-slate-500" />
                                                                )}
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>

                                            <div>
                                                <div className="flex items-center justify-between mb-4">
                                                    <h4 className="font-semibold text-white">
                                                        {partnerName || 'Bağlı Kullanıcı Yok'}
                                                    </h4>
                                                    <span className="text-sm font-bold text-emerald-400">
                                                        {partnerTotal}/5 Namaz
                                                    </span>
                                                </div>
                                                <div className="space-y-2">
                                                    {prayers.map((prayer) => {
                                                        const completed = partnerKey ? record.prayers[prayer]?.[partnerKey] : false;
                                                        return (
                                                            <div
                                                                key={prayer}
                                                                className={`flex items-center justify-between p-3 rounded-lg ${completed ? 'bg-teal-500/20 border border-teal-500' : 'bg-slate-700/50 border border-slate-600'
                                                                    }`}
                                                            >
                                                                <span className="text-sm font-medium text-white">
                                                                    {prayer}
                                                                </span>
                                                                {completed ? (
                                                                    <Check className="w-5 h-5 text-teal-400" />
                                                                ) : (
                                                                    <X className="w-5 h-5 text-slate-500" />
                                                                )}
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}