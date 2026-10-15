import {
  collection,
  doc,
  setDoc,
  deleteDoc,
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
import {
  CLEAN_INITIAL_USERS,
  buildInitialUsers,
  buildFullRosterUsers,
  DEFAULT_SYSTEM_CONFIG,
} from '../data/initialRoster';

const LOCAL_STORAGE_USERS_KEY = 'sagi127_users_v2';
const LOCAL_STORAGE_STATUS_KEY = 'sagi127_status_v2';
const LOCAL_STORAGE_LOGS_KEY = 'sagi127_logs_v2';
const LOCAL_STORAGE_CONFIG_KEY = 'sagi127_config_v2';

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

    // Remove legacy v1 demo data from previous sessions
    try {
      localStorage.removeItem('sagi127_users_v1');
      localStorage.removeItem('sagi127_status_v1');
      localStorage.removeItem('sagi127_logs_v1');
      localStorage.removeItem('sagi127_config_v1');
    } catch {
      // ignore
    }

    // 1. Check local storage cache
    let cachedUsers = this.getLocalUsers();
    if (!cachedUsers || cachedUsers.length === 0) {
      cachedUsers = [...CLEAN_INITIAL_USERS];
      this.setLocalUsers(cachedUsers);
    } else {
      // Ensure Admin.s127 and Wahyu Astuti (OIC) exist
      const hasAdmin = cachedUsers.some(
        (u) => u.username.toLowerCase() === 'admin.s127' || u.id === 'ADMIN.S127'
      );
      if (!hasAdmin) {
        cachedUsers.unshift(CLEAN_INITIAL_USERS[0]);
      }
      cachedUsers = cachedUsers.map((u) => {
        if (u.name.toLowerCase().includes('wahyu astuti') || u.id === '202601193') {
          return {
            ...u,
            role: 'OIC' as const,
            division: 'OIC / Inbound',
            password: 'sagi127',
          };
        }
        return u;
      });
      this.setLocalUsers(cachedUsers);
    }

    let cachedConfig = this.getLocalConfig();
    if (!cachedConfig) {
      cachedConfig = DEFAULT_SYSTEM_CONFIG;
      this.setLocalConfig(cachedConfig);
    }

    // Agent statuses start clean (empty), populated dynamically on user login
    const cachedStatuses = this.getLocalStatuses();
    if (!cachedStatuses) {
      this.setLocalStatuses({});
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

  // --- Firestore Seed & Clean ---
  private async syncSeedToFirestore() {
    try {
      // 1. Verify and seed system configuration
      const configSnap = await getDocs(collection(db, 'system_config'));
      if (configSnap.empty) {
        await setDoc(doc(db, 'system_config', 'default'), DEFAULT_SYSTEM_CONFIG);
      }

      // Check if clean data migration has run
      const cleanedKey = 'sagi127_clean_seeded_v2';
      const hasCleaned = localStorage.getItem(cleanedKey);

      if (!hasCleaned) {
        // Delete all old dummy documents from users collection
        const usersSnap = await getDocs(collection(db, 'users'));
        for (const docSnap of usersSnap.docs) {
          if (docSnap.id !== 'ADMIN.S127' && docSnap.id !== '202601193') {
            await deleteDoc(doc(db, 'users', docSnap.id)).catch(() => {});
          }
        }

        // Delete all old dummy statuses
        const statusSnap = await getDocs(collection(db, 'agent_status'));
        for (const docSnap of statusSnap.docs) {
          await deleteDoc(doc(db, 'agent_status', docSnap.id)).catch(() => {});
        }

        // Delete all old dummy logs
        const logsSnap = await getDocs(collection(db, 'aux_logs'));
        for (const docSnap of logsSnap.docs) {
          await deleteDoc(doc(db, 'aux_logs', docSnap.id)).catch(() => {});
        }

        // Write the clean initial users
        for (const u of CLEAN_INITIAL_USERS) {
          await setDoc(doc(db, 'users', u.id), u, { merge: true });
        }

        this.setLocalUsers(CLEAN_INITIAL_USERS);
        this.setLocalStatuses({});
        this.setLocalLogs([]);
        localStorage.setItem(cleanedKey, 'true');
        return;
      }

      // 2. Ensure clean users are always present in Firestore
      for (const u of CLEAN_INITIAL_USERS) {
        await setDoc(doc(db, 'users', u.id), u, { merge: true });
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.GET, 'sync_initial_seed');
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
          const list: UserProfile[] = [];
          snapshot.forEach((docSnap) => {
            list.push(docSnap.data() as UserProfile);
          });
          const resultList = list.length > 0 ? list : CLEAN_INITIAL_USERS;
          this.setLocalUsers(resultList);
          callback(resultList);
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
          const map: Record<string, AgentRealtimeStatus> = {};
          snapshot.forEach((docSnap) => {
            const data = docSnap.data() as AgentRealtimeStatus;
            map[data.agentId] = data;
          });
          this.setLocalStatuses(map);
          callback(map);
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
          const list: AuxLogEntry[] = [];
          snapshot.forEach((docSnap) => {
            list.push(docSnap.data() as AuxLogEntry);
          });
          this.setLocalLogs(list);
          callback(list);
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
   * Delete User Profile
   */
  public async deleteUserProfile(userId: string): Promise<void> {
    const users = this.getLocalUsers().filter((u) => u.id !== userId);
    this.setLocalUsers(users);

    const statuses = this.getLocalStatuses();
    if (statuses[userId]) {
      delete statuses[userId];
      this.setLocalStatuses(statuses);
    }

    try {
      await deleteDoc(doc(db, 'users', userId));
      await deleteDoc(doc(db, 'agent_status', userId)).catch(() => {});
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `users/${userId}`);
    }
  }

  /**
   * Reset / Clear all data back to clean state:
   * Keeps Admin.s127 and Wahyu Astuti (OIC), deletes all agent statuses and AUX logs.
   */
  public async clearAllData(): Promise<void> {
    try {
      // 1. Clear agent_status in Firestore
      const statusSnap = await getDocs(collection(db, 'agent_status'));
      for (const d of statusSnap.docs) {
        await deleteDoc(doc(db, 'agent_status', d.id)).catch(() => {});
      }

      // 2. Clear aux_logs in Firestore
      const logsSnap = await getDocs(collection(db, 'aux_logs'));
      for (const d of logsSnap.docs) {
        await deleteDoc(doc(db, 'aux_logs', d.id)).catch(() => {});
      }

      // 3. Clean users collection: delete old users, keep only CLEAN_INITIAL_USERS
      const usersSnap = await getDocs(collection(db, 'users'));
      for (const d of usersSnap.docs) {
        if (d.id !== 'ADMIN.S127' && d.id !== '202601193') {
          await deleteDoc(doc(db, 'users', d.id)).catch(() => {});
        }
      }
      for (const u of CLEAN_INITIAL_USERS) {
        await setDoc(doc(db, 'users', u.id), u, { merge: true });
      }

      // 4. Update local cache
      this.setLocalUsers([...CLEAN_INITIAL_USERS]);
      this.setLocalStatuses({});
      this.setLocalLogs([]);
    } catch (err) {
      console.error('Error clearing data:', err);
    }
  }

  /**
   * Load full roster from template
   */
  public async loadFullRoster(): Promise<void> {
    const fullUsers = buildFullRosterUsers();
    this.setLocalUsers(fullUsers);
    for (const u of fullUsers) {
      await setDoc(doc(db, 'users', u.id), u, { merge: true });
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
