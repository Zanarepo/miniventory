# Sprint 10 Product Requirements Document (PRD)
**Epic: Role-Based Access Control (RBAC) & Team Management**

## Sprint Goal
Enable business owners to invite staff (cashiers, managers, salespeople) to their store, assign specific roles, and restrict their access using Role-Based Access Control (RBAC).

---

## 1. Roles & Permissions

### Owner (Admin)
- **Permissions**: Full access to all features.
- **Capabilities**: Manage business settings, invite/remove users, view all financial reports, edit/delete any record, manage inventory, process sales.

### Manager
- **Permissions**: Operational management.
- **Capabilities**: Manage inventory, view sales history, process sales, record expenses, view basic reports.
- **Restrictions**: Cannot delete the business, cannot manage users/roles, cannot view owner-level sensitive profit margins if restricted.

### Cashier / Salesperson
- **Permissions**: Point of Sale (POS) operations only.
- **Capabilities**: Process new sales, view products and current stock levels, view their own sales history for the day.
- **Restrictions**: Cannot view business financials (profit, revenue trends), cannot edit/delete past sales, cannot manage inventory or add new products, cannot record expenses.

---

## 2. Database & RLS Architecture Changes

### New Tables
1. **`business_members`**
   - `id` (uuid, primary key)
   - `business_id` (uuid, references businesses)
   - `user_id` (uuid, references profiles)
   - `role` (varchar: 'owner', 'manager', 'cashier')
   - `joined_at` (timestamptz)

2. **`business_invitations`** (Optional depending on invite flow)
   - `id` (uuid)
   - `business_id` (uuid)
   - `email` (varchar)
   - `role` (varchar)
   - `token` (varchar)
   - `status` ('pending', 'accepted', 'expired')

### Row-Level Security (RLS) Updates
Currently, RLS policies check if `user_id = auth.uid()`. 
**New RLS Strategy**:
- Tables like `sales`, `inventory_transactions`, `products`, and `expenses` will now check if the `auth.uid()` exists in the `business_members` table for the corresponding `business_id`.
- Operations like `DELETE` or `UPDATE` will perform additional checks against the `business_members.role` to ensure cashiers cannot delete records.

---

## 3. UI/UX Features to Implement

### Team Management Dashboard (Owner Only)
- A new settings page: "Team & Access".
- View list of current team members and their roles.
- Button to "Invite New User".
- Ability to revoke access or change roles.

### Invitation Flow
- Owner enters email and selects a role.
- System sends an email with a unique invite link.
- Invitee clicks link, signs up (or logs in), and is automatically joined to the business.

### Role-Based Navigation & UI
- **Dynamic Sidebar**: Hide "Financials", "Reports", and "Expenses" tabs for Cashiers.
- **Action Restrictions**: Disable "Edit" and "Delete" buttons on historical sales for Cashiers.
- **Dashboard View**: Cashiers see a simplified dashboard focused on ringing up sales rather than business-wide profit metrics.

---

## 4. Acceptance Criteria

- [ ] Owners can successfully invite a user via email.
- [ ] Invited users can accept the invite and access the business workspace.
- [ ] Cashiers cannot access the Financials or Reports pages (forced redirect if attempted).
- [ ] Cashiers cannot edit or delete products or historical sales.
- [ ] RLS policies actively block unauthorized API requests from lower-privileged roles.
- [ ] The app handles offline-first sync securely, ensuring local Dexie caches only store data permitted by the user's role.

---

## Open Questions for Approval

1. **Invite Mechanism**: Should we send an email with an invite link, or just generate a "Store Join Code" that the cashier can type in when they create their account? (A Join Code is often easier for micro-businesses).
2. **Offline Mode**: If a cashier logs in offline, how do we handle role verification? (We will need to cache their role in Dexie).
3. **Number of Stores**: Can a cashier be a member of multiple businesses, or just one?
