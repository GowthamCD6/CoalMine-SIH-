# CoalMin Subterranean Mobile Terminal

> **Next-Generation Underground Miner Safety, Environmental Telemetry & DGMS Compliance Mobile System**

The **CoalMin Mobile Terminal** is a specialized, offline-first mobile application engineered specifically for hazardous mining operations, underground coal extraction pits, and surface processing plants. Designed to operate in harsh, subterranean environments where standard cellular connectivity is nonexistent, the app provides real-time miner protection, emergency evacuation guidance, gas hazard detection, and statutory DGMS regulatory workflows.

---

## High-Level System Architecture & Operational Context

In modern coal mining operations, field personnel (Miners, Shot-firers, Sirdars, Overmen, Safety Officers, and Mine Managers) need continuous safety coverage. The mobile app acts as an intrinsically safe digital companion paired with wearable sensors, pithead BLE/RFID beacons, and subterranean mesh gateways.

```
       [ Surface Control Room & TiDB Cloud Backend ]
                           │
                 (Optical Fiber Shaft Link)
                           │
       [ Subterranean Mesh Gateways & BLE Beacons ]
                           │  (Local RF / Offline Mesh)
            ┌──────────────┴──────────────┐
            ▼                             ▼
   [ Miner Mobile Unit 1 ]       [ Miner Mobile Unit 2 ]
   • Tactile SOS Panic Beacon    • Continuous Gas Telemetry
   • AI Hazard Camera            • DGMS Form B Muster Roll
   • Offline SQLite Storage      • Egress Escape Navigation
```

---

## Core Functions & Field Capabilities

### 1. Tactile SOS Panic & Remote Evacuation Dispatch
* **One-Tap Emergency Distress Beacon**: Miners in distress (cave-in, gas release, entrapped machinery) can trigger an instantaneous high-priority SOS distress beacon with a tactile slider or physical volume button overrides.
* **Accidental Trigger Safeguard**: Includes a 3-second tactile cancel countdown to prevent false alarms during heavy physical labor.
* **Acoustic Siren & Strobe Beacon**: Subterranean shafts are pitch-black; upon alarm activation, the app commands the device's LED flash into a rapid strobe pattern accompanied by an oscillating high-decibel evacuation siren and vibration feedback.
* **Remote Targeted Evacuation**: When surface command issues an evacuation broadcast for specific mine sections (e.g., *“Shaft 4 Incline”*), underground miners in that sector receive instant pop-up alarms detailing the hazard type and recommended exit route.
* **Step-by-Step Escape Egress & Heading**: Provides directional escape headings and distance estimation pointing miners toward the nearest safe air shaft or escape hoist, accounting for ventilation curtain directions.

---

### 2. Real-Time Underground Atmospheric & Gas Telemetry
* **Continuous Multi-Gas Monitoring**: Live readings for critical subterranean gases:
  * **Methane ($CH_4$)**: Explosive lower explosive limit (LEL) monitoring.
  * **Carbon Monoxide ($CO$)**: Spontaneous combustion and afterdamp detection.
  * **Oxygen ($O_2$)**: Hypoxia and asphyxiation hazard alerts (< 19.5% threshold).
  * **Hydrogen Sulfide ($H_2S$) & Nitrogen Oxides ($NO_x$)**: Toxic fume tracking post-blasting.
* **Dynamic Danger Zones**: Visual color-coded cards (Normal $\rightarrow$ Warning $\rightarrow$ Danger) that alert miners before hazardous gas concentrations reach statutory evacuation thresholds.
* **Audible Speech Synthesizer**: Text-to-speech engine speaks out critical gas surges into miner headsets so hands remain free for machinery operation.

---

### 3. AI Hazard Camera & Geotagged Evidence Documentation
* **In-Pit Photographic Capture**: Enables pit supervisors and safety inspectors to capture photographic evidence of workplace hazards (e.g., roof fracturing, sidewall spalling, water ponding, unguarded conveyor pulleys).
* **AI Computer Vision Tagging**: Automatically classifies the image into standardized risk categories and assigns an initial hazard severity rating.
* **Automated Spatial Metadata**: Tags every photo with the exact underground sector, mine seam level, heading number, timestamp, and reporting supervisor's biometric ID.
* **Instant Incident Dispatch**: Submits reports directly to surface safety controllers for immediate issuance of work-stoppage orders or corrective maintenance tickets.

