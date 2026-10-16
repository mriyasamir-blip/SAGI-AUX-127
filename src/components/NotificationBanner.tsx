import React, { useEffect, useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { soundSynthesizer } from '../utils/audio';
import { Bell, X, Flame } from 'lucide-react';

interface ToastItem {
  id: string;
  agentName: string;
  status: string;
  isOverdue: boolean;
  isQueueAlert?: boolean;
  queueDeactivated?: boolean;
  time: string;
  division: string;
}

export const NotificationBanner: React.FC = () => {
  const { statuses, currentUser, systemConfig } = useAuth();
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [lastStatuses, setLastStatuses] = useState<Record<string, string>>({});
  const prevQueueRef = useRef<boolean | undefined>(undefined);

  // Monitor Queue Mode transitions
  useEffect(() => {
    if (prevQueueRef.current === false && systemConfig.queueModeActive === true) {
      const queueToast: ToastItem = {
        id: `queue_${Date.now()}`,
        agentName: 'Sistem Admin',
        status: 'TRAFIK PADAT (QUEUE AKTIF)',
        isOverdue: false,
        isQueueAlert: true,
        time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
        division: 'Peringatan Floor',
      };
      setToasts((prev) => [queueToast, ...prev].slice(0, 5));
    } else if (prevQueueRef.current === true && systemConfig.queueModeActive === false) {
      const queueOffToast: ToastItem = {
        id: `queue_off_${Date.now()}`,
        agentName: 'Sistem Admin',
        status: 'TRAFIK NORMAL (QUEUE SELESAI)',
        isOverdue: false,
        queueDeactivated: true,
        time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
        division: 'Floor Update',
      };
      setToasts((prev) => [queueOffToast, ...prev].slice(0, 5));
    }
    prevQueueRef.current = !!systemConfig.queueModeActive;
  }, [systemConfig.queueModeActive]);

  useEffect(() => {
    // Detect status transitions across the fleet
    const newToasts: ToastItem[] = [];

    Object.entries(statuses).forEach(([agentId, live]) => {
      const prevStatus = lastStatuses[agentId];
      // If status changed and this isn't initial boot
      if (prevStatus && prevStatus !== live.currentStatus) {
        newToasts.push({
          id: `${agentId}_${Date.now()}`,
          agentName: live.agentName,
          status: live.currentStatus === 'BRIEFING' ? 'TRAINING' : live.currentStatus,
          isOverdue: false,
          time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
          division: live.division,
        });

        // Trigger sound alert for SPV or Admin if someone enters break or changes status
        if (currentUser?.role === 'SPV' || currentUser?.role === 'ADMIN') {
          soundSynthesizer.playStatusChangeChime();
        }
      }
    });

    if (newToasts.length > 0) {
      setToasts((prev) => [...newToasts, ...prev].slice(0, 4));
    }

    // Update baseline
    const currentMap: Record<string, string> = {};
    Object.entries(statuses).forEach(([agentId, live]) => {
      currentMap[agentId] = live.currentStatus;
    });
    setLastStatuses(currentMap);
  }, [statuses, currentUser]);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => {
        if (toast.isQueueAlert) {
          return (
            <div
              key={toast.id}
              className="pointer-events-auto bg-rose-600 text-white border border-rose-700 rounded-2xl p-4 shadow-2xl flex items-start justify-between gap-3 animate-in slide-in-from-bottom-2 fade-in"
            >
              <div className="flex items-start gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center text-amber-200 shrink-0 mt-0.5 animate-pulse">
                  <Flame className="w-4 h-4 fill-amber-300" />
                </div>
                <div>
                  <div className="text-xs font-black uppercase tracking-wide text-amber-200 flex items-center gap-1.5">
                    <span>TRAFIK SEDANG PADAT (QUEUE)</span>
                  </div>
                  <div className="text-xs text-white mt-0.5 leading-snug">
                    Admin telah mengaktifkan mode queue. Seluruh agent diharapkan standby melayani panggilan.
                  </div>
                  <div className="text-[10px] text-rose-200 font-mono mt-1">
                    {toast.time} WIB · Notifikasi Seluruh Device
                  </div>
                </div>
              </div>

              <button
                onClick={() => removeToast(toast.id)}
                className="text-rose-200 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
                title="Tutup Notifikasi"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          );
        }

        return (
          <div
            key={toast.id}
            className="pointer-events-auto bg-white border border-slate-200 text-slate-800 rounded-2xl p-3.5 shadow-xl flex items-start justify-between gap-3 animate-in slide-in-from-bottom-2 fade-in"
          >
            <div className="flex items-start gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700 shrink-0 mt-0.5">
                <Bell className="w-4 h-4 text-emerald-600" />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <span>{toast.agentName}</span>
                  <span className="text-[10px] text-slate-500 font-mono">({toast.division})</span>
                </div>
                <div className="text-xs text-slate-600 mt-0.5">
                  Status AUX: <span className="font-bold text-emerald-700">{toast.status}</span>
                </div>
                <div className="text-[10px] text-slate-400 font-mono mt-1">
                  {toast.time} WIB · Real-time Sync
                </div>
              </div>
            </div>

            <button
              onClick={() => removeToast(toast.id)}
              className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors"
              title="Tutup Notifikasi"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
