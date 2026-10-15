import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { soundSynthesizer } from '../utils/audio';
import { Volume2, VolumeX, LogOut, ChevronDown, Radio, Users, Shield, UserCheck, Wrench, BarChart3 } from 'lucide-react';
import { SagiLogo } from './SagiLogo';

interface NavbarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  onOpenLoginModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentTab, onSelectTab, onOpenLoginModal }) => {
  const { currentUser, logout } = useAuth();
  const [soundActive, setSoundActive] = useState<boolean>(soundSynthesizer.isSoundEnabled());
  const [showSwitchMenu, setShowSwitchMenu] = useState<boolean>(false);
  const menuRef = React.useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  React.useEffect(() => {
    if (!showSwitchMenu) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowSwitchMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showSwitchMenu]);

  const toggleSound = () => {
    const next = !soundActive;
    soundSynthesizer.setSoundEnabled(next);
    setSoundActive(next);
    if (next) soundSynthesizer.playStatusChangeChime();
  };

  const canAccessSupervisor =
    currentUser?.role === 'SPV' || currentUser?.role === 'OIC' || currentUser?.role === 'ADMIN';

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 text-slate-800 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        
        {/* Zone 1: Brand Mascot & Title */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="p-1 bg-gradient-to-br from-emerald-50 to-sky-50 border border-slate-200/80 rounded-xl shadow-xs">
            <SagiLogo className="w-9 h-9 shrink-0 drop-shadow-xs" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="text-base font-bold tracking-tight text-slate-900 whitespace-nowrap">
                SAGI 127
              </span>
              <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200/60 font-sans">
                Contact Center
              </span>
            </div>
            <span className="text-[11px] text-slate-500 whitespace-nowrap">
              Monitoring AUX & Kinerja Tim
            </span>
          </div>
        </div>

        {/* Zone 2: Navigation Links */}
        <nav className="hidden md:flex items-center gap-1.5">
          <button
            onClick={() => onSelectTab('agent')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              currentTab === 'agent'
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/80 shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Radio className="w-3.5 h-3.5" />
            Terminal Agent
          </button>

          {canAccessSupervisor && (
            <button
              onClick={() => onSelectTab('spv')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                currentTab === 'spv'
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/80 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              Monitoring Real-Time SPV / OIC
            </button>
          )}

          {currentUser?.role === 'ADMIN' && (
            <>
              <button
                onClick={() => onSelectTab('users')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                  currentTab === 'users'
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/80 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Shield className="w-3.5 h-3.5" />
                Kelola User & Tim
              </button>
              <button
                onClick={() => onSelectTab('config')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                  currentTab === 'config'
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/80 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Wrench className="w-3.5 h-3.5" />
                Konfigurasi AUX
              </button>
              <button
                onClick={() => onSelectTab('reports')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                  currentTab === 'reports'
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/80 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <BarChart3 className="w-3.5 h-3.5" />
                Laporan & Log
              </button>
            </>
          )}
        </nav>

        {/* Zone 3: Controls & Profile */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Real-time Firebase Sync Status */}
          <div
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-xs"
            title="Database Firebase Firestore Realtime Terhubung"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="font-mono text-[10px] font-bold tracking-wide">Realtime DB</span>
          </div>

          {/* Sound Alert Toggle */}
          <button
            onClick={toggleSound}
            title={soundActive ? 'Notifikasi Suara Aktif' : 'Notifikasi Suara Dinonaktifkan'}
            className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors border border-transparent hover:border-slate-200 cursor-pointer"
          >
            {soundActive ? <Volume2 className="w-4 h-4 text-emerald-600" /> : <VolumeX className="w-4 h-4 text-slate-400" />}
          </button>

          {currentUser ? (
            <div className="relative flex items-center gap-2" ref={menuRef}>
              <button
                onClick={() => setShowSwitchMenu(!showSwitchMenu)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-left transition-colors shadow-xs cursor-pointer"
                title="Informasi Profil Akun"
              >
                <div className="flex flex-col">
                  <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <span className="truncate max-w-[130px]">{currentUser.name}</span>
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded font-mono font-bold ${
                        currentUser.role === 'OIC'
                          ? 'bg-amber-100 text-amber-800 border border-amber-200'
                          : currentUser.role === 'ADMIN'
                          ? 'bg-rose-100 text-rose-800 border border-rose-200'
                          : currentUser.role === 'SPV'
                          ? 'bg-sky-100 text-sky-800 border border-sky-200'
                          : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                      }`}
                    >
                      {currentUser.role}
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-500 font-mono">
                    {currentUser.username} · {currentUser.division}
                  </div>
                </div>
                <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${showSwitchMenu ? 'rotate-180' : ''}`} />
              </button>

              {/* Direct Quick Logout Button */}
              <button
                onClick={() => {
                  logout();
                  onOpenLoginModal();
                }}
                title="Keluar dari Sesi"
                className="hidden sm:flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200/80 rounded-lg transition-colors cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Keluar</span>
              </button>

              {/* Active Profile Info Dropdown */}
              {showSwitchMenu && (
                <div className="absolute right-0 top-full mt-2 w-64 bg-white border border-slate-200 rounded-xl shadow-xl p-3 z-50 animate-in fade-in slide-in-from-top-1 text-slate-800">
                  <div className="pb-2.5 border-b border-slate-100">
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                      Sesi Pengguna Aktif
                    </div>
                    <div className="font-bold text-sm text-slate-900 truncate">
                      {currentUser.name}
                    </div>
                    <div className="flex items-center gap-1.5 mt-1">
                      <span
                        className={`text-[10px] px-1.5 py-0.5 rounded font-mono font-bold ${
                          currentUser.role === 'OIC'
                            ? 'bg-amber-100 text-amber-800 border border-amber-200'
                            : currentUser.role === 'ADMIN'
                            ? 'bg-rose-100 text-rose-800 border border-rose-200'
                            : currentUser.role === 'SPV'
                            ? 'bg-sky-100 text-sky-800 border border-sky-200'
                            : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                        }`}
                      >
                        {currentUser.role}
                      </span>
                      <span className="text-[11px] text-slate-500 font-mono">
                        @{currentUser.username}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500 mt-1">
                      Divisi: {currentUser.division}
                    </div>
                  </div>

                  <div className="pt-2 space-y-1">
                    <button
                      onClick={() => {
                        setShowSwitchMenu(false);
                        onOpenLoginModal();
                      }}
                      className="w-full text-left px-2.5 py-2 rounded-lg text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors flex items-center justify-between cursor-pointer"
                    >
                      <span>Ganti Akun (Login Lain)</span>
                      <UserCheck className="w-3.5 h-3.5 text-slate-400" />
                    </button>
                    <button
                      onClick={() => {
                        setShowSwitchMenu(false);
                        logout();
                        onOpenLoginModal();
                      }}
                      className="w-full text-left px-2.5 py-2 rounded-lg text-xs font-medium text-rose-600 hover:bg-rose-50 transition-colors flex items-center justify-between cursor-pointer"
                    >
                      <span>Keluar (Logout)</span>
                      <LogOut className="w-3.5 h-3.5 text-rose-500" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={onOpenLoginModal}
              className="px-3.5 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors flex items-center gap-1.5 shadow-sm cursor-pointer"
            >
              <UserCheck className="w-3.5 h-3.5" />
              Masuk
            </button>
          )}
        </div>
      </div>

      {/* Mobile Navigation Strip */}
      <div className="md:hidden flex items-center gap-1.5 px-4 py-2 bg-slate-50 border-t border-slate-200 overflow-x-auto text-xs">
        <button
          onClick={() => onSelectTab('agent')}
          className={`px-3 py-1 rounded-md font-semibold whitespace-nowrap ${
            currentTab === 'agent' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Terminal Agent
        </button>
        {canAccessSupervisor && (
          <button
            onClick={() => onSelectTab('spv')}
            className={`px-3 py-1 rounded-md font-semibold whitespace-nowrap ${
              currentTab === 'spv' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Monitoring SPV/OIC
          </button>
        )}
        {currentUser?.role === 'ADMIN' && (
          <>
            <button
              onClick={() => onSelectTab('users')}
              className={`px-3 py-1 rounded-md font-semibold whitespace-nowrap ${
                currentTab === 'users' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Kelola Tim
            </button>
            <button
              onClick={() => onSelectTab('config')}
              className={`px-3 py-1 rounded-md font-semibold whitespace-nowrap ${
                currentTab === 'config' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Konfigurasi
            </button>
            <button
              onClick={() => onSelectTab('reports')}
              className={`px-3 py-1 rounded-md font-semibold whitespace-nowrap ${
                currentTab === 'reports' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Laporan
            </button>
          </>
        )}
      </div>
    </header>
  );
};
