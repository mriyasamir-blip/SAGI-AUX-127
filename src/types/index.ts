export type UserRole = 'ADMIN' | 'SPV' | 'OIC' | 'AGENT';

export type AuxStatusType =
  | 'READY'
  | 'BREAK'
  | 'TOILET'
  | 'SHOLAT'
  | 'TRAINING'
  | 'COACHING'
  | 'OFFLINE'
  | 'BRIEFING'
  | 'ACW';

export interface UserProfile {
  id: string; // NIK or unique ID
  nik: string;
  name: string;
  username: string; // e.g. ofa127
  password: string; // default "sagi 127"
  gender: 'Pria' | 'Wanita';
  shiftNumber: number;
  role: UserRole;
  division: string; // Inbound, Outbound, Non Voice, PPID, QA, SME, IT, RTFM, etc.
  supervisorName: string;
  status: 'active' | 'inactive';
  updatedAt?: string;
}

export interface AgentRealtimeStatus {
  agentId: string;
  agentName: string;
  nik: string;
  role: UserRole;
  division: string;
  shiftNumber: number;
  supervisorName: string;
  currentStatus: AuxStatusType;
  statusStartedAt: string; // ISO string
  isOnline: boolean;
  notes?: string;
  lastSeen?: string;
  updatedAt: string;
}

export interface AuxLogEntry {
  id: string;
  agentId: string;
  agentName: string;
  nik: string;
  division: string;
  shiftNumber: number;
  status: AuxStatusType;
  startedAt: string;
  endedAt: string;
  durationSeconds: number;
  isOverThreshold: boolean;
  createdAt: string;
}

export interface AuxThresholdConfig {
  BREAK: number; // minutes
  TOILET: number; // minutes
  SHOLAT: number; // minutes
  TRAINING: number; // minutes
  COACHING: number; // minutes, e.g. 45
  COMBINED_ROUTINE_QUOTA: number; // total quota in minutes for (BREAK + SHOLAT + TOILET), default 75
  BRIEFING?: number;
  ACW?: number;
}

export interface SystemConfig {
  id: string;
  auxThresholds: AuxThresholdConfig;
  shiftSchedule: Record<number, { name: string; hours: string }>;
  soundAlertsEnabled: boolean;
  updatedAt: string;
}
