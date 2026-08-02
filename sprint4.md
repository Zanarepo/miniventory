Excellent. Sprint 4 completes the financial transaction layer of BizTrack Lite. Once expenses are captured alongside inventory and sales, the system can provide business owners with an accurate picture of profitability. This is especially important for nano and small businesses, where expenses are often the biggest source of "profit leakage."
The Expense Management module is designed to be as simple as possible, requiring only a few fields to record an expense while remaining extensible for future accounting capabilities.

BizTrack Lite
Sprint 4 Product Requirements Document (PRD)
Expense Management Module
Sprint Number: 4
Duration: 2 Weeks
Priority: Critical
Dependencies
Sprint 0: Foundation
Sprint 1: Authentication & Business Registration
Sprint 2: Inventory Management
Sprint 3: Sales Management

Sprint Goal
Enable business owners to record and categorize business expenses quickly, allowing the system to calculate total operating expenses and prepare for net profit calculations in the next sprint.
By the end of this sprint, users should be able to answer:
How much did I spend today?
What did I spend money on?
Which expense category costs me the most?
What are my daily, weekly, and monthly operating expenses?

Sprint Objectives
Users should be able to:
Record expenses
Categorize expenses
Create custom expense categories
View expense history
Filter expenses
Edit recent expenses
Soft delete expenses
Upload receipt images (optional)
Record expenses offline

Sprint Scope
Included
Expense Categories
Expense Recording
Expense History
Expense Editing
Soft Delete
Receipt Attachment
Offline Support
Excluded
Recurring expenses
Supplier payments
Payroll
Tax calculations
Purchase Orders
Budgeting

Expense Workflow
Dashboard

↓

New Expense

↓

Choose Category

↓

Enter Amount

↓

Enter Description

↓

(Optional) Upload Receipt

↓

Save Expense

↓

Dashboard Updates

↓

Expense History Updated

Epic 1: Expense Categories
Objective
Allow businesses to organize expenses into meaningful groups.

User Story
As a business owner
I want to classify expenses
So I know where my money is going.

Default Categories
Stock Purchase
Transportation
Fuel
Rent
Salaries & Wages
Electricity
Internet
Marketing
Packaging
Repairs & Maintenance
Office Supplies
Miscellaneous
Users may create custom categories.

Database Schema
expense_categories
Column
Type
id
UUID
business_id
UUID
name
TEXT
description
TEXT
is_default
BOOLEAN
created_at
TIMESTAMP


SQL Migration
CREATE TABLE expense_categories (

id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

business_id UUID REFERENCES businesses(id),

name TEXT NOT NULL,

description TEXT,

is_default BOOLEAN DEFAULT FALSE,

created_at TIMESTAMPTZ DEFAULT now()

);

RLS
ALTER TABLE expense_categories ENABLE ROW LEVEL SECURITY;

Policy
CREATE POLICY "Owners manage expense categories"

ON expense_categories

FOR ALL

USING (

business_id IN (

SELECT id

FROM businesses

WHERE owner_id = auth.uid()

)

)

WITH CHECK (

business_id IN (

SELECT id

FROM businesses

WHERE owner_id = auth.uid()

)

);

Epic 2: Expense Recording

User Story
As a business owner
I want to record expenses
So I know how much my business spends.

Database Schema
expenses
Column
Type
id
UUID
business_id
UUID
category_id
UUID
amount
NUMERIC
description
TEXT
expense_date
DATE
payment_method
TEXT
receipt_url
TEXT
created_by
UUID
created_at
TIMESTAMP
updated_at
TIMESTAMP
deleted_at
TIMESTAMP


SQL Migration
CREATE TABLE expenses (

id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

business_id UUID NOT NULL REFERENCES businesses(id),

category_id UUID REFERENCES expense_categories(id),

amount NUMERIC(12,2) NOT NULL,

description TEXT NOT NULL,

expense_date DATE NOT NULL,

payment_method TEXT NOT NULL,

receipt_url TEXT,

created_by UUID REFERENCES profiles(id),

created_at TIMESTAMPTZ DEFAULT now(),

updated_at TIMESTAMPTZ DEFAULT now(),

deleted_at TIMESTAMPTZ

);

Epic 3: Payment Methods
Supported Methods
Cash
Bank Transfer
POS
Mobile Money
Other
Future versions will support split payments.

Epic 4: Receipt Upload
Users may upload:
Receipt photo
Invoice
Store receipt
Stored in:
Supabase Storage
Bucket:
expense-receipts
Maximum File Size
10 MB
Allowed Types
JPG
PNG
WEBP
PDF
Receipt upload is optional.

