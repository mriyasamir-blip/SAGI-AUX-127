import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Lock, AlertCircle, X } from 'lucide-react';
import { SagiLogo } from './SagiLogo';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { login, currentUser } = useAuth();
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Handle Escape key unconditionally at top level to satisfy Rules of Hooks
  React.useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

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
        setErrorMsg(res.message || 'Login gagal. Periksa username dan password.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200"
    >
      <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 sm:p-7 shadow-2xl space-y-5 animate-in fade-in zoom-in-95">
        
        {/* Header with SAGI Mascot */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3.5">
            <div className="p-1.5 bg-slate-50 border border-slate-200/80 rounded-2xl shadow-xs">
              <SagiLogo className="w-12 h-12 shrink-0 drop-shadow-sm" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-1.5">
                SAGI 127 Contact Center
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Terminal Kontrol AUX & Status Agent
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
            title="Tutup (Kembali ke Halaman Utama)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {errorMsg && (
          <div className="bg-rose-50 border border-rose-200 rounded-xl p-3 text-xs text-rose-700 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Credentials Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-700 font-semibold mb-1.5">
              Username / NIK
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Masukkan username atau NIK"
                className="w-full bg-slate-50 hover:bg-white focus:bg-white border border-slate-300 rounded-lg pl-9 pr-3 py-2.5 text-slate-900 placeholder-slate-400 font-medium text-xs focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/15 transition-all shadow-xs"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Masukkan password"
                className="w-full bg-slate-50 hover:bg-white focus:bg-white border border-slate-300 rounded-lg pl-9 pr-3 py-2.5 text-slate-900 placeholder-slate-400 text-xs focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/15 transition-all shadow-xs"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-2.5 font-semibold text-white bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-sm text-xs mt-3 disabled:opacity-60 cursor-pointer"
          >
            {isSubmitting ? 'Memverifikasi...' : 'Masuk ke Aplikasi'}
          </button>
        </form>

      </div>
    </div>
  );
};
