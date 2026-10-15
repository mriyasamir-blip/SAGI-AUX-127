import {
  collection,
  doc,
  setDoc,
  getDocs,
  onSnapshot,
  query,
  orderBy,
  limit,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import {
  UserProfile,
  AgentRealtimeStatus,
  AuxLogEntry,
  SystemConfig,
  AuxStatusType,
} from '../types';
import { buildInitialUsers, DEFAULT_SYSTEM_CONFIG } from '../data/initialRoster';

const LOCAL_STORAGE_USERS_KEY = 'sagi127_users_v1';
const LOCAL_STORAGE_STATUS_KEY = 'sagi127_status_v1';
const LOCAL_STORAGE_LOGS_KEY = 'sagi127_logs_v1';
const LOCAL_STORAGE_CONFIG_KEY = 'sagi127_config_v1';

class StoreService {
  private initialUsers: UserProfile[] = [];
  private isInitialized = false;

  constructor() {
    this.initialUsers = buildInitialUsers();
  }

  /**
   * Initialize local cache and seed Firestore if required
   */
  public async initialize(): Promise<void> {
    if (this.isInitialized) return;

    // 1. Check local storage cache
    let cachedUsers = this.getLocalUsers();
    if (!cachedUsers || cachedUsers.length === 0) {
      cachedUsers = this.initialUsers;
      this.setLocalUsers(cachedUsers);
    }

    let cachedConfig = this.getLocalConfig();
    if (!cachedConfig) {
      cachedConfig = DEFAULT_SYSTEM_CONFIG;
      this.setLocalConfig(cachedConfig);
    }

    let cachedStatuses = this.getLocalStatuses();
    if (!cachedStatuses || Object.keys(cachedStatuses).length === 0) {
      // Default all agents to OFFLINE or initial state
      const initialStatuses: Record<string, AgentRealtimeStatus> = {};
      const now = new Date().toISOString();

      cachedUsers.forEach((u, idx) => {
        // Seed first 12 active agents with realistic live statuses for demonstration
        let initialStatus: AuxStatusType = 'OFFLINE';
        let isOnline = false;

        if (idx < 5) {
          initialStatus = 'READY';
          isOnline = true;
        } else if (idx === 5) {
          initialStatus = 'BREAK';
          isOnline = true;
        } else if (idx === 6) {
          initialStatus = 'TOILET';
          isOnline = true;
        } else if (idx === 7) {
          initialStatus = 'SHOLAT';
          isOnline = true;
        } else if (idx === 8) {
          initialStatus = 'ACW';
          isOnline = true;
        } else if (idx < 15) {
          initialStatus = 'READY';
          isOnline = true;
        }

        initialStatuses[u.id] = {
          agentId: u.id,
          agentName: u.name,
          nik: u.nik,
          role: u.role,
          division: u.division,
          shiftNumber: u.shiftNumber,
          supervisorName: u.supervisorName,
          currentStatus: initialStatus,
          statusStartedAt: new Date(Date.now() - (idx % 8) * 120000).toISOString(),
          isOnline,
          lastSeen: now,
          updatedAt: now,
        };
      });

      this.setLocalStatuses(initialStatuses);
    }

    this.isInitialized = true;

    // 2. Background Firestore Seeding & Sync
    this.syncSeedToFirestore().catch((err) => {
      console.warn('Initial Firestore sync background note:', err);
    });
  }

  // --- Local Cache Helpers ---
  public getLocalUsers(): UserProfile[] {
    try {
      const data = localStorage.getItem(LOCAL_STORAGE_USERS_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return this.initialUsers;
    }
  }

  public setLocalUsers(users: UserProfile[]) {
    try {
      localStorage.setItem(LOCAL_STORAGE_USERS_KEY, JSON.stringify(users));
    } catch {
      // ignore
    }
  }

  public getLocalStatuses(): Record<string, AgentRealtimeStatus> {
    try {
      const data = localStorage.getItem(LOCAL_STORAGE_STATUS_KEY);
      return data ? JSON.parse(data) : {};
    } catch {
      return {};
    }
  }

  public setLocalStatuses(statuses: Record<string, AgentRealtimeStatus>) {
    try {
      localStorage.setItem(LOCAL_STORAGE_STATUS_KEY, JSON.stringify(statuses));
    } catch {
      // ignore
    }
  }

  public getLocalLogs(): AuxLogEntry[] {
    try {
      const data = localStorage.getItem(LOCAL_STORAGE_LOGS_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  public setLocalLogs(logs: AuxLogEntry[]) {
    try {
      localStorage.setItem(LOCAL_STORAGE_LOGS_KEY, JSON.stringify(logs.slice(0, 500)));
    } catch {
      // ignore
    }
  }

  public getLocalConfig(): SystemConfig | null {
    try {
      const data = localStorage.getItem(LOCAL_STORAGE_CONFIG_KEY);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  }

  public setLocalConfig(config: SystemConfig) {
    try {
      localStorage.setItem(LOCAL_STORAGE_CONFIG_KEY, JSON.stringify(config));
    } catch {
      // ignore
    }
  }

  // --- Firestore Seed Check ---
  private async syncSeedToFirestore() {
    try {
      const snap = await getDocs(collection(db, 'system_config'));
      if (snap.empty) {
        // Seed config
        await setDoc(doc(db, 'system_config', 'default'), DEFAULT_SYSTEM_CONFIG);

        // Seed users (batch or sequential subset to respect quota)
        const localUsers = this.getLocalUsers();
        for (const u of localUsers) {
          await setDoc(doc(db, 'users', u.id), u, { merge: true });
        }

        // Seed initial agent statuses
        const localStatuses = this.getLocalStatuses();
        for (const [agentId, status] of Object.entries(localStatuses)) {
          await setDoc(doc(db, 'agent_status', agentId), status, { merge: true });
        }
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.GET, 'system_config');
    }
  }

  // --- Real-time Subscriptions ---

  /**
   * Subscribe to Users
   */
  public subscribeToUsers(callback: (users: UserProfile[]) => void): () => void {
    // Deliver local cache immediately
    callback(this.getLocalUsers());

    try {
      const unsubscribe = onSnapshot(
        collection(db, 'users'),
        (snapshot) => {
          if (!snapshot.empty) {
            const list: UserProfile[] = [];
            snapshot.forEach((docSnap) => {
              list.push(docSnap.data() as UserProfile);
            });
            this.setLocalUsers(list);
            callback(list);
          }
        },
        (error) => {
          handleFirestoreError(error, OperationType.LIST, 'users');
        }
      );
      return unsubscribe;
    } catch {
      return () => {};
    }
  }

  /**
   * Subscribe to Real-time Agent Statuses
   */
  public subscribeToAgentStatuses(
    callback: (statuses: Record<string, AgentRealtimeStatus>) => void
  ): () => void {
    // Deliver local cache immediately
    callback(this.getLocalStatuses());

    try {
      const unsubscribe = onSnapshot(
        collection(db, 'agent_status'),
        (snapshot) => {
          if (!snapshot.empty) {
            const map: Record<string, AgentRealtimeStatus> = {};
            snapshot.forEach((docSnap) => {
              const data = docSnap.data() as AgentRealtimeStatus;
              map[data.agentId] = data;
            });
            this.setLocalStatuses(map);
            callback(map);
          }
        },
        (error) => {
          handleFirestoreError(error, OperationType.LIST, 'agent_status');
        }
      );
      return unsubscribe;
    } catch {
      return () => {};
    }
  }

  /**
   * Subscribe to System Configuration
   */
  public subscribeToConfig(callback: (config: SystemConfig) => void): () => void {
    const cached = this.getLocalConfig() || DEFAULT_SYSTEM_CONFIG;
    callback(cached);

    try {
      const unsubscribe = onSnapshot(
        doc(db, 'system_config', 'default'),
        (docSnap) => {
          if (docSnap.exists()) {
            const cfg = docSnap.data() as SystemConfig;
            this.setLocalConfig(cfg);
            callback(cfg);
          }
        },
        (error) => {
          handleFirestoreError(error, OperationType.GET, 'system_config/default');
        }
      );
      return unsubscribe;
    } catch {
      return () => {};
    }
  }

  /**
   * Subscribe to AUX Activity Logs
   */
  public subscribeToAuxLogs(callback: (logs: AuxLogEntry[]) => void): () => void {
    callback(this.getLocalLogs());

    try {
      const q = query(collection(db, 'aux_logs'), orderBy('createdAt', 'desc'), limit(150));
      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          if (!snapshot.empty) {
            const list: AuxLogEntry[] = [];
            snapshot.forEach((docSnap) => {
              list.push(docSnap.data() as AuxLogEntry);
            });
            this.setLocalLogs(list);
            callback(list);
          }
        },
        (error) => {
          handleFirestoreError(error, OperationType.LIST, 'aux_logs');
        }
      );
      return unsubscribe;
    } catch {
      return () => {};
    }
  }

  // --- Mutations ---

  /**
   * Change Agent Status (e.g. Ready, Break, Toilet)
   */
  public async updateAgentStatus(
    agentId: string,
    newStatus: AuxStatusType,
    userProfile?: Partial<UserProfile>,
    notes?: string
  ): Promise<void> {
    const statuses = this.getLocalStatuses();
    const current = statuses[agentId];
    const now = new Date();
    const nowIso = now.toISOString();

    // If there was a previous active status and it was an AUX or work status, create a log entry
    if (current && current.currentStatus !== newStatus) {
      const startedAtDate = new Date(current.statusStartedAt);
      const durationSeconds = Math.max(0, Math.floor((now.getTime() - startedAtDate.getTime()) / 1000));

      const logId = `log_${agentId}_${now.getTime()}`;
      const logEntry: AuxLogEntry = {
        id: logId,
        agentId,
        agentName: current.agentName,
        nik: current.nik,
        division: current.division,
        shiftNumber: current.shiftNumber,
        status: current.currentStatus,
        startedAt: current.statusStartedAt,
        endedAt: nowIso,
        durationSeconds,
        isOverThreshold: false,
        createdAt: nowIso,
      };

      // Update local logs
      const logs = [logEntry, ...this.getLocalLogs()].slice(0, 500);
      this.setLocalLogs(logs);

      // Async write to Firestore
      setDoc(doc(db, 'aux_logs', logId), logEntry).catch((err) => {
        handleFirestoreError(err, OperationType.CREATE, `aux_logs/${logId}`);
      });
    }

    const updatedStatus: AgentRealtimeStatus = {
      agentId,
      agentName: userProfile?.name || current?.agentName || 'Agent',
      nik: userProfile?.nik || current?.nik || agentId,
      role: userProfile?.role || current?.role || 'AGENT',
      division: userProfile?.division || current?.division || 'General',
      shiftNumber: userProfile?.shiftNumber ?? current?.shiftNumber ?? 1,
      supervisorName: userProfile?.supervisorName || current?.supervisorName || '',
      currentStatus: newStatus,
      statusStartedAt: nowIso,
      isOnline: newStatus !== 'OFFLINE',
      notes: notes || '',
      lastSeen: nowIso,
      updatedAt: nowIso,
    };

    // Update local statuses
    statuses[agentId] = updatedStatus;
    this.setLocalStatuses(statuses);

    // Sync to Firestore
    try {
      await setDoc(doc(db, 'agent_status', agentId), updatedStatus, { merge: true });
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `agent_status/${agentId}`);
    }
  }

  /**
   * Save or Update User Profile
   */
  public async saveUserProfile(user: UserProfile): Promise<void> {
    const users = this.getLocalUsers();
    const index = users.findIndex((u) => u.id === user.id);
    if (index >= 0) {
      users[index] = { ...user, updatedAt: new Date().toISOString() };
    } else {
      users.unshift({ ...user, updatedAt: new Date().toISOString() });
    }
    this.setLocalUsers(users);

    try {
      await setDoc(doc(db, 'users', user.id), user, { merge: true });
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `users/${user.id}`);
    }
  }

  /**
   * Save System Configuration
   */
  public async saveSystemConfig(config: SystemConfig): Promise<void> {
    const updated = { ...config, updatedAt: new Date().toISOString() };
    this.setLocalConfig(updated);

    try {
      await setDoc(doc(db, 'system_config', 'default'), updated, { merge: true });
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'system_config/default');
    }
  }

  /**
   * Supervisor force status reset (e.g. set to READY or OFFLINE)
   */
  public async resetAgentStatus(agentId: string, targetStatus: AuxStatusType = 'READY'): Promise<void> {
    const users = this.getLocalUsers();
    const targetUser = users.find((u) => u.id === agentId);
    await this.updateAgentStatus(agentId, targetStatus, targetUser, 'Reset by Supervisor');
  }
}

export const storeService = new StoreService();
