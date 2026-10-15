import React, { useState, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { Download, Search, FileText, Calendar, Filter, BarChart3 } from 'lucide-react';

export const AdminReports: React.FC = () => {
  const { recentLogs, users, systemConfig } = useAuth();
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [selectedDivision, setSelectedDivision] = useState<string>('ALL');

  // Filter logs
  const filteredLogs = useMemo(() => {
    return recentLogs.filter((log) => {
      if (searchTerm) {
        const q = searchTerm.toLowerCase();
        const match =
          log.agentName.toLowerCase().includes(q) ||
          log.nik.toLowerCase().includes(q) ||
          log.division.toLowerCase().includes(q);
        if (!match) return false;
      }
      if (selectedStatus !== 'ALL' && log.status !== selectedStatus) return false;
      if (selectedDivision !== 'ALL' && log.division !== selectedDivision) return false;
      return true;
    });
  }, [recentLogs, searchTerm, selectedStatus, selectedDivision]);

  // Aggregate statistics
  const totalEvents = filteredLogs.length;
  const totalBreakSeconds = filteredLogs
    .filter((l) => l.status === 'BREAK')
    .reduce((sum, curr) => sum + curr.durationSeconds, 0);

  const totalToiletSeconds = filteredLogs
    .filter((l) => l.status === 'TOILET')
    .reduce((sum, curr) => sum + curr.durationSeconds, 0);

  const totalReadySeconds = filteredLogs
    .filter((l) => l.status === 'READY')
    .reduce((sum, curr) => sum + curr.durationSeconds, 0);

  const formatHours = (seconds: number) => {
    const hours = (seconds / 3600).toFixed(1);
    return `${hours} Jam`;
  };

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

  // Export logs to CSV
  const handleExportCSV = () => {
    const headers = ['Log ID', 'Nama Agent', 'NIK', 'Divisi', 'Shift', 'Status AUX', 'Waktu Mulai', 'Waktu Selesai', 'Durasi Detik'];
    const rows = filteredLogs.map((l) => [
      l.id,
      `"${l.agentName}"`,
      l.nik,
      l.division,
      `Shift ${l.shiftNumber}`,
      l.status,
      l.startedAt,
      l.endedAt,
      l.durationSeconds,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `SAGI127_Audit_AUX_Report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-400 font-mono mb-1">
            <span>Audit & Analytics</span>
            <span aria-hidden="true">·</span>
            <span>Rekam Jejak Kepatuhan SLA</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
            Laporan Riwayat & Aktivitas AUX Agent
          </h1>
        </div>

        <button
          onClick={handleExportCSV}
          className="px-3.5 py-2 text-xs font-semibold text-slate-900 bg-emerald-400 hover:bg-emerald-300 rounded-md transition-colors flex items-center gap-1.5 self-start sm:self-auto shrink-0"
        >
          <Download className="w-4 h-4" />
          Unduh Laporan CSV
        </button>
      </div>

      {/* Aggregate Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="text-xs text-slate-400 font-medium">Total Sesi Tercatat</div>
          <div className="text-2xl font-extrabold font-mono text-white mt-1 tabular-nums">
            {totalEvents}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Transisi status kerja</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="text-xs text-slate-400 font-medium">Akumulasi Waktu Ready</div>
          <div className="text-2xl font-extrabold font-mono text-emerald-400 mt-1 tabular-nums">
            {formatHours(totalReadySeconds)}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">{totalReadySeconds} detik total</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="text-xs text-slate-400 font-medium">Akumulasi Istirahat</div>
          <div className="text-2xl font-extrabold font-mono text-sky-400 mt-1 tabular-nums">
            {formatHours(totalBreakSeconds)}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">{totalBreakSeconds} detik total</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="text-xs text-slate-400 font-medium">Akumulasi Toilet</div>
          <div className="text-2xl font-extrabold font-mono text-amber-400 mt-1 tabular-nums">
            {formatHours(totalToiletSeconds)}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">{totalToiletSeconds} detik total</div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <div className="sm:col-span-2 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Cari nama agent, NIK, atau divisi..."
              className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
            >
              <option value="ALL">Semua Status AUX</option>
              <option value="READY">Ready</option>
              <option value="BREAK">Break / Istirahat</option>
              <option value="TOILET">Toilet</option>
              <option value="SHOLAT">Sholat</option>
              <option value="BRIEFING">Briefing</option>
              <option value="COACHING">Coaching</option>
              <option value="ACW">After Call Work</option>
            </select>
          </div>

          <div>
            <select
              value={selectedDivision}
              onChange={(e) => setSelectedDivision(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
            >
              <option value="ALL">Semua Divisi</option>
              <option value="Inbound">Inbound</option>
              <option value="Outbound">Outbound</option>
              <option value="Non Voice">Non Voice</option>
              <option value="PPID">PPID</option>
              <option value="QA">QA</option>
              <option value="SME">SME</option>
            </select>
          </div>
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
        {filteredLogs.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-xs">
            Tidak ada riwayat aktivitas AUX yang cocok dengan kriteria filter.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="text-[11px] uppercase tracking-wider text-slate-400 bg-slate-800/60 border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Nama Agent</th>
                  <th className="py-3 px-4">NIK</th>
                  <th className="py-3 px-4">Divisi</th>
                  <th className="py-3 px-4">Shift</th>
                  <th className="py-3 px-4">Status AUX</th>
                  <th className="py-3 px-4">Mulai</th>
                  <th className="py-3 px-4">Selesai</th>
                  <th className="py-3 px-4 text-right">Durasi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 font-mono">
                {filteredLogs.map((l) => (
                  <tr key={l.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4 font-sans font-semibold text-white">
                      {l.agentName}
                    </td>
                    <td className="py-3 px-4 text-slate-400">{l.nik}</td>
                    <td className="py-3 px-4 font-sans text-slate-300">{l.division}</td>
                    <td className="py-3 px-4 text-slate-300">Shift {l.shiftNumber}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-800 text-slate-300 border border-slate-700">
                        {l.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-400 tabular-nums">
                      {new Date(l.startedAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </td>
                    <td className="py-3 px-4 text-slate-400 tabular-nums">
                      {new Date(l.endedAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-white tabular-nums">
                      {formatTime(l.durationSeconds)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
};