---

### 4. Electronic Muster Roll & Subterranean Headcount (DGMS Form B)
* **Real-Time Portal In/Out Logging**: Replaces vulnerable paper muster books with cryptographic digital check-in/check-out at the pit mouth.
* **Underground Personnel Tracker**: Surface command and emergency rescue teams can view the exact count of workers currently inside each subterranean district.
* **Missing Miner Locator**: In the event of an evacuation or strata collapse, the app cross-references RFID checkpoints and beacon pings to display an immediate list of unaccounted-for miners and their last-known coordinates.

---

### 5. Statutory DGMS Incident & Injury Reporting (Form J)
* **Standardized Regulatory Filing**: Built-in DGMS (Directorate General of Mines Safety) Form J template for recording mine accidents, injuries, and dangerous occurrences.
* **Structured Accident Triage**:
  * Injury severity (Fatal, Serious Bodily Injury, Reportable Minor Injury).
  * Mechanism of accident (Roof fall, machinery entanglement, inundation, runaway haulage).
  * Medical evacuation status, hospital referral notes, and eyewitness declarations.
* **Statutory PDF Export**: Compiles completed reports into government-compliant formats ready for DGMS safety committee hearings.

---

### 6. HEMM & Explosives Magazine Operations
* **Heavy Earth Moving Machinery (HEMM) Pre-Start Checks**: Operators conduct digital pre-use checklists (brakes, steering, lights, fire extinguishers) for Dumpers, Excavators, Dozers, and Loaders before commencing shifts.
* **Explosive Magazine Requisitions**: Tracks issuance of permitted explosives (emulsions, ANFO) and electronic detonators with shot-firer code authorization.
* **Pre-Blast Evacuation Perimeter**: Shot-firers confirm blast zones are cleared by verifying that all RFID-tracked personnel have moved beyond the designated safety radius prior to firing.

---

### 7. Shift Safety Inspections & Daily Overman Audits
* **Standard Operating Procedure (SOP) Checklists**: Daily shift inspections covering:
  * Strata control & roof bolting load-cell inspections.
  * Ventilation auxiliary fans and brattice cloth integrity.
  * Conveyor belt alignment, fire suppressors, and stone dusting levels.
* **Ticket Lifecycle Tracking**: Safety findings create auditable action items that require supervisor sign-off and photo proof of rectification before closure.

---

### 8. Digital RFID Pass & Geofenced Clearance
* **Miner Smart ID Badge**: Encrypted digital credentials displaying employee code, approved certifications (Gas Testing, First Aid, Blaster’s Certificate), and assigned shift rosters.
* **Cryptographic QR Clearances**: Visual gate clearance for entering restricted areas, explosive storage magazines, or electrical substations.
* **NFC / BLE Beacon Handshake**: Auto-detects entry into danger zones and issues audio warnings if the miner lacks specialized clearance.

---

### 9. Optical Character Recognition (OCR) Logbook Digitizer
* **Paper to Cloud Bridge**: Mines with legacy paper manifests can scan physical log sheets, equipment inspection cards, and weighbridge receipts with the device camera.
* **On-Device Text Parsing**: Extracts shift tallies, fuel readings, and operator notes, converting raw physical records into structured digital data synced to the central database.

---

### 10. Underground Offline-First Architecture & Store-and-Forward Mesh
* **Local High-Performance SQLite Cache**: Full offline capability; users can create incident reports, check rosters, complete inspections, and trigger alerts without internet connectivity.
* **Intelligent Store-and-Forward Queue**: Transactions are cryptographically signed, queued locally, and synced the instant the device establishes contact with a shaft Wi-Fi node or surface terminal.
* **Conflict Resolution**: Incorporates distributed timestamps to ensure reports from multiple shifts merge cleanly without data overwrites.

---

### 11. Miner Well-being & Heat-Stress Monitoring
* **Environmental Heat-Stress Index**: Calculates Wet-Bulb Globe Temperature (WBGT) and warns miners to hydrate and rotate shifts when deep shafts exceed safe thermal indices.
* **Continuous Working Hour Safeguards**: Enforces statutory rest periods and alerts shift supervisors if miners exceed consecutive hours underground.

