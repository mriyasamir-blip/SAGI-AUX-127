import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { soundSynthesizer } from '../utils/audio';
import { Volume2, VolumeX, LogOut, ChevronDown, Radio, Users, Shield, UserCheck } from 'lucide-react';

interface NavbarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  onOpenLoginModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentTab, onSelectTab, onOpenLoginModal }) => {
  const { currentUser, logout, quickSwitchUser, users } = useAuth();
  const [soundActive, setSoundActive] = useState<boolean>(soundSynthesizer.isSoundEnabled());
  const [showSwitchMenu, setShowSwitchMenu] = useState<boolean>(false);

  const toggleSound = () => {
    const next = !soundActive;
    soundSynthesizer.setSoundEnabled(next);
    setSoundActive(next);
    if (next) soundSynthesizer.playStatusChangeChime();
  };

  // Preset demo accounts for quick role switching
  const sampleAdmin = users.find((u) => u.role === 'ADMIN') || users[0];
  const sampleSpv = users.find((u) => u.role === 'SPV') || users[1];
  const sampleAgent = users.find((u) => u.role === 'AGENT' && u.division === 'Inbound') || users[3];
  const sampleOutbound = users.find((u) => u.role === 'AGENT' && u.division === 'Outbound') || users[55];

  return (
    <header className="sticky top-0 z-40 bg-slate-900 border-b border-slate-800 text-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-6">
        
        {/* Zone 1: Brand Wordmark */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold text-base tracking-wider">
            127
          </div>
          <div className="flex flex-col">
            <span className="text-base font-semibold tracking-tight text-white whitespace-nowrap">
              SAGI 127 Contact Center
            </span>
            <span className="text-[11px] text-slate-400 whitespace-nowrap">
              AUX & Workforce Control
            </span>
          </div>
        </div>

        {/* Zone 2: Navigation Links based on role */}
        <nav className="hidden md:flex items-center gap-1">
          {/* Agent View is accessible to everyone so SPV/Admin can test personal AUX terminal */}
          <button
            onClick={() => onSelectTab('agent')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              currentTab === 'agent'
                ? 'bg-slate-800 text-emerald-400 border border-slate-700'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Radio className="w-3.5 h-3.5" />
            Terminal Agent
          </button>

          {(currentUser?.role === 'SPV' || currentUser?.role === 'ADMIN') && (
            <button
              onClick={() => onSelectTab('spv')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                currentTab === 'spv'
                  ? 'bg-slate-800 text-emerald-400 border border-slate-700'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              Monitoring Real-Time SPV
            </button>
          )}

          {currentUser?.role === 'ADMIN' && (
            <>
              <button
                onClick={() => onSelectTab('users')}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                  currentTab === 'users'
                    ? 'bg-slate-800 text-emerald-400 border border-slate-700'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                <Shield className="w-3.5 h-3.5" />
                Kelola User & Tim
              </button>
              <button
                onClick={() => onSelectTab('config')}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                  currentTab === 'config'
                    ? 'bg-slate-800 text-emerald-400 border border-slate-700'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                Konfigurasi AUX
              </button>
              <button
                onClick={() => onSelectTab('reports')}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                  currentTab === 'reports'
                    ? 'bg-slate-800 text-emerald-400 border border-slate-700'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                Laporan & Log
              </button>
            </>
          )}
        </nav>

        {/* Zone 3: Profile, Quick Switch & Action Controls */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Sound Alert Toggle */}
          <button
            onClick={toggleSound}
            title={soundActive ? 'Notifikasi Suara Aktif' : 'Notifikasi Suara Dinonaktifkan'}
            className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-md transition-colors"
          >
            {soundActive ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
          </button>

          {currentUser ? (
            <div className="relative">
              <button
                onClick={() => setShowSwitchMenu(!showSwitchMenu)}
                className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-800 border border-slate-700 text-left transition-colors"
              >
                <div className="flex flex-col">
                  <div className="text-xs font-medium text-slate-200 flex items-center gap-1.5">
                    <span className="truncate max-w-[130px]">{currentUser.name}</span>
                    <span className="text-[10px] px-1.5 py-0.2 bg-slate-700 text-emerald-300 rounded font-mono font-medium">
                      {currentUser.role}
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono">
                    {currentUser.username} · Shift {currentUser.shiftNumber}
                  </div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {/* Quick switch dropdown menu */}
              {showSwitchMenu && (
                <div className="absolute right-0 mt-2 w-72 bg-slate-900 border border-slate-700 rounded-lg shadow-xl p-2 z-50 animate-in fade-in slide-in-from-top-1">
                  <div className="px-2 py-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-800">
                    Ganti Akun Demo / Evaluasi
                  </div>

                  <div className="space-y-1 py-1 text-xs">
                    {sampleAdmin && (
                      <button
                        onClick={() => {
                          quickSwitchUser(sampleAdmin.id);
                          onSelectTab('spv');
                          setShowSwitchMenu(false);
                        }}
                        className={`w-full text-left px-2.5 py-1.5 rounded flex items-center justify-between hover:bg-slate-800 ${
                          currentUser.id === sampleAdmin.id ? 'bg-slate-800/60 text-emerald-400' : 'text-slate-300'
                        }`}
                      >
                        <div>
                          <div className="font-medium">{sampleAdmin.name}</div>
                          <div className="text-[10px] text-slate-400">{sampleAdmin.username} · Admin</div>
                        </div>
                        <span className="text-[10px] text-slate-400 font-mono">Admin</span>
                      </button>
                    )}

                    {sampleSpv && (
                      <button
                        onClick={() => {
                          quickSwitchUser(sampleSpv.id);
                          onSelectTab('spv');
                          setShowSwitchMenu(false);
                        }}
                        className={`w-full text-left px-2.5 py-1.5 rounded flex items-center justify-between hover:bg-slate-800 ${
                          currentUser.id === sampleSpv.id ? 'bg-slate-800/60 text-emerald-400' : 'text-slate-300'
                        }`}
                      >
                        <div>
                          <div className="font-medium">{sampleSpv.name}</div>
                          <div className="text-[10px] text-slate-400">{sampleSpv.username} · SPV / PMO</div>
                        </div>
                        <span className="text-[10px] text-slate-400 font-mono">SPV</span>
                      </button>
                    )}

                    {sampleAgent && (
                      <button
                        onClick={() => {
                          quickSwitchUser(sampleAgent.id);
                          onSelectTab('agent');
                          setShowSwitchMenu(false);
                        }}
                        className={`w-full text-left px-2.5 py-1.5 rounded flex items-center justify-between hover:bg-slate-800 ${
                          currentUser.id === sampleAgent.id ? 'bg-slate-800/60 text-emerald-400' : 'text-slate-300'
                        }`}
                      >
                        <div>
                          <div className="font-medium">{sampleAgent.name}</div>
                          <div className="text-[10px] text-slate-400">{sampleAgent.username} · Inbound</div>
                        </div>
                        <span className="text-[10px] text-slate-400 font-mono">Agent</span>
                      </button>
                    )}

                    {sampleOutbound && (
                      <button
                        onClick={() => {
                          quickSwitchUser(sampleOutbound.id);
                          onSelectTab('agent');
                          setShowSwitchMenu(false);
                        }}
                        className={`w-full text-left px-2.5 py-1.5 rounded flex items-center justify-between hover:bg-slate-800 ${
                          currentUser.id === sampleOutbound.id ? 'bg-slate-800/60 text-emerald-400' : 'text-slate-300'
                        }`}
                      >
                        <div>
                          <div className="font-medium">{sampleOutbound.name}</div>
                          <div className="text-[10px] text-slate-400">{sampleOutbound.username} · Outbound</div>
                        </div>
                        <span className="text-[10px] text-slate-400 font-mono">Agent</span>
                      </button>
                    )}
                  </div>

                  <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                    <button
                      onClick={() => {
                        setShowSwitchMenu(false);
                        onOpenLoginModal();
                      }}
                      className="text-xs text-emerald-400 hover:text-emerald-300 font-medium px-2 py-1"
                    >
                      Login Akun Lain
                    </button>
                    <button
                      onClick={() => {
                        setShowSwitchMenu(false);
                        logout();
                        onOpenLoginModal();
                      }}
                      className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1 px-2 py-1"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      Keluar
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={onOpenLoginModal}
              className="px-3.5 py-1.5 text-xs font-semibold text-slate-900 bg-emerald-400 hover:bg-emerald-300 rounded-md transition-colors flex items-center gap-1.5"
            >
              <UserCheck className="w-3.5 h-3.5" />
              Masuk
            </button>
          )}
        </div>
      </div>

      {/* Mobile Nav strip */}
      <div className="md:hidden flex items-center gap-1 px-4 py-2 bg-slate-950 border-t border-slate-800 overflow-x-auto text-xs">
        <button
          onClick={() => onSelectTab('agent')}
          className={`px-2.5 py-1 rounded whitespace-nowrap ${currentTab === 'agent' ? 'bg-slate-800 text-emerald-400' : 'text-slate-400'}`}
        >
          Terminal Agent
        </button>
        {(currentUser?.role === 'SPV' || currentUser?.role === 'ADMIN') && (
          <button
            onClick={() => onSelectTab('spv')}
            className={`px-2.5 py-1 rounded whitespace-nowrap ${currentTab === 'spv' ? 'bg-slate-800 text-emerald-400' : 'text-slate-400'}`}
          >
            Monitoring SPV
          </button>
        )}
        {currentUser?.role === 'ADMIN' && (
          <>
            <button
              onClick={() => onSelectTab('users')}
              className={`px-2.5 py-1 rounded whitespace-nowrap ${currentTab === 'users' ? 'bg-slate-800 text-emerald-400' : 'text-slate-400'}`}
            >
              Kelola Tim
            </button>
            <button
              onClick={() => onSelectTab('config')}
              className={`px-2.5 py-1 rounded whitespace-nowrap ${currentTab === 'config' ? 'bg-slate-800 text-emerald-400' : 'text-slate-400'}`}
            >
              Konfigurasi
            </button>
            <button
              onClick={() => onSelectTab('reports')}
              className={`px-2.5 py-1 rounded whitespace-nowrap ${currentTab === 'reports' ? 'bg-slate-800 text-emerald-400' : 'text-slate-400'}`}
            >
              Laporan
            </button>
          </>
        )}
      </div>
    </header>
  );
};
