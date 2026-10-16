import React from 'react';
import { useAuth } from '../context/AuthContext';
import { AlertOctagon, Flame, ShieldAlert, CheckCircle2, Volume2 } from 'lucide-react';

export const QueueAlertBanner: React.FC = () => {
  const { systemConfig, currentUser, toggleQueueMode, activeStatus, updateMyStatus } = useAuth();

  if (!systemConfig.queueModeActive) return null;

  const startedTime = systemConfig.queueModeStartedAt
    ? new Date(systemConfig.queueModeStartedAt).toLocaleTimeString('id-ID', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      })
    : '';

  const isCurrentAgentInBreak =
    currentUser?.role === 'AGENT' && activeStatus?.currentStatus === 'BREAK';

  return (
    <div className="bg-gradient-to-r from-rose-600 via-amber-600 to-rose-700 text-white shadow-lg border-b border-rose-800 animate-in slide-in-from-top duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          
          {/* Main Alert Message */}
          <div className="flex items-start sm:items-center gap-3">
            <div className="p-2 bg-white/20 backdrop-blur-xs rounded-xl shrink-0 flex items-center justify-center animate-bounce">
              <Flame className="w-5 h-5 text-amber-200 fill-amber-300" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-black text-sm tracking-wide uppercase px-2 py-0.5 rounded-md bg-black/25 border border-white/20">
                  TRAFIK SEDANG PADAT · QUEUE AKTIF
                </span>
                {startedTime && (
                  <span className="text-xs text-amber-100 font-mono bg-white/10 px-2 py-0.5 rounded-md">
                    Sejak {startedTime} WIB
                  </span>
                )}
                {systemConfig.queueModeActivatedBy && (
                  <span className="text-xs text-amber-100/90 hidden sm:inline">
                    Oleh: {systemConfig.queueModeActivatedBy}
                  </span>
                )}
              </div>
              <p className="text-xs text-white/95 mt-1 font-medium leading-relaxed">
                {systemConfig.queueMessage ||
                  'Seluruh agent dimohon standby melayani panggilan/chat pelanggan. Pengambilan AUX Istirahat sementara dinonaktifkan.'}
              </p>
            </div>
          </div>

          {/* Action Area */}
          <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
            {/* If Agent is currently in BREAK, quick return button */}
            {isCurrentAgentInBreak && (
              <button
                onClick={() => updateMyStatus('READY')}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg shadow-md border border-emerald-400 flex items-center gap-1.5 transition-colors cursor-pointer animate-pulse"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Kembali Ready Sekarang</span>
              </button>
            )}

            {/* Admin can disable queue mode directly */}
            {currentUser?.role === 'ADMIN' && (
              <button
                onClick={() => toggleQueueMode(false)}
                className="px-3.5 py-1.5 bg-white text-rose-800 hover:bg-rose-50 text-xs font-extrabold rounded-lg shadow-md transition-colors flex items-center gap-1.5 cursor-pointer border border-rose-200"
                title="Nonaktifkan status Queue saat trafik antrean sudah normal"
              >
                <AlertOctagon className="w-4 h-4 text-rose-600" />
                <span>Matikan Mode Queue</span>
              </button>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};