Epic 5: Expense History
Users can:
Search expenses
Filter by category
Filter by date
Filter by payment method
View receipts
Export later (Sprint 7)

Epic 6: Expense Editing
Users may edit:
Description
Category
Amount
Payment Method
Expense Date
Every edit updates:
updated_at

Epic 7: Soft Delete
Expenses should never be permanently deleted from the database.
Instead:
deleted_at = NOW()
Queries ignore deleted records.

Epic 8: Dashboard Summary
Display:
Today's Expenses
Weekly Expenses
Monthly Expenses
Largest Expense Category
Most Recent Expense

React Pages
ExpensesPage

NewExpensePage

ExpenseHistoryPage

EditExpensePage

Components
ExpenseForm

ExpenseCategoryDropdown

PaymentMethodSelector

ReceiptUploader

ExpenseTable

ExpenseSummaryCard

ExpenseFilter

TypeScript Interfaces
export interface ExpenseCategory {
  id: string;
  business_id: string;
  name: string;
  description?: string;
  is_default: boolean;
}

export interface Expense {
  id: string;
  business_id: string;
  category_id: string;
  amount: number;
  description: string;
  expense_date: string;
  payment_method: string;
  receipt_url?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
}

Business Rules
Expense amount must be greater than zero.
Expense category is required.
Description is required.
Receipt upload is optional.
Deleted expenses are excluded from calculations.
Future expense dates are not allowed.
Expenses cannot belong to another business.

Functional Requirements
Users can:
Create expense categories
Edit categories
Archive custom categories
Record expenses
Edit expenses
View history
Search
Filter
Upload receipts
Soft delete expenses

Offline Requirements
When offline:
Expenses are stored in IndexedDB.
Receipt uploads are queued until connectivity returns.
Expense records synchronize automatically.
Conflict resolution uses the latest synchronized version while preserving audit timestamps.

Non-Functional Requirements
Performance
Save expense < 2 seconds
Search results < 300 ms
Accessibility
WCAG 2.2 AA
Security
HTTPS
Supabase Authentication
Row Level Security
Reliability
Failed uploads retry automatically.
Offline transactions persist across browser restarts.

RLS Policies
Enable RLS:
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
Policy:
CREATE POLICY "Owners manage expenses"

ON expenses

FOR ALL

USING (

business_id IN (

SELECT id

FROM businesses

WHERE owner_id = auth.uid()

)

)

WITH CHECK (

business_id IN (

SELECT id

FROM businesses

WHERE owner_id = auth.uid()

)

);

Implementation Task Breakdown
Backend
Create expense_categories table
Seed default categories
Create expenses table
Configure Supabase Storage bucket
Configure RLS
Create indexes on business_id, expense_date, and category_id
Add updated_at trigger
Implement soft delete logic

Frontend
Expense CRUD pages
Category management
Receipt uploader
Expense history
Search and filters
Offline queue for expenses
IndexedDB integration
Synchronization service

QA
Expense creation
Category CRUD
Receipt upload
Edit expense
Soft delete
Offline synchronization
Security testing
Performance testing

Sprint Deliverables
✅ Expense category management
✅ Expense recording
✅ Expense editing
✅ Soft delete
✅ Receipt attachment
✅ Expense history
✅ Dashboard expense summary
✅ Offline expense support
✅ RLS policies
✅ Supabase Storage integration

Definition of Done
Users can record an expense in less than 20 seconds.
Expense totals update correctly.
Soft-deleted expenses no longer appear in reports.
Receipt uploads are stored securely.
Offline expense recording synchronizes successfully.
RLS policies prevent unauthorized access.
All unit, integration, and end-to-end tests pass.

Open Questions
Should stock purchases be recorded only as expenses in the MVP, or should future purchasing modules automatically create both inventory additions and expense entries?
Should receipt uploads support multiple files per expense, or is a single attachment sufficient for the MVP?
Should users be allowed to edit an expense after it has been synchronized, or should edits create an audit log in future versions?
Should default expense categories be editable, or only custom categories?
Should expense records include optional geolocation metadata for businesses operating in multiple locations?
Should recurring expenses (such as rent and salaries) be generated automatically in a future sprint?

Product Management Recommendation
At this point, BizTrack Lite has all three primary operational data sources:
Inventory
Sales
Expenses
The next sprint, Sprint 5: Profit Engine & Financial Calculations, will unify these modules into a centralized financial engine that calculates gross profit, operating expenses, net profit, cash position, and business performance metrics. This financial engine will become the foundation for dashboards, reports, AI insights, and loan-readiness features in subsequent sprints.

