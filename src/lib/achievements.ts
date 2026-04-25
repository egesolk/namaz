import { DayRecord, getDateString, getHistoryRecords, getPrayerDayDate } from './prayerTracker';
import { logAchievementUnlocked } from './loginLogs';

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlocked: boolean;
  progress: number; // 0-100
  progressText: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

export const achievementDefinitions = {
  streak7: {
    id: 'streak7',
    name: '7 Gün Seri',
    description: '7 gün üst üste 5 namazı tamamla',
    icon: '🔥',
    rarity: 'common' as const
  },
  streak14: {
    id: 'streak14',
    name: '2 Hafta Seri',
    description: '14 gün üst üste 5 namazı tamamla',
    icon: '⚡',
    rarity: 'rare' as const
  },
  streak30: {
    id: 'streak30',
    name: 'Bir Ay Seri',
    description: '30 gün üst üste 5 namazı tamamla',
    icon: '⭐',
    rarity: 'epic' as const
  },
  streak100: {
    id: 'streak100',
    name: 'Efsane Seri',
    description: '100 gün üst üste 5 namazı tamamla',
    icon: '👑',
    rarity: 'legendary' as const
  },
  total50: {
    id: 'total50',
    name: '50 Namaz',
    description: 'Toplam 50 namaz kıl',
    icon: '📿',
    rarity: 'common' as const
  },
  total100: {
    id: 'total100',
    name: '100 Namaz',
    description: 'Toplam 100 namaz kıl',
    icon: '🕌',
    rarity: 'rare' as const
  },
  total500: {
    id: 'total500',
    name: '500 Namaz',
    description: 'Toplam 500 namaz kıl',
    icon: '💎',
    rarity: 'epic' as const
  },
  total1000: {
    id: 'total1000',
    name: '1000 Namaz',
    description: 'Toplam 1000 namaz kıl',
    icon: '🏆',
    rarity: 'legendary' as const
  },
  weeklyPerfect: {
    id: 'weeklyPerfect',
    name: 'Mükemmel Hafta',
    description: 'Bir hafta boyunca her gün 5 namazı tamamla',
    icon: '✨',
    rarity: 'rare' as const
  },
  earlyBird: {
    id: 'earlyBird',
    name: 'Sabah Kuşu',
    description: '10 kez Sabah namazını kıl',
    icon: '🌅',
    rarity: 'common' as const
  }
} as const;