---

### 12. Dynamic Shift Handover & Role Delegation
* **Supervisor Field Delegation**: Allows Overmen and Safety Officers to securely delegate responsibilities (e.g., during leave or emergency rotation) to certified deputies with timestamped audit records.
* **Quick-Switch Demo Profiles**: Built-in profile switching for field simulations, multi-role training, and auditor walkthroughs.

---

## Typical Operational Workflows

### Shift Ingress & Pre-Shift Safety Workflow
```
[ Miner Enters Pithead ]
       │
       ▼
[ RFID / QR Pass Scan ] ──► (Validates Medical & Gas-Testing Clearance)
       │
       ▼
[ Electronic Form B Muster Check-in ] ──► (Logged to TiDB Attendance Table)
       │
       ▼
[ Shift Tool & HEMM Pre-Start Audit ] ──► (Brakes, Lights, Siren Tested)
       │
       ▼
[ Descent into Underground District ]
```

### Emergency Evacuation & Rescue Workflow
```
[ Hazard Triggered (Gas Spike / Roof Sag / Surface Command Order) ]
       │
       ▼
[ Audible Siren + LED Strobe + Haptic Alarm Fired on Miner Mobile Units ]
       │
       ▼
[ Escape Navigation Activated ] ──► (Points toward nearest intake air shaft)
       │
       ▼
[ Real-Time Muster Reconciliation ] ──► (Identifies missing workers at portal)
       │
       ▼
[ Search & Rescue Coordination ] ──► (Last beacon coordinates sent to Rescue Team)
```

### Underground Hazard Remediation Workflow
```
[ Miner Detects Sidewall Spalling / Gas Leak ]
       │
       ▼
[ Opens Hazard Camera in Mobile App ]
       │
       ▼
[ Takes Photo + Voice Tagging + Auto Sector Metadata ]
       │
       ▼
[ Queued to Offline SQLite Storage (If disconnected underground) ]
       │
       ▼
[ Auto-Synced to Surface Control Room via Mesh Gateways ]
       │
       ▼
[ Surface Safety Officer Reviews & Dispatches Remediation Team ]
```

---

## Summary Matrix of Field Screens

| Screen / Feature | Primary Persona | Key Functions & Deliverables |
| :--- | :--- | :--- |
| **Dashboard** | All Personnel | Real-time shift status, quick-action emergency trigger, sector density summary, pending inspection alerts. |
| **SOS Panic** | Underground Miners | High-decibel siren, LED strobe, countdown cancel, egress escape compass, live distress beacon broadcasting. |
| **Gas Monitor** | Mining Engineers, Sirdars | Multi-gas telemetry ($CH_4, CO, O_2, H_2S$), threshold color indicators, speech synthesis alerts, calibration logs. |
| **Hazard Cam** | Safety Officers, Miners | Camera evidence capture, AI hazard classification, geotagged spatial coordinates, risk priority assignment. |
| **Muster Roll** | Shift Supervisors, HR | Biometric/RFID check-in, real-time underground headcount, missing miner reconciliation during disasters. |
| **Form J** | Safety Officers | Statutory DGMS accident documentation, injury severity tracking, witness statements, regulatory PDF export. |
| **HEMM & Explosives** | Machinery Operators, Blasters | Pre-start equipment inspections, explosive magazine issuance logs, blast perimeter clearance validation. |
| **Inspections** | Overmen, Safety Inspectors | Digital shift checklists for strata control, ventilation curtains, water sumps, conveyor belts, corrective ticketing. |
| **RFID Pass** | All Employees | Encrypted miner smart badge, QR clearances for blasting zones, gate reader emulation. |
| **OCR Scanner** | Inventory & Clerical Staff | Document camera scanner, automatic optical character extraction of equipment manifests and paper tickets. |
| **Offline Sync** | All Personnel | Store-and-forward queue manager, SQLite sync state, beacon network strength monitor. |
| **Wellbeing** | All Personnel | Heat-stress index calculation, fatigue limits, shift hydration alerts. |
| **Delegation** | Managers, Overmen | Time-bound supervisor authority delegation, cryptographic audit signatures, multi-tier role switcher. |
