import { useState } from 'react';
import { Check, ChevronDown, ChevronUp } from 'lucide-react';
import { getUserDisplayName } from '../lib/auth';
import { prayerDetails } from '../lib/prayerDetails';

interface PrayerCardProps {
  name: string;
  time: string;
  status: any;
  currentUserName: string;
  partnerName: string | null;
  onToggle: () => void;
}

export function PrayerCard({
  name,
  time,
  status,
  currentUserName,
  partnerName,
  onToggle,
}: PrayerCardProps) {
  const [showDetails, setShowDetails] = useState(false);

  if (name === 'Güneş') {
    return null;
  }

  const userKey = currentUserName.toLowerCase().replace(/\s+/g, '');
  const partnerKey = partnerName ? partnerName.toLowerCase().replace(/\s+/g, '') : null;

  const userCompleted = status?.[userKey] ?? false;
  const partnerCompleted = partnerKey ? (status?.[partnerKey] ?? false) : false;
  const userAt = status?.[`${userKey}At`];
  const partnerAt = partnerKey ? status?.[`${partnerKey}At`] : null;

  return (
    <div className="bg-slate-800/50 rounded-xl shadow-lg overflow-hidden border border-slate-600 hover:shadow-xl transition-all">
      <div className="bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-white font-bold text-xl">{name}</h3>
          </div>
          <div className="text-right">
            <p className="text-white text-2xl font-bold">{time}</p>
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="space-y-3">
          <button
            onClick={onToggle}
            className={`w-full flex flex-col items-start p-4 rounded-lg transition-all ${userCompleted
              ? 'bg-emerald-500/20 border-4 border-emerald-500'
              : 'bg-slate-700/50 border-2 border-slate-600 hover:border-emerald-500 hover:border-4'
              }`}
          >
            <div className="w-full flex items-center justify-between">
              <span className="font-semibold text-white">{currentUserName} (Siz)</span>
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${userCompleted ? 'bg-emerald-500' : 'bg-slate-600'
                  }`}
              >
                {userCompleted && <Check className="w-5 h-5 text-white" />}
              </div>
            </div>
            {userAt && (
              <span className="text-xs text-slate-300 mt-2">
                İşaretlenme saati: {new Date(userAt).toLocaleTimeString('tr-TR')}
              </span>
            )}
          </button>

          <div
            className={`w-full flex flex-col items-start p-4 rounded-lg transition-all ${partnerCompleted
              ? 'bg-teal-500/20 border-4 border-teal-500'
              : 'bg-slate-700/50 border-2 border-slate-600 hover:border-teal-500 hover:border-4'
              }`}
          >
            <div className="w-full flex items-center justify-between">
              <span className="font-semibold text-white">{partnerName || 'Henüz Bağlanılmadı'}</span>
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${partnerCompleted ? 'bg-teal-500' : 'bg-slate-600'
                  }`}
              >
                {partnerCompleted && <Check className="w-5 h-5 text-white" />}
              </div>
            </div>
            {partnerAt && (
              <span className="text-xs text-slate-300 mt-2">
                İşaretlenme saati: {new Date(partnerAt).toLocaleTimeString('tr-TR')}
              </span>
            )}
          </div>

          {/* Detayları Gör Butonu */}
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="w-full flex items-center justify-center gap-2 bg-slate-700/50 hover:bg-slate-700 px-4 py-2 rounded-lg transition text-sm text-slate-300 hover:text-white border border-slate-600"
          >
            {showDetails ? (
              <>
                <ChevronUp className="w-4 h-4" />
                <span>Detayları Gizle</span>
              </>
            ) : (
              <>
                <ChevronDown className="w-4 h-4" />
                <span>Detayları Gör</span>
              </>
            )}
          </button>

          {/* Namaz Detayları */}
          {showDetails && prayerDetails[name] && (
            <div className="mt-4 bg-gradient-to-br from-slate-700/50 to-slate-800/50 rounded-lg p-4 border border-slate-600 space-y-3">
              <div>
                <h4 className="text-emerald-400 font-semibold mb-2">📿 Rekat Bilgileri</h4>
                <div className="space-y-1 text-sm text-slate-300">
                  <p>• <span className="font-semibold">Sünnet Öncesi:</span> {prayerDetails[name].sunnets.before} rekat</p>
                  <p>• <span className="font-semibold">Farz:</span> {prayerDetails[name].farz} rekat</p>
                  <p>• <span className="font-semibold">Sünnet Sonrası:</span> {prayerDetails[name].sunnets.after} rekat</p>
                  <p>• <span className="font-semibold text-emerald-400">Toplam:</span> {prayerDetails[name].totalRakaa} rekat</p>
                </div>
              </div>

              <div className="border-t border-slate-600 pt-3">
                <h4 className="text-teal-400 font-semibold mb-2">ℹ️ Şerif Bilgiler</h4>
                <p className="text-sm text-slate-300">{prayerDetails[name].description}</p>
              </div>

              <div className="border-t border-slate-600 pt-3">
                <h4 className="text-blue-400 font-semibold mb-2">✨ Önemli Bilgiler</h4>
                <p className="text-xs text-slate-300 whitespace-pre-line leading-relaxed">
                  {prayerDetails[name].notes}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}