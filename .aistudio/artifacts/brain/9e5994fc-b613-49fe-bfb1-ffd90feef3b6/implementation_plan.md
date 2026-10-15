# SAGI 127 Contact Center AUX & Real-time Agent Monitoring

A unified real-time auxiliary (AUX) state tracking and workforce monitoring platform tailored for SAGI 127 Contact Center Inbound, Outbound, Non-Voice, and Support divisions. The platform provides role-governed views for Agents, Supervisors (SPV), and Admins with synchronized status counters, threshold alerts, and persistent roster management.

---

### User Review & Critical Decisions

> [!IMPORTANT]
> The following system decisions have been incorporated based on contact center operational standards and SAGI 127 requirements:

- **Confirmed Credentials Rule**: Authentication defaults to `[first_name_lowercase]127` (e.g., `ofa127`, `wahyu127`, `pustaka127`) with default initial password `sagi 127`. Users can update passwords upon login.
- **Pre-populated Roster**: All 90+ provided team members (Managers, SPVs, Inbound, Outbound, Non-Voice, PPID, QA, SME, IT, RTFM, Admin) are seeded with their designated NIK, shift codes, and assigned supervisors.
- **Standard Contact Center AUX Set**: Includes `Ready`, `Break / Istirahat` (max 60m), `Toilet` (max 10m), `Prayer / Sholat` (max 20m), `Briefing` (max 30m), `Coaching` (max 45m), and `After Call Work (ACW)` (max 5m). Thresholds are configurable in Admin settings.
- **Audio & Visual Realtime Alerts**: Configured with visual pulses, banner notifications, and optional Web Audio chime when an agent exceeds their AUX limit or when critical state transitions occur.
- **Firebase Firestore Persistence**: Real-time multi-agent synchronization via Firestore listeners (`onSnapshot`) with secure role-based rules and local resilience fallback.

---

### 1. Overview & Core Concept

- **What It Does**: Empowers contact center agents to toggle their work availability states in real time with high-visibility timers, while giving supervisors and administrators a live control-room dashboard tracking active AUX states, idle duration, shift adherence, and team statistics.
- **Target Audience / Persona**:
  - **Agents (Inbound, Outbound, Non-Voice, PPID)**: Need a distraction-free, one-click interface to mark active work or AUX breaks, track remaining break time, and view shift details.
  - **Supervisors (SPV & Team Leads)**: Need immediate visibility into floor occupancy, who is available vs. on break, duration alerts, and the ability to filter by shift/team/channel.
  - **Administrators**: Need complete control over user roster, shift definitions, AUX duration thresholds, audit logs, and exportable activity reports.
- **Key Value**: Eliminates manual check-ins, prevents unreported agent downtime, optimizes service level adherence (SLA), and maintains transparent workforce accountability.

---

### 2. User Experience & Visual Design

#### Key User Flows
1. **Authentication Flow**:
   - Clean login screen featuring SAGI 127 branding, quick-switch role presets for instant testing/demo, and credentials login (`username` + `password`).
   - Seamless role routing: Admin to System Management & Deep Monitor, SPV to Floor Control Monitoring, Agent to Personal Work Terminal.
2. **Agent Work Terminal**:
   - Status header displaying Agent NIK, Name, Assigned Shift (e.g., Shift 1, Shift 2, etc.), Assigned Supervisor, and current session duration.
   - Primary Status Switcher: Prominent state action buttons (`Ready`, `Break`, `Toilet`, `Sholat`, `Briefing`, `Coaching`, `ACW`, `Offline`).
   - Active Timer Display: High-contrast tabular clock displaying elapsed time in current status and time remaining before threshold breach.
   - Activity History: Chronological timeline of daily AUX toggles with exact start/end timestamps and calculated durations.
