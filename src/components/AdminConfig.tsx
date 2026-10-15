import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { SystemConfig } from '../types';
import { Save, Check, Sliders, Clock, PieChart, Sparkles } from 'lucide-react';

export const AdminConfig: React.FC = () => {
  const { systemConfig, saveConfig } = useAuth();
  const [formData, setFormData] = useState<SystemConfig>({
    ...systemConfig,
    auxThresholds: {
      ...systemConfig.auxThresholds,
      COMBINED_ROUTINE_QUOTA: systemConfig.auxThresholds.COMBINED_ROUTINE_QUOTA || 75,
      COACHING: systemConfig.auxThresholds.COACHING || 45,
      TRAINING: systemConfig.auxThresholds.TRAINING || systemConfig.auxThresholds.BRIEFING || 60,
    },
  });
  const [isSaved, setIsSaved] = useState<boolean>(false);

  const handleThresholdChange = (key: keyof SystemConfig['auxThresholds'], value: string) => {
    const num = Math.max(1, parseInt(value) || 1);
    setFormData({
      ...formData,
      auxThresholds: {
        ...formData.auxThresholds,
        [key]: num,
      },
    });
  };

  const handleShiftHoursChange = (shiftNum: number, hours: string) => {
    setFormData({
      ...formData,
      shiftSchedule: {
        ...formData.shiftSchedule,
        [shiftNum]: {
          name: formData.shiftSchedule[shiftNum]?.name || `Shift ${shiftNum}`,
          hours,
        },
      },
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await saveConfig(formData);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 font-mono mb-1">
            <span className="font-semibold text-slate-700">Sistem Operasional SAGI 127</span>
            <span aria-hidden="true">·</span>
            <span>Konfigurasi Global</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
            Pengaturan Jatah Durasi AUX & Jadwal Shift
          </h1>
        </div>

        <button
          onClick={handleSubmit}
          className="px-4 py-2.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors flex items-center gap-1.5 self-start sm:self-auto shadow-xs cursor-pointer"
        >
          <Save className="w-4 h-4" />
          Simpan Pengaturan
        </button>
      </div>

      {isSaved && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3.5 text-xs text-emerald-800 flex items-center gap-2 animate-in fade-in">
          <Check className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Pengaturan sistem berhasil disimpan ke database Firestore dan disinkronkan ke seluruh user.</span>
        </div>
      )}

      {/* AUX Thresholds Card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-5 shadow-xs">
        <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3.5">
          <Sliders className="w-5 h-5 text-emerald-600" />
          <div>
            <h2 className="text-sm font-bold text-slate-900">Ketentuan Kuota & Batas Waktu AUX</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Jatah kuota harian dan batas maksimal durasi per sesi kerja. Ketentuan waktu toilet dan jadwal sholat bebas tanpa batasan jadwal kaku.
            </p>
          </div>
        </div>

        {/* Highlight Card: Combined Quota */}
        <div className="bg-sky-50/70 border border-sky-200 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-sky-950 font-bold text-xs uppercase tracking-wider">
              <PieChart className="w-4 h-4 text-sky-600" />
              Kuota Gabungan AUX Rutin (Istirahat + Pray + Toilet)
            </div>
            <p className="text-xs text-slate-600">
              Total jatah harian yang dibagikan untuk AUX Istirahat, Sholat / Pray, dan Toilet.
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <input
              type="number"
              min="15"
              max="180"
              value={formData.auxThresholds.COMBINED_ROUTINE_QUOTA || 75}
              onChange={(e) => handleThresholdChange('COMBINED_ROUTINE_QUOTA', e.target.value)}
              className="w-24 bg-white border border-sky-300 rounded-lg p-2 text-slate-900 font-mono text-center font-bold text-sm shadow-xs focus:outline-none focus:border-sky-500"
            />
            <span className="text-slate-700 font-semibold text-xs font-mono">Menit Total</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs">
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 space-y-2">
            <label className="block font-bold text-slate-800">Istirahat / Break</label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="5"
                max="180"
                value={formData.auxThresholds.BREAK}
                onChange={(e) => handleThresholdChange('BREAK', e.target.value)}
                className="w-20 bg-white border border-slate-300 rounded-lg p-2 text-slate-900 font-mono text-center font-bold text-xs"
              />
              <span className="text-slate-500 font-mono">Menit</span>
            </div>
            <div className="text-[11px] text-slate-500">Maksimal 1 sesi istirahat</div>
          </div>

          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 space-y-2">
            <label className="block font-bold text-slate-800">Coaching SPV (Jatah Khusus)</label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="5"
                max="120"
                value={formData.auxThresholds.COACHING}
                onChange={(e) => handleThresholdChange('COACHING', e.target.value)}
                className="w-20 bg-white border border-purple-300 rounded-lg p-2 text-slate-900 font-mono text-center font-bold text-xs"
              />
              <span className="text-slate-500 font-mono">Menit</span>
            </div>
            <div className="text-[11px] text-purple-700 font-medium">Jatah khusus 45 menit (terpisah)</div>
          </div>

          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 space-y-2">
            <label className="block font-bold text-slate-800">Training / Pelatihan</label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="5"
                max="180"
                value={formData.auxThresholds.TRAINING || formData.auxThresholds.BRIEFING || 60}
                onChange={(e) => handleThresholdChange('TRAINING', e.target.value)}
                className="w-20 bg-white border border-slate-300 rounded-lg p-2 text-slate-900 font-mono text-center font-bold text-xs"
              />
              <span className="text-slate-500 font-mono">Menit</span>
            </div>
            <div className="text-[11px] text-slate-500">Pengganti istilah Briefing</div>
          </div>

          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 space-y-2">
            <label className="block font-bold text-slate-800">Toilet Break</label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="1"
                max="60"
                value={formData.auxThresholds.TOILET}
                onChange={(e) => handleThresholdChange('TOILET', e.target.value)}
                className="w-20 bg-white border border-slate-300 rounded-lg p-2 text-slate-900 font-mono text-center font-bold text-xs"
              />
              <span className="text-slate-500 font-mono">Menit</span>
            </div>
            <div className="text-[11px] text-emerald-700 font-medium">Bebas jadwal · Kuota rutin 75m</div>
          </div>

          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 space-y-2">
            <label className="block font-bold text-slate-800">Ibadah / Pray</label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="5"
                max="60"
                value={formData.auxThresholds.SHOLAT}
                onChange={(e) => handleThresholdChange('SHOLAT', e.target.value)}
                className="w-20 bg-white border border-slate-300 rounded-lg p-2 text-slate-900 font-mono text-center font-bold text-xs"
              />
              <span className="text-slate-500 font-mono">Menit</span>
            </div>
            <div className="text-[11px] text-emerald-700 font-medium">Bebas jadwal · Kuota rutin 75m</div>
          </div>
        </div>
      </div>

      {/* Shift Schedule Table */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-xs">
        <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3.5">
          <Clock className="w-5 h-5 text-emerald-600" />
          <div>
            <h2 className="text-sm font-bold text-slate-900">Jadwal Shift Kerja Operasional</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Atur jam operasional mulai dan berakhir untuk setiap shift SAGI 127.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs">
          {Object.entries(formData.shiftSchedule).map(([numStr, shift]) => {
            const shiftNum = Number(numStr);
            return (
              <div key={shiftNum} className="bg-slate-50 p-3 rounded-xl border border-slate-200/80 flex items-center justify-between gap-2">
                <span className="font-bold text-slate-800 font-mono whitespace-nowrap">
                  {shift.name}
                </span>
                <input
                  type="text"
                  value={shift.hours}
                  onChange={(e) => handleShiftHoursChange(shiftNum, e.target.value)}
                  className="bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-slate-900 font-mono text-right text-xs w-36 shadow-xs focus:outline-none focus:border-emerald-600"
                />
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};
