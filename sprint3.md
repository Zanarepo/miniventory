Excellent. Sprint 3 is arguably the most important sprint in the MVP because it is where BizTrack Lite begins generating measurable business value. Every sale recorded automatically updates inventory, revenue, cash position, and gross profit. This sprint must be designed with a transactional approach to ensure data consistency, especially in offline scenarios.
I recommend using a Sales Header + Sales Line Items architecture instead of storing sales in a single table. Although the MVP is simple, this design supports future enhancements such as receipts, returns, discounts, taxes, multiple payment methods, and invoices without requiring a database redesign.

BizTrack Lite
Sprint 3 Product Requirements Document (PRD)
Sales Management Module
Sprint Number: 3
Duration: 3 Weeks
Priority: Critical
Dependencies
Sprint 0: Foundation
Sprint 1: Authentication & Business Registration
Sprint 2: Inventory Management

Sprint Goal
Enable business owners to quickly record sales while automatically:
Updating inventory
Calculating revenue
Calculating gross profit
Recording payment methods
Maintaining a complete sales history
The sales process should take less than 30 seconds for a typical transaction.

Sprint Objectives
By the end of this sprint, users should be able to:
Record sales
Sell multiple products in one transaction
Accept multiple payment methods
Automatically deduct inventory
View sales history
Print or download receipts
Search previous sales
View daily sales totals

Sprint Scope
Included
Sales transactions
Multiple line items
Automatic inventory deduction
Revenue calculation
Gross profit calculation
Payment methods
Sales history
Receipt generation
Offline sales queue
Excluded
Customer accounts
Credit sales
Discounts
Taxes (VAT)
Returns
Refunds
Quotations
Invoices

Sales Workflow
Dashboard

↓

New Sale

↓

Search Product

↓

Select Product

↓

Enter Quantity

↓

Review Cart

↓

Choose Payment Method

↓

Complete Sale

↓

Inventory Deducted

↓

Revenue Updated

↓

Receipt Generated

Epic 1: Sales Transaction (Header)
Each completed sale generates one Sales record.

User Story
As a business owner
I want every completed transaction recorded
So that I have an accurate sales history.

Database Schema
sales
Column
Type
id
UUID
business_id
UUID
receipt_number
TEXT
subtotal
NUMERIC
total_amount
NUMERIC
total_cost
NUMERIC
gross_profit
NUMERIC
payment_method
TEXT
created_by
UUID
created_at
TIMESTAMP


SQL Migration
CREATE TABLE sales (

id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

business_id UUID NOT NULL REFERENCES businesses(id),

receipt_number TEXT NOT NULL UNIQUE,

subtotal NUMERIC(12,2) NOT NULL,

total_amount NUMERIC(12,2) NOT NULL,

total_cost NUMERIC(12,2) NOT NULL,

gross_profit NUMERIC(12,2) NOT NULL,

payment_method TEXT NOT NULL,

created_by UUID NOT NULL REFERENCES profiles(id),

created_at TIMESTAMPTZ DEFAULT now()

);

Epic 2: Sales Line Items
Every product sold becomes a line item.

Database Schema
sale_items
Column
Type
id
UUID
sale_id
UUID
product_id
UUID
quantity
NUMERIC
unit_cost
NUMERIC
selling_price
NUMERIC
line_total
NUMERIC
line_profit
NUMERIC


SQL Migration
CREATE TABLE sale_items (

id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

sale_id UUID REFERENCES sales(id) ON DELETE CASCADE,

product_id UUID REFERENCES products(id),

quantity NUMERIC(12,2),

unit_cost NUMERIC(12,2),

selling_price NUMERIC(12,2),

line_total NUMERIC(12,2),

line_profit NUMERIC(12,2)

);

Epic 3: Payment Methods
Supported in MVP
Cash
Bank Transfer
POS
Mobile Money
Other
Future versions can add split payments.

Epic 4: Automatic Inventory Deduction
When a sale is completed:
For every sale item:
Insert inventory transaction.
Movement Type:
SALE
Quantity:
Negative quantity.

Inventory Transaction Example
Product

Rice

Quantity

-3

Movement

SALE

Timestamp

2026-08-20
Current inventory updates automatically through the inventory ledger created in Sprint 2.

Epic 5: Receipt Number Generator
Receipt Format
BT-20260801-000001
Logic
Business Prefix

+

Date

+

Sequential Number
Receipt numbers must remain unique per business.

Epic 6: Gross Profit Calculation
For each line item:
Line Profit

=

Selling Price

-

Cost Price

×

Quantity
Sale totals
Revenue

=

Sum(Line Totals)

Cost

=

Sum(Unit Cost × Quantity)

Gross Profit

=

Revenue − Cost
Gross profit is stored at the sale level to improve reporting performance.

