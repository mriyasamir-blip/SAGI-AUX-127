import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { AgentDashboard } from './components/AgentDashboard';
import { SupervisorDashboard } from './components/SupervisorDashboard';
import { AdminUserManagement } from './components/AdminUserManagement';
import { AdminConfig } from './components/AdminConfig';
import { AdminReports } from './components/AdminReports';
import { LoginModal } from './components/LoginModal';
import { NotificationBanner } from './components/NotificationBanner';
import { Loader2 } from 'lucide-react';

const AppContent: React.FC = () => {
  const { currentUser, isLoading } = useAuth();
  const [currentTab, setCurrentTab] = useState<string>('spv');
  const [isLoginModalOpen, setIsLoginModalOpen] = useState<boolean>(false);

  // Sync default tab with user's role on login/change
  useEffect(() => {
    if (currentUser) {
      if (currentUser.role === 'AGENT') {
        setCurrentTab('agent');
      } else if (currentUser.role === 'SPV') {
        setCurrentTab('spv');
      } else if (currentUser.role === 'ADMIN' && currentTab === 'agent') {
        // Keep current or set to spv
      }
    } else {
      setIsLoginModalOpen(true);
    }
  }, [currentUser]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-400 gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-400" />
        <span className="text-xs font-mono">Memuat Sistem AUX SAGI 127...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-emerald-500/20 selection:text-emerald-300">
      {/* Top Bar */}
      <Navbar
        currentTab={currentTab}
        onSelectTab={(tab) => setCurrentTab(tab)}
        onOpenLoginModal={() => setIsLoginModalOpen(true)}
      />

      {/* Main View Port */}
      <main className="flex-1 pb-16">
        {currentTab === 'agent' && <AgentDashboard />}
        {currentTab === 'spv' && <SupervisorDashboard />}
        {currentTab === 'users' && <AdminUserManagement />}
        {currentTab === 'config' && <AdminConfig />}
        {currentTab === 'reports' && <AdminReports />}
      </main>

      {/* Real-time Fleet Status Notifications */}
      <NotificationBanner />

      {/* Role-based Authentication Modal */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onSuccess={() => {
          setIsLoginModalOpen(false);
        }}
      />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
