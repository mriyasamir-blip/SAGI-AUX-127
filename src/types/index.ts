export type UserRole = 'ADMIN' | 'SPV' | 'AGENT';

export type AuxStatusType =
  | 'READY'
  | 'BREAK'
  | 'TOILET'
  | 'SHOLAT'
  | 'BRIEFING'
  | 'COACHING'
  | 'ACW'
  | 'OFFLINE';

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
  BREAK: number; // minutes, e.g. 60
  TOILET: number; // minutes, e.g. 10
  SHOLAT: number; // minutes, e.g. 20
  BRIEFING: number; // minutes, e.g. 30
  COACHING: number; // minutes, e.g. 45
  ACW: number; // minutes, e.g. 5
}

export interface SystemConfig {
  id: string;
  auxThresholds: AuxThresholdConfig;
  shiftSchedule: Record<number, { name: string; hours: string }>;
  soundAlertsEnabled: boolean;
  updatedAt: string;
}
