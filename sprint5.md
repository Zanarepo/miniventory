Excellent. Sprint 5 is the heart of BizTrack Lite. Up until now, the application has focused on recording transactions. This sprint transforms those records into meaningful financial intelligence.
This module should not store financial values directly unless they are immutable snapshots. Instead, the Profit Engine derives financial metrics from the underlying sales, inventory, and expense data. This keeps the system accurate, auditable, and consistent.
As Product Manager, I recommend implementing this as a Financial Calculation Engine with reusable calculation services. Future modules such as Dashboards, Reports, AI Insights, Loan Readiness, and Tax Estimation will consume these services instead of duplicating calculation logic.

BizTrack Lite
Sprint 5 Product Requirements Document (PRD)
Profit Engine & Financial Calculation Module
Sprint Number: 5
Sprint Duration: 2 Weeks
Priority: Critical
Dependencies
Sprint 1: Business Registration
Sprint 2: Inventory
Sprint 3: Sales
Sprint 4: Expenses

Sprint Goal
Develop the financial calculation engine that automatically computes business performance metrics using transactional data.
At the end of this sprint, a business owner should immediately know:
Revenue
Cost of Goods Sold (COGS)
Gross Profit
Operating Expenses
Net Profit
Cash Position
Inventory Value
without performing any manual calculations.

Sprint Objectives
Users should be able to:
View financial summaries
Monitor profitability
Analyze daily, weekly, monthly, yearly performance
Compare periods
Understand business health

Sprint Scope
Included
Revenue calculations
Cost of Goods Sold (COGS)
Gross Profit
Operating Expenses
Net Profit
Cash Position
Inventory Valuation
Business Health Indicators
Financial calculation services
Excluded
Tax computation
Balance Sheet
General Ledger
Depreciation
Budgeting
Forecasting

Financial Engine Architecture
Inventory
        │
        ▼
Sales Transactions
        │
        ▼
Revenue Engine
        │
        ▼
COGS Engine
        │
        ▼
Gross Profit
        │
        ▼
Expense Engine
        │
        ▼
Net Profit
        │
        ▼
Dashboard
Reports
Analytics
AI Insights

Financial Calculation Principles
The system will never ask users to enter:
Gross Profit
Net Profit
Revenue
Cash Position
These values are always calculated.

Financial Calculation Service
Revenue
Formula
Revenue

=

SUM(total_amount)
Source
Sales Table

Cost of Goods Sold (COGS)
Formula
COGS

=

SUM(unit_cost × quantity)
Source
Sale Items

Gross Profit
Formula
Gross Profit

=

Revenue

-

COGS

Operating Expenses
Formula
Operating Expenses

=

SUM(expenses.amount)

Net Profit
Formula
Net Profit

=

Gross Profit

-

Operating Expenses

Inventory Value
Formula
Inventory Value

=

Current Stock

×

Cost Price
Uses
Inventory Summary View

Cash Position
MVP Formula
Cash Position

=

Cash Sales

-

Cash Expenses
Future versions will incorporate bank accounts and reconciliations.

Epic 1
Financial Summary Service

User Story
As a business owner
I want to immediately know how my business is performing
So I can make informed decisions.

Service Output
export interface FinancialSummary {

revenue:number;

costOfGoodsSold:number;

grossProfit:number;

expenses:number;

netProfit:number;

cashPosition:number;

inventoryValue:number;

}

Epic 2
Daily Summary
Display
Revenue
Expenses
Gross Profit
Net Profit
Transactions

Epic 3
Weekly Summary
Metrics
Weekly Revenue
Weekly Expenses
Weekly Profit
Growth

Epic 4
Monthly Summary
Display
Revenue
COGS
Gross Profit
Expenses
Net Profit

Epic 5
Yearly Summary
Display
Annual Revenue
Annual Expenses
Annual Net Profit
Inventory Value

Epic 6
Financial Period Selector
Users choose
Today
Yesterday
Last 7 Days
Last 30 Days
This Month
Last Month
This Year
Custom Date

Epic 7
Business Health Score
The system calculates a score from 0 to 100 based on key indicators.
Example weighting:
Metric
Weight
Profitability
35%
Expense Control
20%
Inventory Health
20%
Revenue Growth
15%
Cash Position
10%

Health Rating:
Score
Rating
90–100
Excellent
75–89
Healthy
60–74
Stable
40–59
At Risk
Below 40
Critical

This score is informational and can be refined in future AI releases.

Epic 8
Financial KPI Cards
Display:
Revenue
Gross Profit
Net Profit
Expenses
Inventory Value
Cash Position
Each KPI shows:
Current value
Percentage change
Trend indicator

Database Views
Instead of storing calculations, create reusable database views.
revenue_summary
CREATE VIEW revenue_summary AS

SELECT

business_id,

DATE(created_at) AS business_date,

SUM(total_amount) AS revenue

