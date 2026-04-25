export interface PrayerDetail {
  name: string;
  arabicName: string;
  sunnets: {
    before: number;
    after: number;
  };
  farz: number;
  totalRakaa: number;
  description: string;
  notes: string;
}

export const prayerDetails: Record<string, PrayerDetail> = {
  'Sabah': {
    name: 'Sabah Namazı',
    arabicName: 'الفجر',
    sunnets: {
      before: 2,
      after: 0
    },
    farz: 2,
    totalRakaa: 4,
    description: 'Günün ilk namazı, sünnet olarak 2 rekatı vardır.',
    notes: '✓ Fecr (şafak) vakti\n✓ En fazla sevap alan namazlardan biridir\n✓ Sünnet kıl sonra farz kıl'
  },
  'Öğle': {
    name: 'Öğle Namazı',
    arabicName: 'الظهر',
    sunnets: {
      before: 4,
      after: 2
    },
    farz: 4,
    totalRakaa: 10,
    description: 'Güneş tepede iken kılınan namaz.',
    notes: '✓ Öğle namazı 4 rekattan oluşur\n✓ Sünnetleri vardır\n✓ İslam\'ın en faziletli namazlarından biridir'
  },
  'İkindi': {
    name: 'İkindi Namazı',
    arabicName: 'العصر',
    sunnets: {
      before: 4,
      after: 2
    },
    farz: 4,
    totalRakaa: 10,
    description: 'Öğleden sonra kılınan namaz.',
    notes: '✓ İkindi namazı 4 rekattan oluşur\n✓ Önemli bir namazdır\n✓ Sünneti vardır'
  },
  'Akşam': {
    name: 'Akşam Namazı',
    arabicName: 'المغرب',
    sunnets: {
      before: 0,
      after: 2
    },
    farz: 3,
    totalRakaa: 5,
    description: 'Akşamüstü, güneş batıktan sonra kılınan namaz.',
    notes: '✓ Akşam namazı 3 rekattan oluşur\n✓ Tek sayı rekatlı tek farzdır\n✓ Sonrası sünneti vardır'
  },
  'Yatsı': {
    name: 'Yatsı Namazı',
    arabicName: 'العشاء',
    sunnets: {
      before: 0,
      after: 3
    },
    farz: 4,
    totalRakaa: 7,
    description: 'Gece kılınan son namaz.',
    notes: '✓ Yatsı namazı 4 rekattan oluşur\n✓ Sonrası 3 rekat vitir vardır\n✓ Gece namazına hazırlık olarak görülür'
  }
};