Epic 7: Sales History
Users can:
Search receipts
Search products
Filter by date
Filter by payment method
View receipt details

Epic 8: Receipt Generation
Receipt displays:
Business Name
Receipt Number
Products Sold
Quantity
Price
Subtotal
Payment Method
Date
Cashier
Total
The receipt should be printable as PDF using the browser print dialog in the MVP.

React Pages
SalesPage

NewSalePage

SalesHistoryPage

ReceiptPage

Components
ProductSearch

CartTable

PaymentSelector

ReceiptPreview

SaleSummaryCard

SalesHistoryTable

PaymentBadge

QuantityInput

TypeScript Interfaces
export interface Sale {
  id: string;
  business_id: string;
  receipt_number: string;
  subtotal: number;
  total_amount: number;
  total_cost: number;
  gross_profit: number;
  payment_method: string;
  created_by: string;
  created_at: string;
}

export interface SaleItem {
  id: string;
  sale_id: string;
  product_id: string;
  quantity: number;
  unit_cost: number;
  selling_price: number;
  line_total: number;
  line_profit: number;
}

Business Rules
A sale must contain at least one line item.
Quantity sold must be greater than zero.
Products cannot be sold if available stock is insufficient.
Selling price may be edited during the sale only if it remains greater than or equal to zero.
Gross profit is calculated automatically and cannot be edited.
Inventory deduction occurs only after the sale is successfully committed.
A completed sale cannot be edited. Corrections will be handled by future return and refund features.

Functional Requirements
Users can:
Search products by name or SKU
Add multiple products to a cart
Edit quantities before checkout
Remove items from the cart
Complete a sale
View sales history
Reprint receipts
Filter sales by date and payment method

Offline Requirements
The PWA must support offline sales.
When offline:
Sales are stored in IndexedDB.
Inventory availability is validated against the last synchronized stock levels.
Completed sales are placed in a synchronization queue.
Receipt numbers use a temporary offline prefix and are replaced with permanent numbers during synchronization.
Synchronization must preserve transaction order to avoid inventory inconsistencies.

Non-Functional Requirements
Performance
Product search results displayed in under 300 ms.
Sale completion in under 2 seconds online.
Receipt rendering in under 1 second.
Reliability
Sales transactions must be atomic. Either all related records are committed, or none are.
Security
All sales are protected by Row Level Security.
Users can access only sales belonging to their own business.
Accessibility
Fully keyboard navigable.
WCAG 2.2 AA compliant.

RLS Policies
Enable RLS:
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE sale_items ENABLE ROW LEVEL SECURITY;
Example policy for sales:
CREATE POLICY "Owners manage business sales"
ON sales
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
A corresponding policy should be created for sale_items by validating access through the parent sale record.

Implementation Task Breakdown
Backend
Create sales table
Create sale_items table
Generate receipt numbers
Create inventory deduction transaction
Configure RLS
Create reporting indexes
Wrap sale creation in a database transaction or Supabase Edge Function
Frontend
Build New Sale page
Implement product search
Build shopping cart
Payment method selector
Receipt page
Sales history page
Offline synchronization queue
QA
Multi-item sale testing
Inventory deduction testing
Profit calculation validation
Receipt generation
Offline sales synchronization
Concurrent transaction testing

Sprint Deliverables
✅ Sales transaction module
✅ Multi-line sales support
✅ Automatic inventory deduction
✅ Revenue calculation
✅ Gross profit calculation
✅ Receipt generation
✅ Sales history
✅ Offline sales support
✅ RLS policies for sales data

Definition of Done
Users can complete a sale in under 30 seconds.
Inventory updates correctly after every sale.
Revenue and gross profit calculations are accurate.
Receipts are generated and printable.
Offline sales synchronize successfully without creating duplicate records.
Security policies prevent unauthorized access.
All automated and manual QA tests pass.

Open Questions
Should selling prices be editable during checkout, or always default to the product's configured selling price?
Should receipt numbers restart each day, each month, or continue as a single sequence?
Should cancelled sales be soft-deleted with an audit trail, or remain immutable until the Returns module is implemented?
Do we need support for barcode scanners in a future sprint to speed up checkout?
Should cashiers be able to save an unfinished sale as a draft, or should draft sales be deferred to a later release?
Should we generate receipts as HTML only in the MVP, or also provide downloadable PDF formatting with branded templates?
With Sprint 3 complete, BizTrack Lite can now capture the two core operational activities of a retail business: inventory and sales. Sprint 4 will introduce Expense Management, completing the financial transaction layer needed for accurate net profit calculations and comprehensive financial reporting.

make itvery mobiel 1st experince, include lanaguage tramslation for all the modules, make sure the ui is very smooth and fast and mobile optimized, i should be able to do all the operations in mobile smooth and fast, the design should be premium and user-friendly. all th cRUD must accompany its notifcation pop ups 