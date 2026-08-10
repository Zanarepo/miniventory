# Sprint 4 PRD — Unit-Level & Bulk Returns, Financial Restorations & Business Report Sync
**Module:** Miniventory | **Product:** Sellytics Inventory Platform
**Epic:** Dual-Mode Inventory Architecture (Serialized & Non-Serialized)

---

## 1. Objective
Handle returns for both inventory modes accurately — restoring stock, reversing financials, and closing the loop with Business Reports in real time — while guarding against return fraud and re-selling damaged goods as new.

---

## 2. User Stories

- **US4.1:** As a cashier, I process bulk returns by quantity and serialized returns by scanning the exact unit.
- **US4.2:** As a store owner, both return types restore stock and correct revenue/margin metrics accurately.
- **US4.3 (New) — Return Reason & Condition Tracking:** As a cashier, I want to capture why an item is being returned and its physical condition, so damaged units don't silently re-enter sellable stock.
- **US4.4 (New) — Return Window Enforcement:** As a store owner, I want to configure a return policy window (e.g., 14/30 days) so returns outside policy require explicit manager approval rather than processing automatically.
- **US4.5 (New) — Exchange in One Flow:** As a cashier, I want to process a return and a new sale together as a linked exchange, so the customer doesn't need two separate transactions and the register stays balanced.

---

## 3. Functional Return Matrix

| Feature | Non-Serialized Return | Serialized Return |
|---|---|---|
| Lookup | Select line item from original Receipt ID | Scan unit barcode or select from Receipt ID |
| Validation | Returned Qty ≤ Purchased Qty | Barcode status is `SOLD` and linked to that transaction |
| Stock Adjustment | `quantity += N` | `status: SOLD → AVAILABLE`, `available_stock += 1` |
| Financial Reversal | Refund `Qty × Unit Price`, reverse revenue/profit | Refund `Unit Price`, reverse revenue/profit for that unit |
| **Condition (New)** | N/A (bulk assumed fungible) | Cashier tags `Resellable` or `Damaged/Defective`; `Damaged` routes to `status = QUARANTINE` instead of `AVAILABLE`, excluded from sellable stock until manually cleared |
| **Reason Code (New)** | Required dropdown: Wrong Item / Changed Mind / Defective / Other | Same, applies per-unit |
| **Policy Check (New)** | Flag if return date > policy window; require manager approval to proceed | Same |

---

## 4. Functional Requirements

1. **Return Intake:** lookup by Receipt ID or direct barcode scan (serialized only). Reason code is mandatory before the return can be submitted.
2. **Serialized Condition Routing (New):** if tagged `Damaged/Defective`, unit status becomes `QUARANTINE` (new status, distinct from `AVAILABLE`/`SOLD`/`VOID`), excluded from POS scan-ability and dashboard "available" counts, but still visible in an inventory-manager-only "Quarantine" view for write-off or repair decisions.
3. **Policy Window Enforcement (New):** compare return date to sale date against a configurable per-category or global policy window. Within window → auto-process. Outside window → require manager PIN approval, logged with the override reason, before financial reversal executes.
4. **Exchange Flow (New):** a return and a new sale can be linked under one `exchange_id`; net financial impact is calculated as the delta rather than two independent transactions, and the receipt reflects it as a single exchange summary rather than two disconnected receipts.
5. **Financial Reversal:** unchanged from source logic — reverses gross revenue and restores COGS in Money & Profits and Business Reports in real time.
6. **Fraud Signal (New, lightweight):** if the same serial number is sold-and-returned more than a configurable threshold (e.g., 3 times in 30 days), flag it on the inventory manager dashboard for review — informational only in this sprint, no automated blocking.

---

## 5. UI/UX Requirements

- **Return Intake Screen:** Receipt-ID search prominent at top; barcode scan field for serialized fast-path. Reason-code and (for serialized) condition-tag selectors appear inline once an item is selected — not as a separate step, to keep the flow to one screen.
- **Policy Warning (New):** if outside the return window, an amber banner appears before submission: "This return is 6 days past policy — manager approval required," with the PIN entry surfaced inline rather than blocking navigation.
- **Quarantine View (New):** separate filtered tab on the inventory dashboard ("Quarantine — 4 units") visible to inventory managers, with actions to "Clear to Available" or "Write Off" (write-off removes the unit from active inventory value permanently, logged).
- **Exchange Flow (New):** single combined screen — return panel and new-sale panel side by side, with a running "Net Due / Net Refund" total at the bottom, so the cashier and customer see one number, not two transactions.
- **Reports Sync Indicator:** Business Reports and Money & Profits views show a subtle "Updated just now" timestamp on affected metrics after a return, so store owners trust the numbers are live.

---

## 6. Acceptance Criteria
- [ ] Bulk return increments stock by returned quantity, validated against original purchased quantity.
- [ ] Serialized return sets unit to `AVAILABLE` (if resellable) or `QUARANTINE` (if damaged) and updates parent available count accordingly — quarantined units never appear as sellable.
- [ ] Return outside the configured policy window is blocked from auto-processing and requires manager PIN, logged with reason.
- [ ] Exchange flow nets return + new sale into a single linked record with one combined receipt.
- [ ] Money & Profits and Business Reports reflect the financial reversal in real time (no batch delay).
- [ ] A serial returned/sold beyond the fraud-signal threshold appears flagged on the manager dashboard.
- [ ] Every return, regardless of type, is logged with reason code, operator, and (for serialized) condition tag.

---

## 7. Non-Functional Requirements
- Return processing and report sync complete within the same latency budget as checkout (<300ms) so store owners see real-time figures.
- Quarantine status must be excluded from all "available stock" aggregate queries platform-wide (dashboard, POS lookup, low-stock alerts) — not just hidden in the UI.
- Policy window and fraud-signal threshold must be configurable per store, not hardcoded.

---

## 8. Dependencies
- Sprint 1 schema (ItemUnit status enum needs `QUARANTINE` added).
- Sprint 3 sale/receipt records for return lookup and exchange linking.
- Manager PIN/override mechanism from Sprint 2.
- Money & Profits / Business Reports modules for real-time sync targets.

---

## 9. Open Questions
- Who has authority to clear a `QUARANTINE` unit back to `AVAILABLE` — inventory manager only, or store owner-level permission?
- Should the fraud-signal threshold trigger any automated action in a future sprint (e.g., temporary hold), or remain informational indefinitely?
- Is restocking fee logic (partial refund on non-defective returns) in scope for this sprint or deferred to a later financial-rules sprint?