import { db } from './firebase';
import {
    collection,
    doc,
    setDoc,
    updateDoc,
    getDoc,
    onSnapshot,
    query,
    where,
    orderBy,
    limit,
    getDocs,
} from 'firebase/firestore';
import { logPrayerTracking } from './loginLogs';

export interface DayRecord {
    date: string;
    prayers: {
        [key: string]: any; // Dinamik namaz isimleri ve kullanıcı keyleri için
    };
}

export const PRAYER_DAY_START_HOUR = 4;

export function getPrayerDayDate(inputDate: Date = new Date()): Date {
    const date = new Date(inputDate);

    if (date.getHours() < PRAYER_DAY_START_HOUR) {
        date.setDate(date.getDate() - 1);
    }

    date.setHours(0, 0, 0, 0);
    return date;
}

export function getDateString(date: Date): string {
    const effectiveDate = getPrayerDayDate(date);
    const year = effectiveDate.getFullYear();
    const month = String(effectiveDate.getMonth() + 1).padStart(2, '0');
    const day = String(effectiveDate.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
}

function getEmailKey(name: string): string {
    return name.toLowerCase().replace(/\s+/g, '');
}

// localStorage helper
function getRecordFromStorage(date: string, groupId: string): DayRecord | null {
    const stored = localStorage.getItem(`prayer-record:${groupId}:${date}`);
    return stored ? JSON.parse(stored) : null;
}

function saveRecordToStorage(record: DayRecord, groupId: string): void {
    localStorage.setItem(`prayer-record:${groupId}:${record.date}`, JSON.stringify(record));
}

function getEmptyRecord(date: string): DayRecord {
    return {
        date,
        prayers: {
            Sabah: {},
            Öğle: {},
            İkindi: {},
            Akşam: {},
            Yatsı: {},
        },
    };
}

export async function togglePrayer(
    date: string,
    prayerName: string,
    userEmail: string,
    groupId: string
): Promise<void> {
    const userKey = getEmailKey(userEmail);
    const docRef = doc(db, 'prayerGroups', groupId, 'records', date);

    try {
        // Önce mevcut veriyi al
        const docSnap = await getDoc(docRef);
        if (!docSnap.exists()) {
            await setDoc(docRef, getEmptyRecord(date));
        }

        const currentData = docSnap.exists() ? (docSnap.data() as DayRecord) : getEmptyRecord(date);
        const currentStatus = currentData.prayers[prayerName as keyof typeof currentData.prayers]?.[userKey] ?? false;

        const newStatus = !currentStatus;
        const timestamp = newStatus ? new Date().toISOString() : null;

        // Atomik güncelleme: Sadece ilgili alanları değiştirir, diğer namazlara dokunmaz
        await updateDoc(docRef, {
            [`prayers.${prayerName}.${userKey}`]: newStatus,
            [`prayers.${prayerName}.${userKey}At`]: timestamp
        });

        console.log(`Firebase güncellendi: ${prayerName} -> ${newStatus}`);

        // LocalStorage güncelleme (offline fallback için tüm kaydı tekrar çekip kaydetmek gerekebilir 
        // veya yerel state üzerinden yönetilebilir)
        const updatedRecord = { ...currentData };
        updatedRecord.prayers[prayerName as keyof typeof updatedRecord.prayers][userKey] = newStatus;
        (updatedRecord.prayers[prayerName as keyof typeof updatedRecord.prayers] as any)[`${userKey}At`] = timestamp;
        saveRecordToStorage(updatedRecord, groupId);

        // Telegram'a log gönder
        const prayerTimes: { [key: string]: string } = {
            'Sabah': '05:30',
            'Öğle': '12:30',
            'İkindi': '15:30',
            'Akşam': '18:30',
            'Yatsı': '20:30',
        };

        const prayerTime = prayerTimes[prayerName] || 'Bilinmiyor';
        const status = newStatus ? 'done' : 'missed';

        await logPrayerTracking(
            userEmail,
            prayerName,
            prayerTime,
            status,
            timestamp || undefined
        );
    } catch (error) {
        console.error('togglePrayer hatası:', error);
        alert('Hata: ' + (error instanceof Error ? error.message : 'Bilinmeyen hata'));

        // Hata logu gönder
        const { logError } = await import('./loginLogs');
        await logError(
            userEmail,
            error instanceof Error ? error.message : 'Bilinmeyen namaz takip hatası',
            `togglePrayer - ${prayerName}`
        );

        // Hata durumunda en azından localStorage'a kaydedelim
        let record = getRecordFromStorage(date) || getEmptyRecord(date);
        const prayerStatus = record.prayers[prayerName as keyof typeof record.prayers];
        const currentStatus = prayerStatus ? prayerStatus[userKey] : false;

        if (!currentStatus) {
            record.prayers[prayerName as keyof typeof record.prayers][userKey] = true;
            (record.prayers[prayerName as keyof typeof record.prayers] as any)[`${userKey}At`] = new Date().toISOString();
        } else {
            record.prayers[prayerName as keyof typeof record.prayers][userKey] = false;
            (record.prayers[prayerName as keyof typeof record.prayers] as any)[`${userKey}At`] = null;
        }
        saveRecordToStorage(record, groupId);
        console.log('localStorage\'ya kaydedildi');
    }
}

export function subscribeToDayRecord(
    date: string,
    groupId: string,
    callback: (record: DayRecord | null) => void
): () => void {
    const docRef = doc(db, 'prayerGroups', groupId, 'records', date);

    // İlk veriyi localStorage'dan hızlıca göster
    const initialRecord = getRecordFromStorage(date, groupId) || getEmptyRecord(date);
    callback(initialRecord);

    // Firebase'i realtime dinle
    const unsubscribeFirebase = onSnapshot(
        docRef,
        (docSnap) => {
            if (docSnap.exists()) {
                const firebaseRecord = docSnap.data() as DayRecord;
                // localStorage'a da yaz
                saveRecordToStorage(firebaseRecord);
                // Callback'i çağır
                callback(firebaseRecord);
            } else {
                // Document yoksa boş record döndür
                callback(getEmptyRecord(date));
            }
        },
        (error) => {
            console.error('Firebase dinleme hatası:', error);
            const localRecord = getRecordFromStorage(date, groupId) || getEmptyRecord(date);
            callback(localRecord);
        }
    );

    // Unsubscribe fonksiyonu
    return () => {
        unsubscribeFirebase();
    };
}

export async function resetUserPrayersForDay(
    date: string,
    userEmail: string
): Promise<void> {
    const userKey = getEmailKey(userEmail);
    const docRef = doc(db, 'prayerRecords', date);

    try {
        // Mevcut veriyi al
        const docSnap = await getDoc(docRef);
        let record = docSnap.exists() ? (docSnap.data() as DayRecord) : getEmptyRecord(date);

        const prayers: (keyof typeof record.prayers)[] = ['Sabah', 'Öğle', 'İkindi', 'Akşam', 'Yatsı'];

        prayers.forEach((prayer) => {
            record.prayers[prayer][userKey] = false;
            (record.prayers[prayer] as any)[`${userKey}At`] = null;
        });

        // Firebase'e yazıyla
        await setDoc(docRef, record, { merge: true });

        // localStorage'a da yaz
        saveRecordToStorage(record);
    } catch (error) {
        console.error('resetUserPrayersForDay hatası:', error);
        // Hata durumunda localStorage'tan devam et
        let record = getRecordFromStorage(date) || getEmptyRecord(date);
        const prayers: (keyof typeof record.prayers)[] = ['Sabah', 'Öğle', 'İkindi', 'Akşam', 'Yatsı'];

        prayers.forEach((prayer) => {
            record.prayers[prayer][userKey] = false;
            (record.prayers[prayer] as any)[`${userKey}At`] = null;
        });

        saveRecordToStorage(record);
    }
}

export async function getHistoryRecords(days: number = 30, startDate?: Date): Promise<DayRecord[]> {
    const records: DayRecord[] = [];
    const today = getPrayerDayDate();
    const recordsCollection = collection(db, 'prayerRecords');

    try {
        // Tek seferde tüm kayıtları getir (N+1 sorgu problemini çözer)
        const q = startDate
            ? query(recordsCollection, where('date', '>=', getDateString(startDate)), orderBy('date', 'desc'))
            : query(recordsCollection, orderBy('date', 'desc'), limit(days));

        const querySnapshot = await getDocs(q);
        const dbRecords = new Map<string, DayRecord>();

        querySnapshot.forEach(doc => {
            dbRecords.set(doc.id, doc.data() as DayRecord);
        });

        // Belirlenen aralıktaki günleri dön ve eksik olanları localStorage'dan tamamla
        const iterations = startDate
            ? Math.ceil((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
            : days;

        for (let i = 1; i <= iterations; i++) {
            const checkDate = new Date(today);
            checkDate.setDate(checkDate.getDate() - i);
            const dateString = getDateString(checkDate);

            const record = dbRecords.get(dateString) || getRecordFromStorage(dateString);
            if (record) records.push(record);
        }
    } catch (error) {
        console.error('getHistoryRecords hatası:', error);
        // Hata durumunda sadece localStorage fallback
        const fallbackDays = startDate ? 30 : days;
        for (let i = 1; i <= fallbackDays; i++) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const dateString = getDateString(date);
            const record = getRecordFromStorage(dateString);
            if (record) records.push(record);
        }
    }

    return records;
}