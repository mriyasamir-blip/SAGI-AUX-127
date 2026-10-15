import React from 'react';
import { SagiLogo } from './SagiLogo';
import { LogIn, Shield, Users, Timer, CheckCircle2, Sparkles } from 'lucide-react';

interface WelcomeScreenProps {
  onOpenLoginModal: () => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onOpenLoginModal }) => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-100 flex flex-col justify-between selection:bg-emerald-500/20 selection:text-emerald-800">
      
      {/* Top Simple Brand Bar */}
      <header className="py-5 px-6 border-b border-slate-200/80 bg-white/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-1.5 bg-slate-50 border border-slate-200 rounded-xl shadow-xs">
              <SagiLogo className="w-8 h-8" />
            </div>
            <div>
              <span className="font-extrabold text-slate-900 tracking-tight text-base">SAGI 127</span>
              <span className="ml-2 text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                Contact Center
              </span>
            </div>
          </div>

          <button
            onClick={onOpenLoginModal}
            className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 rounded-xl transition-all shadow-sm flex items-center gap-2 cursor-pointer"
          >
            <LogIn className="w-4 h-4" />
            <span>Masuk ke Sistem</span>
          </button>
        </div>
      </header>

      {/* Main Hero & Welcome Banner */}
      <main className="flex-1 max-w-4xl mx-auto px-4 py-12 sm:py-16 flex flex-col items-center justify-center text-center space-y-8">
        
        {/* Mascot Avatar with Soft Glow - Clickable to login */}
        <div 
          onClick={onOpenLoginModal}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onOpenLoginModal(); }}
          className="relative cursor-pointer group focus:outline-none"
          title="Klik untuk membuka Login SAGI 127"
        >
          <div className="absolute inset-0 bg-emerald-400/25 blur-2xl rounded-full scale-110 group-hover:bg-emerald-400/40 transition-all duration-300" />
          <div className="relative p-5 bg-white border border-slate-200/90 group-hover:border-emerald-400 rounded-3xl shadow-xl group-hover:shadow-2xl transition-all duration-300 transform group-hover:scale-105">
            <SagiLogo className="w-28 h-28 sm:w-36 sm:h-36 drop-shadow-md animate-in zoom-in-90 duration-500" />
            <div className="mt-2 text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200/60 rounded-full px-2.5 py-0.5 inline-block group-hover:bg-emerald-600 group-hover:text-white transition-colors">
              Klik untuk Masuk
            </div>
          </div>
        </div>

        {/* Headline Requested by User */}
        <div className="space-y-3 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span>Sistem Operasional Resmi Contact Center</span>
          </div>
          
          <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight">
            Welcome AUX SAGI 127
          </h1>
          
          <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
            Portal monitoring status kerja, pencatatan durasi AUX real-time, dan manajemen kinerja untuk Agent, Supervisor (SPV), dan Officer In Charge (OIC).
          </p>
        </div>

        {/* Primary Call To Action */}
        <div className="pt-2 flex flex-col items-center gap-2">
          <button
            onClick={onOpenLoginModal}
            className="px-8 py-3.5 text-sm sm:text-base font-extrabold text-white bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 rounded-2xl transition-all shadow-md hover:shadow-lg flex items-center gap-2.5 transform hover:-translate-y-0.5 cursor-pointer"
          >
            <LogIn className="w-5 h-5" />
            <span>Masuk untuk Mulai (Login)</span>
          </button>
          <span className="text-xs text-slate-400 font-medium">
            Klik tombol di atas untuk membuka formulir login akun Anda
          </span>
        </div>

        {/* Value Highlights Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full pt-6 text-left">
          <div className="bg-white border border-slate-200 rounded-2xl p-4.5 shadow-xs">
            <div className="w-9 h-9 rounded-xl bg-sky-50 border border-sky-200 flex items-center justify-center text-sky-600 mb-3">
              <Timer className="w-5 h-5" />
            </div>
            <h3 className="text-xs font-bold text-slate-900">Jatah AUX Rutin 75 Menit</h3>
            <p className="text-[11px] text-slate-500 mt-1 leading-normal">
              Kuota gabungan fleksibel untuk Istirahat, Sholat / Pray, dan Toilet tanpa batasan jadwal kaku.
            </p>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-4.5 shadow-xs">
            <div className="w-9 h-9 rounded-xl bg-purple-50 border border-purple-200 flex items-center justify-center text-purple-600 mb-3">
              <Users className="w-5 h-5" />
            </div>
            <h3 className="text-xs font-bold text-slate-900">Jatah Coaching 45 Menit</h3>
            <p className="text-[11px] text-slate-500 mt-1 leading-normal">
              Sesi pembinaan terpisah khusus bersama Supervisor atau OIC untuk meningkatkan kualitas layanan.
            </p>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-4.5 shadow-xs">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 mb-3">
              <Shield className="w-5 h-5" />
            </div>
            <h3 className="text-xs font-bold text-slate-900">Multi-Role Terpadu</h3>
            <p className="text-[11px] text-slate-500 mt-1 leading-normal">
              Hak akses presisi untuk Admin, SPV, OIC, dan Agent dengan sinkronisasi Firestore real-time.
            </p>
          </div>
        </div>

      </main>

      {/* Footer */}
      <footer className="py-4 text-center text-xs text-slate-400 border-t border-slate-200/80 bg-white/60">
        SAGI 127 Contact Center Workforce Management & AUX Control System
      </footer>

    </div>
  );
};
