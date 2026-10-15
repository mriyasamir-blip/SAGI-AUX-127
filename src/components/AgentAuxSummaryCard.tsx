import React from 'react';
import { AuxStatusType } from '../types';
import {
  Timer,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Coffee,
  Sparkles,
  MessageSquare,
  GraduationCap,
  PowerOff,
  PieChart,
  Hourglass,
  TrendingUp,
} from 'lucide-react';

interface AgentAuxSummaryCardProps {
  currentStatus: AuxStatusType;
  elapsedSeconds: number;
  breakSeconds: number;
  sholatSeconds: number;
  toiletSeconds: number;
  coachingSeconds: number;
  trainingSeconds: number;
  readySeconds: number;
  routineQuotaMinutes?: number; // 75
  coachingQuotaMinutes?: number; // 45
}

export const AgentAuxSummaryCard: React.FC<AgentAuxSummaryCardProps> = ({
  currentStatus,
  elapsedSeconds,
  breakSeconds,
  sholatSeconds,
  toiletSeconds,
  coachingSeconds,
  trainingSeconds,
  readySeconds,
  routineQuotaMinutes = 75,
  coachingQuotaMinutes = 45,
}) => {
  // Format total seconds to HH:MM:SS
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

  const isRoutine = currentStatus === 'BREAK' || currentStatus === 'SHOLAT' || currentStatus === 'TOILET';
  const isCoaching = currentStatus === 'COACHING';

  // Quota totals (in seconds)
  const routineQuotaSeconds = routineQuotaMinutes * 60;
  const coachingQuotaSeconds = coachingQuotaMinutes * 60;

  // Real-time accumulated seconds including active session
  const totalRoutineSecondsUsed =
    breakSeconds + sholatSeconds + toiletSeconds + (isRoutine ? elapsedSeconds : 0);
  const totalCoachingSecondsUsed = coachingSeconds + (isCoaching ? elapsedSeconds : 0);

  // Remaining minutes
  const remainingRoutineSeconds = Math.max(0, routineQuotaSeconds - totalRoutineSecondsUsed);
  const remainingRoutineMinutes = Math.floor(remainingRoutineSeconds / 60);

  const remainingCoachingSeconds = Math.max(0, coachingQuotaSeconds - totalCoachingSecondsUsed);
  const remainingCoachingMinutes = Math.floor(remainingCoachingSeconds / 60);

  // Overdue checks
  const isRoutineOver = totalRoutineSecondsUsed > routineQuotaSeconds;
  const isCoachingOver = totalCoachingSecondsUsed > coachingQuotaSeconds;

  const routinePercent = Math.min(100, Math.floor((totalRoutineSecondsUsed / routineQuotaSeconds) * 100));
  const coachingPercent = Math.min(100, Math.floor((totalCoachingSecondsUsed / coachingQuotaSeconds) * 100));

  // Visual status configurations
  const getStatusMeta = () => {
    switch (currentStatus) {
      case 'READY':
        return {
          label: 'READY',
          sub: 'Siap Melayani Pelanggan',
          icon: <CheckCircle2 className="w-5 h-5 text-emerald-600" />,
          accent: 'emerald',
          badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-200',
        };
      case 'BREAK':
        return {
          label: 'ISTIRAHAT',
          sub: 'Sesi Istirahat Kerja',
          icon: <Coffee className="w-5 h-5 text-sky-600" />,
          accent: 'sky',
          badgeClass: 'bg-sky-50 text-sky-800 border-sky-200',
        };
      case 'SHOLAT':
        return {
          label: 'PRAY / IBADAH',
          sub: 'Waktu Sholat & Ibadah',
          icon: <Clock className="w-5 h-5 text-teal-600" />,
          accent: 'teal',
          badgeClass: 'bg-teal-50 text-teal-800 border-teal-200',
        };
      case 'TOILET':
        return {
          label: 'TOILET',
          sub: 'Keperluan Toilet',
          icon: <Sparkles className="w-5 h-5 text-amber-600" />,
          accent: 'amber',
          badgeClass: 'bg-amber-50 text-amber-800 border-amber-200',
        };
      case 'COACHING':
        return {
          label: 'COACHING',
          sub: 'Sesi Pembinaan Bersama SPV',
          icon: <MessageSquare className="w-5 h-5 text-purple-600" />,
          accent: 'purple',
          badgeClass: 'bg-purple-50 text-purple-800 border-purple-200',
        };
      case 'TRAINING':
      case 'BRIEFING':
        return {
          label: 'TRAINING',
          sub: 'Sesi Pelatihan / Training',
          icon: <GraduationCap className="w-5 h-5 text-indigo-600" />,
          accent: 'indigo',
          badgeClass: 'bg-indigo-50 text-indigo-800 border-indigo-200',
        };
      case 'OFFLINE':
      default:
        return {
          label: 'LOG OFF',
          sub: 'Di Luar Antrean Kerja',
          icon: <PowerOff className="w-5 h-5 text-slate-400" />,
          accent: 'slate',
          badgeClass: 'bg-slate-100 text-slate-600 border-slate-200',
        };
    }
  };

  const meta = getStatusMeta();

  return (
    <div
      className={`bg-white border rounded-2xl p-6 sm:p-7 shadow-xs transition-all ${
        (isRoutine && isRoutineOver) || (isCoaching && isCoachingOver)
          ? 'border-rose-300 ring-2 ring-rose-500/20 bg-rose-50/10'
          : currentStatus === 'READY'
          ? 'border-emerald-300 ring-2 ring-emerald-500/10'
          : 'border-slate-200'
      }`}
    >
      {/* Top Bar: Current Status & SLA Badge */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 shadow-xs">
            {meta.icon}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Status AUX Terkini
              </span>
              <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${meta.badgeClass}`}>
                {meta.label}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">{meta.sub}</p>
          </div>
        </div>

        {/* SLA Status Indicator */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          {(isRoutine && isRoutineOver) || (isCoaching && isCoachingOver) ? (
            <span className="text-xs font-bold text-rose-700 bg-rose-100/80 border border-rose-300 px-3 py-1.5 rounded-xl flex items-center gap-1.5 shadow-xs">
              <AlertTriangle className="w-4 h-4 text-rose-600" />
              <span>Melebihi Jatah Batas Waktu</span>
            </span>
          ) : currentStatus !== 'OFFLINE' ? (
            <span className="text-xs font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl flex items-center gap-1.5 shadow-xs">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Sesuai SLA Batas Waktu</span>
            </span>
          ) : (
            <span className="text-xs font-medium text-slate-500 bg-slate-100 px-3 py-1.5 rounded-xl">
              Tidak Sedang AUX
            </span>
          )}
        </div>
      </div>

      {/* Main Clock & Metric Numbers */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-5 items-center">
        {/* Left Column: Big Task Elapsed Clock */}
        <div className="lg:col-span-5 space-y-1.5 text-center sm:text-left">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5 justify-center sm:justify-start">
            <Timer className="w-4 h-4 text-emerald-600" />
            <span>Durasi Berjalan Sesi Ini</span>
          </div>
          <div className="text-5xl sm:text-6xl font-black tracking-tight font-mono text-slate-900 tabular-nums">
            {formatTime(elapsedSeconds)}
          </div>
          <div className="text-xs text-slate-500 flex items-center gap-1.5 justify-center sm:justify-start">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Waktu aktif terhitung seketika</span>
          </div>
        </div>

        {/* Right Column: Visual Quota Limit Cards */}
        <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {/* Card 1: 75-Minute Combined Routine AUX Limit */}
          <div
            className={`p-4 rounded-xl border transition-all ${
              isRoutine
                ? 'bg-sky-50/70 border-sky-300 ring-2 ring-sky-500/20'
                : 'bg-slate-50/70 border-slate-200'
            }`}
          >
            <div className="flex items-center justify-between gap-1 mb-1.5">
              <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <PieChart className="w-3.5 h-3.5 text-sky-600" />
                AUX Rutin (75m)
              </span>
              <span
                className={`text-xs font-bold font-mono ${
                  isRoutineOver ? 'text-rose-600' : 'text-slate-800'
                }`}
              >
                {Math.floor(totalRoutineSecondsUsed / 60)} / 75m
              </span>
            </div>

            {/* Progress bar */}
            <div className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden my-2">
              <div
                className={`h-2.5 rounded-full transition-all duration-500 ${
                  isRoutineOver ? 'bg-rose-500' : routinePercent > 80 ? 'bg-amber-500' : 'bg-sky-500'
                }`}
                style={{ width: `${Math.min(100, routinePercent)}%` }}
              />
            </div>

            {/* Remaining Time Display */}
            <div className="flex items-center justify-between text-[11px] pt-1">
              <span className="text-slate-500">Sisa Jatah:</span>
              <span
                className={`font-bold font-mono ${
                  isRoutineOver ? 'text-rose-700' : 'text-sky-900'
                }`}
              >
                {isRoutineOver
                  ? `Lewat ${Math.floor((totalRoutineSecondsUsed - routineQuotaSeconds) / 60)}m`
                  : `${remainingRoutineMinutes} Menit Tersisa`}
              </span>
            </div>
            <div className="text-[10px] text-slate-400 mt-1 truncate">
              Gabungan Istirahat, Pray & Toilet
            </div>
          </div>

          {/* Card 2: 45-Minute Coaching Limit */}
          <div
            className={`p-4 rounded-xl border transition-all ${
              isCoaching
                ? 'bg-purple-50/70 border-purple-300 ring-2 ring-purple-500/20'
                : 'bg-slate-50/70 border-slate-200'
            }`}
          >
            <div className="flex items-center justify-between gap-1 mb-1.5">
              <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5 text-purple-600" />
                Coaching SPV (45m)
              </span>
              <span
                className={`text-xs font-bold font-mono ${
                  isCoachingOver ? 'text-rose-600' : 'text-slate-800'
                }`}
              >
                {Math.floor(totalCoachingSecondsUsed / 60)} / 45m
              </span>
            </div>

            {/* Progress bar */}
            <div className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden my-2">
              <div
                className={`h-2.5 rounded-full transition-all duration-500 ${
                  isCoachingOver ? 'bg-rose-500' : coachingPercent > 80 ? 'bg-amber-500' : 'bg-purple-500'
                }`}
                style={{ width: `${Math.min(100, coachingPercent)}%` }}
              />
            </div>

            {/* Remaining Time Display */}
            <div className="flex items-center justify-between text-[11px] pt-1">
              <span className="text-slate-500">Sisa Jatah:</span>
              <span
                className={`font-bold font-mono ${
                  isCoachingOver ? 'text-rose-700' : 'text-purple-900'
                }`}
              >
                {isCoachingOver
                  ? `Lewat ${Math.floor((totalCoachingSecondsUsed - coachingQuotaSeconds) / 60)}m`
                  : `${remainingCoachingMinutes} Menit Tersisa`}
              </span>
            </div>
            <div className="text-[10px] text-slate-400 mt-1 truncate">
              Jatah khusus pembinaan SPV
            </div>
          </div>
        </div>
      </div>

      {/* Routine Detail breakdown pill row */}
      <div className="mt-5 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex flex-wrap items-center gap-3 text-slate-500 text-[11px]">
          <span>
            Istirahat: <strong className="text-slate-700 font-mono">{formatTime(breakSeconds)}</strong>
          </span>
          <span aria-hidden="true">·</span>
          <span>
            Pray: <strong className="text-slate-700 font-mono">{formatTime(sholatSeconds)}</strong>
          </span>
          <span aria-hidden="true">·</span>
          <span>
            Toilet: <strong className="text-slate-700 font-mono">{formatTime(toiletSeconds)}</strong>
          </span>
          <span aria-hidden="true">·</span>
          <span>
            Ready: <strong className="text-emerald-700 font-mono">{formatTime(readySeconds)}</strong>
          </span>
        </div>

        <div className="text-[11px] font-semibold text-slate-500">
          Total AUX Rutin Terpakai:{' '}
          <span className="text-slate-900 font-bold font-mono">
            {Math.floor(totalRoutineSecondsUsed / 60)} Menit / 75 Menit
          </span>
        </div>
      </div>
    </div>
  );
};
