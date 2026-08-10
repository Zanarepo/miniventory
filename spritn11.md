# Sprint 1 PRD — Unified Inventory Schema, Intake & Restock Engine
**Module:** Miniventory | **Product:** Sellytics Inventory Platform
**Epic:** Dual-Mode Inventory Architecture (Serialized & Non-Serialized)

---

## 1. Objective
Establish a unified inventory data model that supports **Serialized (Unique)** and **Non-Serialized (Bulk)** items in the same schema, and ship the intake/restock workflows for both — including auditability, barcode integrity, and a dashboard experience that scales to thousands of SKUs without confusing the two modes.

---

## 2. User Stories

- **US1.1 — Dual Mode Selection:** As an inventory manager, when creating a product, I choose Serialized or Non-Serialized tracking so the system enforces the right data model from day one.
- **US1.2 — Non-Serialized Restock:** As an inventory manager, I scan a static barcode once and enter a quantity delta so stock updates instantly.
- **US1.3 — Serialized Restock:** As an inventory manager, I scan N new unique codes so available stock grows while sold history stays untouched.
- **US1.4 — Batch Restock Audit:** As an inventory manager, every restock event is logged with timestamp, operator, cost price, and batch size.
- **US1.5 (New) — Bulk Serial Import:** As an inventory manager receiving a large shipment (50+ units), I want to import serial numbers via CSV or paste-list instead of scanning one-by-one, so large intakes don't bottleneck at the register.
- **US1.6 (New) — Low Stock Alerting:** As an inventory manager, I want to set a reorder threshold per product so I'm notified before a line goes to zero.
- **US1.7 (New) — Restock Correction:** As an inventory manager, if I log a restock batch in error (wrong quantity, wrong cost price), I want to void that specific batch without corrupting the running stock total.

---

## 3. Functional Requirements

### A. Non-Serialized Product Flow (`is_serialized = false`)
1. Product record: name, category, unit price, cost price, single fixed barcode, numeric quantity, **reorder threshold (new)**.
2. Restock: scan/search barcode → enter delta → `quantity += delta` → write `RestockBatch` row.
3. Barcode is immutable regardless of stock movement.
4. **New:** if resulting quantity ≤ reorder threshold, flag product as `LOW_STOCK` for dashboard surfacing (Sprint 1) and future notification hooks.

### B. Serialized Product Flow (`is_serialized = true`)
1. Parent product created; child `ItemUnit` records hold `serial_barcode`, `status` (`AVAILABLE` / `SOLD` / `VOID`), `restock_batch_id`, `cost_price`.
2. Intake modal: continuous scanner mode, <50ms input delay, real-time duplicate check against **both active and sold** records (global uniqueness).
3. Restock: new units create new `ItemUnit` rows tied to a new `RestockBatch`; existing `SOLD` units are never touched.
4. **New — Bulk Import:** accept a CSV (`serial_barcode,cost_price`) or newline-paste list. System validates each row against the global uniqueness index before commit; duplicates and malformed codes are rejected row-by-row with a downloadable error report, not a full-batch failure.
5. **New — Barcode Checksum Validation:** on manual entry, validate EAN-13/UPC-A check digit where applicable and warn (not block) on non-standard formats, since some serials are internal, not retail barcodes.

### C. Restock Batch Integrity (New)
- Every batch (`RestockBatch`) is immutable once committed but can be **voided**: a void reverses the exact quantity/units it introduced (if the units are still `AVAILABLE`; a batch containing already-sold units cannot be fully voided and requires manager review — surfaced as a warning, not silently blocked).
- Void action requires a reason code (`Wrong Quantity`, `Wrong Cost Price`, `Duplicate Entry`, `Other`) and is itself logged.

---

## 4. UI/UX Requirements

- **Product Creation:** two large tap targets (not a toggle switch) — "Serialized · Unique Code Per Item" vs "Non-Serialized · Bulk Quantity" — each with a one-line example ("IMEI, Serial #" / "UPC, Barcode"), so the choice is legible without training.
- **Intake/Restock Modal:**
  - Live scan feed: each successful scan appends a row with a subtle slide-in + checkmark; duplicate/error scans flash red with the reason inline (no separate error modal for routine dupes).
  - Running counter fixed at the top: "Scanned: 5 · Duplicates blocked: 1".
  - **New:** "Paste/Import" tab alongside "Scan" tab for the bulk-import path (US1.5), with a preview table before commit.
- **Inventory Dashboard:**
  - Non-Serialized row: `Product | Barcode | Stock | [Low Stock badge if applicable]`.
  - Serialized row: `Product | Available | [Expand ▾]` → drawer with searchable/filterable serial list (`AVAILABLE` shown by default, toggle to view `SOLD`/`VOID`).
  - **New:** Low-stock rows visually pinned/sorted to top of dashboard or filterable via a "Low Stock" quick-filter chip.
- **Restock History Table:** paginated, filterable by product/date/operator; each row has a "Void" action gated by role permission, with the reason-code dropdown appearing inline on click (no page navigation).

---

## 5. Acceptance Criteria
- [ ] Product creation enforces mode selection before save; mode is immutable after first restock/sale event.
- [ ] Non-serialized quantity updates are atomic single-field writes; no child records created.
- [ ] Serialized uniqueness is enforced globally (active + sold + voided) at both scan-time and CSV-import time.
- [ ] CSV import commits valid rows and returns a per-row error report for invalid ones — never an all-or-nothing failure.
- [ ] Every restock (manual or imported) generates a `RestockBatch` record with timestamp, operator ID, cost price, and quantity/unit count.
- [ ] Voiding a batch reverses exactly the units/quantity it added, blocked (with explanation) if any unit in the batch is `SOLD`.
- [ ] Products at or below reorder threshold are flagged `LOW_STOCK` and visible via dashboard filter.
- [ ] Serialized dashboard drawer supports search-by-serial and status filtering without a full page reload.

---

## 6. Non-Functional Requirements
- Scan-to-confirmation latency: <50ms per unit under continuous mode.
- Uniqueness check must scale to 100k+ serial records without degrading scan latency (indexed lookup, not full table scan).
- CSV import supports at least 5,000 rows per file without timeout; processed in chunks with progress indicator.
- All restock/void actions are transactional — partial writes are not possible.

---

## 7. Dependencies
- Product/category schema must exist prior to Sprint 1.
- Role/permission system (manager vs. staff) needed for batch-void gating — if not yet built, void action is available to all users with an audit flag noting elevated-risk action.

---

## 8. Open Questions
- Does reorder threshold apply per-location, or globally, ahead of multi-location support?
- Should voided serialized units be permanently blocked from reuse, or eligible for re-entry after review?
- What's the retention policy for `VOID` status units on the dashboard (hide after N days)?


Question	Global Industry Standard	Miniventory Strategy
Reorder Thresholds	Location-specific reorder points with aggregated global purchasing.	Attach thresholds to location tables now to support multi-location expansion seamlessly.
Voided Serial Reuse	Eligible for reuse via review/quarantine workflows; full audit history retained.	Allow re-entry to AVAILABLE status with mandatory manager review note and immutable audit logs.
VOID Retention	Filtered from operational views; stored permanently; customizable date-range filters.	Hide from active POS view by default; set 30-day auto-hide threshold with dynamic user view controls.