3. **Supervisor Real-time Floor Monitor**:
   - Live KPI Strip: Total Agents, Currently Ready, On Break, On Critical AUX, and Over-threshold Count.
   - Live Agent Grid / Table View: Real-time cards or tabular view with live elapsed duration counters, channel tags (Inbound, Outbound, Non-Voice), shift filter, and search by agent name/NIK.
   - Threshold Warning System: Agents approaching or exceeding AUX limits are highlighted with amber/crimson status rings and alert banners.
   - Quick Nudge & Filter Controls: Filter by Supervisor group (e.g. agents supervised by Kusuma Warastra, Mudrik Reza Bahrain, etc.) or shift number.
4. **Admin Management & Reporting Suite**:
   - System Configuration: Add, edit, or adjust AUX categories and duration thresholds.
   - Roster Management: Complete table of all 90+ staff with search, role editing, supervisor reassignment, and password resets.
   - Reports & Analytics: Date-range filtering of AUX logs, total break time per agent, adherence percentage, and CSV download.

#### Visual Identity & Theme
- **Aesthetic Direction**: High-efficiency enterprise operations console (SaaS / Mission-Control) built with clean geometric typography, subtle hairline borders, and zero decorative fluff.
- **Color Palette**:
  - Neutral Base: Slate Canvas (`#090D16` dark / `#F8FAFC` light posture) with structural panels (`#131B2E` / `#FFFFFF`).
  - Semantic Status Accent:
    - Ready: Emerald (`#10B981`)
    - Break / Sholat: Sky Blue (`#0EA5E9`)
    - Toilet / Briefing: Indigo / Amber (`#F59E0B`)
    - Overdue / Alert: Crimson (`#EF4444`)
- **Typography & Hierarchy**: `Plus Jakarta Sans` for clean UI display and navigation, paired with `JetBrains Mono` / `tabular-nums` for timers and data tables.
- **Anti-Slop Restraint**: Zero floating capsule badges or fake badges; clean unboxed metadata with dot separators (`NIK 202601193 · Inbound · Shift 15 · SPV Pustaka Adam`).

---

### 3. Key Product Decisions & Trade-Offs

- **Decision 1: Pre-seeded SAGI 127 Database with Live Firestore Sync**
  - *Chosen Approach*: Embed the complete roster of 90+ staff members into an initial database seeding script that checks and populates Firestore upon first run, while maintaining reactive `onSnapshot` listeners for real-time status sync.
  - *Why*: Guarantees every single employee mentioned in the prompt is instantly searchable and playable out of the box with their designated credentials (`[firstname]127`), while changes sync live across different browser tabs and devices.
  - *Alternatives Considered*: Manual CSV upload was rejected because the user supplied the complete staff list directly in the prompt.
- **Decision 2: Configurable Multi-level AUX Thresholds**
  - *Chosen Approach*: Store default threshold limits (e.g. Toilet 10m, Rest 60m) in a Firestore `system_config` document, allowing Admins to adjust them dynamically without code changes.
  - *Why*: Contact center policies vary across peak hours; dynamic config avoids rigid hardcoding.
- **Decision 3: Non-blocking Audio Chime for Over-limit Alerts**
  - *Chosen Approach*: Browser Web Audio API synthesizer for short, pleasant alert chimes when a threshold is breached, with a mute toggle in the top bar.
  - *Why*: Audio provides instant situational awareness for supervisors without requiring constant eye contact with the screen.

---

### 4. Technical Architecture & Data Strategy

#### Architecture & Component Diagram

