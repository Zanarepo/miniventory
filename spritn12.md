# Sprint 2 PRD — High-Speed Multi-Scan POS Engine & Dual-Mode Collision Interceptor
**Module:** Miniventory | **Product:** Sellytics Inventory Platform
**Epic:** Dual-Mode Inventory Architecture (Serialized & Non-Serialized)

---

## 1. Objective
Enable cashiers to scan bulk and serialized items interchangeably, in any order, at high speed, while the system prevents duplicate/invalid serial entries and keeps the cart mathematically correct in real time — including when things go wrong (bad scan, wrong item, network hiccup).

---

## 2. User Stories

- **US2.1:** As a cashier, scanning bulk and serialized items in any sequence adds each correctly to the register.
- **US2.2:** As a cashier, re-scanning a non-serialized item increments quantity; re-scanning a serialized item triggers a duplicate check.
- **US2.3 (New) — Undo Last Scan:** As a cashier, I want a single "undo" action for the most recent scan so I can correct a mis-scan without hunting through the cart.
- **US2.4 (New) — Manager Override:** As a cashier, if a serialized unit is incorrectly flagged (e.g., a prior sale was voided/returned but status hasn't propagated), I want to request a manager PIN override so the sale isn't blocked at the register with a customer waiting.
- **US2.5 (New) — Offline Scan Queue:** As a cashier, if connectivity drops mid-sale, I want scans to queue locally and sync once reconnected, rather than losing the cart.

---

## 3. Functional POS Logic

1. **Scanner Input Router**
   - Non-serialized barcode match:
     - In cart → `Qty += 1`.
     - Not in cart → add line, `Qty = 1`.
   - Serialized barcode match:
     - Already in active cart → block, warning tone, inline toast: "Already added — [SN-xxxx]".
     - Status `SOLD` in DB → block, error tone, modal: "Previously sold — [SN-xxxx]". **New:** modal includes a "Request Override" button routed to US2.4.
     - Status `AVAILABLE` → add line, attach serial chip, `Qty += 1`.
   - Unrecognized barcode → **New:** non-blocking toast "No match for [code] — search manually?" with a quick manual-search fallback, instead of a silent failure.

2. **Undo Last Scan (New)**
   - A persistent "Undo" affordance reverses only the most recent scan event (decrements bulk qty by 1, or removes the specific serial chip). Does not cascade to earlier scans.

3. **Manager Override (New)**
   - Override requires a manager-level PIN (4–6 digit, configurable), logs `overridden_by`, `reason`, and `original_block_reason` against the sale for later audit. Overridden items are visually tagged in the cart (small flag icon) through to receipt.

4. **Offline Queue (New)**
   - Scans buffer in local storage with client-generated timestamps. On reconnect, queued scans replay server-side in original order; any that now fail validation (e.g., someone else sold that serial in the interim) surface as a reconciliation list the cashier must resolve before finalizing checkout — cart is never silently altered.

---

## 4. UI/UX Requirements

- **Cart Panel:** bulk lines and serialized lines are visually distinct — bulk lines show a quantity stepper; serialized lines show stacked serial "chips" beneath the parent product name, each removable individually.
- **Feedback System:** three-tier — success (soft chime + green flash), warning/duplicate (short buzz + amber toast), error/sold (distinct error tone + red modal). Sound is togglable in settings, but visual feedback is never sound-dependent.
- **Undo Control:** fixed, always-visible "Undo Last Scan" button near the scan input — not buried in a menu, since speed at the register matters.
- **Override Flow:** PIN entry appears as a lightweight inline drawer over the blocking modal, not a full context switch, so the cashier doesn't lose place in the transaction.
- **Offline Indicator:** persistent small status pill ("Offline — 4 scans queued") so cashiers always know sync state; reconciliation list (if any) appears before the checkout button becomes active again.

---

## 5. Acceptance Criteria
- [ ] Mixed bulk + serialized scanning in any order produces a correct, consolidated cart.
- [ ] Duplicate serialized scans in the same session are blocked without incrementing quantity or corrupting the line.
- [ ] Undo reverses exactly one scan event and is disabled (greyed) when the cart is empty.
- [ ] Manager override requires valid PIN, is logged with reason, and visibly flags the affected line through to the receipt (Sprint 3 dependency).
- [ ] Offline scans queue locally, replay in order on reconnect, and any post-hoc conflicts are surfaced for manual resolution — never silently dropped or silently applied.
- [ ] Unrecognized barcodes never hard-block the register; they offer a manual search fallback.

---

## 6. Non-Functional Requirements
- Continuous scan input handling maintained at <50ms per event, including when the offline queue is active.
- Offline queue must persist across a browser/app refresh (not just in-memory) to survive an unexpected reload during an outage.
- Override PIN attempts are rate-limited (e.g., 5 attempts/5 minutes) to prevent brute-forcing at the terminal.

---

## 7. Dependencies
- Sprint 1 unified schema and global uniqueness index.
- Role/permission system for manager PIN issuance and validation.
- Local storage / IndexedDB availability on the POS terminal for offline queueing.

---

## 8. Open Questions
- Should override actions require a follow-up approval step from a manager dashboard, or is PIN-at-terminal sufficient?
- What's the maximum offline queue duration before forcing a hold on new sales (to avoid large unreconciled batches)?
- Do bulk items need a max-quantity-per-scan-session guardrail to catch scanner malfunctions (e.g., stuck trigger)?