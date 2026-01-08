# MG Asset Tracking — Scope & Workflow (v1.1)

_Last updated:_ 2025-10-20 Africa/Libreville

---

## 1) Project Overview

**Goal:** Department MG app to track **assets** (vehicles, equipment, etc.) and manage **warehouse stock** (consumables: pens, ink, paper…), with light approvals, real-time notifications, and a KPI dashboard.

**Stack decisions (scope-level):**

- Backend: Node.js (Express) + MongoDB
- Real-time + Events: Kafka, Socket.IO
- Auth/RBAC: username login, roles = `SUPER_ADMIN`, `MG_COS`, `MG_COB`, `MG_AGT`
- Observability: `/health` endpoints, logs, dashboard integration

---

## 2) Core Modules

1. **Assets** — lifecycle, maintenance, flags
2. **Warehouse (Stocks)** — consumables, stock levels, movements
3. **Notifications** — event-driven, TripWise-derived logic
4. **KPI Dashboard** — MG-wide operational insights
5. **Maintenance** — periodic service tracking

---

## 3) Roles & Permissions

| Role        | Description         | Key Capabilities                                               |
| ----------- | ------------------- | -------------------------------------------------------------- |
| MG_COS      | Chief of Service    | Full visibility, override powers, receives all critical alerts |
| MG_COB      | Chief of Bureau     | Supervises imports/exports, validates exceptions               |
| MG_AGT      | Agent / Storekeeper | Executes movements, manages assets and warehouse               |
| SUPER_ADMIN | Global Admin        | Cross-department system management                             |

---

## 4) Asset Workflow

- **Create / Update / Assign** assets
- **Check-out / Check-in** operations
- **Maintenance due / overdue** reminders
- **Flag missing / recovered** assets
- **Import / Export** (no multi-layer approvals needed)

### Event taxonomy

`asset.created`, `asset.updated`, `asset.assigned`, `asset.checkin`, `asset.checkout`,  
`asset.maintenance.due`, `asset.maintenance.overdue`,  
`asset.flag.missing`, `asset.flag.recovered`

---

## 5) Warehouse Workflow

**Objects:** `Article`, `StockMovement`, `InventorySession`

### Typical flows

**Import (receive):**

1. AGT records import; stock increases.
2. If below-min articles recover → emit `stock.replenished`.

**Export (issue):**

1. AGT records export to office/person; stock decreases.
2. Threshold checks → possible `stock.low` or `stock.critical`.

**Adjustment:**

- Records damage/loss/correction.
- Requires justification; triggers `stock.adjustment` (warning/critical).

**Inventory Count:**

- Cycle or full; count → auto adjustments; emits `stock.inventory.closed`.

---

## 6) Notifications Framework

**Delivery:** per-user (`u:{userId}`), per-role (`r:MG_COS` …), per-resource (`asset:{id}` …)

**Categories:** `asset`, `import`, `export`, `stock`, `maintenance`, `system`, `audit`  
**Severity:** `info`, `success`, `warning`, `error`, `critical`

**Warehouse-specific events:**

- `stock.import` → info
- `stock.export` → info
- `stock.low` → warning
- `stock.critical` → critical
- `stock.replenished` → success
- `stock.adjustment` → warning/critical
- `stock.inventory.closed` → info

---

## 7) Warehouse Policy & Alert Tuning

### Threshold levels

| Level         | Logic                              | Example trigger            | Severity | Recipients |
| ------------- | ---------------------------------- | -------------------------- | -------- | ---------- |
| **Critical**  | `currentStock <= 25% of minStock`  | Paper: min=100, current=20 | Critical | COS, COB   |
| **Low**       | `currentStock <= minStock`         | Ink: min=50, current=40    | Warning  | COB        |
| **Recovered** | Stock rises above `minStock` again | After import               | Success  | COB        |
| **Stable**    | Normal state                       | –                          | –        | –          |

### Digest Cadence

| Digest            | Frequency           | Content                                                           | Recipients |
| :---------------- | :------------------ | :---------------------------------------------------------------- | :--------- |
| **Daily Digest**  | every morning 08:00 | Imports, Exports, Adjustments summary + current low/critical list | COB        |
| **Weekly Digest** | every Monday        | Aggregated stock & maintenance KPIs + anomalies                   | COS, COB   |

### Override & anomaly handling

| Policy                          | Description                                                                                |
| :------------------------------ | :----------------------------------------------------------------------------------------- |
| **Negative stock prevention**   | Default block; override allowed once per article/day with justification.                   |
| **Repetitive loss detection**   | If same article sees ≥2 losses within 7 days → system flags anomaly `stock.repeated.loss`. |
| **Rapid depletion alert**       | If an article drops >40% of its stock within 48h → auto-warning.                           |
| **High-value adjustment guard** | If `price × qty > threshold` (e.g., 100,000 FCFA) → escalate to COS (critical).            |
| **Audit logging**               | Each override, loss, or negative adjustment gets an audit trail + linked log entry.        |

---

## 8) KPI Dashboard Hooks

- Assets: totals, active/missing, maintenance due
- Warehouse: imports/exports, below-min count, top used items, adjustments by reason
- Notifications: unread criticals
- Role-based data scope (COS/COB full, AGT own)

---

## 9) Governance & Auditing

- Every movement logged with timestamp + actor + delta.
- Justifications mandatory for adjustments/overrides.
- Scheduled digests keep COS/COB informed.
- Health monitoring integrated with ServiceStatusDashboard.

---

## 10) Timeline (progress summary)

| Step                                   | Status   |
| -------------------------------------- | -------- |
| Codes                                  | ✅       |
| RBAC                                   | ✅       |
| ERD                                    | ✅       |
| Import/Export + Mongo                  | ✅       |
| Notifications Mapping (TripWise reuse) | ✅       |
| Warehouse Workflow & Policies          | ✅       |
| KPI Dashboard                          | 🔜 Next  |
| Maintenance Scheduling                 | ⏳ Later |

---

## 11) Next Action

Begin defining **KPI metrics and aggregation logic**, integrating both asset and warehouse data streams.

---

_Document prepared via ChatGPT workspace → synced to Anytype._
