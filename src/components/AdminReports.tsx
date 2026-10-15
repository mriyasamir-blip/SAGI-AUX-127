import React, { useState, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { Download, Search, BarChart3 } from 'lucide-react';

export const AdminReports: React.FC = () => {
  const { recentLogs } = useAuth();
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
      if (selectedStatus !== 'ALL') {
        if (selectedStatus === 'TRAINING') {
          if (log.status !== 'TRAINING' && log.status !== 'BRIEFING') return false;
        } else if (log.status !== selectedStatus) {
          return false;
        }
      }
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
    const headers = ['Log ID', 'Nama Agent', 'NIK', 'Divisi', 'Status AUX', 'Waktu Mulai', 'Waktu Selesai', 'Durasi Detik'];
    const rows = filteredLogs.map((l) => [
      l.id,
      `"${l.agentName}"`,
      l.nik,
      l.division,
      l.status === 'BRIEFING' ? 'TRAINING' : l.status,
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
          <div className="flex items-center gap-2 text-xs text-slate-500 font-mono mb-1">
            <span className="font-semibold text-slate-700">Audit & Analytics</span>
            <span aria-hidden="true">·</span>
            <span>Rekam Jejak Kepatuhan SLA</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
            Laporan Riwayat & Aktivitas AUX Agent
          </h1>
        </div>

        <button
          onClick={handleExportCSV}
          className="px-3.5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors flex items-center gap-1.5 self-start sm:self-auto shrink-0 shadow-xs cursor-pointer"
        >
          <Download className="w-4 h-4" />
          Unduh Laporan CSV
        </button>
      </div>

      {/* Aggregate Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
          <div className="text-xs text-slate-500 font-semibold">Total Sesi Tercatat</div>
          <div className="text-2xl font-black font-mono text-slate-900 mt-1 tabular-nums">
            {totalEvents}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Transisi status kerja</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
          <div className="text-xs text-slate-500 font-semibold">Akumulasi Waktu Ready</div>
          <div className="text-2xl font-black font-mono text-emerald-700 mt-1 tabular-nums">
            {formatHours(totalReadySeconds)}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">{totalReadySeconds} detik total</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
          <div className="text-xs text-slate-500 font-semibold">Akumulasi Istirahat</div>
          <div className="text-2xl font-black font-mono text-sky-700 mt-1 tabular-nums">
            {formatHours(totalBreakSeconds)}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">{totalBreakSeconds} detik total</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
          <div className="text-xs text-slate-500 font-semibold">Akumulasi Toilet</div>
          <div className="text-2xl font-black font-mono text-amber-700 mt-1 tabular-nums">
            {formatHours(totalToiletSeconds)}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">{totalToiletSeconds} detik total</div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4.5 shadow-xs">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <div className="sm:col-span-2 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Cari nama agent, NIK, atau divisi..."
              className="w-full bg-slate-50 hover:bg-white focus:bg-white border border-slate-300 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-600 transition-all"
            />
          </div>

          <div>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full bg-slate-50 hover:bg-white focus:bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-700 focus:outline-none focus:border-emerald-600 cursor-pointer"
            >
              <option value="ALL">Semua Status AUX</option>
              <option value="READY">Ready</option>
              <option value="BREAK">Istirahat</option>
              <option value="TOILET">Toilet</option>
              <option value="SHOLAT">Pray / Sholat</option>
              <option value="COACHING">Coaching (45m)</option>
              <option value="TRAINING">Training</option>
            </select>
          </div>

          <div>
            <select
              value={selectedDivision}
              onChange={(e) => setSelectedDivision(e.target.value)}
              className="w-full bg-slate-50 hover:bg-white focus:bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-700 focus:outline-none focus:border-emerald-600 cursor-pointer"
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
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
        {filteredLogs.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-xs">
            Tidak ada riwayat aktivitas AUX yang cocok dengan kriteria filter.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="text-[11px] uppercase tracking-wider text-slate-500 bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4 font-bold">Nama Agent</th>
                  <th className="py-3 px-4 font-bold">NIK</th>
                  <th className="py-3 px-4 font-bold">Divisi</th>
                  <th className="py-3 px-4 font-bold">Status AUX</th>
                  <th className="py-3 px-4 font-bold">Mulai</th>
                  <th className="py-3 px-4 font-bold">Selesai</th>
                  <th className="py-3 px-4 text-right font-bold">Durasi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono">
                {filteredLogs.map((l) => (
                  <tr key={l.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4 font-sans font-bold text-slate-900">
                      {l.agentName}
                    </td>
                    <td className="py-3 px-4 text-slate-500">{l.nik}</td>
                    <td className="py-3 px-4 font-sans text-slate-600">{l.division}</td>
                    <td className="py-3 px-4 font-sans">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                        {l.status === 'BRIEFING' ? 'TRAINING' : l.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-500 tabular-nums">
                      {new Date(l.startedAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </td>
                    <td className="py-3 px-4 text-slate-500 tabular-nums">
                      {new Date(l.endedAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-slate-900 tabular-nums">
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
