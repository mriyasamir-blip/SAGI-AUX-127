import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { AuxStatusType } from '../types';
import { AgentAuxSummaryCard } from './AgentAuxSummaryCard';
import {
  CheckCircle2,
  Coffee,
  Clock,
  Sparkles,
  GraduationCap,
  MessageSquare,
  PowerOff,
  History,
  Lock,
  Flame,
  AlertTriangle,
} from 'lucide-react';

export const AgentDashboard: React.FC = () => {
  const { currentUser, activeStatus, updateMyStatus, systemConfig, recentLogs } = useAuth();
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  const [isUpdating, setIsUpdating] = useState<boolean>(false);
  const [queueBlockedNotice, setQueueBlockedNotice] = useState<string | null>(null);

  const currentStatus = activeStatus?.currentStatus || 'OFFLINE';

  // Timer ticker only ticks for active AUX statuses (NOT for Log Off or Ready)
  useEffect(() => {
    if (
      !activeStatus?.statusStartedAt ||
      currentStatus === 'OFFLINE' ||
      currentStatus === 'READY'
    ) {
      setElapsedSeconds(0);
      return;
    }

    const calculateElapsed = () => {
      const start = new Date(activeStatus.statusStartedAt).getTime();
      const now = Date.now();
      setElapsedSeconds(Math.max(0, Math.floor((now - start) / 1000)));
    };

    calculateElapsed();
    const interval = setInterval(calculateElapsed, 1000);
    return () => clearInterval(interval);
  }, [activeStatus?.statusStartedAt, currentStatus]);

  if (!currentUser) {
    return (
      <div className="max-w-4xl mx-auto py-16 px-4 text-center">
        <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-xs max-w-md mx-auto">
          <p className="text-slate-600 text-sm">Silakan pilih akun atau masuk untuk membuka Terminal Agent.</p>
        </div>
      </div>
    );
  }

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

  // Agent's personalized logs
  const myLogs = recentLogs.filter((log) => log.agentId === currentUser.id);

  // Compute daily aggregates
  const breakSeconds = myLogs
    .filter((l) => l.status === 'BREAK')
    .reduce((acc, curr) => acc + curr.durationSeconds, 0);

  const sholatSeconds = myLogs
    .filter((l) => l.status === 'SHOLAT')
    .reduce((acc, curr) => acc + curr.durationSeconds, 0);

  const toiletSeconds = myLogs
    .filter((l) => l.status === 'TOILET')
    .reduce((acc, curr) => acc + curr.durationSeconds, 0);

  const coachingSeconds = myLogs
    .filter((l) => l.status === 'COACHING')
    .reduce((acc, curr) => acc + curr.durationSeconds, 0);

  const trainingSeconds = myLogs
    .filter((l) => l.status === 'TRAINING' || l.status === 'BRIEFING')
    .reduce((acc, curr) => acc + curr.durationSeconds, 0);

  const readySeconds = myLogs
    .filter((l) => l.status === 'READY')
    .reduce((acc, curr) => acc + curr.durationSeconds, 0);

  // Handle status toggle
  const handleStatusChange = async (newStatus: AuxStatusType) => {
    if (isUpdating || currentStatus === newStatus) return;

    // Block Istirahat (BREAK) if Queue mode is active
    if (newStatus === 'BREAK' && systemConfig.queueModeActive) {
      setQueueBlockedNotice(
        'Tombol Istirahat dinonaktifkan oleh Admin karena antrean trafik sedang padat (Queue Mode). Mohon tetap READY.'
      );
      return;
    }

    setQueueBlockedNotice(null);
    setIsUpdating(true);
    try {
      await updateMyStatus(newStatus);
    } finally {
      setIsUpdating(false);
    }
  };

  // Status definitions (ACW removed, Briefing replaced with Training, no toilet/prayer schedule restrictions)
  const statusDefinitions: Array<{
    type: AuxStatusType;
    label: string;
    sublabel: string;
    badgeText?: string;
    icon: React.ReactNode;
    cardStyle: string;
    activeCardStyle: string;
  }> = [
    {
      type: 'READY',
      label: 'READY',
      sublabel: 'Siap Melayani Pelanggan',
      icon: <CheckCircle2 className="w-5 h-5 text-emerald-600" />,
      cardStyle: 'bg-white hover:bg-emerald-50/50 border-slate-200 text-slate-800 hover:border-emerald-300',
      activeCardStyle: 'bg-emerald-50 border-emerald-500 ring-2 ring-emerald-500/30 text-emerald-950 font-bold',
    },
    {
      type: 'BREAK',
      label: 'ISTIRAHAT',
      sublabel: 'Termasuk Kuota Rutin 75m',
      badgeText: 'Jatah 75m',
      icon: <Coffee className="w-5 h-5 text-sky-600" />,
      cardStyle: 'bg-white hover:bg-sky-50/50 border-slate-200 text-slate-800 hover:border-sky-300',
      activeCardStyle: 'bg-sky-50 border-sky-500 ring-2 ring-sky-500/30 text-sky-950 font-bold',
    },
    {
      type: 'SHOLAT',
      label: 'PRAY / IBADAH',
      sublabel: 'Bebas waktu · Kuota Rutin 75m',
      badgeText: 'Jatah 75m',
      icon: <Clock className="w-5 h-5 text-teal-600" />,
      cardStyle: 'bg-white hover:bg-teal-50/50 border-slate-200 text-slate-800 hover:border-teal-300',
      activeCardStyle: 'bg-teal-50 border-teal-500 ring-2 ring-teal-500/30 text-teal-950 font-bold',
    },
    {
      type: 'TOILET',
      label: 'TOILET',
      sublabel: 'Bebas waktu · Kuota Rutin 75m',
      badgeText: 'Jatah 75m',
      icon: <Sparkles className="w-5 h-5 text-amber-600" />,
      cardStyle: 'bg-white hover:bg-amber-50/50 border-slate-200 text-slate-800 hover:border-amber-300',
      activeCardStyle: 'bg-amber-50 border-amber-500 ring-2 ring-amber-500/30 text-amber-950 font-bold',
    },
    {
      type: 'COACHING',
      label: 'COACHING',
      sublabel: 'Jatah Khusus 45 Menit',
      badgeText: 'Jatah 45m',
      icon: <MessageSquare className="w-5 h-5 text-purple-600" />,
      cardStyle: 'bg-white hover:bg-purple-50/50 border-slate-200 text-slate-800 hover:border-purple-300',
      activeCardStyle: 'bg-purple-50 border-purple-500 ring-2 ring-purple-500/30 text-purple-950 font-bold',
    },
    {
      type: 'TRAINING',
      label: 'TRAINING',
      sublabel: 'Sesi Pembelajaran / Pelatihan',
      badgeText: 'Pelatihan',
      icon: <GraduationCap className="w-5 h-5 text-indigo-600" />,
      cardStyle: 'bg-white hover:bg-indigo-50/50 border-slate-200 text-slate-800 hover:border-indigo-300',
      activeCardStyle: 'bg-indigo-50 border-indigo-500 ring-2 ring-indigo-500/30 text-indigo-950 font-bold',
    },
    {
      type: 'OFFLINE',
      label: 'LOG OFF',
      sublabel: 'Keluar Antrean & Selesai Kerja',
      icon: <PowerOff className="w-5 h-5 text-slate-500" />,
      cardStyle: 'bg-white hover:bg-slate-100 border-slate-200 text-slate-700 hover:border-slate-300',
      activeCardStyle: 'bg-slate-100 border-slate-400 ring-2 ring-slate-400/30 text-slate-900 font-bold',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Agent Identification Banner (Shift text removed as requested) */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 font-mono mb-1.5">
            <span className="font-semibold text-slate-700">NIK {currentUser.nik}</span>
            <span aria-hidden="true">·</span>
            <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-sans font-medium">
              {currentUser.division}
            </span>
            <span aria-hidden="true">·</span>
            <span className="text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/60 font-sans">
              Role: {currentUser.role}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
            {currentUser.name}
          </h1>
          <div className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
            <span>Supervisor / OIC:</span>
            <span className="text-slate-800 font-bold">{currentUser.supervisorName || 'Pustaka Adam'}</span>
          </div>
        </div>

        {/* Live status badge */}
        <div className="flex items-center gap-3.5 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5">
          <div className="text-right">
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Status Saat Ini
            </div>
            <div className="text-lg font-black text-slate-900 tracking-wide font-mono">
              {currentStatus === 'BRIEFING' ? 'TRAINING' : currentStatus}
            </div>
          </div>
          <div
            className={`w-4 h-4 rounded-full ${
              currentStatus === 'READY'
                ? 'bg-emerald-500 ring-4 ring-emerald-100'
                : currentStatus === 'OFFLINE'
                ? 'bg-slate-400 ring-4 ring-slate-100'
                : 'bg-amber-500 ring-4 ring-amber-100 animate-pulse'
            }`}
          />
        </div>
      </div>

      {/* Visual Summary Component for Agent Dashboard */}
      <AgentAuxSummaryCard
        currentStatus={currentStatus}
        statusStartedAt={activeStatus?.statusStartedAt}
        elapsedSeconds={elapsedSeconds}
        breakSeconds={breakSeconds}
        sholatSeconds={sholatSeconds}
        toiletSeconds={toiletSeconds}
        coachingSeconds={coachingSeconds}
        trainingSeconds={trainingSeconds}
        readySeconds={readySeconds}
        routineQuotaMinutes={systemConfig.auxThresholds.COMBINED_ROUTINE_QUOTA || 75}
        coachingQuotaMinutes={systemConfig.auxThresholds.COACHING || 45}
      />

      {/* Queue Mode Warning for Agents */}
      {systemConfig.queueModeActive && (
        <div className="bg-rose-50 border border-rose-300 rounded-2xl p-4.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-rose-950 shadow-xs animate-in fade-in">
          <div className="flex items-start sm:items-center gap-3">
            <div className="p-2 rounded-xl bg-rose-100 text-rose-700 shrink-0">
              <Flame className="w-5 h-5 animate-pulse text-rose-600" />
            </div>
            <div>
              <div className="font-extrabold text-sm text-rose-900 flex items-center gap-2">
                <span>STATUS QUEUE (TRAFIK PADAT) AKTIF</span>
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-rose-200/80 text-rose-900 font-bold">
                  Prioritas Layanan
                </span>
              </div>
              <p className="text-xs text-rose-700 mt-0.5">
                Admin telah mengaktifkan mode trafik padat. Tombol AUX Istirahat dikunci sementara agar seluruh agent dapat melayani antrean pelanggan.
              </p>
            </div>
          </div>
          {currentStatus !== 'READY' && (
            <button
              onClick={() => handleStatusChange('READY')}
              className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors shrink-0 flex items-center gap-1.5 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Beralih ke READY</span>
            </button>
          )}
        </div>
      )}

      {/* Toast Notice if agent tries to click locked Istirahat */}
      {queueBlockedNotice && (
        <div className="bg-amber-50 border border-amber-300 text-amber-900 rounded-xl p-3 text-xs flex items-center justify-between gap-2 shadow-xs">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>{queueBlockedNotice}</span>
          </div>
          <button
            onClick={() => setQueueBlockedNotice(null)}
            className="text-amber-700 font-bold px-2 py-0.5 hover:bg-amber-100 rounded-lg"
          >
            Tutup
          </button>
        </div>
      )}

      {/* AUX Switcher Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
            Pilihan Status AUX Kerja
          </h2>
          <span className="text-xs text-slate-500">Klik tombol untuk beralih status seketika</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3">
          {statusDefinitions.map((item) => {
            const isActive = currentStatus === item.type || (item.type === 'TRAINING' && currentStatus === 'BRIEFING');
            const isBreakDisabled = systemConfig.queueModeActive && item.type === 'BREAK';

            return (
              <button
                key={item.type}
                disabled={isUpdating || (isBreakDisabled && !isActive)}
                onClick={() => {
                  if (isBreakDisabled && !isActive) {
                    setQueueBlockedNotice(
                      'Tombol Istirahat dinonaktifkan oleh Admin karena antrean trafik sedang padat (Queue Mode).'
                    );
                    return;
                  }
                  handleStatusChange(item.type);
                }}
                className={`p-4 rounded-xl border text-left transition-all duration-150 flex flex-col justify-between min-h-[120px] relative shadow-xs ${
                  isBreakDisabled && !isActive
                    ? 'bg-slate-50/80 border-rose-200 text-slate-400 opacity-70 cursor-not-allowed'
                    : 'cursor-pointer'
                } ${isActive ? item.activeCardStyle : isBreakDisabled ? '' : item.cardStyle}`}
                title={
                  isBreakDisabled
                    ? 'AUX Istirahat dinonaktifkan saat antrean padat (Queue)'
                    : item.label
                }
              >
                <div className="flex items-center justify-between">
                  <div className="p-1 rounded-lg bg-slate-100/60">
                    {isBreakDisabled && !isActive ? (
                      <Lock className="w-5 h-5 text-rose-500" />
                    ) : (
                      item.icon
                    )}
                  </div>
                  {isActive && (
                    <span className="text-[10px] font-mono px-2 py-0.5 bg-emerald-600 text-white rounded-full font-bold shadow-xs">
                      AKTIF
                    </span>
                  )}
                  {!isActive && isBreakDisabled && (
                    <span className="text-[9px] font-mono px-1.5 py-0.5 bg-rose-100 text-rose-700 rounded font-bold border border-rose-200">
                      Terkunci (Queue)
                    </span>
                  )}
                  {!isActive && !isBreakDisabled && item.badgeText && (
                    <span className="text-[9px] font-mono px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded font-medium">
                      {item.badgeText}
                    </span>
                  )}
                </div>
                <div className="mt-3">
                  <div className="text-sm font-extrabold tracking-tight text-slate-900 flex items-center gap-1.5">
                    <span>{item.label}</span>
                    {isBreakDisabled && !isActive && (
                      <Lock className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                    )}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">
                    {isBreakDisabled && !isActive
                      ? 'Terkunci saat trafik padat'
                      : item.sublabel}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Today's AUX History Timeline */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3.5">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-emerald-600" />
            <h3 className="text-sm font-bold text-slate-900">Riwayat Penggunaan AUX Hari Ini</h3>
          </div>
          <span className="text-xs text-slate-500 font-mono bg-slate-100 px-2.5 py-1 rounded-lg">
            {myLogs.length} Sesi Tercatat
          </span>
        </div>

        {myLogs.length === 0 ? (
          <div className="py-10 text-center text-slate-400 text-xs">
            Belum ada catatan aktivitas AUX hari ini. Pilih status di atas untuk memulai sesi kerja.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="text-[11px] uppercase tracking-wider text-slate-500 bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="py-3 px-3.5 font-bold">Status AUX</th>
                  <th className="py-3 px-3.5 font-bold">Mulai</th>
                  <th className="py-3 px-3.5 font-bold">Selesai</th>
                  <th className="py-3 px-3.5 text-right font-bold">Durasi</th>
                  <th className="py-3 px-3.5 text-right font-bold">Status Sesi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono">
                {myLogs.map((log) => {
                  const displayStatus = log.status === 'BRIEFING' ? 'TRAINING' : log.status;
                  return (
                    <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-3.5 font-sans font-bold text-slate-900">
                        {displayStatus}
                      </td>
                      <td className="py-3 px-3.5 text-slate-500 tabular-nums">
                        {new Date(log.startedAt).toLocaleTimeString('id-ID', {
                          hour: '2-digit',
                          minute: '2-digit',
                          second: '2-digit',
                        })}
                      </td>
                      <td className="py-3 px-3.5 text-slate-500 tabular-nums">
                        {new Date(log.endedAt).toLocaleTimeString('id-ID', {
                          hour: '2-digit',
                          minute: '2-digit',
                          second: '2-digit',
                        })}
                      </td>
                      <td className="py-3 px-3.5 text-right font-bold text-slate-900 tabular-nums">
                        {formatTime(log.durationSeconds)}
                      </td>
                      <td className="py-3 px-3.5 text-right">
                        <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 font-sans font-medium">
                          Tercatat
                        </span>
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
