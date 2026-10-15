import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { UserProfile, AgentRealtimeStatus, AuxStatusType, SystemConfig, AuxLogEntry } from '../types';
import { storeService } from '../services/storeService';
import { soundSynthesizer } from '../utils/audio';
import { DEFAULT_SYSTEM_CONFIG } from '../data/initialRoster';

interface AuthContextType {
  currentUser: UserProfile | null;
  activeStatus: AgentRealtimeStatus | null;
  users: UserProfile[];
  statuses: Record<string, AgentRealtimeStatus>;
  systemConfig: SystemConfig;
  recentLogs: AuxLogEntry[];
  isLoading: boolean;
  login: (username: string, password: string) => Promise<{ success: boolean; message?: string }>;
  quickSwitchUser: (userId: string) => void;
  logout: () => void;
  updateMyStatus: (newStatus: AuxStatusType) => Promise<void>;
  updateUserRoleOrShift: (user: UserProfile) => Promise<void>;
  saveConfig: (cfg: SystemConfig) => Promise<void>;
  supervisorResetStatus: (agentId: string, targetStatus?: AuxStatusType) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const CURRENT_USER_SESSION_KEY = 'sagi127_session_user_v1';

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [statuses, setStatuses] = useState<Record<string, AgentRealtimeStatus>>({});
  const [systemConfig, setSystemConfig] = useState<SystemConfig>(DEFAULT_SYSTEM_CONFIG);
  const [recentLogs, setRecentLogs] = useState<AuxLogEntry[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Initialize service & subscriptions
  useEffect(() => {
    let unsubs: Array<() => void> = [];

    const init = async () => {
      await storeService.initialize();

      // Subscribe to users
      const unsubUsers = storeService.subscribeToUsers((updatedUsers) => {
        setUsers(updatedUsers);

        // Check if cached session exists
        const savedSession = localStorage.getItem(CURRENT_USER_SESSION_KEY);
        if (savedSession) {
          try {
            const parsed = JSON.parse(savedSession) as UserProfile;
            const liveMatch = updatedUsers.find((u) => u.id === parsed.id);
            if (liveMatch) {
              setCurrentUser(liveMatch);
            }
          } catch {
            // ignore
          }
        }
      });

      // Subscribe to statuses
      const unsubStatus = storeService.subscribeToAgentStatuses((updatedStatuses) => {
        setStatuses(updatedStatuses);
      });

      // Subscribe to config
      const unsubConfig = storeService.subscribeToConfig((updatedConfig) => {
        setSystemConfig(updatedConfig);
      });

      // Subscribe to logs
      const unsubLogs = storeService.subscribeToAuxLogs((updatedLogs) => {
        setRecentLogs(updatedLogs);
      });

      unsubs = [unsubUsers, unsubStatus, unsubConfig, unsubLogs];
      setIsLoading(false);
    };

    init();

    return () => {
      unsubs.forEach((fn) => fn());
    };
  }, []);

  // Compute active status for currently logged in user
  const activeStatus = currentUser ? statuses[currentUser.id] || null : null;

  // Login handler
  const login = useCallback(
    async (rawUsername: string, rawPassword: string): Promise<{ success: boolean; message?: string }> => {
      const usernameInput = rawUsername.trim().toLowerCase();
      const passwordInput = rawPassword.trim();

      const matchedUser = users.find(
        (u) =>
          u.username.toLowerCase() === usernameInput ||
          u.nik === usernameInput ||
          u.id === usernameInput
      );

      if (!matchedUser) {
        return {
          success: false,
          message: `Username atau NIK "${rawUsername}" tidak ditemukan. Format username: [namadepan]127 (contoh: ofa127, wahyu127, edhi127)`,
        };
      }

      // Check password (default is "sagi 127" or user custom password)
      if (
        matchedUser.password !== passwordInput &&
        passwordInput !== 'sagi 127' &&
        passwordInput !== 'sagi127'
      ) {
        return {
          success: false,
          message: 'Password salah. Password default adalah "sagi 127".',
        };
      }

      setCurrentUser(matchedUser);
      localStorage.setItem(CURRENT_USER_SESSION_KEY, JSON.stringify(matchedUser));

      // Mark agent online with READY or retain last status
      const existing = statuses[matchedUser.id];
      if (!existing || existing.currentStatus === 'OFFLINE') {
        await storeService.updateAgentStatus(matchedUser.id, 'READY', matchedUser);
      }

      soundSynthesizer.playStatusChangeChime();
      return { success: true };
    },
    [users, statuses]
  );

  // Quick switch user (for fast role evaluation by SPV, Admin, or Agent)
  const quickSwitchUser = useCallback(
    (userId: string) => {
      const matchedUser = users.find((u) => u.id === userId);
      if (matchedUser) {
        setCurrentUser(matchedUser);
        localStorage.setItem(CURRENT_USER_SESSION_KEY, JSON.stringify(matchedUser));
        soundSynthesizer.playStatusChangeChime();
      }
    },
    [users]
  );

  // Logout handler
  const logout = useCallback(() => {
    if (currentUser) {
      // Mark as OFFLINE
      storeService.updateAgentStatus(currentUser.id, 'OFFLINE', currentUser);
    }
    setCurrentUser(null);
    localStorage.removeItem(CURRENT_USER_SESSION_KEY);
  }, [currentUser]);

  // Update status for current user
  const updateMyStatus = useCallback(
    async (newStatus: AuxStatusType) => {
      if (!currentUser) return;
      await storeService.updateAgentStatus(currentUser.id, newStatus, currentUser);
      soundSynthesizer.playStatusChangeChime();
    },
    [currentUser]
  );

  // Supervisor or Admin resets an agent's status
  const supervisorResetStatus = useCallback(
    async (agentId: string, targetStatus: AuxStatusType = 'READY') => {
      await storeService.resetAgentStatus(agentId, targetStatus);
      soundSynthesizer.playStatusChangeChime();
    },
    []
  );

  // Save updated user profile
  const updateUserRoleOrShift = useCallback(async (user: UserProfile) => {
    await storeService.saveUserProfile(user);
  }, []);

  // Save updated system config
  const saveConfig = useCallback(async (cfg: SystemConfig) => {
    await storeService.saveSystemConfig(cfg);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        activeStatus,
        users,
        statuses,
        systemConfig,
        recentLogs,
        isLoading,
        login,
        quickSwitchUser,
        logout,
        updateMyStatus,
        updateUserRoleOrShift,
        saveConfig,
        supervisorResetStatus,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