export async function getUserAchievements(
  userEmail: string
): Promise<Achievement[]> {
  
  
  // Geçmiş verileri al
  const historyRecords = await getHistoryRecords(100);
  
  // Istatistikleri hesapla
  const stats = calculateStats(historyRecords, userKey);

  // Önceki rozetleri localStorage'dan yükle
  const previousAchievementsStr = localStorage.getItem(`achievements:${userEmail}`);
  const previousAchievements = previousAchievementsStr ? JSON.parse(previousAchievementsStr) : {};

  // Rozetleri kontrol et
  const achievements: Achievement[] = [];

  // 7 Gün Seri
  const streak7Unlocked = stats.currentStreak >= 7;
  const streak7Def = {
    id: achievementDefinitions.streak7.id,
    name: achievementDefinitions.streak7.name,
    description: achievementDefinitions.streak7.description,
    icon: achievementDefinitions.streak7.icon,
    rarity: achievementDefinitions.streak7.rarity,
    unlocked: streak7Unlocked,
    progress: Math.min((stats.currentStreak / 7) * 100, 100),
    progressText: `${stats.currentStreak}/7 gün`
  };
  achievements.push(streak7Def);
  
  // Yeni açılan rozetleri log'la
  if (streak7Unlocked && !previousAchievements[achievementDefinitions.streak7.id]) {
    logAchievementUnlocked(userEmail, achievementDefinitions.streak7.name, achievementDefinitions.streak7.description).catch(console.error);
  }

  // 14 Gün Seri
  const streak14Unlocked = stats.currentStreak >= 14;
  const streak14Def = {
    id: achievementDefinitions.streak14.id,
    name: achievementDefinitions.streak14.name,
    description: achievementDefinitions.streak14.description,
    icon: achievementDefinitions.streak14.icon,
    rarity: achievementDefinitions.streak14.rarity,
    unlocked: streak14Unlocked,
    progress: Math.min((stats.currentStreak / 14) * 100, 100),
    progressText: `${stats.currentStreak}/14 gün`
  };
  achievements.push(streak14Def);
  
  if (streak14Unlocked && !previousAchievements[achievementDefinitions.streak14.id]) {
    logAchievementUnlocked(userEmail, achievementDefinitions.streak14.name, achievementDefinitions.streak14.description).catch(console.error);
  }

  // 30 Gün Seri
  const streak30Unlocked = stats.currentStreak >= 30;
  const streak30Def = {
    id: achievementDefinitions.streak30.id,
    name: achievementDefinitions.streak30.name,
    description: achievementDefinitions.streak30.description,
    icon: achievementDefinitions.streak30.icon,
    rarity: achievementDefinitions.streak30.rarity,
    unlocked: streak30Unlocked,
    progress: Math.min((stats.currentStreak / 30) * 100, 100),
    progressText: `${stats.currentStreak}/30 gün`
  };
  achievements.push(streak30Def);
  
  if (streak30Unlocked && !previousAchievements[achievementDefinitions.streak30.id]) {
    logAchievementUnlocked(userEmail, achievementDefinitions.streak30.name, achievementDefinitions.streak30.description).catch(console.error);
  }

  // 100 Gün Seri
  const streak100Unlocked = stats.currentStreak >= 100;
  const streak100Def = {
    id: achievementDefinitions.streak100.id,
    name: achievementDefinitions.streak100.name,
    description: achievementDefinitions.streak100.description,
    icon: achievementDefinitions.streak100.icon,
    rarity: achievementDefinitions.streak100.rarity,
    unlocked: streak100Unlocked,
    progress: Math.min((stats.currentStreak / 100) * 100, 100),
    progressText: `${stats.currentStreak}/100 gün`
  };
  achievements.push(streak100Def);
  
  if (streak100Unlocked && !previousAchievements[achievementDefinitions.streak100.id]) {
    logAchievementUnlocked(userEmail, achievementDefinitions.streak100.name, achievementDefinitions.streak100.description).catch(console.error);
  }

  // 50 Namaz
  const total50Unlocked = stats.totalPrayers >= 50;
  const total50Def = {
    id: achievementDefinitions.total50.id,
    name: achievementDefinitions.total50.name,
    description: achievementDefinitions.total50.description,
    icon: achievementDefinitions.total50.icon,
    rarity: achievementDefinitions.total50.rarity,
    unlocked: total50Unlocked,
    progress: Math.min((stats.totalPrayers / 50) * 100, 100),
    progressText: `${stats.totalPrayers}/50 namaz`
  };
  achievements.push(total50Def);
  
  if (total50Unlocked && !previousAchievements[achievementDefinitions.total50.id]) {
    logAchievementUnlocked(userEmail, achievementDefinitions.total50.name, achievementDefinitions.total50.description).catch(console.error);
  }

  // 100 Namaz
  const total100Unlocked = stats.totalPrayers >= 100;
  const total100Def = {
    id: achievementDefinitions.total100.id,
    name: achievementDefinitions.total100.name,
    description: achievementDefinitions.total100.description,
    icon: achievementDefinitions.total100.icon,
    rarity: achievementDefinitions.total100.rarity,
    unlocked: total100Unlocked,
    progress: Math.min((stats.totalPrayers / 100) * 100, 100),
    progressText: `${stats.totalPrayers}/100 namaz`
  };
  achievements.push(total100Def);
  
  if (total100Unlocked && !previousAchievements[achievementDefinitions.total100.id]) {
    logAchievementUnlocked(userEmail, achievementDefinitions.total100.name, achievementDefinitions.total100.description).catch(console.error);
  }

  // 500 Namaz
  const total500Unlocked = stats.totalPrayers >= 500;
  const total500Def = {
    id: achievementDefinitions.total500.id,
    name: achievementDefinitions.total500.name,
    description: achievementDefinitions.total500.description,
    icon: achievementDefinitions.total500.icon,
    rarity: achievementDefinitions.total500.rarity,
    unlocked: total500Unlocked,
    progress: Math.min((stats.totalPrayers / 500) * 100, 100),
    progressText: `${stats.totalPrayers}/500 namaz`
  };
  achievements.push(total500Def);
  
  if (total500Unlocked && !previousAchievements[achievementDefinitions.total500.id]) {
    logAchievementUnlocked(userEmail, achievementDefinitions.total500.name, achievementDefinitions.total500.description).catch(console.error);
  }

  // 1000 Namaz
  const total1000Unlocked = stats.totalPrayers >= 1000;
  const total1000Def = {
    id: achievementDefinitions.total1000.id,
    name: achievementDefinitions.total1000.name,
    description: achievementDefinitions.total1000.description,
    icon: achievementDefinitions.total1000.icon,
    rarity: achievementDefinitions.total1000.rarity,
    unlocked: total1000Unlocked,
    progress: Math.min((stats.totalPrayers / 1000) * 100, 100),
    progressText: `${stats.totalPrayers}/1000 namaz`
  };
  achievements.push(total1000Def);
  
  if (total1000Unlocked && !previousAchievements[achievementDefinitions.total1000.id]) {
    logAchievementUnlocked(userEmail, achievementDefinitions.total1000.name, achievementDefinitions.total1000.description).catch(console.error);
  }

  // Mükemmel Hafta
  const weeklyPerfectUnlocked = hasWeeklyPerfect(historyRecords, userKey);
  const weeklyPerfectDef = {
    id: achievementDefinitions.weeklyPerfect.id,
    name: achievementDefinitions.weeklyPerfect.name,
    description: achievementDefinitions.weeklyPerfect.description,
    icon: achievementDefinitions.weeklyPerfect.icon,
    rarity: achievementDefinitions.weeklyPerfect.rarity,
    unlocked: weeklyPerfectUnlocked,
    progress: weeklyPerfectUnlocked ? 100 : 0,
    progressText: weeklyPerfectUnlocked ? 'Tamamlandı' : 'Yapılmadı'
  };
  achievements.push(weeklyPerfectDef);
  
  if (weeklyPerfectUnlocked && !previousAchievements[achievementDefinitions.weeklyPerfect.id]) {
    logAchievementUnlocked(userEmail, achievementDefinitions.weeklyPerfect.name, achievementDefinitions.weeklyPerfect.description).catch(console.error);
  }

  // Sabah Kuşu
  const morningCount = historyRecords.filter(record => 
    (record.prayers['Sabah'] as any)?.[userKey] === true
  ).length;
  const earlyBirdUnlocked = morningCount >= 10;
  const earlyBirdDef = {
    id: achievementDefinitions.earlyBird.id,
    name: achievementDefinitions.earlyBird.name,
    description: achievementDefinitions.earlyBird.description,
    icon: achievementDefinitions.earlyBird.icon,
    rarity: achievementDefinitions.earlyBird.rarity,
    unlocked: earlyBirdUnlocked,
    progress: Math.min((morningCount / 10) * 100, 100),
    progressText: `${morningCount}/10 kez`
  };
  achievements.push(earlyBirdDef);
  
  if (earlyBirdUnlocked && !previousAchievements[achievementDefinitions.earlyBird.id]) {
    logAchievementUnlocked(userEmail, achievementDefinitions.earlyBird.name, achievementDefinitions.earlyBird.description).catch(console.error);
  }

  // Yeni rozetleri localStorage'a kaydet
  const unlockedAchievements: Record<string, boolean> = {};
  achievements.forEach(ach => {
    if (ach.unlocked) {
      unlockedAchievements[ach.id] = true;
    }
  });
  localStorage.setItem(`achievements:${userEmail}`, JSON.stringify(unlockedAchievements));

  return achievements;
}

