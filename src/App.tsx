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
import { WelcomeScreen } from './components/WelcomeScreen';
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
      } else if (currentUser.role === 'SPV' || currentUser.role === 'OIC') {
        setCurrentTab('spv');
      } else if (currentUser.role === 'ADMIN' && currentTab === 'agent') {
        setCurrentTab('spv');
      }
    }
  }, [currentUser]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center text-slate-500 gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
        <span className="text-xs font-mono font-medium">Memuat Sistem AUX SAGI 127...</span>
      </div>
    );
  }

  // If user is not logged in, show Welcome Screen (never expose main dashboard)
  if (!currentUser) {
    return (
      <>
        <WelcomeScreen onOpenLoginModal={() => setIsLoginModalOpen(true)} />
        <LoginModal
          isOpen={isLoginModalOpen}
          onClose={() => setIsLoginModalOpen(false)}
          onSuccess={() => setIsLoginModalOpen(false)}
        />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-800 flex flex-col selection:bg-emerald-500/20 selection:text-emerald-800">
      {/* Top Bar */}
      <Navbar
        currentTab={currentTab}
        onSelectTab={(tab) => setCurrentTab(tab)}
        onOpenLoginModal={() => setIsLoginModalOpen(true)}
      />

      {/* Main View Port for Authenticated Users */}
      <main className="flex-1 pb-16">
        {currentTab === 'agent' && <AgentDashboard />}
        {currentTab === 'spv' && <SupervisorDashboard />}
        {currentTab === 'users' && currentUser.role === 'ADMIN' && <AdminUserManagement />}
        {currentTab === 'config' && currentUser.role === 'ADMIN' && <AdminConfig />}
        {currentTab === 'reports' && currentUser.role === 'ADMIN' && <AdminReports />}
      </main>

      {/* Real-time Fleet Status Notifications */}
      <NotificationBanner />

      {/* Modal for Switching / Re-authenticating */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onSuccess={() => setIsLoginModalOpen(false)}
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