FROM sales

GROUP BY business_id, DATE(created_at);

expense_summary
CREATE VIEW expense_summary AS

SELECT

business_id,

expense_date,

SUM(amount) AS total_expenses

FROM expenses

WHERE deleted_at IS NULL

GROUP BY business_id, expense_date;

profit_summary
CREATE VIEW profit_summary AS

SELECT

r.business_id,

r.business_date,

r.revenue,

COALESCE(c.cogs,0) AS cogs,

(r.revenue-COALESCE(c.cogs,0)) AS gross_profit,

COALESCE(e.total_expenses,0) AS expenses,

((r.revenue-COALESCE(c.cogs,0))-COALESCE(e.total_expenses,0)) AS net_profit

FROM revenue_summary r

LEFT JOIN cogs_summary c

ON r.business_id=c.business_id

AND r.business_date=c.business_date

LEFT JOIN expense_summary e

ON r.business_id=e.business_id

AND r.business_date=e.expense_date;

React Pages
FinancialSummaryPage

ProfitPage

BusinessHealthPage

Components
RevenueCard

ExpenseCard

NetProfitCard

CashPositionCard

InventoryValueCard

BusinessHealthGauge

PeriodSelector

FinancialSummaryTable

TypeScript Models
export interface FinancialSummary {
  revenue: number;
  costOfGoodsSold: number;
  grossProfit: number;
  expenses: number;
  netProfit: number;
  cashPosition: number;
  inventoryValue: number;
}

export interface BusinessHealth {
  score: number;
  rating: string;
  evaluatedAt: string;
}

Business Rules
Revenue comes only from completed sales.
Deleted expenses are excluded from calculations.
Gross Profit is always Revenue minus COGS.
Net Profit is always Gross Profit minus Operating Expenses.
Inventory value uses current stock only.
Negative profit values are valid and must be displayed.
All calculations must be filtered by business_id and reporting period.

Functional Requirements
Users can:
View financial summaries
Change reporting periods
Compare financial periods
View profitability
View inventory valuation
View business health score

Offline Requirements
Financial summaries should remain available offline using the most recently synchronized data.
When offline:
Previously calculated summaries are cached in IndexedDB.
New sales and expenses recorded offline trigger local recalculations.
Synchronization reconciles local and server-side calculations without overwriting transactional data.

Non-Functional Requirements
Performance
Financial summary generation < 1 second for up to 100,000 transactions.
KPI cards load in under 500 ms after data retrieval.
Scalability
Calculation services must support millions of transactions through indexed queries and database views.
Security
Financial summaries inherit Row Level Security from their underlying tables.
No business can query another business's financial data.
Reliability
Calculations must be deterministic and produce identical results whether generated online or from synchronized offline data.

Implementation Task Breakdown
Backend
Create revenue summary view
Create COGS summary view
Create expense summary view
Create profit summary view
Build financial calculation service
Add database indexes on business_id and date fields
Optimize query performance
Frontend
Financial Summary page
KPI cards
Period selector
Business Health score component
Offline financial cache
Local recalculation service
QA
Revenue calculation tests
COGS validation
Gross profit tests
Net profit tests
Cash position tests
Period comparison tests
Offline recalculation tests
Performance benchmarking

Sprint Deliverables
✅ Financial calculation engine
✅ Revenue summary service
✅ COGS calculation
✅ Gross profit calculation
✅ Net profit calculation
✅ Inventory valuation
✅ Cash position calculation
✅ Business Health score
✅ Financial database views
✅ Offline financial summaries

Definition of Done
All financial calculations match expected values for test datasets.
KPI values update immediately after new sales or expenses.
Database views return accurate results across reporting periods.
Offline summaries reconcile correctly after synchronization.
Performance targets are met.
Automated tests achieve agreed coverage.
Product Owner signs off on financial accuracy.

Open Questions
Should the Business Health Score remain rule-based in the MVP, or should it later evolve into an AI-driven score?
Should users be able to customize the weighting of the health score for different industries?
Should cash position distinguish between payment methods (cash, bank transfer, POS) in future releases?
Do we need comparative metrics such as "same period last month" in the MVP, or can they be introduced in Sprint 6?
Should financial summaries support multiple currencies in a future enterprise edition?
Should calculation services be implemented as PostgreSQL database views, SQL functions, or Supabase Edge Functions for better maintainability and scalability?

Product Management Recommendation
By the end of Sprint 5, BizTrack Lite has transitioned from a transaction-recording tool into a financial management platform. The next sprint, Sprint 6: Dashboard & Business Analytics, will consume the Financial Engine created here to present users with an intuitive, visual overview of their business performance through KPI cards, charts, trends, alerts, and actionable insights without introducing new financial calculations. This separation keeps the architecture clean by ensuring that Sprint 5 owns the calculation logic, while Sprint 6 focuses solely on visualization and user experience.

