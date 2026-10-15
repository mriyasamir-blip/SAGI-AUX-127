import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { SystemConfig } from '../types';
import { Save, Check, Sliders, Clock, Bell } from 'lucide-react';

export const AdminConfig: React.FC = () => {
  const { systemConfig, saveConfig } = useAuth();
  const [formData, setFormData] = useState<SystemConfig>(systemConfig);
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
          <div className="flex items-center gap-2 text-xs text-slate-400 font-mono mb-1">
            <span>Sistem Operasional SAGI 127</span>
            <span aria-hidden="true">·</span>
            <span>Konfigurasi Global</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
            Pengaturan Batas Waktu AUX & Jadwal Shift
          </h1>
        </div>

        <button
          onClick={handleSubmit}
          className="px-4 py-2 text-xs font-semibold text-slate-900 bg-emerald-400 hover:bg-emerald-300 rounded-md transition-colors flex items-center gap-1.5 self-start sm:self-auto shadow-sm"
        >
          <Save className="w-4 h-4" />
          Simpan Pengaturan
        </button>
      </div>

      {isSaved && (
        <div className="bg-emerald-950/40 border border-emerald-600/60 rounded-xl p-3 text-xs text-emerald-300 flex items-center gap-2 animate-in fade-in">
          <Check className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>Pengaturan sistem berhasil disimpan ke database Firestore dan disinkronkan ke seluruh user.</span>
        </div>
      )}

      {/* AUX Thresholds Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
          <Sliders className="w-4 h-4 text-emerald-400" />
          <div>
            <h2 className="text-sm font-semibold text-white">Batas Maksimal Durasi AUX (Menit)</h2>
            <p className="text-[11px] text-slate-400">
              Jika agent melebihi durasi batas ini, sistem akan memicu notifikasi peringatan dan status overdue pada SPV.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs">
          <div className="bg-slate-800/50 p-3 rounded-lg border border-slate-700/60 space-y-1.5">
            <label className="block font-medium text-slate-300">Istirahat / Break</label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="5"
                max="180"
                value={formData.auxThresholds.BREAK}
                onChange={(e) => handleThresholdChange('BREAK', e.target.value)}
                className="w-24 bg-slate-900 border border-slate-700 rounded p-1.5 text-white font-mono text-center font-bold"
              />
              <span className="text-slate-400 font-mono">Menit</span>
            </div>
            <div className="text-[10px] text-slate-500">Standar 60 menit</div>
          </div>

          <div className="bg-slate-800/50 p-3 rounded-lg border border-slate-700/60 space-y-1.5">
            <label className="block font-medium text-slate-300">Toilet Break</label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="1"
                max="60"
                value={formData.auxThresholds.TOILET}
                onChange={(e) => handleThresholdChange('TOILET', e.target.value)}
                className="w-24 bg-slate-900 border border-slate-700 rounded p-1.5 text-white font-mono text-center font-bold"
              />
              <span className="text-slate-400 font-mono">Menit</span>
            </div>
            <div className="text-[10px] text-slate-500">Standar 10 menit</div>
          </div>

          <div className="bg-slate-800/50 p-3 rounded-lg border border-slate-700/60 space-y-1.5">
            <label className="block font-medium text-slate-300">Ibadah / Sholat</label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="5"
                max="60"
                value={formData.auxThresholds.SHOLAT}
                onChange={(e) => handleThresholdChange('SHOLAT', e.target.value)}
                className="w-24 bg-slate-900 border border-slate-700 rounded p-1.5 text-white font-mono text-center font-bold"
              />
              <span className="text-slate-400 font-mono">Menit</span>
            </div>
            <div className="text-[10px] text-slate-500">Standar 20 menit</div>
          </div>

          <div className="bg-slate-800/50 p-3 rounded-lg border border-slate-700/60 space-y-1.5">
            <label className="block font-medium text-slate-300">Briefing Operasional</label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="5"
                max="120"
                value={formData.auxThresholds.BRIEFING}
                onChange={(e) => handleThresholdChange('BRIEFING', e.target.value)}
                className="w-24 bg-slate-900 border border-slate-700 rounded p-1.5 text-white font-mono text-center font-bold"
              />
              <span className="text-slate-400 font-mono">Menit</span>
            </div>
            <div className="text-[10px] text-slate-500">Standar 30 menit</div>
          </div>

          <div className="bg-slate-800/50 p-3 rounded-lg border border-slate-700/60 space-y-1.5">
            <label className="block font-medium text-slate-300">Coaching SPV</label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="5"
                max="120"
                value={formData.auxThresholds.COACHING}
                onChange={(e) => handleThresholdChange('COACHING', e.target.value)}
                className="w-24 bg-slate-900 border border-slate-700 rounded p-1.5 text-white font-mono text-center font-bold"
              />
              <span className="text-slate-400 font-mono">Menit</span>
            </div>
            <div className="text-[10px] text-slate-500">Standar 45 menit</div>
          </div>

          <div className="bg-slate-800/50 p-3 rounded-lg border border-slate-700/60 space-y-1.5">
            <label className="block font-medium text-slate-300">After Call Work (ACW)</label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="1"
                max="30"
                value={formData.auxThresholds.ACW}
                onChange={(e) => handleThresholdChange('ACW', e.target.value)}
                className="w-24 bg-slate-900 border border-slate-700 rounded p-1.5 text-white font-mono text-center font-bold"
              />
              <span className="text-slate-400 font-mono">Menit</span>
            </div>
            <div className="text-[10px] text-slate-500">Standar 5 menit</div>
          </div>
        </div>
      </div>

      {/* Shift Schedule Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
          <Clock className="w-4 h-4 text-emerald-400" />
          <div>
            <h2 className="text-sm font-semibold text-white">Jadwal Shift Kerja Operasional</h2>
            <p className="text-[11px] text-slate-400">
              Atur jam kerja mulai dan berakhir untuk setiap nomor shift yang digunakan di SAGI 127.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs">
          {Object.entries(formData.shiftSchedule).map(([numStr, shift]) => {
            const shiftNum = Number(numStr);
            return (
              <div key={shiftNum} className="bg-slate-800/40 p-2.5 rounded-lg border border-slate-700/50 flex items-center justify-between gap-2">
                <span className="font-semibold text-slate-200 font-mono whitespace-nowrap">
                  {shift.name}
                </span>
                <input
                  type="text"
                  value={shift.hours}
                  onChange={(e) => handleShiftHoursChange(shiftNum, e.target.value)}
                  className="bg-slate-900 border border-slate-700 rounded px-2 py-1 text-white font-mono text-right text-xs w-36"
                />
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};
