# Sprint 3 PRD — Order Finalization, Dual-Mode Deductions & Audit Stock Logging
**Module:** Miniventory | **Product:** Sellytics Inventory Platform
**Epic:** Dual-Mode Inventory Architecture (Serialized & Non-Serialized)

---

## 1. Objective
Guarantee that checkout finalization is atomic, race-safe across concurrent terminals, and produces a receipt and stock log that accurately reflect what actually left the shelf — for both bulk and serialized inventory.

---

## 2. User Stories

- **US3.1:** As a store clerk, checkout deducts bulk quantities and sets serialized units to `SOLD` atomically, preventing discrepancies across terminals.
- **US3.2:** As a customer, my receipt shows bulk items as single lines and serialized items with their exact serial numbers.
- **US3.3 (New) — Overselling Prevention:** As a store owner running multiple terminals, I want the system to prevent two terminals from selling the same last unit or the same serialized item simultaneously.
- **US3.4 (New) — Checkout Idempotency:** As a cashier, if I double-tap "Complete Sale" or the network retries a request, I want the system to guarantee only one sale is recorded, not two.
- **US3.5 (New) — Partial Failure Handling:** As a store owner, if a sale fails mid-transaction (e.g., a unit was sold by another terminal a second earlier), I want the cashier told exactly which line failed, not a generic error, so it can be resolved without restarting the whole cart.

---

## 3. Execution Logic on Sale Finalization

1. **Pre-commit Validation (New):** Immediately before commit, re-validate every line against current DB state (not just cart-load-time state):
   - Non-serialized: `quantity >= requested_qty`.
   - Serialized: unit status is still `AVAILABLE`.
   - If any line fails, abort the whole transaction (no partial sale) and return a **line-level** failure report to the client.
2. **Atomic Commit:**
   - Non-serialized: `UPDATE Product SET quantity = quantity - N WHERE id = product_id AND quantity >= N` (conditional update as a concurrency guard, not just an application-level check).
   - Serialized: `UPDATE ItemUnit SET status = 'SOLD', sale_id = X WHERE serial_barcode IN (...) AND status = 'AVAILABLE'`.
   - Both run inside a single DB transaction; if either statement affects fewer rows than expected, the transaction rolls back entirely.
3. **Idempotency (New):** Client generates a UUID `idempotency_key` per checkout attempt at cart-lock time. Server persists this key with the resulting sale; a retried request with the same key returns the original sale result instead of creating a duplicate.
4. **Post-commit:** Write `StockHistory` entries (`BULK_DEDUCTION` / `SERIAL_SOLD`), generate receipt payload, release any reservation holds (if reservation model is adopted — see Open Questions).

---

## 4. UI/UX Requirements

- **Checkout Confirmation Screen:** itemized breakdown (bulk lines with qty × price, serialized lines with serials listed) shown before final commit, so the cashier confirms what's about to leave the shelf — this doubles as receipt preview.
- **Failure State (New):** if pre-commit validation fails, the checkout screen highlights *only* the failing line(s) in red with a specific reason ("Only 2 left — you scanned 3" / "SN-1004 was just sold at Register 2") and offers one-tap "Adjust quantity" or "Remove item" without discarding the rest of the cart.
- **Multi-Terminal Sync Indicator (New):** subtle live badge on serialized product rows in the cart ("Last verified 2s ago") to set expectations that stock is checked live, not just cached from scan time.
- **Receipt Layout:** unchanged from source spec — bulk lines as single rows, serialized lines with `S/N:` list beneath; **New:** overridden-sale lines (from Sprint 2) carry a small manager-approval marker on the receipt for audit trail continuity.

---

## 5. Acceptance Criteria
- [ ] Sale finalization runs inside a single isolated DB transaction; any failed line aborts the entire commit.
- [ ] Concurrent checkout attempts on the same last unit resolve so exactly one succeeds and the other receives a specific, actionable failure — never a silent oversell.
- [ ] Duplicate checkout submissions (double-tap, network retry) with the same idempotency key never create a second sale record.
- [ ] Non-serialized stock decrements exactly by purchased quantity; serialized units transition to `SOLD` and link to the correct `sale_id`.
- [ ] Receipt correctly separates bulk vs. serialized formatting, including any manager-override markers carried from Sprint 2.
- [ ] `StockHistory` log records deduction type, quantity/unit(s), sale ID, and timestamp for every completed sale.

---

## 6. Non-Functional Requirements
- Checkout commit (validation + write + log) completes in <300ms under normal load for carts up to 50 line items.
- Conditional updates (`WHERE quantity >= N` / `WHERE status = 'AVAILABLE'`) must be used for all deduction writes — no read-then-write pattern that's vulnerable to race conditions.
- Idempotency keys retained for at least 24 hours to cover retry windows on flaky connections.

---

## 7. Dependencies
- Sprint 1 schema (Product, ItemUnit).
- Sprint 2 cart state (line items, override flags) as checkout input.
- Transactional DB support for conditional/atomic updates.

---

## 8. Open Questions
- Should the system introduce a short-lived **reservation/hold** on scanned items (e.g., 2-minute soft-lock) to reduce failed checkouts at the pre-commit stage, rather than relying solely on the atomic conditional update at commit time?
- Do we need split-payment or partial-refund-mid-transaction support in this sprint, or is that explicitly deferred?
- Should receipts support email/PDF delivery in this sprint, or is print-only in scope?