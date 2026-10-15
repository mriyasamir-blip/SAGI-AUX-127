import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { AuxStatusType } from '../types';
import {
  CheckCircle2,
  Coffee,
  Clock,
  Sparkles,
  Users,
  MessageSquare,
  FileText,
  PowerOff,
  AlertTriangle,
  History,
  TrendingUp,
} from 'lucide-react';

export const AgentDashboard: React.FC = () => {
  const { currentUser, activeStatus, updateMyStatus, systemConfig, recentLogs } = useAuth();
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  const [isUpdating, setIsUpdating] = useState<boolean>(false);

  // Timer ticker
  useEffect(() => {
    const calculateElapsed = () => {
      if (!activeStatus?.statusStartedAt) {
        setElapsedSeconds(0);
        return;
      }
      const start = new Date(activeStatus.statusStartedAt).getTime();
      const now = Date.now();
      setElapsedSeconds(Math.max(0, Math.floor((now - start) / 1000)));
    };

    calculateElapsed();
    const interval = setInterval(calculateElapsed, 1000);
    return () => clearInterval(interval);
  }, [activeStatus?.statusStartedAt]);

  if (!currentUser) {
    return (
      <div className="max-w-4xl mx-auto py-12 px-4 text-center">
        <p className="text-slate-400 text-sm">Silakan pilih akun atau masuk untuk membuka Terminal Agent.</p>
      </div>
    );
  }

  const currentStatus = activeStatus?.currentStatus || 'OFFLINE';

  // Format seconds to HH:MM:SS
  const formatTime = (totalSec: number) => {
    const hours = Math.floor(totalSec / 3600);
    const minutes = Math.floor((totalSec % 3600) / 60);
    const seconds = totalSec % 60;
    return [
      hours.toString().padStart(2, '0'),
      minutes.toString().padStart(2, '0'),
      seconds.toString().padStart(2, '0'),
    ].join(':');
  };

  // Threshold calculation
  const getThresholdMinutes = (status: AuxStatusType): number | null => {
    if (status === 'BREAK') return systemConfig.auxThresholds.BREAK;
    if (status === 'TOILET') return systemConfig.auxThresholds.TOILET;
    if (status === 'SHOLAT') return systemConfig.auxThresholds.SHOLAT;
    if (status === 'BRIEFING') return systemConfig.auxThresholds.BRIEFING;
    if (status === 'COACHING') return systemConfig.auxThresholds.COACHING;
    if (status === 'ACW') return systemConfig.auxThresholds.ACW;
    return null;
  };

  const limitMinutes = getThresholdMinutes(currentStatus);
  const limitSeconds = limitMinutes ? limitMinutes * 60 : null;
  const isOverdue = limitSeconds !== null && elapsedSeconds > limitSeconds;
  const progressPercent = limitSeconds ? Math.min(100, Math.floor((elapsedSeconds / limitSeconds) * 100)) : 0;

  // Handle status toggle
  const handleStatusChange = async (newStatus: AuxStatusType) => {
    if (isUpdating || currentStatus === newStatus) return;
    setIsUpdating(true);
    try {
      await updateMyStatus(newStatus);
    } finally {
      setIsUpdating(false);
    }
  };

  // Agent's personalized logs
  const myLogs = recentLogs.filter((log) => log.agentId === currentUser.id);

  // Compute daily aggregates
  const breakSeconds = myLogs
    .filter((l) => l.status === 'BREAK')
    .reduce((acc, curr) => acc + curr.durationSeconds, 0);

  const toiletSeconds = myLogs
    .filter((l) => l.status === 'TOILET')
    .reduce((acc, curr) => acc + curr.durationSeconds, 0);

  const readySeconds = myLogs
    .filter((l) => l.status === 'READY')
    .reduce((acc, curr) => acc + curr.durationSeconds, 0);

  const shiftInfo = systemConfig.shiftSchedule[currentUser.shiftNumber] || {
    name: `Shift ${currentUser.shiftNumber}`,
    hours: 'Standar Operasional',
  };

  const statusDefinitions: Array<{
    type: AuxStatusType;
    label: string;
    sublabel: string;
    icon: React.ReactNode;
    colorClass: string;
    activeBorder: string;
  }> = [
    {
      type: 'READY',
      label: 'READY',
      sublabel: 'Siap Melayani Pelanggan',
      icon: <CheckCircle2 className="w-5 h-5 text-emerald-400" />,
      colorClass: 'hover:border-emerald-500/50 hover:bg-emerald-950/20',
      activeBorder: 'border-emerald-500 bg-emerald-950/30 ring-1 ring-emerald-500/40 text-emerald-300',
    },
    {
      type: 'BREAK',
      label: 'ISTIRAHAT',
      sublabel: `Maks ${systemConfig.auxThresholds.BREAK} Menit`,
      icon: <Coffee className="w-5 h-5 text-sky-400" />,
      colorClass: 'hover:border-sky-500/50 hover:bg-sky-950/20',
      activeBorder: 'border-sky-500 bg-sky-950/30 ring-1 ring-sky-500/40 text-sky-300',
    },
    {
      type: 'TOILET',
      label: 'TOILET',
      sublabel: `Maks ${systemConfig.auxThresholds.TOILET} Menit`,
      icon: <Sparkles className="w-5 h-5 text-amber-400" />,
      colorClass: 'hover:border-amber-500/50 hover:bg-amber-950/20',
      activeBorder: 'border-amber-500 bg-amber-950/30 ring-1 ring-amber-500/40 text-amber-300',
    },
    {
      type: 'SHOLAT',
      label: 'IBADAH / SHOLAT',
      sublabel: `Maks ${systemConfig.auxThresholds.SHOLAT} Menit`,
      icon: <Clock className="w-5 h-5 text-teal-400" />,
      colorClass: 'hover:border-teal-500/50 hover:bg-teal-950/20',
      activeBorder: 'border-teal-500 bg-teal-950/30 ring-1 ring-teal-500/40 text-teal-300',
    },
    {
      type: 'BRIEFING',
      label: 'BRIEFING',
      sublabel: `Maks ${systemConfig.auxThresholds.BRIEFING} Menit`,
      icon: <Users className="w-5 h-5 text-indigo-400" />,
      colorClass: 'hover:border-indigo-500/50 hover:bg-indigo-950/20',
      activeBorder: 'border-indigo-500 bg-indigo-950/30 ring-1 ring-indigo-500/40 text-indigo-300',
    },
    {
      type: 'COACHING',
      label: 'COACHING',
      sublabel: `Maks ${systemConfig.auxThresholds.COACHING} Menit`,
      icon: <MessageSquare className="w-5 h-5 text-purple-400" />,
      colorClass: 'hover:border-purple-500/50 hover:bg-purple-950/20',
      activeBorder: 'border-purple-500 bg-purple-950/30 ring-1 ring-purple-500/40 text-purple-300',
    },
    {
      type: 'ACW',
      label: 'AFTER CALL WORK',
      sublabel: `Maks ${systemConfig.auxThresholds.ACW} Menit`,
      icon: <FileText className="w-5 h-5 text-orange-400" />,
      colorClass: 'hover:border-orange-500/50 hover:bg-orange-950/20',
      activeBorder: 'border-orange-500 bg-orange-950/30 ring-1 ring-orange-500/40 text-orange-300',
    },
    {
      type: 'OFFLINE',
      label: 'LOG OFF / SELESAI',
      sublabel: 'Keluar Antrean Kerja',
      icon: <PowerOff className="w-5 h-5 text-slate-400" />,
      colorClass: 'hover:border-slate-500/50 hover:bg-slate-900',
      activeBorder: 'border-slate-600 bg-slate-800 text-slate-300',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Agent Identification & Shift Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-400 font-mono mb-1">
            <span>NIK {currentUser.nik}</span>
            <span aria-hidden="true">·</span>
            <span>{currentUser.division}</span>
            <span aria-hidden="true">·</span>
            <span className="text-emerald-400 font-semibold">{shiftInfo.name} ({shiftInfo.hours})</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
            {currentUser.name}
          </h1>
          <div className="text-xs text-slate-400 mt-0.5">
            Supervisor: <span className="text-slate-200 font-medium">{currentUser.supervisorName || 'Pustaka Adam'}</span>
          </div>
        </div>

        {/* Status indicator badge */}
        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="text-[11px] uppercase tracking-wider text-slate-400">Status Saat Ini</div>
            <div className="text-base font-bold text-white tracking-wide">{currentStatus}</div>
          </div>
          <div className={`w-3.5 h-3.5 rounded-full ${currentStatus === 'READY' ? 'bg-emerald-400 ring-4 ring-emerald-950' : currentStatus === 'OFFLINE' ? 'bg-slate-500 ring-4 ring-slate-800' : 'bg-amber-400 ring-4 ring-amber-950'}`} />
        </div>
      </div>

      {/* Main Focus: Live AUX Status Clock */}
      <div className={`border rounded-xl p-6 transition-colors shadow-lg ${
        isOverdue
          ? 'bg-rose-950/20 border-rose-600/60'
          : currentStatus === 'READY'
          ? 'bg-slate-900 border-slate-800'
          : 'bg-slate-900 border-slate-800'
      }`}>
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-1 text-center md:text-left">
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Durasi Berjalan ({currentStatus})
            </div>
            <div className="text-5xl sm:text-6xl font-extrabold tracking-tight font-mono text-white tabular-nums">
              {formatTime(elapsedSeconds)}
            </div>
            {limitMinutes && (
              <div className="text-xs text-slate-400 flex items-center gap-1.5 justify-center md:justify-start">
                <span>Batas maksimal: {limitMinutes} menit</span>
                {isOverdue && (
                  <span className="text-rose-400 font-semibold flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    MELEBIHI BATAS ({Math.floor((elapsedSeconds - (limitSeconds || 0)) / 60)}m lewat)
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-3 gap-3 w-full md:w-auto">
            <div className="bg-slate-800/60 border border-slate-700/60 rounded-lg p-3 text-center min-w-[110px]">
              <div className="text-[11px] text-slate-400 font-medium">Total Ready</div>
              <div className="text-sm font-bold font-mono text-emerald-400 tabular-nums mt-0.5">
                {formatTime(readySeconds)}
              </div>
            </div>
            <div className="bg-slate-800/60 border border-slate-700/60 rounded-lg p-3 text-center min-w-[110px]">
              <div className="text-[11px] text-slate-400 font-medium">Total Istirahat</div>
              <div className="text-sm font-bold font-mono text-sky-400 tabular-nums mt-0.5">
                {formatTime(breakSeconds)}
              </div>
            </div>
            <div className="bg-slate-800/60 border border-slate-700/60 rounded-lg p-3 text-center min-w-[110px]">
              <div className="text-[11px] text-slate-400 font-medium">Total Toilet</div>
              <div className="text-sm font-bold font-mono text-amber-400 tabular-nums mt-0.5">
                {formatTime(toiletSeconds)}
              </div>
            </div>
          </div>
        </div>

        {/* Progress bar for time-limited AUX */}
        {limitSeconds && (
          <div className="mt-5 pt-4 border-t border-slate-800">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5 font-mono">
              <span>Penggunaan Waktu AUX</span>
              <span className={isOverdue ? 'text-rose-400 font-bold' : 'text-slate-300'}>
                {progressPercent}%
              </span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
              <div
                className={`h-2 rounded-full transition-all duration-500 ${
                  isOverdue ? 'bg-rose-500' : progressPercent > 80 ? 'bg-amber-400' : 'bg-emerald-400'
                }`}
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* AUX Switcher Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-200 uppercase tracking-wider">
            Pilihan Status AUX Kerja
          </h2>
          <span className="text-xs text-slate-400">Klik tombol untuk berganti status seketika</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {statusDefinitions.map((item) => {
            const isActive = currentStatus === item.type;
            return (
              <button
                key={item.type}
                disabled={isUpdating}
                onClick={() => handleStatusChange(item.type)}
                className={`p-4 rounded-xl border text-left transition-all duration-150 flex flex-col justify-between h-28 relative ${
                  isActive
                    ? item.activeBorder
                    : `border-slate-800 bg-slate-900/90 text-slate-300 ${item.colorClass}`
                }`}
              >
                <div className="flex items-center justify-between">
                  {item.icon}
                  {isActive && (
                    <span className="text-[10px] font-mono px-1.5 py-0.5 bg-emerald-500/20 text-emerald-300 rounded font-semibold">
                      AKTIF
                    </span>
                  )}
                </div>
                <div>
                  <div className="text-sm font-bold tracking-tight">{item.label}</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">{item.sublabel}</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Today's AUX History Timeline */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-semibold text-white">Riwayat Penggunaan AUX Hari Ini</h3>
          </div>
          <span className="text-xs text-slate-400 font-mono">
            {myLogs.length} Aktivitas Tercatat
          </span>
        </div>

        {myLogs.length === 0 ? (
          <div className="py-8 text-center text-slate-500 text-xs">
            Belum ada catatan aktivitas AUX hari ini. Pilih status di atas untuk memulai sesi kerja.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="text-[11px] uppercase tracking-wider text-slate-400 bg-slate-800/40 border-b border-slate-800">
                <tr>
                  <th className="py-2.5 px-3">Status AUX</th>
                  <th className="py-2.5 px-3">Mulai</th>
                  <th className="py-2.5 px-3">Selesai</th>
                  <th className="py-2.5 px-3 text-right">Durasi</th>
                  <th className="py-2.5 px-3 text-right">Kepatuhan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {myLogs.map((log) => {
                  const threshold = getThresholdMinutes(log.status);
                  const isOver = threshold ? log.durationSeconds > threshold * 60 : false;
                  return (
                    <tr key={log.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="py-2.5 px-3 font-sans font-medium text-slate-200">
                        {log.status}
                      </td>
                      <td className="py-2.5 px-3 text-slate-400 tabular-nums">
                        {new Date(log.startedAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                      </td>
                      <td className="py-2.5 px-3 text-slate-400 tabular-nums">
                        {new Date(log.endedAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                      </td>
                      <td className="py-2.5 px-3 text-right font-bold text-slate-200 tabular-nums">
                        {formatTime(log.durationSeconds)}
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        {isOver ? (
                          <span className="text-[10px] text-rose-400 font-sans font-semibold">
                            Over Limit
                          </span>
                        ) : (
                          <span className="text-[10px] text-emerald-400 font-sans">
                            Sesuai SLA
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
};
