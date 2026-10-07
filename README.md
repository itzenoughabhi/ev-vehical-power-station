# EVNEXUS — Real-Time EV Charging Network Digital Twin

**EVNEXUS** is an enterprise-grade 3D digital-twin platform for managing, monitoring, and optimizing an electric vehicle charging infrastructure in real time.

It is built as a unified reactive system: the authoritative backend state machine, real-time WebSocket telemetry, PostgreSQL/Prisma data models, responsive dashboard controls, and the 3D urban digital-twin environment operate in continuous synchronization.

---

## System Architecture

```text
DATABASE (PostgreSQL + Prisma)
             ↕
BACKEND ENGINE (Node.js / Express / Socket.IO / State Machine)
             ↕  (WebSockets & REST APIs)
FRONTEND DASHBOARD (Next.js / Zustand / Tailwind CSS)
             ↕
3D DIGITAL TWIN (Three.js / React Three Fiber / @react-three/drei)
```

---

## Key Features

### 1. Live 3D Urban Digital Twin
- **Fictional High-Tech Urban District**: Modular 3D environment including road avenues, illuminated intersections, commercial skyscrapers with glowing window matrices, streetlights, and landscaping.
- **4 Regional Charging Hubs**:
  - `A102` (Metro Central Hub) — Downtown Core
  - `B104` (North Tech Park) — Silicon Heights
  - `C201` (West Commercial Plaza) — West Quarter
  - `D305` (South Transit Interchange) — Port Terminal
- **Detailed Charging Infrastructure**: Cantilevered solar canopy with PV cell arrays, Megapack grid battery storage & transformer unit, marked parking bays, and 4 DC Fast Charging pedestals per station.
- **Visual Pedestal States**:
  - `AVAILABLE`: Glowing emerald/cyan LED bar with subtle breathing pulse.
  - `CHARGING`: Pulsing electric beam connected to the EV with animated power flow.
  - `OCCUPIED`: Solid electric blue.
  - `FAULT`: Pulsing crimson alert light with 3D rotating hazard diamond and warning beacon.
  - `MAINTENANCE`: Amber hazard indicator.
  - `OFFLINE`: Muted slate.
- **Interactive 3D Objects**: Clicking any Station, Charger, Vehicle, or Incident smoothly animates the camera into close focus and opens its dedicated inspector drawer. "Reset Camera" returns to the cinematic overview.

### 2. Full EV Fleet Simulation & Lifecycle
- **Simulated Fleet**: CyberSedan, Apex SUV, HyperCoupe, and FleetVan models.
- **Authoritative Lifecycle State Machine**:
  ```text
  EN_ROUTE → ARRIVING → QUEUE → CHARGER_ASSIGNED → CHARGING → COMPLETED → DEPARTING → LEFT_NETWORK
  ```
- **Physical Road Waypoint Traversal**: Vehicles calculate smooth position and orientation along urban roads and station access spurs.
- **Real-Time Battery Telemetry**: Increments progressively during active charging (e.g. 18% → 85%) with delivered kWh tracked dynamically.
- **Floating 3D HUD Badges**: Real-time vehicle code, battery percentage gauge (color-coded red/amber/green), and charging icons.

### 3. Live Command-Center Dashboard
- **Top KPI Cards**:
  - Active Stations
  - Available Chargers
  - Vehicles Charging
  - Waiting Vehicles
  - Active Faults
  - Network Load (MW / kW)
- **Live Events Feed**: Timestamped stream of operational logs with severity tags (`INFO`, `WARNING`, `CRITICAL`, `SUCCESS`).
- **2D Network Topology**: Topological grid map displaying station load %, queues, and node health with click-to-focus camera triggers.
- **Energy & Grid Dispatch Panel**: Dynamic SVG power curve, peak feeder tracking, solar offset generation, and overload threshold monitoring (`<70%` Normal, `70-85%` High, `85-95%` Critical, `>95%` Overload).

