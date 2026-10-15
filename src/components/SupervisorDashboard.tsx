import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { AgentRealtimeStatus, AuxStatusType } from '../types';
import { soundSynthesizer } from '../utils/audio';
import {
  Search,
  AlertTriangle,
  RotateCcw,
  Download,
  LayoutGrid,
  List,
  Activity,
  CheckCircle,
  Users,
} from 'lucide-react';

export const SupervisorDashboard: React.FC = () => {
  const { users, statuses, systemConfig, supervisorResetStatus } = useAuth();
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedDivision, setSelectedDivision] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [selectedSupervisor, setSelectedSupervisor] = useState<string>('ALL');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [now, setNow] = useState<number>(Date.now());

  // Global 1-second ticker to re-evaluate active durations smoothly
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
    if (status === 'BREAK') return systemConfig.auxThresholds.BREAK || 60;
    if (status === 'COACHING') return systemConfig.auxThresholds.COACHING || 45;
    if (status === 'TRAINING' || status === 'BRIEFING') return systemConfig.auxThresholds.TRAINING || 60;
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

  // Sound chime when someone goes overdue
  useEffect(() => {
    if (overdueAgents.length > 0 && systemConfig.soundAlertsEnabled) {
      soundSynthesizer.playThresholdAlertChime();
    }
  }, [overdueAgents.length, systemConfig.soundAlertsEnabled]);

  // Distinct Filter values
  const divisions = useMemo(() => {
    const set = new Set(users.map((u) => u.division).filter(Boolean));
    return Array.from(set).sort();
  }, [users]);

  const supervisors = useMemo(() => {
    const set = new Set(users.map((u) => u.supervisorName).filter(Boolean));
    return Array.from(set).sort();
  }, [users]);

  // Filtering engine (Shift filter removed as requested)
  const filteredAgents = useMemo(() => {
    return agentList.filter(({ user, status }) => {
      // Search
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        const matches =
          user.name.toLowerCase().includes(q) ||
          user.nik.toLowerCase().includes(q) ||
          user.username.toLowerCase().includes(q);
        if (!matches) return false;
      }

      // Division
      if (selectedDivision !== 'ALL' && user.division !== selectedDivision) {
        return false;
      }

      // Supervisor
      if (selectedSupervisor !== 'ALL' && user.supervisorName !== selectedSupervisor) {
        return false;
      }

      // Status
      if (selectedStatus === 'ONLINE') return status.isOnline && status.currentStatus !== 'OFFLINE';
      if (selectedStatus === 'OFFLINE') return status.currentStatus === 'OFFLINE';
      if (selectedStatus === 'READY') return status.currentStatus === 'READY';
      if (selectedStatus === 'BREAK') return status.currentStatus === 'BREAK';
      if (selectedStatus === 'TOILET') return status.currentStatus === 'TOILET';
      if (selectedStatus === 'SHOLAT') return status.currentStatus === 'SHOLAT';
      if (selectedStatus === 'COACHING') return status.currentStatus === 'COACHING';
      if (selectedStatus === 'TRAINING') return status.currentStatus === 'TRAINING' || status.currentStatus === 'BRIEFING';
      if (selectedStatus === 'OVERDUE') {
        const limitMin = getThresholdMinutes(status.currentStatus);
        if (!limitMin) return false;
        const elapsed = getElapsedSeconds(status.statusStartedAt);
        return elapsed > limitMin * 60;
      }

      return true;
    });
  }, [agentList, searchTerm, selectedDivision, selectedSupervisor, selectedStatus, now]);

  // Supervisor Forced Reset to READY
  const handleForceReady = async (agentId: string, agentName: string) => {
    const confirmed = window.confirm(`Reset status agent ${agentName} ke READY?`);
    if (confirmed) {
      await supervisorResetStatus(agentId, 'READY');
      soundSynthesizer.playStatusChangeChime();
    }
  };

  // Export to CSV
  const handleExportCSV = () => {
    const headers = ['NIK', 'Nama Agent', 'Divisi', 'Supervisor / OIC', 'Status Saat Ini', 'Durasi Berjalan', 'Kondisi Online'];
    const rows = filteredAgents.map(({ user, status }) => [
      `"${user.nik}"`,
      `"${user.name}"`,
      `"${user.division}"`,
      `"${user.supervisorName}"`,
      status.currentStatus === 'BRIEFING' ? 'TRAINING' : status.currentStatus,
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
        badge: 'text-rose-700 bg-rose-50 border border-rose-200 font-bold',
        card: 'border-rose-400 bg-rose-50/30',
        text: 'text-rose-700',
      };
    }
    const normalized = currentStatus === 'BRIEFING' ? 'TRAINING' : currentStatus;
    switch (normalized) {
      case 'READY':
        return { badge: 'text-emerald-700 bg-emerald-50 border border-emerald-200 font-bold', card: 'border-slate-200 bg-white hover:border-emerald-300', text: 'text-emerald-700' };
      case 'BREAK':
        return { badge: 'text-sky-700 bg-sky-50 border border-sky-200 font-semibold', card: 'border-slate-200 bg-white hover:border-sky-300', text: 'text-sky-700' };
      case 'TOILET':
        return { badge: 'text-amber-700 bg-amber-50 border border-amber-200 font-semibold', card: 'border-slate-200 bg-white hover:border-amber-300', text: 'text-amber-700' };
      case 'SHOLAT':
        return { badge: 'text-teal-700 bg-teal-50 border border-teal-200 font-semibold', card: 'border-slate-200 bg-white hover:border-teal-300', text: 'text-teal-700' };
      case 'COACHING':
        return { badge: 'text-purple-700 bg-purple-50 border border-purple-200 font-semibold', card: 'border-slate-200 bg-white hover:border-purple-300', text: 'text-purple-700' };
      case 'TRAINING':
        return { badge: 'text-indigo-700 bg-indigo-50 border border-indigo-200 font-semibold', card: 'border-slate-200 bg-white hover:border-indigo-300', text: 'text-indigo-700' };
      case 'OFFLINE':
      default:
        return { badge: 'text-slate-500 bg-slate-100 border border-slate-200', card: 'border-slate-200/60 bg-slate-50/50 opacity-80', text: 'text-slate-500' };
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Title & Real-time Indicator */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 font-mono mb-1">
            <span className="font-semibold text-slate-700">SAGI 127 Contact Center Floor</span>
            <span aria-hidden="true">·</span>
            <span className="text-emerald-700 font-semibold flex items-center gap-1 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/60 font-sans">
              <Activity className="w-3 h-3 text-emerald-600 animate-pulse" /> Real-time Synchronized
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
            Dasbor Monitoring Real-Time Supervisor & OIC
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap shadow-xs cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            Ekspor Data CSV
          </button>
        </div>
      </div>

      {/* KPI Cards Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3.5">
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
          <div className="text-xs text-slate-500 font-semibold">Total Terdaftar</div>
          <div className="text-2xl font-black font-mono text-slate-900 mt-1 tabular-nums">
            {totalAgents}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Seluruh agent & tim</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
          <div className="text-xs text-slate-500 font-semibold">Agent Online</div>
          <div className="text-2xl font-black font-mono text-emerald-700 mt-1 tabular-nums">
            {onlineAgents}
          </div>
          <div className="text-[11px] text-emerald-600 font-medium mt-1">
            {Math.round((onlineAgents / (totalAgents || 1)) * 100)}% kehadiran floor
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
          <div className="text-xs text-slate-500 font-semibold">Ready (Siap Call)</div>
          <div className="text-2xl font-black font-mono text-emerald-600 mt-1 tabular-nums">
            {readyAgents}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Tersedia melayani</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
          <div className="text-xs text-slate-500 font-semibold">Sedang AUX</div>
          <div className="text-2xl font-black font-mono text-sky-700 mt-1 tabular-nums">
            {auxAgents}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Istirahat, ibadah, toilet</div>
        </div>

        <div className={`rounded-2xl p-4 border transition-colors shadow-xs ${
          overdueAgents.length > 0 ? 'bg-rose-50 border-rose-300' : 'bg-white border-slate-200'
        }`}>
          <div className="text-xs font-semibold flex items-center justify-between">
            <span className={overdueAgents.length > 0 ? 'text-rose-800 font-bold' : 'text-slate-500'}>
              AUX Over Limit
            </span>
            {overdueAgents.length > 0 && <AlertTriangle className="w-4 h-4 text-rose-600 animate-bounce" />}
          </div>
          <div className={`text-2xl font-black font-mono mt-1 tabular-nums ${
            overdueAgents.length > 0 ? 'text-rose-600' : 'text-slate-400'
          }`}>
            {overdueAgents.length}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Perlu atensi SPV/OIC</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4.5 space-y-3.5 shadow-xs">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          
          {/* Search Input */}
          <div className="sm:col-span-2 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Cari nama agent, NIK, atau username..."
              className="w-full bg-slate-50 hover:bg-white focus:bg-white border border-slate-300 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/15 transition-all"
            />
          </div>

          {/* Division Filter */}
          <div>
            <select
              value={selectedDivision}
              onChange={(e) => setSelectedDivision(e.target.value)}
              className="w-full bg-slate-50 hover:bg-white focus:bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-700 focus:outline-none focus:border-emerald-600 cursor-pointer"
            >
              <option value="ALL">Semua Divisi</option>
              {divisions.map((div) => (
                <option key={div} value={div}>
                  {div}
                </option>
              ))}
            </select>
          </div>

          {/* Supervisor / OIC Filter */}
          <div>
            <select
              value={selectedSupervisor}
              onChange={(e) => setSelectedSupervisor(e.target.value)}
              className="w-full bg-slate-50 hover:bg-white focus:bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-700 focus:outline-none focus:border-emerald-600 cursor-pointer"
            >
              <option value="ALL">Semua Supervisor / OIC</option>
              {supervisors.map((spv) => (
                <option key={spv} value={spv}>
                  Pembina: {spv}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Status Segmented Buttons + View Mode Switcher */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-slate-100">
          <div className="flex items-center gap-1.5 overflow-x-auto text-xs py-0.5">
            {[
              { id: 'ALL', label: 'Semua' },
              { id: 'ONLINE', label: 'Online' },
              { id: 'READY', label: 'Ready' },
              { id: 'BREAK', label: 'Istirahat' },
              { id: 'TOILET', label: 'Toilet' },
              { id: 'SHOLAT', label: 'Pray' },
              { id: 'COACHING', label: 'Coaching (45m)' },
              { id: 'TRAINING', label: 'Training' },
              { id: 'OVERDUE', label: `Overdue (${overdueAgents.length})` },
              { id: 'OFFLINE', label: 'Offline' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedStatus(tab.id)}
                className={`px-3 py-1.5 rounded-lg font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                  selectedStatus === tab.id
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center gap-1 p-0.5 bg-slate-100 rounded-lg border border-slate-200 shrink-0">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-md transition-colors cursor-pointer ${
                viewMode === 'grid' ? 'bg-white text-emerald-700 shadow-xs font-bold' : 'text-slate-500 hover:text-slate-800'
              }`}
              title="Tampilan Grid"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-md transition-colors cursor-pointer ${
                viewMode === 'table' ? 'bg-white text-emerald-700 shadow-xs font-bold' : 'text-slate-500 hover:text-slate-800'
              }`}
              title="Tampilan Tabel"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Agents Listing Display */}
      {filteredAgents.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center text-slate-400 text-xs shadow-xs">
          Tidak ada agent yang cocok dengan kriteria pencarian / filter ini.
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5">
          {filteredAgents.map(({ user, status }) => {
            const limitMin = getThresholdMinutes(status.currentStatus);
            const elapsedSec = getElapsedSeconds(status.statusStartedAt);
            const isOver = limitMin !== null && elapsedSec > limitMin * 60;
            const style = getStatusColor(status.currentStatus, isOver);
            const displayStatus = status.currentStatus === 'BRIEFING' ? 'TRAINING' : status.currentStatus;

            return (
              <div
                key={user.id}
                className={`border rounded-2xl p-4.5 transition-all flex flex-col justify-between shadow-xs ${style.card}`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div className="truncate">
                      <div className="font-bold text-slate-900 text-sm truncate">{user.name}</div>
                      <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                        {user.nik} · {user.division}
                      </div>
                    </div>
                    <span className={`text-[10px] uppercase font-mono px-2 py-0.5 rounded-full ${style.badge}`}>
                      {displayStatus}
                    </span>
                  </div>

                  <div className="mt-3.5 pt-3 border-t border-slate-100 flex items-center justify-between">
                    <div>
                      <div className="text-[10px] text-slate-400 uppercase font-semibold">Durasi AUX</div>
                      <div className="text-xl font-black font-mono text-slate-900 tabular-nums">
                        {status.currentStatus === 'OFFLINE' ? '--:--' : formatDuration(status.statusStartedAt)}
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-[10px] text-slate-400 font-semibold">Peran</div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                        {user.role}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-3.5 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] text-slate-500 truncate max-w-[130px]">
                    Pembina: {user.supervisorName || '-'}
                  </span>
                  {status.currentStatus !== 'READY' && status.currentStatus !== 'OFFLINE' && (
                    <button
                      onClick={() => handleForceReady(user.id, user.name)}
                      title="Tarik kembali agent ke status READY"
                      className="text-[11px] text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-2 py-1 rounded-md font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <RotateCcw className="w-3 h-3" />
                      Set Ready
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="text-[11px] uppercase tracking-wider text-slate-500 bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="py-3 px-3.5 font-bold">Agent</th>
                  <th className="py-3 px-3.5 font-bold">Divisi</th>
                  <th className="py-3 px-3.5 font-bold">Role</th>
                  <th className="py-3 px-3.5 font-bold">Supervisor / OIC</th>
                  <th className="py-3 px-3.5 font-bold">Status Saat Ini</th>
                  <th className="py-3 px-3.5 text-right font-bold">Durasi AUX</th>
                  <th className="py-3 px-3.5 text-right font-bold">Aksi SPV</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono">
                {filteredAgents.map(({ user, status }) => {
                  const limitMin = getThresholdMinutes(status.currentStatus);
                  const elapsedSec = getElapsedSeconds(status.statusStartedAt);
                  const isOver = limitMin !== null && elapsedSec > limitMin * 60;
                  const style = getStatusColor(status.currentStatus, isOver);
                  const displayStatus = status.currentStatus === 'BRIEFING' ? 'TRAINING' : status.currentStatus;

                  return (
                    <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-3.5 font-sans">
                        <div className="font-bold text-slate-900">{user.name}</div>
                        <div className="text-[11px] text-slate-500 font-mono">{user.nik}</div>
                      </td>
                      <td className="py-3 px-3.5 text-slate-600 font-sans">{user.division}</td>
                      <td className="py-3 px-3.5 font-sans">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                          {user.role}
                        </span>
                      </td>
                      <td className="py-3 px-3.5 text-slate-600 font-sans">{user.supervisorName || '-'}</td>
                      <td className="py-3 px-3.5 font-sans">
                        <span className={`text-[10px] uppercase font-mono px-2 py-0.5 rounded-full ${style.badge}`}>
                          {displayStatus}
                        </span>
                      </td>
                      <td className="py-3 px-3.5 text-right font-bold text-slate-900 tabular-nums">
                        {status.currentStatus === 'OFFLINE' ? '--:--' : formatDuration(status.statusStartedAt)}
                      </td>
                      <td className="py-3 px-3.5 text-right font-sans">
                        {status.currentStatus !== 'READY' && status.currentStatus !== 'OFFLINE' ? (
                          <button
                            onClick={() => handleForceReady(user.id, user.name)}
                            className="text-[11px] text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-2.5 py-1 rounded-md font-semibold inline-flex items-center gap-1 transition-colors cursor-pointer"
                          >
                            <RotateCcw className="w-3 h-3" />
                            Set Ready
                          </button>
                        ) : (
                          <span className="text-[11px] text-slate-400">-</span>
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
