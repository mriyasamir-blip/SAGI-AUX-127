import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { AgentRealtimeStatus, AuxStatusType } from '../types';
import { soundSynthesizer } from '../utils/audio';
import {
  Search,
  Filter,
  AlertTriangle,
  RotateCcw,
  Download,
  LayoutGrid,
  List,
  Activity,
  CheckCircle,
  Clock,
  ShieldAlert,
} from 'lucide-react';

export const SupervisorDashboard: React.FC = () => {
  const { users, statuses, systemConfig, supervisorResetStatus } = useAuth();
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedDivision, setSelectedDivision] = useState<string>('ALL');
  const [selectedShift, setSelectedShift] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [selectedSupervisor, setSelectedSupervisor] = useState<string>('ALL');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [now, setNow] = useState<number>(Date.now());

  // Keep a global 1-second ticker to re-evaluate active durations smoothly
  useEffect(() => {
    const timer = setInterval(() => {
      setNow(Date.now());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Format seconds to MM:SS or HH:MM:SS
  const formatDuration = (startIso: string) => {
    if (!startIso) return '00:00';
    const start = new Date(startIso).getTime();
    const diff = Math.max(0, Math.floor((now - start) / 1000));
    const h = Math.floor(diff / 3600);
    const m = Math.floor((diff % 3600) / 60);
    const s = diff % 60;
    if (h > 0) {
      return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    }
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const getElapsedSeconds = (startIso: string) => {
    if (!startIso) return 0;
    const start = new Date(startIso).getTime();
    return Math.max(0, Math.floor((now - start) / 1000));
  };

  // Get threshold in minutes
  const getThresholdMinutes = (status: AuxStatusType): number | null => {
    if (status === 'BREAK') return systemConfig.auxThresholds.BREAK;
    if (status === 'TOILET') return systemConfig.auxThresholds.TOILET;
    if (status === 'SHOLAT') return systemConfig.auxThresholds.SHOLAT;
    if (status === 'BRIEFING') return systemConfig.auxThresholds.BRIEFING;
    if (status === 'COACHING') return systemConfig.auxThresholds.COACHING;
    if (status === 'ACW') return systemConfig.auxThresholds.ACW;
    return null;
  };

  // Merge registered users with their live statuses
  const agentList: Array<{ user: (typeof users)[0]; status: AgentRealtimeStatus }> = useMemo(() => {
    return users.map((u) => {
      const live = statuses[u.id] || {
        agentId: u.id,
        agentName: u.name,
        nik: u.nik,
        role: u.role,
        division: u.division,
        shiftNumber: u.shiftNumber,
        supervisorName: u.supervisorName,
        currentStatus: 'OFFLINE' as AuxStatusType,
        statusStartedAt: new Date().toISOString(),
        isOnline: false,
        updatedAt: new Date().toISOString(),
      };
      return { user: u, status: live };
    });
  }, [users, statuses]);

  // Aggregate KPI metrics
  const totalAgents = agentList.length;
  const onlineAgents = agentList.filter((a) => a.status.isOnline && a.status.currentStatus !== 'OFFLINE').length;
  const readyAgents = agentList.filter((a) => a.status.currentStatus === 'READY').length;
  const auxAgents = agentList.filter(
    (a) => a.status.isOnline && a.status.currentStatus !== 'READY' && a.status.currentStatus !== 'OFFLINE'
  ).length;

  const overdueAgents = agentList.filter((a) => {
    const limitMin = getThresholdMinutes(a.status.currentStatus);
    if (!limitMin) return false;
    const elapsed = getElapsedSeconds(a.status.statusStartedAt);
    return elapsed > limitMin * 60;
  });

  // Unique lists for filter options
  const divisions = useMemo(() => {
    const set = new Set<string>();
    users.forEach((u) => u.division && set.add(u.division));
    return Array.from(set).sort();
  }, [users]);

  const shifts = useMemo(() => {
    const set = new Set<number>();
    users.forEach((u) => u.shiftNumber && set.add(u.shiftNumber));
    return Array.from(set).sort((a, b) => a - b);
  }, [users]);

  const supervisors = useMemo(() => {
    const set = new Set<string>();
    users.forEach((u) => u.supervisorName && set.add(u.supervisorName));
    return Array.from(set).sort();
  }, [users]);

  // Filtered Agent List
  const filteredAgents = useMemo(() => {
    return agentList.filter(({ user, status }) => {
      // Search by name or NIK or username
      if (searchTerm) {
        const query = searchTerm.toLowerCase();
        const match =
          user.name.toLowerCase().includes(query) ||
          user.nik.toLowerCase().includes(query) ||
          user.username.toLowerCase().includes(query);
        if (!match) return false;
      }

      // Division filter
      if (selectedDivision !== 'ALL' && user.division !== selectedDivision) {
        return false;
      }

      // Shift filter
      if (selectedShift !== 'ALL' && user.shiftNumber.toString() !== selectedShift) {
        return false;
      }

      // Supervisor filter
      if (selectedSupervisor !== 'ALL' && user.supervisorName !== selectedSupervisor) {
        return false;
      }

      // Status filter
      if (selectedStatus === 'ONLINE') {
        if (!status.isOnline || status.currentStatus === 'OFFLINE') return false;
      } else if (selectedStatus === 'OFFLINE') {
        if (status.isOnline && status.currentStatus !== 'OFFLINE') return false;
      } else if (selectedStatus === 'READY') {
        if (status.currentStatus !== 'READY') return false;
      } else if (selectedStatus === 'AUX') {
        if (status.currentStatus === 'READY' || status.currentStatus === 'OFFLINE') return false;
      } else if (selectedStatus === 'OVERDUE') {
        const limitMin = getThresholdMinutes(status.currentStatus);
        if (!limitMin) return false;
        const elapsed = getElapsedSeconds(status.statusStartedAt);
        if (elapsed <= limitMin * 60) return false;
      } else if (selectedStatus !== 'ALL') {
        if (status.currentStatus !== selectedStatus) return false;
      }

      return true;
    });
  }, [agentList, searchTerm, selectedDivision, selectedShift, selectedSupervisor, selectedStatus, now]);

  // Export current monitoring view to CSV
  const handleExportCSV = () => {
    const headers = ['NIK', 'Nama Agent', 'Divisi', 'Shift', 'Supervisor', 'Status AUX', 'Durasi Berjalan', 'Status Online'];
    const rows = filteredAgents.map(({ user, status }) => [
      user.nik,
      `"${user.name}"`,
      user.division,
      `Shift ${user.shiftNumber}`,
      `"${user.supervisorName}"`,
      status.currentStatus,
      formatDuration(status.statusStartedAt),
      status.isOnline ? 'Online' : 'Offline',
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `SAGI127_AUX_Monitoring_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getStatusColor = (currentStatus: AuxStatusType, isOver: boolean) => {
    if (isOver) {
      return {
        badge: 'text-rose-400 font-bold',
        card: 'border-rose-500/60 bg-rose-950/20',
      };
    }
    switch (currentStatus) {
      case 'READY':
        return { badge: 'text-emerald-400 font-bold', card: 'border-slate-800 bg-slate-900/90' };
      case 'BREAK':
        return { badge: 'text-sky-400 font-semibold', card: 'border-slate-800 bg-slate-900/90' };
      case 'TOILET':
        return { badge: 'text-amber-400 font-semibold', card: 'border-slate-800 bg-slate-900/90' };
      case 'SHOLAT':
        return { badge: 'text-teal-400 font-semibold', card: 'border-slate-800 bg-slate-900/90' };
      case 'BRIEFING':
        return { badge: 'text-indigo-400 font-semibold', card: 'border-slate-800 bg-slate-900/90' };
      case 'COACHING':
        return { badge: 'text-purple-400 font-semibold', card: 'border-slate-800 bg-slate-900/90' };
      case 'ACW':
        return { badge: 'text-orange-400 font-semibold', card: 'border-slate-800 bg-slate-900/90' };
      case 'OFFLINE':
      default:
        return { badge: 'text-slate-500', card: 'border-slate-800/60 bg-slate-950/40 opacity-75' };
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Title & Real-time Indicator */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-400 font-mono mb-1">
            <span>SAGI 127 Contact Center Floor</span>
            <span aria-hidden="true">·</span>
            <span className="text-emerald-400 font-semibold flex items-center gap-1">
              <Activity className="w-3 h-3 text-emerald-400" /> Real-time Synchronized
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
            Dasbor Monitoring Real-Time Supervisor
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="px-3 py-1.5 text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-md transition-colors flex items-center gap-1.5 whitespace-nowrap"
          >
            <Download className="w-3.5 h-3.5 text-slate-400" />
            Ekspor CSV
          </button>
        </div>
      </div>

      {/* KPI Cards Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="text-xs text-slate-400 font-medium">Total Terdaftar</div>
          <div className="text-2xl font-extrabold font-mono text-white mt-1 tabular-nums">
            {totalAgents}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Seluruh agent & tim</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="text-xs text-slate-400 font-medium">Agent Online</div>
          <div className="text-2xl font-extrabold font-mono text-emerald-400 mt-1 tabular-nums">
            {onlineAgents}
          </div>
          <div className="text-[11px] text-emerald-500/80 mt-1">
            {Math.round((onlineAgents / (totalAgents || 1)) * 100)}% floor presence
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="text-xs text-slate-400 font-medium">Ready (Siap Call)</div>
          <div className="text-2xl font-extrabold font-mono text-emerald-300 mt-1 tabular-nums">
            {readyAgents}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Tersedia melayani</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="text-xs text-slate-400 font-medium">Sedang AUX / Istirahat</div>
          <div className="text-2xl font-extrabold font-mono text-sky-400 mt-1 tabular-nums">
            {auxAgents}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Break, toilet, ibadah</div>
        </div>

        <div className={`rounded-xl p-4 border transition-colors ${
          overdueAgents.length > 0 ? 'bg-rose-950/30 border-rose-600/70' : 'bg-slate-900 border-slate-800'
        }`}>
          <div className="text-xs font-medium flex items-center justify-between">
            <span className={overdueAgents.length > 0 ? 'text-rose-300' : 'text-slate-400'}>
              AUX Melebihi Batas
            </span>
            {overdueAgents.length > 0 && <AlertTriangle className="w-4 h-4 text-rose-400" />}
          </div>
          <div className={`text-2xl font-extrabold font-mono mt-1 tabular-nums ${
            overdueAgents.length > 0 ? 'text-rose-400' : 'text-slate-500'
          }`}>
            {overdueAgents.length}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Perlu atensi SPV</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
          
          {/* Search Input */}
          <div className="sm:col-span-2 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Cari nama agent, NIK, atau username..."
              className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Division Filter */}
          <div>
            <select
              value={selectedDivision}
              onChange={(e) => setSelectedDivision(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
            >
              <option value="ALL">Semua Divisi</option>
              {divisions.map((div) => (
                <option key={div} value={div}>
                  {div}
                </option>
              ))}
            </select>
          </div>

          {/* Shift Filter */}
          <div>
            <select
              value={selectedShift}
              onChange={(e) => setSelectedShift(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
            >
              <option value="ALL">Semua Shift</option>
              {shifts.map((s) => (
                <option key={s} value={s.toString()}>
                  Shift {s}
                </option>
              ))}
            </select>
          </div>

          {/* Supervisor Filter */}
          <div>
            <select
              value={selectedSupervisor}
              onChange={(e) => setSelectedSupervisor(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
            >
              <option value="ALL">Semua Supervisor</option>
              {supervisors.map((spv) => (
                <option key={spv} value={spv}>
                  SPV: {spv}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Status Segmented Buttons + View Mode Switcher */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-slate-800/80">
          <div className="flex items-center gap-1 overflow-x-auto text-xs py-0.5">
            {[
              { id: 'ALL', label: 'Semua' },
              { id: 'ONLINE', label: 'Online' },
              { id: 'READY', label: 'Ready' },
              { id: 'BREAK', label: 'Break' },
              { id: 'TOILET', label: 'Toilet' },
              { id: 'SHOLAT', label: 'Sholat' },
              { id: 'OVERDUE', label: `Overdue (${overdueAgents.length})` },
              { id: 'OFFLINE', label: 'Offline' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedStatus(tab.id)}
                className={`px-3 py-1 rounded-md font-medium whitespace-nowrap transition-colors ${
                  selectedStatus === tab.id
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center gap-1 p-0.5 bg-slate-800 rounded-lg border border-slate-700/80 shrink-0">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded transition-colors ${viewMode === 'grid' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-slate-200'}`}
              title="Grid View"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded transition-colors ${viewMode === 'table' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-slate-200'}`}
              title="Table View"
            >
              <List className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Agents Listing Display */}
      {filteredAgents.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-12 text-center text-slate-500 text-xs">
          Tidak ada agent yang cocok dengan kriteria pencarian / filter ini.
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5">
          {filteredAgents.map(({ user, status }) => {
            const limitMin = getThresholdMinutes(status.currentStatus);
            const elapsedSec = getElapsedSeconds(status.statusStartedAt);
            const isOver = limitMin !== null && elapsedSec > limitMin * 60;
            const style = getStatusColor(status.currentStatus, isOver);

            return (
              <div
                key={user.id}
                className={`border rounded-xl p-4 transition-all flex flex-col justify-between ${style.card}`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div className="truncate">
                      <div className="font-semibold text-white text-sm truncate">{user.name}</div>
                      <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                        {user.nik} · {user.division}
                      </div>
                    </div>
                    <span className={`text-xs uppercase font-mono px-2 py-0.5 rounded ${
                      status.currentStatus === 'READY'
                        ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-800'
                        : isOver
                        ? 'bg-rose-950 text-rose-300 border border-rose-700 animate-pulse'
                        : 'bg-slate-800 text-slate-300 border border-slate-700'
                    }`}>
                      {status.currentStatus}
                    </span>
                  </div>

                  <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between">
                    <div>
                      <div className="text-[10px] uppercase tracking-wider text-slate-400">Durasi</div>
                      <div className="text-lg font-bold font-mono text-white tabular-nums">
                        {status.currentStatus === 'OFFLINE' ? '--:--' : formatDuration(status.statusStartedAt)}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-[10px] uppercase tracking-wider text-slate-400">Jadwal</div>
                      <div className="text-xs font-mono text-slate-300">Shift {user.shiftNumber}</div>
                    </div>
                  </div>

                  <div className="mt-2 text-[11px] text-slate-400 truncate">
                    SPV: <span className="text-slate-300">{user.supervisorName || '-'}</span>
                  </div>
                </div>

                {/* Supervisor intervention buttons */}
                <div className="mt-3 pt-2 border-t border-slate-800/60 flex items-center justify-between gap-2">
                  <span className="text-[10px] text-slate-500 font-mono">
                    {user.username}
                  </span>
                  {status.currentStatus !== 'READY' && status.currentStatus !== 'OFFLINE' && (
                    <button
                      onClick={() => supervisorResetStatus(user.id, 'READY')}
                      title="Setel ulang status agent ke READY"
                      className="text-[11px] text-emerald-400 hover:text-emerald-300 hover:bg-emerald-950/40 px-2 py-1 rounded border border-emerald-800/60 flex items-center gap-1 transition-colors"
                    >
                      <RotateCcw className="w-3 h-3" /> Set Ready
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="text-[11px] uppercase tracking-wider text-slate-400 bg-slate-800/60 border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Nama Agent</th>
                  <th className="py-3 px-4">NIK</th>
                  <th className="py-3 px-4">Divisi</th>
                  <th className="py-3 px-4">Shift</th>
                  <th className="py-3 px-4">Supervisor</th>
                  <th className="py-3 px-4">Status AUX</th>
                  <th className="py-3 px-4 text-right">Durasi</th>
                  <th className="py-3 px-4 text-right">Aksi SPV</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 font-mono">
                {filteredAgents.map(({ user, status }) => {
                  const limitMin = getThresholdMinutes(status.currentStatus);
                  const elapsedSec = getElapsedSeconds(status.statusStartedAt);
                  const isOver = limitMin !== null && elapsedSec > limitMin * 60;

                  return (
                    <tr key={user.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-4 font-sans font-semibold text-white">
                        {user.name}
                      </td>
                      <td className="py-3 px-4 text-slate-400">{user.nik}</td>
                      <td className="py-3 px-4 font-sans text-slate-300">{user.division}</td>
                      <td className="py-3 px-4 text-slate-300">Shift {user.shiftNumber}</td>
                      <td className="py-3 px-4 font-sans text-slate-400">{user.supervisorName}</td>
                      <td className="py-3 px-4">
                        <span className={`text-[11px] uppercase font-bold px-2 py-0.5 rounded ${
                          status.currentStatus === 'READY'
                            ? 'text-emerald-400 bg-emerald-950/60'
                            : isOver
                            ? 'text-rose-400 bg-rose-950 font-extrabold'
                            : 'text-sky-300 bg-sky-950/60'
                        }`}>
                          {status.currentStatus}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right font-bold text-white tabular-nums">
                        {status.currentStatus === 'OFFLINE' ? '--:--' : formatDuration(status.statusStartedAt)}
                      </td>
                      <td className="py-3 px-4 text-right">
                        {status.currentStatus !== 'READY' && status.currentStatus !== 'OFFLINE' ? (
                          <button
                            onClick={() => supervisorResetStatus(user.id, 'READY')}
                            className="text-[11px] text-emerald-400 hover:text-emerald-300 font-sans px-2 py-1 rounded border border-emerald-800/80 hover:bg-emerald-950/40 transition-colors"
                          >
                            Set Ready
                          </button>
                        ) : (
                          <span className="text-[11px] text-slate-600 font-sans">-</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
};