### 4. Queue Optimization & AI Recommendation Engine
- Automatically detects bottlenecked stations with long queues or hardware faults.
- Compares alternate facilities using multi-variable scoring:
  $$\text{Score} = f(\text{Distance}, \text{Wait Time}, \text{Bay Availability}, \text{Grid Load})$$
- Generates proactive operator recommendation banner:
  - Example: *EV-221 approaching congested Station A102 (Wait: 31m). Recommended: Station B104 (Wait: 6m). Potential saving: 25 minutes.*
  - Operator can **[Accept Recommendation]** or **[Dismiss]**.
  - Accepting triggers an immediate real-time waypoint recalculation and reroutes the EV in 3D.

### 5. Interactive Demo / Incident Simulation Panel
Toolbar allowing operators, interviewers, or evaluators to test dynamic system behavior on demand:
- **[Spawn EV]**: Injects a low-battery vehicle onto the network.
- **[Trigger Fault]**: Simulates an inverter or thermal sensor trip on a charger.
- **[Surge Load]**: Drives station power draw to test threshold warnings.
- **[Create Queue]**: Stacks incoming vehicles to demonstrate queue handling.
- **[Finish Charge]**: Instantly tops off an active session to test departure.
- **[Reset Twin]**: Restores baseline operational state.
- **Speed Controls**: `Pause`, `1x`, `2x`, `4x`.

### 6. AI Assistant Architecture (Copilot)
- Conversational mission-control interface answering queries on:
  - *"What's happening right now?"*
  - *"Which station is most congested?"*
  - *"Why is Station A102 overloaded?"*
  - *"Where should EV-221 charge?"*
  - *"Which chargers have faults?"*
  - *"What happens if 20 more EVs arrive?"*
- Built with a clean service contract ready for direct connection to an external Python / FastAPI AI microservice.

---

## Getting Started

### Prerequisites
- Node.js 18+ (Tested on v24.9.0)
- npm 9+
- PostgreSQL (Optional: system automatically operates with built-in high-performance operational memory if PostgreSQL credentials are not yet supplied)

### Running the Application

1. **Start both Backend & Frontend concurrently:**
   ```bash
   npm run dev
   ```

2. **Or start services individually:**
   - **Backend:**
     ```bash
     npm run dev:backend
     ```
     Runs at `http://localhost:4000` (REST & WebSockets).
   - **Frontend:**
     ```bash
     npm run dev:frontend
     ```
     Runs at `http://localhost:3000`.

3. **Open in Browser:**
   Navigate to [http://localhost:3000](http://localhost:3000).

---

## Database Configuration (Prisma + PostgreSQL)

The Prisma schema is located at `database/prisma/schema.prisma`.

To connect to your local PostgreSQL instance:
1. Update `backend/.env`:
   ```env
   DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/evnexus?schema=public"
   ```
2. Run database migration / schema push:
   ```bash
   npm run prisma:generate
   cd backend && npx prisma db push --schema=../database/prisma/schema.prisma
   ```

---

## REST API Reference

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/health` | Server & DB health status |
| `GET` | `/stations` | All 4 charging hubs with chargers & queues |
| `GET` | `/stations/:id` | Detailed station telemetry |
| `GET` | `/chargers` | All 16 charging pedestals |
| `GET` | `/vehicles` | Active EV fleet telemetry & positions |
| `GET` | `/events` | Recent event logs stream |
| `GET` | `/incidents` | Active hardware & grid alerts |
| `GET` | `/energy` | Power metrics & history curve |
| `GET` | `/kpis` | Aggregated network KPIs |
| `POST` | `/simulation/vehicle` | Spawn new EV |
| `POST` | `/simulation/fault` | Trigger charger fault |
| `POST` | `/simulation/repair` | Repair charger bay |
| `POST` | `/simulation/load` | Surge station load |
| `POST` | `/simulation/queue` | Force station queue |
| `POST` | `/simulation/speed` | Set simulation speed (0 - 4x) |
| `POST` | `/simulation/reset` | Reset simulation state |
| `POST` | `/ai/query` | Submit natural language query to AI copilot |