```
┌────────────────────────────────────────────────────────────────────────┐
│                        SAGI 127 Contact Center                         │
│                    AUX & Workforce Management App                      │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
           ┌────────────────────────┼────────────────────────┐
           ▼                        ▼                        ▼
┌──────────────────────┐ ┌──────────────────────┐ ┌──────────────────────┐
│     Agent View       │ │   Supervisor View    │ │      Admin View      │
│  - Active Status Bar │ │  - Live Floor Matrix │ │  - Staff Roster Mgt  │
│  - 1-Click AUX Dock  │ │  - Status Filters    │ │  - Shift & AUX Rules │
│  - Live Timer Clock  │ │  - Overdue Warnings  │ │  - Exportable Logs   │
│  - Personal Logbook  │ │  - Team KPI Metrics  │ │  - Audit History     │
└──────────┬───────────┘ └──────────┬───────────┘ └──────────┬───────────┘
           │                        │                        │
           └────────────────────────┼────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                   State Management & Realtime Sync                     │
│  - Auth Context (Role validation & Session state)                      │
│  - Realtime Firestore Listener (`onSnapshot` on `agent_status`)        │
│  - Live Audio Alert Synthesizer (Web Audio API)                        │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                     Firestore Collections / Schemas                    │
│  - `users`: Staff profile, NIK, role, division, shift, supervisor      │
│  - `agent_status`: Current state (ready, break, etc.), startedAt       │
│  - `aux_logs`: Historical session records (agentId, status, duration)  │
│  - `system_config`: AUX rules, thresholds, shift schedules             │
└────────────────────────────────────────────────────────────────────────┘
```

#### Data Model Entities

1. **User Profile (`users`)**:
   - `id`: string (e.g. `202601193`)
   - `nik`: string
   - `name`: string (e.g. `"Wahyu Astuti"`)
   - `username`: string (e.g. `"wahyu127"`)
   - `password`: string
   - `gender`: `"Pria"` | `"Wanita"`
   - `shiftNumber`: number (e.g. `15`)
   - `role`: `"Admin"` | `"SPV"` | `"Agent"`
   - `division`: `"Inbound"` | `"Outbound"` | `"Non Voice"` | `"PPID"` | `"QA"` | `"SME"` | `"IT"` | `"RTFM"` | `"Admin"` | `"Manager"`
   - `supervisorName`: string (e.g. `"Pustaka Adam"`)
   - `status`: `"active"` | `"inactive"`

2. **Real-time Status (`agent_status`)**:
   - `agentId`: string (references `users.id`)
   - `agentName`: string
   - `currentStatus`: `"READY"` | `"BREAK"` | `"TOILET"` | `"SHOLAT"` | `"BRIEFING"` | `"COACHING"` | `"ACW"` | `"OFFLINE"`
   - `statusStartedAt`: timestamp (ISO string / Firestore server timestamp)
   - `durationSeconds`: number (live calculated)
   - `isOverThreshold`: boolean
   - `updatedAt`: timestamp

3. **AUX Log Entry (`aux_logs`)**:
   - `id`: string
   - `agentId`: string
   - `agentName`: string
   - `status`: string
   - `startedAt`: string
   - `endedAt`: string
   - `durationMinutes`: number

4. **System Configuration (`system_config`)**:
   - `auxThresholds`: `{ BREAK: 60, TOILET: 10, SHOLAT: 20, BRIEFING: 30, COACHING: 45, ACW: 5 }`
   - `shifts`: predefined shift timing table (Shift 1 to Shift 16).

---

### Step-by-Step Implementation Sequence

1. **App Metadata & Package Setup**:
   - Update `metadata.json` with official name (`SAGI 127 - AUX & Agent Monitoring System`) and description.
   - Install required packages (e.g., `firebase`) if needed.
2. **Firebase Provisioning & Configuration**:
   - Call `show_aistudio_ui` / `rpc_action` to provision Firestore and Authentication according to the skill instructions.
   - Create `firebase-blueprint.json` and `firestore.rules` adhering to the ABAC zero-trust pattern.
3. **Core Data Store & Roster Seeding**:
   - Seed all 90+ staff records from the prompt with generated usernames (`[firstname]127`) and default passwords.
   - Implement real-time Firestore synchronization with offline/in-memory fallback for instant responsiveness.
4. **Agent Personal Terminal**:
   - Create interactive AUX button deck with high-contrast timer display and session log history.
5. **Supervisor Real-time Floor Control**:
   - Build live grid and tabular monitoring views with instant filters (by division, shift, and supervisor).
   - Implement audio alert synthesizer and threshold warning banners.
6. **Admin Suite**:
   - Build complete user management (search, role edit, password reset), configuration controls, and CSV export.
7. **Verification & Build**:
   - Run `compile_applet` and verify no TypeScript or lint errors.