interface Stats {
  currentStreak: number;
  totalPrayers: number;
}

function calculateStats(records: DayRecord[], userKey: string): Stats {
  let totalPrayers = 0;
  let currentStreak = 0;

  // Toplam namazları say
  records.forEach(record => {
    const prayers: (keyof typeof record.prayers)[] = ['Sabah', 'Öğle', 'İkindi', 'Akşam', 'Yatsı'];
    prayers.forEach(prayer => {
      if ((record.prayers[prayer] as any)?.[userKey] === true) {
        totalPrayers++;
      }
    });
  });

  // Güncel seriyi hesapla (sondan başa doğru)
  const today = getPrayerDayDate();
  let checkDate = new Date(today);

  for (let i = 0; i < 365; i++) {
    const dateString = getDateString(checkDate);
    const record = records.find(r => r.date === dateString);

    if (record) {
      const prayers: (keyof typeof record.prayers)[] = ['Sabah', 'Öğle', 'İkindi', 'Akşam', 'Yatsı'];
      const allPrayersCompleted = prayers.every(prayer => 
        (record.prayers[prayer] as any)?.[userKey] === true
      );

      if (allPrayersCompleted) {
        currentStreak++;
      } else {
        break;
      }
    } else {
      // Eğer geçmiş veriller yoksa seriyi kes
      break;
    }

    checkDate.setDate(checkDate.getDate() - 1);
  }

  return {
    currentStreak,
    totalPrayers
  };
}

function hasWeeklyPerfect(records: DayRecord[], userKey: string): boolean {
  const today = getPrayerDayDate();
  
  // Son 7 gün kontrol et
  for (let week = 0; week < 10; week++) {
    let weekPerfect = true;
    
    for (let day = 0; day < 7; day++) {
      const checkDate = new Date(today);
      checkDate.setDate(checkDate.getDate() - (week * 7 + day));
      const dateString = getDateString(checkDate);
      const record = records.find(r => r.date === dateString);

      if (!record) {
        weekPerfect = false;
        break;
      }

      const prayers: (keyof typeof record.prayers)[] = ['Sabah', 'Öğle', 'İkindi', 'Akşam', 'Yatsı'];
      const allCompleted = prayers.every(p => (record.prayers[p] as any)?.[userKey] === true);

      if (!allCompleted) {
        weekPerfect = false;
        break;
      }
    }

    if (weekPerfect) {
      return true;
    }
  }

  return false;
}
