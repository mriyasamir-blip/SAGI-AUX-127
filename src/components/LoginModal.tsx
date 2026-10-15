import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Shield, Key, User, Lock, AlertCircle, X, Sparkles, CheckCircle2 } from 'lucide-react';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { login, quickSwitchUser, users, currentUser } = useAuth();
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('sagi 127');
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) {
      setErrorMsg('Silakan masukkan username atau NIK Anda.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');

    try {
      const res = await login(username, password);
      if (res.success) {
        onSuccess();
        onClose();
      } else {
        setErrorMsg(res.message || 'Login gagal.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickLogin = async (targetUsername: string) => {
    setUsername(targetUsername);
    setPassword('sagi 127');
    setIsSubmitting(true);
    setErrorMsg('');
    try {
      const res = await login(targetUsername, 'sagi 127');
      if (res.success) {
        onSuccess();
        onClose();
      } else {
        setErrorMsg(res.message || 'Login gagal.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95">
        
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold text-lg">
              127
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">
                Login Sistem AUX SAGI 127
              </h2>
              <p className="text-xs text-slate-400">
                Otentikasi multi-role: Admin, Supervisor (SPV), dan Agent
              </p>
            </div>
          </div>

          {currentUser && (
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-200 p-1 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {errorMsg && (
          <div className="bg-rose-950/40 border border-rose-600/60 rounded-xl p-3 text-xs text-rose-300 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Credentials Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          <div>
            <label className="block text-slate-300 font-medium mb-1 flex items-center justify-between">
              <span>Username / NIK</span>
              <span className="text-[11px] text-slate-400 font-mono">Format: [namadepan]127</span>
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Contoh: ofa127, wahyu127, pustaka127"
                className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-white placeholder-slate-500 font-mono text-xs focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-medium mb-1 flex items-center justify-between">
              <span>Password</span>
              <span className="text-[11px] text-slate-400 font-mono">Default: sagi 127</span>
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Masukkan password"
                className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-white text-xs focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-2.5 font-semibold text-slate-900 bg-emerald-400 hover:bg-emerald-300 rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-sm text-xs mt-2"
          >
            {isSubmitting ? 'Memverifikasi...' : 'Masuk ke Aplikasi'}
          </button>
        </form>

        {/* Quick presets for evaluation */}
        <div className="pt-3 border-t border-slate-800 space-y-2">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            Preset Masuk Cepat (1-Klik untuk Evaluasi)
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              type="button"
              onClick={() => handleQuickLogin('pustaka127')}
              className="p-2.5 rounded-lg bg-slate-800/70 hover:bg-slate-800 border border-slate-700/70 text-left transition-colors"
            >
              <div className="font-semibold text-white">Pustaka Adam</div>
              <div className="text-[10px] text-slate-400">pustaka127 · Manager / SPV</div>
            </button>

            <button
              type="button"
              onClick={() => handleQuickLogin('laily127')}
              className="p-2.5 rounded-lg bg-slate-800/70 hover:bg-slate-800 border border-slate-700/70 text-left transition-colors"
            >
              <div className="font-semibold text-white">Laily Rahmah S.</div>
              <div className="text-[10px] text-slate-400">laily127 · Administrator</div>
            </button>

            <button
              type="button"
              onClick={() => handleQuickLogin('ofa127')}
              className="p-2.5 rounded-lg bg-slate-800/70 hover:bg-slate-800 border border-slate-700/70 text-left transition-colors"
            >
              <div className="font-semibold text-white">Ofa Nur Arafah</div>
              <div className="text-[10px] text-slate-400">ofa127 · PPID / Inbound</div>
            </button>

            <button
              type="button"
              onClick={() => handleQuickLogin('wahyu127')}
              className="p-2.5 rounded-lg bg-slate-800/70 hover:bg-slate-800 border border-slate-700/70 text-left transition-colors"
            >
              <div className="font-semibold text-white">Wahyu Astuti</div>
              <div className="text-[10px] text-slate-400">wahyu127 · Agent Inbound</div>
            </button>

            <button
              type="button"
              onClick={() => handleQuickLogin('hadi127')}
              className="p-2.5 rounded-lg bg-slate-800/70 hover:bg-slate-800 border border-slate-700/70 text-left transition-colors"
            >
              <div className="font-semibold text-white">Hadi Kurnia</div>
              <div className="text-[10px] text-slate-400">hadi127 · Agent Outbound</div>
            </button>

            <button
              type="button"
              onClick={() => handleQuickLogin('edhi127')}
              className="p-2.5 rounded-lg bg-slate-800/70 hover:bg-slate-800 border border-slate-700/70 text-left transition-colors"
            >
              <div className="font-semibold text-white">Edhi Sukriyanto</div>
              <div className="text-[10px] text-slate-400">edhi127 · Supervisor</div>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
