# MG Asset Tracking — Scope & Workflow (v1.0)
*Last updated:* 2025-10-20 12:37:15 WAT

## 1) Project Overview
**Goal:** Department MG app to track **assets** (vehicles, equipment, etc.) and manage **warehouse stock** (consumables: pens, ink, paper…), with light in‑dept approvals, real‑time notifications, and a KPI dashboard.

**Stack decisions (scope-level):**
- **Backend:** Node.js (Express), **MongoDB** (chosen for flexible, evolving schema + many-to-many patterns).
- **Real-time + Events:** Kafka for domain events, Socket.IO for in‑app notifications.
- **Auth/RBAC:** Roles = `SUPER_ADMIN`, `MG_COS`, `MG_COB`, `MG_AGT`; username‑based login.
- **Observability:** `/health` per service; logs + (later) metrics.

## 2) Core Modules
- **Assets:** lifecycle (create, update, assign, check‑in/out, maintenance, flags: missing/recovered).
- **Warehouse (Stocks):** articles (code, label, unit, minStock, currentStock, location), stock movements (import/export/adjustment), inventory counts.
- **Maintenance:** due/overdue tracking (later detail).
- **Notifications:** event‑driven alerts (TripWise mapping adapted to MG).
- **KPI Dashboard:** overview cards, trends, leaderboards, stock watchlist.

## 3) Roles & Permissions (high level)
- **MG_COS:** full visibility and overrides; gets critical alerts.
- **MG_COB:** supervises, validates exceptions; gets warnings/infos.
- **MG_AGT:** performs asset ops and warehouse ops (imports/exports/adjustments, counts).
- **SUPER_ADMIN:** global admin (cross‑dept if needed).

## 4) Asset Workflow (summary)
- **Create/Update/Assign**
- **Check‑Out / Check‑In**
- **Maintenance Due/Overdue**
- **Flags:** missing / recovered
- **Import/Export** (for assets or related accessories) — *no heavy approvals in‑dept*

**Key events (examples):**
- `asset.created`, `asset.updated`, `asset.assigned`, `asset.checkin`, `asset.checkout`, `asset.maintenance.due|overdue`, `asset.flag.missing|recovered`

## 5) Warehouse Workflow (summary)
**Objects:** `Article` (consumable), `StockMovement` (import/export/adjustment), `InventorySession` (cycle/full).

**Happy paths:**
- **Import:** receive supply → stock++ → `stock.import`; if threshold recovered → `stock.replenished`.
- **Export:** issue to office/person → stock-- → threshold checks → `stock.low` / `stock.critical`.
- **Adjustment:** damage/loss/correction (justified) → stock +/- → `stock.adjustment` (warning/critical if repeated/large).
- **Inventory Count:** schedule → count → reconcile deltas (auto‑adjustments) → `stock.inventory.closed`.

**Rules & safeguards:**
- Default: **no negative stock** (override requires justification + audit).
- Base unit storage; pack conversion helper (e.g., 1 box = 10 pcs).
- Cancelling a movement (same day) auto‑reverses stock; restricted to COB/COS.

## 6) Notifications (mapping & delivery)
**Delivery rooms:** per‑user (`u:{userId}`), per‑role (`r:MG_COS`, `r:MG_COB`, `r:MG_AGT`), optional per‑resource (`asset:{id}`, `import:{id}`, `export:{id}`).

**Categories:** `asset`, `import`, `export`, `stock`, `maintenance`, `compliance`, `system`, `audit`.

**Severities:** `info`, `success`, `warning`, `error`, `critical` → UI badges & sticky rules.

**Stock-specific events:**
- `stock.import` (info), `stock.export` (info),
- `stock.low` (warning), `stock.critical` (critical),
- `stock.replenished` (success),
- `stock.adjustment` (warning/critical),
- `stock.inventory.closed` (info).

**Idempotency & scale:**
- `eventId` on every message; consumer dedup.
- Per‑user read/delete state via **NotificationUser pivot** (not arrays).
- Optional Redis adapter for Socket.IO when horizontally scaling.

## 7) Data (conceptual collections)
- `assets`, `articles`, `stock_movements`, `inventory_sessions`,
- `imports`, `exports` (asset flows), `notifications`, `notification_users`, `logs`, `users`.

## 8) KPI Dashboard (concept)
**Cards:** total assets, active assets, imports (period), exports (period), exceptions, missing assets, maintenance due/overdue, unread critical (per viewer).
**Charts:** imports vs exports over time; exceptions by type; stock levels by category; maintenance timeline.
**Tables:** top agents (imports+exports), recent critical events, expiring documents; warehouse watchlist (below min).

**Filters:** Time (Today/7d/30d/Quarter/Custom), Dept=MG, optional Bureau; role-aware visibility (AGT vs COS/COB).

## 9) Governance & Auditing
- Every operation logged (who/when/what).
- Justification required for adjustments & overrides.
- Daily/weekly digests for COB/COS (stock movements + below-min list).
- Health checks wired to ServiceStatusDashboard.

## 10) Current Timeline (one‑task focus)
- **Codes** — ✅ Done
- **RBAC** — ✅ Done
- **ERD** — ✅ Done
- **Import/Export + Mongo** — ✅ Done
- **Notifications Mapping (TripWise reuse)** — ✅ Completed (adapted to MG)
- **KPI Dashboard** — 🔜 Upcoming (after policy tuning for warehouse)
- **Warehouse Policy Tuning** — 🔜 Next (threshold bands, digests, overrides)

## 11) Next Immediate Step
Lock **Warehouse policy & alerts** (threshold bands, digest cadence, anomaly heuristics). Then start KPI definitions wired to those policies.

